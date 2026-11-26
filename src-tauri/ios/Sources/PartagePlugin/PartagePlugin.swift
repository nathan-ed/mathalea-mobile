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
      let variante = args.variante ?? "centre"
      PartagePlugin.diagnostic("avant", vue)
      if variante == "document" {
        // Aperçu du fichier (Quick Look) avec son propre bouton de partage
        let doc = UIDocumentInteractionController(url: fichier)
        PartagePlugin.documents = doc
        let ecran = vue.view.bounds
        doc.presentOptionsMenu(from: CGRect(x: ecran.midX, y: ecran.midY, width: 1, height: 1), in: vue.view, animated: true)
        invoke.resolve()
        return
      }
      let feuille = UIActivityViewController(activityItems: [fichier], applicationActivities: nil)
      var presentateur: UIViewController = vue
      if variante == "fenetre", let scene = vue.view.window?.windowScene {
        // Fenêtre à part, au-dessus de celle de l'app, avec un contrôleur neuf
        // (indépendant du contrôleur et de la vue de Tao) ; retirée à la fin
        let fenetre = UIWindow(windowScene: scene)
        fenetre.frame = scene.coordinateSpace.bounds
        fenetre.windowLevel = .alert
        fenetre.backgroundColor = .clear
        let support = UIViewController()
        support.view.backgroundColor = .clear
        fenetre.rootViewController = support
        fenetre.makeKeyAndVisible()
        PartagePlugin.fenetre = fenetre
        presentateur = support
        PartagePlugin.diagnostic("fenêtre à part", support)
        feuille.completionWithItemsHandler = { _, _, _, _ in
          PartagePlugin.fenetre?.isHidden = true
          PartagePlugin.fenetre = nil
          vue.view.window?.makeKeyAndVisible()
        }
      }
      if variante == "compact", #available(iOS 17.0, *) {
        feuille.traitOverrides.horizontalSizeClass = .compact
      }
      if let bulle = feuille.popoverPresentationController {
        let ecran = presentateur.view.bounds
        bulle.sourceView = presentateur.view
        bulle.sourceRect = CGRect(x: ecran.midX, y: ecran.midY, width: 1, height: 1)
        bulle.permittedArrowDirections = []
      }
      presentateur.present(feuille, animated: true) {
        PartagePlugin.diagnostic("présentée [\(variante)]", feuille)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { PartagePlugin.diagnostic("après 2 s [\(variante)]", feuille) }
      }
      invoke.resolve()
    }
  }

  static var fenetre: UIWindow?
  static var documents: UIDocumentInteractionController?

  /// Journal des essais sur le simulateur : géométrie et classes de taille du
  /// contrôleur, de ses vues parentes et de sa fenêtre
  static func diagnostic(_ moment: String, _ c: UIViewController) {
    let t = c.traitCollection
    var lignes = ["Partage[\(moment)] \(type(of: c)) style \(c.modalPresentationStyle.rawValue) présentation \(String(describing: c.presentationController.map { type(of: $0) })) tailles h \(t.horizontalSizeClass.rawValue) v \(t.verticalSizeClass.rawValue) idiome \(t.userInterfaceIdiom.rawValue) échelle \(t.displayScale)"]
    var v: UIView? = c.view
    var n = 0
    while let vue = v, n < 8 {
      lignes.append("  \(type(of: vue)) cadre \(NSCoder.string(for: vue.frame)) transformation \(NSCoder.string(for: vue.transform))")
      v = vue.superview
      n += 1
    }
    if let w = c.view.window {
      lignes.append("  fenêtre \(type(of: w)) \(NSCoder.string(for: w.frame)) niveau \(w.windowLevel.rawValue) écran \(NSCoder.string(for: w.screen.bounds)) scène \(String(describing: w.windowScene?.interfaceOrientation.rawValue)) tailles h \(w.traitCollection.horizontalSizeClass.rawValue) racine \(String(describing: w.rootViewController.map { type(of: $0) }))")
    }
    if let conteneur = c.presentationController?.containerView {
      lignes.append("  conteneur \(NSCoder.string(for: conteneur.frame))")
    }
    NSLog("%@", lignes.joined(separator: "\n"))
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
