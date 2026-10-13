//! Mises à jour du moteur MathALÉA sans mise à jour de l'app.
//!
//! Une publication (scripts/publier-moteur.mjs) contient `mise-a-jour.json`,
//! sa signature Ed25519 `mise-a-jour.json.sig` et l'archive du moteur. L'app
//! vérifie la signature avec CLE_PUBLIQUE, la version d'API, la taille et le
//! SHA-256 de l'archive, l'extrait à part, puis l'active au lancement suivant :
//! une séance ne change jamais de moteur en cours de route. Sans publication
//! valide, l'app garde le moteur livré avec elle.

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use base64::Engine;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::Manager;
use tauri_plugin_http::reqwest;

/// Adresse provisoire : à fixer avec l'équipe Coopmaths (voir docs/developpement.md).
/// Variable d'environnement MATHALEA_MOTEUR_URL pour les essais.
pub const URL_MISES_A_JOUR: &str = "https://coopmaths.fr/alea/moteur/";

/// Clé publique Ed25519 (32 octets, base64) qui signe les publications.
/// Clé de test : Coopmaths génère la sienne (scripts/cles-moteur.mjs) et la remplace ici.
pub const CLE_PUBLIQUE: &str = "UaVlT+Qmsv8bLpxDfjkMDfDvA4yHSiX5ogHhMNdl8sU=";

const FORMAT: &str = "moteur-mathalea/1";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MiseAJour {
    pub format: String,
    pub version: String,
    pub api: u32,
    pub publie_le: String,
    pub archive: String,
    pub taille: u64,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Actif {
    pub version: String,
    pub publie_le: String,
    pub dossier: String,
}

fn base_url() -> String {
    let url = std::env::var("MATHALEA_MOTEUR_URL").unwrap_or_else(|_| URL_MISES_A_JOUR.into());
    if url.ends_with('/') { url } else { format!("{url}/") }
}

pub fn verifier_signature(texte: &[u8], signature_b64: &str, cle_b64: &str) -> Result<(), String> {
    let b64 = base64::engine::general_purpose::STANDARD;
    let cle: [u8; 32] = b64
        .decode(cle_b64.trim())
        .map_err(|_| "clé publique illisible")?
        .try_into()
        .map_err(|_| "clé publique invalide")?;
    let cle = VerifyingKey::from_bytes(&cle).map_err(|_| "clé publique invalide")?;
    let sig: [u8; 64] = b64
        .decode(signature_b64.trim())
        .map_err(|_| "signature illisible")?
        .try_into()
        .map_err(|_| "signature invalide")?;
    cle.verify(texte, &Signature::from_bytes(&sig))
        .map_err(|_| "signature incorrecte".to_string())
}

async fn telecharger(client: &reqwest::Client, url: &str) -> Result<Vec<u8>, String> {
    let r = client.get(url).send().await.map_err(|e| format!("réseau : {e}"))?;
    if !r.status().is_success() {
        return Err(format!("{url} : HTTP {}", r.status().as_u16()));
    }
    Ok(r.bytes().await.map_err(|e| format!("réseau : {e}"))?.to_vec())
}

/// Publication plus récente que `publie_actuel`, signée et compatible, ou None
pub async fn chercher(base: &str, cle: &str, api: u32, publie_actuel: &str) -> Result<Option<MiseAJour>, String> {
    let client = reqwest::Client::new();
    let texte = telecharger(&client, &format!("{base}mise-a-jour.json")).await?;
    let signature = telecharger(&client, &format!("{base}mise-a-jour.json.sig")).await?;
    verifier_signature(&texte, &String::from_utf8_lossy(&signature), cle)?;
    let m: MiseAJour = serde_json::from_slice(&texte).map_err(|e| format!("publication illisible : {e}"))?;
    if m.format != FORMAT || m.api != api {
        return Ok(None);
    }
    if m.archive.contains('/') || m.archive.contains("..") {
        return Err("nom d'archive invalide".into());
    }
    Ok((m.publie_le.as_str() > publie_actuel).then_some(m))
}

/// Télécharge, vérifie et extrait la publication, puis la marque active pour le prochain lancement
pub async fn installer(base: &str, m: &MiseAJour, dossier_moteurs: &Path) -> Result<Actif, String> {
    let client = reqwest::Client::new();
    let octets = telecharger(&client, &format!("{base}{}", m.archive)).await?;
    let empreinte: String = Sha256::digest(&octets).iter().map(|o| format!("{o:02x}")).collect();
    if octets.len() as u64 != m.taille || empreinte != m.sha256 {
        return Err("archive incomplète ou altérée".into());
    }

    let nom: String = m.version.chars().map(|c| if c.is_ascii_alphanumeric() || c == '.' || c == '-' { c } else { '_' }).collect();
    let final_ = dossier_moteurs.join(&nom);
    let temporaire = dossier_moteurs.join(format!("{nom}.tmp"));
    let _ = fs::remove_dir_all(&temporaire);
    fs::create_dir_all(&temporaire).map_err(|e| e.to_string())?;
    let extraction = (|| -> Result<(), String> {
        // unpack refuse les chemins qui sortiraient du dossier
        tar::Archive::new(flate2::read::GzDecoder::new(octets.as_slice()))
            .unpack(&temporaire)
            .map_err(|e| format!("extraction : {e}"))?;
        let manifeste: serde_json::Value = serde_json::from_slice(
            &fs::read(temporaire.join("manifest.json")).map_err(|_| "manifest.json absent")?,
        )
        .map_err(|_| "manifest.json illisible")?;
        if manifeste["version"] != m.version.as_str() || manifeste["api"] != m.api || !temporaire.join("moteur.js").is_file() {
            return Err("contenu de l'archive incohérent".into());
        }
        Ok(())
    })();
    if let Err(e) = extraction {
        let _ = fs::remove_dir_all(&temporaire);
        return Err(e);
    }
    let _ = fs::remove_dir_all(&final_);
    fs::rename(&temporaire, &final_).map_err(|e| e.to_string())?;

    let actif = Actif { version: m.version.clone(), publie_le: m.publie_le.clone(), dossier: nom };
    let chemin = dossier_moteurs.join("actif.json");
    let tmp = dossier_moteurs.join("actif.json.tmp");
    fs::write(&tmp, serde_json::to_vec(&actif).unwrap()).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &chemin).map_err(|e| e.to_string())?;
    Ok(actif)
}

