package fr.coopmaths.mathalea

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.tauri.plugin.JSObject
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import java.io.File

@InvokeArg
class PartagerArgs {
  lateinit var nom: String
  lateinit var texte: String
}

@InvokeArg
class BarreEtatArgs {
  var sombre: Boolean = false
  // Utile sur iOS seulement (apparence rendue au téléphone)
  var telephone: Boolean = false
}

/** Feuille de partage d'Android pour un fichier texte et icônes de la barre
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
      fichier.writeText(args.texte)
      val uri = FileProvider.getUriForFile(activity, activity.packageName + ".fileprovider", fichier)
      val envoi = Intent(Intent.ACTION_SEND).apply {
        // Parcours en JSON, liste d'objectifs en CSV
        type = if (fichier.name.endsWith(".csv")) "text/csv" else "application/json"
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
