fn main() {
    // Android 15+ et Google Play : bibliothèques natives alignées sur des pages
    // de 16 Ko (sinon la Play Console refuse le bundle). Par build.rs plutôt
    // que .cargo/config.toml : Tauri impose RUSTFLAGS pour Android.
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("android") {
        println!("cargo:rustc-link-arg=-Wl,-z,max-page-size=16384");
    }
    // iOS : compile le plugin Swift « partage » (ios/) et le lie à l'app,
    // comme le font les plugins Tauri officiels (seulement sur macOS)
    #[cfg(target_os = "macos")]
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("ios") {
        ios::lier_plugin();
    }
    tauri_build::build()
}

#[cfg(target_os = "macos")]
mod ios {
    use std::path::{Path, PathBuf};

    pub fn lier_plugin() {
        let racine = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
        // API Swift de Tauri, fournie par la caisse tauri (links = "Tauri")
        let api = PathBuf::from(std::env::var("DEP_TAURI_IOS_LIBRARY_PATH").expect("DEP_TAURI_IOS_LIBRARY_PATH absent"));
        let copie = racine.join(".tauri").join("tauri-api");
        let _ = std::fs::remove_dir_all(&copie);
        copier(&api, &copie);
        println!("cargo:rerun-if-changed=ios");
        tauri_utils::build::link_apple_library("mathalea-partage", racine.join("ios"));
    }

    fn copier(de: &Path, vers: &Path) {
        std::fs::create_dir_all(vers).unwrap();
        for e in std::fs::read_dir(de).unwrap() {
            let e = e.unwrap();
            let nom = e.file_name();
            if [".build", "Package.resolved", "Tests"].iter().any(|n| nom == *n) {
                continue;
            }
            if e.file_type().unwrap().is_dir() {
                copier(&e.path(), &vers.join(&nom));
            } else {
                std::fs::copy(e.path(), vers.join(&nom)).unwrap();
            }
        }
    }
}
