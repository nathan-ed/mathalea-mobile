mod moteur;
mod partage;
mod telechargement;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(partage::init())
        // Moteur téléchargé (mise à jour), servi à l'interface par moteur://
        .register_uri_scheme_protocol("moteur", |ctx, requete| moteur::servir(ctx.app_handle(), &requete))
        .invoke_handler(tauri::generate_handler![
            telechargement::telecharger,
            moteur::mises_a_jour_moteur,
            moteur::moteur_telecharge,
            moteur::mettre_a_jour_moteur,
            partage::partager_fichier,
            partage::barre_etat,
            partage::marges
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
