package fr.coopmaths.mathalea

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.util.Base64
import androidx.activity.result.ActivityResult
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.tauri.plugin.JSObject
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import java.io.File

@InvokeArg
class PartagerArgs {
  lateinit var nom: String
  var texte: String = ""
  // Fichier binaire (image) : ses octets en base64, à la place du texte
  var base64: String? = null
}

/** Contenu du fichier : octets de l'image, ou texte en UTF-8 */
private fun octets(args: PartagerArgs): ByteArray =
  args.base64?.let { Base64.decode(it, Base64.DEFAULT) } ?: args.texte.toByteArray(Charsets.UTF_8)

/** Type du fichier d'après son extension */
private fun typeDe(nom: String) = when {
  nom.endsWith(".csv") -> "text/csv"
  nom.endsWith(".txt") -> "text/plain"
  nom.endsWith(".png") -> "image/png"
  else -> "application/json"
}

@InvokeArg
class BarreEtatArgs {
  var sombre: Boolean = false
  // Utile sur iOS seulement (apparence rendue au téléphone)
  var telephone: Boolean = false
}

/** Feuille de partage d'Android pour un fichier (texte ou image) et icônes de la barre
 * d'état selon le thème de l'app (voir src-tauri/src/partage.rs) */
@TauriPlugin
class PartagePlugin(private val activity: Activity) : Plugin(activity) {
  @Command
  fun partager(invoke: Invoke) {
    try {
      val args = invoke.parseArgs(PartagerArgs::class.java)
      val dossier = File(activity.cacheDir, "partage")
      dossier.mkdirs()
      // Nom sans chemin : le fichier reste dans le cache de l'app
      val fichier = File(dossier, File(args.nom).name)
      fichier.writeBytes(octets(args))
      val uri = FileProvider.getUriForFile(activity, activity.packageName + ".fileprovider", fichier)
      val envoi = Intent(Intent.ACTION_SEND).apply {
        // Parcours en JSON, objectifs en CSV, réponses en texte, QR code en image
        type = typeDe(fichier.name)
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_TITLE, fichier.name)
        clipData = ClipData.newRawUri(fichier.name, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      activity.startActivity(Intent.createChooser(envoi, fichier.name))
      invoke.resolve()
    } catch (e: Exception) {
      invoke.reject(e.message ?: "Partage impossible")
    }
  }

  // Contenu à écrire dans le fichier que l'utilisateur est en train de choisir
  private var aEnregistrer: ByteArray? = null

  /** Enregistre le fichier là où l'utilisateur le choisit (Téléchargements,
   * carte SD…) avec le sélecteur de fichiers d'Android */
  @Command
  fun enregistrer(invoke: Invoke) {
    try {
      val args = invoke.parseArgs(PartagerArgs::class.java)
      aEnregistrer = octets(args)
      val nom = File(args.nom).name
      val choix = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = typeDe(nom)
        putExtra(Intent.EXTRA_TITLE, nom)
      }
      startActivityForResult(invoke, choix, "fichierChoisi")
    } catch (e: Exception) {
      invoke.reject(e.message ?: "Enregistrement impossible")
    }
  }

  @ActivityCallback
  fun fichierChoisi(invoke: Invoke, result: ActivityResult) {
    val texte = aEnregistrer
    aEnregistrer = null
    val uri = result.data?.data
    val r = JSObject()
    if (result.resultCode != Activity.RESULT_OK || uri == null || texte == null) {
      r.put("enregistre", false)
      invoke.resolve(r)
      return
    }
    try {
      // « wt » : un fichier existant choisi est remplacé, pas complété
      activity.contentResolver.openOutputStream(uri, "wt")?.use { it.write(texte) }
        ?: throw Exception("Fichier inaccessible")
      r.put("enregistre", true)
      invoke.resolve(r)
    } catch (e: Exception) {
      invoke.reject(e.message ?: "Enregistrement impossible")
    }
  }

  @Command
  fun barreEtat(invoke: Invoke) {
    val args = invoke.parseArgs(BarreEtatArgs::class.java)
    activity.runOnUiThread {
      val barres = WindowCompat.getInsetsController(activity.window, activity.window.decorView)
      barres.isAppearanceLightStatusBars = !args.sombre
      barres.isAppearanceLightNavigationBars = !args.sombre
    }
    invoke.resolve()
  }

  /** Barres du système (état en haut, navigation en bas), en pixels CSS */
  @Command
  fun marges(invoke: Invoke) {
    activity.runOnUiThread {
      val barres = ViewCompat.getRootWindowInsets(activity.window.decorView)
        ?.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
      val densite = activity.resources.displayMetrics.density
      val r = JSObject()
      r.put("haut", (barres?.top ?: 0) / densite)
      r.put("bas", (barres?.bottom ?: 0) / densite)
      invoke.resolve(r)
    }
  }
}
