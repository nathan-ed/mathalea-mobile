//! Mise à jour de l'app de bureau (Windows, macOS, AppImage Linux), en
//! arrière-plan : au démarrage, l'app demande la dernière version publiée
//! (`latest.json` de la forge, voir `scripts/release.sh`), la télécharge sans
//! rien afficher et l'installe à la fermeture. Rien n'interrompt une séance ;
//! la version suivante s'ouvre au lancement d'après.
//!
//! Le fichier téléchargé est vérifié par la clé publique de `tauri.conf.json`
//! (signature minisign posée par la CI). Rien n'est envoyé sauf la demande
//! elle-même (aucune donnée de l'élève).
//!
//! Pas de mise à jour pour un .deb ou un .rpm (elle demanderait le mot de
//! passe administrateur : le gestionnaire de paquets s'en charge), ni en
//! développement, ni avec `MATHALEA_SANS_MAJ=1`.

use std::sync::Mutex;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_updater::{Update, UpdaterExt};

/// Mise à jour téléchargée, en attente de la fermeture de l'app.
struct EnAttente(Mutex<Option<(Update, Vec<u8>)>>);

/// Cherche et télécharge la mise à jour, sans bloquer le démarrage.
pub fn lancer<R: Runtime>(app: &AppHandle<R>) {
    if !active() {
        return;
    }
    app.manage(EnAttente(Mutex::new(None)));
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        if let Err(erreur) = telecharger(&app).await {
            eprintln!("Mise à jour : {erreur}");
        }
    });
}

fn active() -> bool {
    if cfg!(debug_assertions) || std::env::var_os("MATHALEA_SANS_MAJ").is_some() {
        return false;
    }
    // Linux : seulement l'AppImage (variable posée par son lanceur)
    if cfg!(target_os = "linux") && std::env::var_os("APPIMAGE").is_none() {
        return false;
    }
    true
}

async fn telecharger<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    // Windows : l'installateur ne relance pas l'app, puisqu'on vient de la fermer
    let verificateur = app.updater_builder().restart_after_install(false).build()?;
    let Some(maj) = verificateur.check().await? else {
        return Ok(());
    };
    let octets = maj.download(|_, _| {}, || {}).await?;
    eprintln!("Mise à jour {} téléchargée : installée à la fermeture", maj.version);
    if let Some(etat) = app.try_state::<EnAttente>() {
        if let Ok(mut attente) = etat.0.lock() {
            *attente = Some((maj, octets));
        }
    }
    Ok(())
}

/// À la fermeture : installe la mise à jour téléchargée, s'il y en a une.
/// Windows lance l'installateur (petite barre de progression, sans question) et
/// quitte ; macOS et Linux remplacent l'app, ouverte à jour la fois suivante.
pub fn installer<R: Runtime>(app: &AppHandle<R>) {
    let Some(etat) = app.try_state::<EnAttente>() else {
        return;
    };
    let attente = etat.0.lock().ok().and_then(|mut a| a.take());
    if let Some((maj, octets)) = attente {
        if let Err(erreur) = maj.install(&octets) {
            eprintln!("Mise à jour {} non installée : {erreur}", maj.version);
        }
    }
}
