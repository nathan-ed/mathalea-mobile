import Tauri
import UIKit
import WebKit

struct PartagerArgs: Decodable {
  let nom: String
  let texte: String
  // Fichier binaire (image) : ses octets en base64, à la place du texte
  let base64: String?
  // Essais sur le simulateur (e2e/appareil-ios.mjs) : manière de présenter la
  // feuille ; absente dans l'app
  let variante: String?
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
      let variante = args.variante ?? "centre"
      let ecran = vue.view.bounds
      // Sur iPad, la feuille s'ouvre dans une bulle qui doit être ancrée : au
      // centre, sans flèche. Sur iPhone, depuis iOS 26, la feuille de partage
      // s'ouvre aussi en bulle ; sans ancrage elle part du coin en bas à
      // droite, à moitié hors de l'écran, icônes coupées (0.6.1, puis 0.8.0
      // sur un iPhone ; reproduit sur le simulateur par e2e/appareil-ios.mjs).
      switch variante {
      case "feuille":
        feuille.modalPresentationStyle = .pageSheet
        if #available(iOS 18.0, *) { feuille.preferredTransition = .coverVertical }
        if let bas = feuille.sheetPresentationController {
          bas.detents = [.medium(), .large()]
          bas.prefersGrabberVisible = true
        }
      case "plein":
        feuille.modalPresentationStyle = .overFullScreen
        if #available(iOS 18.0, *) { feuille.preferredTransition = .coverVertical }
      default:
        if let bulle = feuille.popoverPresentationController {
          bulle.sourceView = vue.view
          bulle.sourceRect = variante == "bas"
            ? CGRect(x: ecran.midX, y: ecran.maxY - vue.view.safeAreaInsets.bottom - 8, width: 1, height: 1)
            : CGRect(x: ecran.midX, y: ecran.midY, width: 1, height: 1)
          bulle.permittedArrowDirections = []
        }
        if variante == "transition", #available(iOS 18.0, *) { feuille.preferredTransition = .coverVertical }
      }
      let decrire = { (moment: String) in
        NSLog("Partage[\(variante)] \(moment) : style \(feuille.modalPresentationStyle.rawValue), présentation \(String(describing: feuille.presentationController.map { type(of: $0) })), cadre \(NSCoder.string(for: feuille.view.frame)) dans \(NSCoder.string(for: ecran)), fenêtre \(String(describing: feuille.view.window != nil))")
      }
      vue.present(feuille, animated: variante != "sans-animation") {
        decrire("présentée")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { decrire("après 2 s") }
      }
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