/// Garde le moteur actif et celui utilisé par la session en cours, supprime les autres
pub fn nettoyer(dossier_moteurs: &Path, garder: &[&str]) {
    if let Ok(entrees) = fs::read_dir(dossier_moteurs) {
        for e in entrees.flatten() {
            let nom = e.file_name().to_string_lossy().to_string();
            if e.path().is_dir() && !garder.contains(&nom.as_str()) {
                let _ = fs::remove_dir_all(e.path());
            }
        }
    }
}

pub fn lire_actif(dossier_moteurs: &Path) -> Option<Actif> {
    let a: Actif = serde_json::from_slice(&fs::read(dossier_moteurs.join("actif.json")).ok()?).ok()?;
    dossier_moteurs.join(&a.dossier).join("moteur.js").is_file().then_some(a)
}

fn dossier_moteurs(app: &tauri::AppHandle) -> Option<PathBuf> {
    Some(app.path().app_data_dir().ok()?.join("moteurs"))
}

/// Moteur choisi au lancement : il sert toute la session
static SESSION: OnceLock<Option<(Actif, PathBuf)>> = OnceLock::new();

fn session(app: &tauri::AppHandle) -> &'static Option<(Actif, PathBuf)> {
    SESSION.get_or_init(|| {
        let d = dossier_moteurs(app)?;
        let a = lire_actif(&d)?;
        let racine = d.join(&a.dossier);
        Some((a, racine))
    })
}

/// Moteur téléchargé utilisé par cette session (None : moteur livré avec l'app)
#[tauri::command]
pub fn moteur_telecharge(app: tauri::AppHandle) -> Option<Actif> {
    session(&app).as_ref().map(|(a, _)| a.clone())
}

/// Cherche et installe une mise à jour ; elle sera active au prochain lancement
#[tauri::command]
pub async fn mettre_a_jour_moteur(app: tauri::AppHandle, api: u32, publie_actuel: String) -> Result<Option<String>, String> {
    let dossier = dossier_moteurs(&app).ok_or("dossier de données introuvable")?;
    fs::create_dir_all(&dossier).map_err(|e| e.to_string())?;
    let base = base_url();
    let Some(m) = chercher(&base, CLE_PUBLIQUE, api, &publie_actuel).await? else {
        return Ok(None);
    };
    let actif = installer(&base, &m, &dossier).await?;
    let en_cours = session(&app).as_ref().map(|(a, _)| a.dossier.clone());
    let mut garder = vec![actif.dossier.as_str()];
    if let Some(d) = en_cours.as_deref() {
        garder.push(d);
    }
    nettoyer(&dossier, &garder);
    Ok(Some(actif.version))
}

fn type_mime(chemin: &Path) -> &'static str {
    match chemin.extension().and_then(|e| e.to_str()).unwrap_or_default() {
        "js" | "mjs" => "text/javascript",
        "css" => "text/css",
        "json" => "application/json",
        "woff2" => "font/woff2",
        "woff" => "font/woff",
        "ttf" => "font/ttf",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        _ => "application/octet-stream",
    }
}

