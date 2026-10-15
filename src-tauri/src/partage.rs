//! Partage d'un fichier par la feuille de partage du téléphone (kDrive,
//! Dropbox, Drive, courriel…). Android : classe Kotlin
//! gen/android/…/PartagePlugin.kt ; iOS : paquet Swift ios/ (lié par build.rs).
//! Ailleurs, la commande répond false et l'interface enregistre le fichier.
//! Le même plugin règle la couleur des icônes de la barre d'état selon le
//! thème choisi dans l'app (sinon elles suivent le thème du téléphone).

use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

#[cfg(mobile)]
struct Partage<R: Runtime>(tauri::plugin::PluginHandle<R>);

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_partage);

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("partage")
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                use tauri::Manager;
                let h = _api.register_android_plugin("fr.coopmaths.mathalea", "PartagePlugin")?;
                _app.manage(Partage(h));
            }
            #[cfg(target_os = "ios")]
            {
                use tauri::Manager;
                let h = _api.register_ios_plugin(init_plugin_partage)?;
                _app.manage(Partage(h));
            }
            Ok(())
        })
        .build()
}

/// Ouvre la feuille de partage avec le fichier `nom` contenant `texte`
#[tauri::command]
pub async fn partager_fichier<R: Runtime>(app: tauri::AppHandle<R>, nom: String, texte: String) -> Result<bool, String> {
    #[cfg(mobile)]
    {
        use tauri::Manager;
        let p = app.state::<Partage<R>>();
        p.0.run_mobile_plugin::<serde_json::Value>("partager", serde_json::json!({ "nom": nom, "texte": texte }))
            .map_err(|e| e.to_string())?;
        return Ok(true);
    }
    #[cfg(not(mobile))]
    {
        let _ = (app, nom, texte);
        Ok(false)
    }
}

/// Icônes de la barre d'état claires (thème sombre de l'app) ou foncées ;
/// `telephone` : l'app suit le thème du téléphone (iOS ne l'impose alors pas)
#[tauri::command]
pub async fn barre_etat<R: Runtime>(app: tauri::AppHandle<R>, sombre: bool, telephone: Option<bool>) -> Result<(), String> {
    #[cfg(mobile)]
    {
        use tauri::Manager;
        let p = app.state::<Partage<R>>();
        p.0.run_mobile_plugin::<serde_json::Value>("barreEtat", serde_json::json!({ "sombre": sombre, "telephone": telephone.unwrap_or(false) }))
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(mobile))]
    let _ = (app, sombre, telephone);
    Ok(())
}

/// Hauteur des barres du système (Android) ou zones sûres (iOS), en pixels CSS : { haut, bas }
#[tauri::command]
pub async fn marges<R: Runtime>(app: tauri::AppHandle<R>) -> Result<serde_json::Value, String> {
    #[cfg(mobile)]
    {
        use tauri::Manager;
        let p = app.state::<Partage<R>>();
        return p.0.run_mobile_plugin::<serde_json::Value>("marges", serde_json::json!({})).map_err(|e| e.to_string());
    }
    #[cfg(not(mobile))]
    {
        let _ = app;
        Ok(serde_json::json!({ "haut": 0, "bas": 0 }))
    }
}
