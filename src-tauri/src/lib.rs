mod impression;
#[cfg(desktop)]
mod maj;
mod moteur;
mod partage;
mod telechargement;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let constructeur = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(partage::init());
    #[cfg(desktop)]
    let constructeur = constructeur.plugin(tauri_plugin_updater::Builder::new().build());
    constructeur
        .setup(|app| {
            #[cfg(target_os = "linux")]
            camera_linux(app);
            #[cfg(desktop)]
            maj::lancer(app.handle());
            #[cfg(not(any(target_os = "linux", desktop)))]
            let _ = app;
            Ok(())
        })
        // Moteur téléchargé (mise à jour), servi à l'interface par moteur://
        .register_uri_scheme_protocol("moteur", |ctx, requete| moteur::servir(ctx.app_handle(), &requete))
        .invoke_handler(tauri::generate_handler![
            telechargement::telecharger,
            moteur::mises_a_jour_moteur,
            moteur::moteur_telecharge,
            moteur::mettre_a_jour_moteur,
            partage::partager_fichier,
            partage::enregistrer_fichier,
            partage::barre_etat,
            partage::marges,
            impression::compiler_pdf
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app, _evenement| {
            // Bureau : la mise à jour téléchargée s'installe à la fermeture
            #[cfg(desktop)]
            if let tauri::RunEvent::Exit = _evenement {
                maj::installer(_app);
            }
        });
}

/// WebKitGTK n'ouvre pas la caméra par défaut : flux média activé, et la
/// demande de la page acceptée (lecture des QR codes des élèves). Les autres
/// systèmes demandent eux-mêmes l'autorisation à l'utilisateur.
#[cfg(target_os = "linux")]
fn camera_linux(app: &tauri::App) {
    use tauri::Manager;
    use webkit2gtk::glib::Cast;
    use webkit2gtk::{PermissionRequestExt, SettingsExt, UserMediaPermissionRequest, WebViewExt};
    for fenetre in app.webview_windows().values() {
        let _ = fenetre.with_webview(|vue| {
            let vue = vue.inner();
            if let Some(reglages) = WebViewExt::settings(&vue) {
                reglages.set_enable_media_stream(true);
            }
            vue.connect_permission_request(|_, demande| {
                if demande.downcast_ref::<UserMediaPermissionRequest>().is_some() {
                    demande.allow();
                    return true;
                }
                false
            });
        });
    }
}