/// Protocole moteur:// : fichiers du moteur téléchargé de la session
pub fn servir(app: &tauri::AppHandle, requete: &tauri::http::Request<Vec<u8>>) -> tauri::http::Response<Vec<u8>> {
    let reponse = |statut: u16, mime: &str, corps: Vec<u8>| {
        tauri::http::Response::builder()
            .status(statut)
            .header("Content-Type", mime)
            .header("Access-Control-Allow-Origin", "*")
            .body(corps)
            .unwrap()
    };
    let Some((_, racine)) = session(app) else {
        return reponse(404, "text/plain", Vec::new());
    };
    let relatif = percent_decode(requete.uri().path().trim_start_matches('/'));
    let chemin = racine.join(&relatif);
    let r = match (chemin.canonicalize(), racine.canonicalize()) {
        (Ok(c), Ok(r)) if c.starts_with(&r) && c.is_file() => match fs::read(&c) {
            Ok(corps) => reponse(200, type_mime(&c), corps),
            Err(_) => reponse(500, "text/plain", Vec::new()),
        },
        _ => reponse(404, "text/plain", Vec::new()),
    };
    #[cfg(debug_assertions)]
    eprintln!("moteur:// {relatif} -> {}", r.status().as_u16());
    r
}

fn percent_decode(s: &str) -> String {
    let octets = s.as_bytes();
    let mut sortie = Vec::with_capacity(octets.len());
    let mut i = 0;
    while i < octets.len() {
        if octets[i] == b'%' && i + 2 < octets.len() {
            if let Ok(v) = u8::from_str_radix(&s[i + 1..i + 3], 16) {
                sortie.push(v);
                i += 3;
                continue;
            }
        }
        sortie.push(octets[i]);
        i += 1;
    }
    String::from_utf8_lossy(&sortie).into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};
    use std::io::{Read, Write};
    use std::net::TcpListener;

    /// Serveur HTTP minimal qui sert un dossier (un thread par requête)
    fn servir_dossier(dossier: PathBuf) -> String {
        let ecoute = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = ecoute.local_addr().unwrap().port();
        std::thread::spawn(move || {
            for flux in ecoute.incoming().flatten() {
                let dossier = dossier.clone();
                std::thread::spawn(move || {
                    let mut flux = flux;
                    let mut tampon = [0u8; 4096];
                    let n = flux.read(&mut tampon).unwrap_or(0);
                    let ligne = String::from_utf8_lossy(&tampon[..n]);
                    let chemin = ligne.split_whitespace().nth(1).unwrap_or("/").trim_start_matches('/').to_string();
                    let (statut, corps) = match fs::read(dossier.join(&chemin)) {
                        Ok(c) => ("200 OK", c),
                        Err(_) => ("404 Not Found", Vec::new()),
                    };
                    let _ = write!(flux, "HTTP/1.1 {statut}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n", corps.len());
                    let _ = flux.write_all(&corps);
                });
            }
        });
        format!("http://127.0.0.1:{port}/")
    }

    fn cle() -> SigningKey {
        SigningKey::from_bytes(&[7u8; 32])
    }

    fn cle_publique(c: &SigningKey) -> String {
        base64::engine::general_purpose::STANDARD.encode(c.verifying_key().to_bytes())
    }

    /// Publication d'un faux moteur, signée par `signataire`
    fn publier(dossier: &Path, version: &str, api: u32, publie_le: &str, signataire: &SigningKey) -> MiseAJour {
        let mut archive = Vec::new();
        {
            let gz = flate2::write::GzEncoder::new(&mut archive, flate2::Compression::fast());
            let mut tar = tar::Builder::new(gz);
            for (nom, contenu) in [
                ("manifest.json", format!(r#"{{"version":"{version}","api":{api},"entree":"moteur.js","css":"moteur.css"}}"#)),
                ("moteur.js", "export const API_MOTEUR = 1".into()),
                ("morceaux/exo.js", "export default 1".into()),
            ] {
                let mut entete = tar::Header::new_gnu();
                entete.set_size(contenu.len() as u64);
                entete.set_mode(0o644);
                entete.set_cksum();
                tar.append_data(&mut entete, nom, contenu.as_bytes()).unwrap();
            }
            tar.into_inner().unwrap().finish().unwrap();
        }
        let m = MiseAJour {
            format: FORMAT.into(),
            version: version.into(),
            api,
            publie_le: publie_le.into(),
            archive: format!("moteur-{version}.tar.gz"),
            taille: archive.len() as u64,
            sha256: Sha256::digest(&archive).iter().map(|o| format!("{o:02x}")).collect(),
        };
        let texte = serde_json::to_vec(&m).unwrap();
        fs::create_dir_all(dossier).unwrap();
        fs::write(dossier.join(&m.archive), &archive).unwrap();
        fs::write(dossier.join("mise-a-jour.json"), &texte).unwrap();
        let sig = signataire.sign(&texte);
        fs::write(dossier.join("mise-a-jour.json.sig"), base64::engine::general_purpose::STANDARD.encode(sig.to_bytes())).unwrap();
        m
    }

    #[tokio::test]
    async fn installe_une_publication_valide_et_l_active() {
        let serveur = tempfile::tempdir().unwrap();
        let donnees = tempfile::tempdir().unwrap();
        publier(serveur.path(), "2026-11-01+abc", 1, "2026-11-01T10:00:00Z", &cle());
        let base = servir_dossier(serveur.path().into());
        let m = chercher(&base, &cle_publique(&cle()), 1, "2026-10-13").await.unwrap().expect("plus récente");
        let actif = installer(&base, &m, donnees.path()).await.unwrap();
        assert_eq!(lire_actif(donnees.path()).unwrap().version, "2026-11-01+abc");
        assert!(donnees.path().join(&actif.dossier).join("morceaux/exo.js").is_file());
    }

    #[tokio::test]
    async fn ignore_une_publication_pas_plus_recente_ou_d_une_autre_api() {
        let serveur = tempfile::tempdir().unwrap();
        publier(serveur.path(), "v", 1, "2026-11-01T10:00:00Z", &cle());
        let base = servir_dossier(serveur.path().into());
        let cp = cle_publique(&cle());
        assert!(chercher(&base, &cp, 1, "2026-11-01T10:00:00Z").await.unwrap().is_none());
        assert!(chercher(&base, &cp, 2, "2026-10-13").await.unwrap().is_none());
    }

    #[tokio::test]
    async fn refuse_une_signature_d_une_autre_cle() {
        let serveur = tempfile::tempdir().unwrap();
        publier(serveur.path(), "v", 1, "2026-11-01T10:00:00Z", &SigningKey::from_bytes(&[9u8; 32]));
        let base = servir_dossier(serveur.path().into());
        let e = chercher(&base, &cle_publique(&cle()), 1, "2026-10-13").await.unwrap_err();
        assert!(e.contains("signature"), "{e}");
    }

    #[tokio::test]
    async fn refuse_une_archive_alteree_sans_toucher_au_moteur_actif() {
        let serveur = tempfile::tempdir().unwrap();
        let donnees = tempfile::tempdir().unwrap();
        let base = servir_dossier(serveur.path().into());
        let m1 = publier(serveur.path(), "un", 1, "2026-11-01T10:00:00Z", &cle());
        installer(&base, &m1, donnees.path()).await.unwrap();
        let m2 = publier(serveur.path(), "deux", 1, "2026-11-02T10:00:00Z", &cle());
        let chemin = serveur.path().join(&m2.archive);
        let mut octets = fs::read(&chemin).unwrap();
        let milieu = octets.len() / 2;
        octets[milieu] ^= 0xff;
        fs::write(&chemin, octets).unwrap();
        assert!(installer(&base, &m2, donnees.path()).await.unwrap_err().contains("altérée"));
        assert_eq!(lire_actif(donnees.path()).unwrap().version, "un");
    }

    /// Publication réelle (scripts/publier-moteur.mjs) vérifiée avec CLE_PUBLIQUE :
    /// MOTEUR_PUBLICATION=<dossier de sortie du script> cargo test -- --ignored
    #[tokio::test]
    #[ignore = "publication préparée par le script Node"]
    async fn accepte_une_publication_du_script() {
        let dossier = PathBuf::from(std::env::var("MOTEUR_PUBLICATION").expect("MOTEUR_PUBLICATION"));
        let donnees = tempfile::tempdir().unwrap();
        let base = servir_dossier(dossier);
        let m = chercher(&base, CLE_PUBLIQUE, 1, "2000").await.unwrap().expect("publication acceptée");
        let actif = installer(&base, &m, donnees.path()).await.unwrap();
        assert!(donnees.path().join(&actif.dossier).join("moteur.css").is_file());
    }

    #[test]
    fn la_cle_publique_de_l_app_est_valide() {
        let octets = base64::engine::general_purpose::STANDARD.decode(CLE_PUBLIQUE).unwrap();
        assert!(VerifyingKey::from_bytes(&octets.try_into().unwrap()).is_ok());
    }
}
