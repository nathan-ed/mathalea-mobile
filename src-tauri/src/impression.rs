//! Impression : compile en PDF une fiche Typst préparée par le moteur
//! MathALÉA (`sourceTypst`). Le compilateur Typst est dans l'app, avec les
//! paquets @preview des fiches et leurs polices (src-tauri/typst/, voir
//! scripts/typst-ressources.sh) : tout marche hors ligne, rien n'est téléchargé.

use std::collections::HashMap;
use std::sync::OnceLock;

use include_dir::{include_dir, Dir};
use typst::diag::{FileError, FileResult, SourceDiagnostic};
use typst::foundations::{Bytes, Datetime, Duration};
use typst::syntax::{FileId, RootedPath, Source, VirtualPath, VirtualRoot};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Library, LibraryExt, World};
use typst_layout::PagedDocument;

static PAQUETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/typst/paquets");
static POLICES: Dir = include_dir!("$CARGO_MANIFEST_DIR/typst/polices");

/// Bibliothèque standard et polices, préparées une seule fois
struct Communs {
    library: LazyHash<Library>,
    book: LazyHash<FontBook>,
    fonts: Vec<Font>,
}

fn communs() -> &'static Communs {
    static C: OnceLock<Communs> = OnceLock::new();
    C.get_or_init(|| {
        let fonts: Vec<Font> = POLICES
            .files()
            .filter(|f| matches!(f.path().extension().and_then(|e| e.to_str()), Some("otf" | "ttf")))
            .flat_map(|f| Font::iter(Bytes::new(f.contents())))
            .collect();
        Communs {
            library: LazyHash::new(Library::default()),
            book: LazyHash::new(FontBook::from_fonts(&fonts)),
            fonts,
        }
    })
}

/// Un document : sa source et les fichiers qu'il lit (images des fiches de cours)
struct Monde {
    principal: FileId,
    source: Source,
    fichiers: HashMap<String, Bytes>,
    aujourdhui: Option<Datetime>,
}

impl Monde {
    fn lire(&self, id: FileId) -> FileResult<Bytes> {
        let chemin = id.get();
        let relatif = chemin.vpath().get_without_slash();
        match chemin.root() {
            VirtualRoot::Project => self.fichiers.get(relatif).cloned(),
            VirtualRoot::Package(p) if p.namespace == "preview" => PAQUETS
                .get_file(format!("preview/{}/{}/{}", p.name, p.version, relatif))
                .map(|f| Bytes::new(f.contents())),
            VirtualRoot::Package(_) => None,
        }
        .ok_or_else(|| FileError::NotFound(relatif.into()))
    }
}

impl World for Monde {
    fn library(&self) -> &LazyHash<Library> {
        &communs().library
    }
    fn book(&self) -> &LazyHash<FontBook> {
        &communs().book
    }
    fn main(&self) -> FileId {
        self.principal
    }
    fn source(&self, id: FileId) -> FileResult<Source> {
        if id == self.principal {
            return Ok(self.source.clone());
        }
        let octets = self.lire(id)?;
        let texte = std::str::from_utf8(&octets).map_err(|_| FileError::InvalidUtf8)?;
        Ok(Source::new(id, texte.into()))
    }
    fn file(&self, id: FileId) -> FileResult<Bytes> {
        self.lire(id)
    }
    fn font(&self, index: usize) -> Option<Font> {
        communs().fonts.get(index).cloned()
    }
    fn today(&self, _decalage: Option<Duration>) -> Option<Datetime> {
        self.aujourdhui
    }
}

/// Message lisible des erreurs de compilation (les premières seulement)
fn erreurs(diagnostics: &[SourceDiagnostic]) -> String {
    diagnostics
        .iter()
        .take(5)
        .map(|d| d.message.to_string())
        .collect::<Vec<_>>()
        .join(" ; ")
}

/// Compile `source` en PDF. `fichiers` : chemin dans le projet → octets.
pub fn compiler(source: String, fichiers: HashMap<String, Vec<u8>>) -> Result<Vec<u8>, String> {
    let principal = RootedPath::new(VirtualRoot::Project, VirtualPath::new("fiche.typ").map_err(|e| format!("{e:?}"))?).intern();
    let maintenant = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let jours = maintenant.div_euclid(86_400);
    let monde = Monde {
        principal,
        source: Source::new(principal, source),
        fichiers: fichiers.into_iter().map(|(k, v)| (k.trim_start_matches('/').to_string(), Bytes::new(v))).collect(),
        aujourdhui: date_du_jour(jours),
    };
    let document = typst::compile::<PagedDocument>(&monde).output.map_err(|e| erreurs(&e))?;
    typst_pdf::pdf(&document, &typst_pdf::PdfOptions::default()).map_err(|e| erreurs(&e))
}

/// Date civile (UTC) du jour numéro `jours` depuis le 1er janvier 1970
fn date_du_jour(jours: i64) -> Option<Datetime> {
    // Algorithme de Howard Hinnant (days_from_civil inversé)
    let z = jours + 719_468;
    let ere = z.div_euclid(146_097);
    let doe = z - ere * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let jour = (doy - (153 * mp + 2) / 5 + 1) as u8;
    let mois = if mp < 10 { mp + 3 } else { mp - 9 } as u8;
    let annee = (yoe + ere * 400 + if mois <= 2 { 1 } else { 0 }) as i32;
    Datetime::from_ymd(annee, mois, jour)
}

/// Compile la fiche en PDF, hors du fil de l'interface. Réponse en octets
/// bruts (pas un tableau JSON de plusieurs centaines de milliers de nombres).
#[tauri::command]
pub async fn compiler_pdf(source: String, fichiers: Option<HashMap<String, Vec<u8>>>) -> Result<tauri::ipc::Response, String> {
    let pdf = tauri::async_runtime::spawn_blocking(move || compiler(source, fichiers.unwrap_or_default()))
        .await
        .map_err(|e| e.to_string())??;
    Ok(tauri::ipc::Response::new(pdf))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn date_du_jour_civile() {
        assert_eq!(date_du_jour(0), Datetime::from_ymd(1970, 1, 1));
        assert_eq!(date_du_jour(20_759), Datetime::from_ymd(2026, 11, 2));
        assert_eq!(date_du_jour(11_016), Datetime::from_ymd(2000, 2, 29));
    }

    #[test]
    fn compile_avec_les_paquets_embarques() {
        let source = r#"
#import "@preview/exercise-bank:0.8.0": exo
#import "@preview/cetz:0.5.2"
#import "@preview/tiaoma:0.3.0": qrcode
#set text(font: "Libertinus Serif", lang: "fr")
#show math.equation: set text(font: "Libertinus Math")
= Fiche
Résoudre $x^2 - 5x + 6 = 0$.
#cetz.canvas({ cetz.draw.circle((0, 0), radius: 1) })
#qrcode("https://coopmaths.fr")
#image("cours/carre.svg", width: 2cm)
"#;
        let svg = br#"<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>"#;
        let fichiers = HashMap::from([("cours/carre.svg".to_string(), svg.to_vec())]);
        let pdf = compiler(source.into(), fichiers).expect("compilation");
        assert!(pdf.starts_with(b"%PDF"));
    }

    #[test]
    fn erreur_lisible() {
        let e = compiler("#nimporte-quoi()".into(), HashMap::new()).unwrap_err();
        assert!(e.contains("unknown variable"), "{e}");
    }
}
