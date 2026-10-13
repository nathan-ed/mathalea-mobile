//! Téléchargement des fichiers de classe depuis les drives (lien public).
//! Fait côté Rust : sans en-tête Origin, que kDrive refuse quand il vient
//! d'une autre origine que la sienne (redirection vers une page d'erreur).

use serde::Serialize;
use tauri_plugin_http::reqwest;

#[derive(Serialize)]
pub struct Reponse {
    pub statut: u16,
    pub corps: Vec<u8>,
}

/// Tout drive en HTTPS (kDrive, Dropbox, Google Drive, Nextcloud…) ;
/// HTTP seulement pour un dossier partagé local (essais).
fn autorise(url: &reqwest::Url) -> bool {
    let hote = url.host_str().unwrap_or_default();
    match url.scheme() {
        "https" => true,
        "http" => hote == "127.0.0.1" || hote == "localhost",
        _ => false,
    }
}

#[tauri::command]
pub async fn telecharger(url: String) -> Result<Reponse, String> {
    let url = reqwest::Url::parse(&url).map_err(|_| "Adresse invalide".to_string())?;
    if !autorise(&url) {
        return Err("Adresse non autorisée".into());
    }
    let client = reqwest::Client::builder()
        .user_agent("MathALEA")
        .build()
        .map_err(|e| e.to_string())?;
    // Toujours la version du drive, jamais une copie gardée en route
    let r = client
        .get(url)
        .header(reqwest::header::CACHE_CONTROL, "no-cache")
        .send().await.map_err(|e| format!("Réseau : {e}"))?;
    let statut = r.status().as_u16();
    let corps = r.bytes().await.map_err(|e| format!("Réseau : {e}"))?.to_vec();
    Ok(Reponse { statut, corps })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Dossier kDrive de test fourni par Nathan (lecture seule)
    const KDRIVE: &str = "https://kdrive.infomaniak.com/2/app/120240/share/ba6c0e4d-4386-4789-80f5-8d824146b723";

    #[tokio::test]
    #[ignore = "réseau"]
    async fn lit_le_dossier_kdrive_de_test() {
        let init = telecharger(format!("{KDRIVE}/init")).await.unwrap();
        assert_eq!(init.statut, 200);
        let v: serde_json::Value = serde_json::from_slice(&init.corps).unwrap();
        let racine = v["data"]["file_id"].as_i64().unwrap();
        let liste = telecharger(format!("{KDRIVE}/files/{racine}/files?per_page=200&page=1")).await.unwrap();
        let v: serde_json::Value = serde_json::from_slice(&liste.corps).unwrap();
        let fichier = v["data"]
            .as_array()
            .unwrap()
            .iter()
            .find(|f| f["name"] == "parcours-mathalea.json")
            .expect("parcours-mathalea.json présent");
        let contenu = telecharger(format!("{KDRIVE}/files/{}/download", fichier["id"])).await.unwrap();
        assert_eq!(contenu.statut, 200);
        let v: serde_json::Value = serde_json::from_slice(&contenu.corps).unwrap();
        assert_eq!(v["format"], "classe-mathalea/1");
    }

    /// Dossier Dropbox de test fourni par Nathan : arrive en zip (dl=1)
    #[tokio::test]
    #[ignore = "réseau"]
    async fn lit_le_dossier_dropbox_de_test() {
        let r = telecharger(
            "https://www.dropbox.com/scl/fo/61ukfii2ul7wygvtn480a/AMdjmMSWDB0y5U5-HVi2oCU?rlkey=japzwkf6z8n5ocnc0ovxi4lrj&dl=1"
                .into(),
        )
        .await
        .unwrap();
        assert_eq!(r.statut, 200);
        assert_eq!(&r.corps[..2], b"PK", "un dossier Dropbox arrive en zip");
    }

    #[test]
    fn refuse_http_hors_local() {
        assert!(!autorise(&reqwest::Url::parse("http://exemple.ch/x").unwrap()));
        assert!(autorise(&reqwest::Url::parse("http://127.0.0.1:8702/s/x").unwrap()));
        assert!(autorise(&reqwest::Url::parse("https://kdrive.infomaniak.com/2/app/1/share/x/init").unwrap()));
    }
}
