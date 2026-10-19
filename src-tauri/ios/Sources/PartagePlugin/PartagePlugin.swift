import Tauri
import UIKit
import WebKit

struct PartagerArgs: Decodable {
  let nom: String
  let texte: String
  // Fichier binaire (image) : ses octets en base64, à la place du texte
  let base64: String?
}

struct BarreEtatArgs: Decodable {
  let sombre: Bool
  let telephone: Bool
}

/// Feuille de partage d'iOS pour un fichier (texte ou image), apparence de la barre
/// d'état selon le thème de l'app et zones sûres de l'écran (voir
/// src-tauri/src/partage.rs ; équivalent Android : PartagePlugin.kt).
class PartagePlugin: Plugin {
  @objc public func partager(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(PartagerArgs.self)
    // Nom sans chemin : le fichier reste dans le dossier temporaire de l'app
    let nom = (args.nom as NSString).lastPathComponent
    let dossier = FileManager.default.temporaryDirectory.appendingPathComponent("partage")
    let fichier = dossier.appendingPathComponent(nom)
    do {
      try FileManager.default.createDirectory(at: dossier, withIntermediateDirectories: true)
      if let b = args.base64 {
        guard let octets = Data(base64Encoded: b) else { throw CocoaError(.fileWriteUnknown) }
        try octets.write(to: fichier, options: .atomic)
      } else {
        try args.texte.write(to: fichier, atomically: true, encoding: .utf8)
      }
    } catch {
      invoke.reject("Partage impossible : \(error.localizedDescription)")
      return
    }
    DispatchQueue.main.async {
      guard let vue = self.manager.viewController else {
        invoke.reject("Partage impossible")
        return
      }
      let feuille = UIActivityViewController(activityItems: [fichier], applicationActivities: nil)
      // Sur iPad, la feuille s'ouvre dans une bulle qui doit être ancrée
      UIUtils.centerPopover(rootViewController: vue, popoverController: feuille)
      vue.present(feuille, animated: true)
      invoke.resolve()
    }
  }

  /// Le texte de la barre d'état suit l'apparence de la fenêtre : on impose
  /// celle du thème choisi dans l'app. Quand l'app suit le téléphone, on ne
  /// l'impose pas : la page continue de voir les changements du téléphone.
  @objc public func barreEtat(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(BarreEtatArgs.self)
    DispatchQueue.main.async {
      self.manager.viewController?.view.window?.overrideUserInterfaceStyle =
        args.telephone ? .unspecified : (args.sombre ? .dark : .light)
      invoke.resolve()
    }
  }

  /// Zones sûres (encoche, barre d'accueil), en points, soit des pixels CSS
  @objc public func marges(_ invoke: Invoke) {
    DispatchQueue.main.async {
      let zones = self.manager.viewController?.view.safeAreaInsets ?? .zero
      invoke.resolve(["haut": Double(zones.top), "bas": Double(zones.bottom)])
    }
  }
}

@_cdecl("init_plugin_partage")
func initPlugin() -> Plugin {
  return PartagePlugin()
}
