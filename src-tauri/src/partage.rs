//! Partage d'un fichier par la feuille de partage d'Android (kDrive, Dropbox,
//! Drive, courriel…). Classe Kotlin : gen/android/…/PartagePlugin.kt.
//! Ailleurs, la commande répond false et l'interface enregistre le fichier.
//! Le même plugin règle la couleur des icônes de la barre d'état selon le
//! thème choisi dans l'app (sinon elles suivent le thème du téléphone).

use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

#[cfg(target_os = "android")]
struct Partage<R: Runtime>(tauri::plugin::PluginHandle<R>);

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("partage")
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                use tauri::Manager;
                let h = _api.register_android_plugin("fr.coopmaths.mathalea", "PartagePlugin")?;
                _app.manage(Partage(h));
            }
            Ok(())
        })
        .build()
}

/// Ouvre la feuille de partage avec le fichier `nom` contenant `texte`
#[tauri::command]
pub async fn partager_fichier<R: Runtime>(app: tauri::AppHandle<R>, nom: String, texte: String) -> Result<bool, String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        let p = app.state::<Partage<R>>();
        p.0.run_mobile_plugin::<serde_json::Value>("partager", serde_json::json!({ "nom": nom, "texte": texte }))
            .map_err(|e| e.to_string())?;
        return Ok(true);
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (app, nom, texte);
        Ok(false)
    }
}

/// Icônes de la barre d'état claires (thème sombre de l'app) ou foncées
#[tauri::command]
pub async fn barre_etat<R: Runtime>(app: tauri::AppHandle<R>, sombre: bool) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        let p = app.state::<Partage<R>>();
        p.0.run_mobile_plugin::<serde_json::Value>("barreEtat", serde_json::json!({ "sombre": sombre }))
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "android"))]
    let _ = (app, sombre);
    Ok(())
}

/// Hauteur des barres du système (Android), en pixels CSS : { haut, bas }
#[tauri::command]
pub async fn marges<R: Runtime>(app: tauri::AppHandle<R>) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        let p = app.state::<Partage<R>>();
        return p.0.run_mobile_plugin::<serde_json::Value>("marges", serde_json::json!({})).map_err(|e| e.to_string());
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Ok(serde_json::json!({ "haut": 0, "bas": 0 }))
    }
}
