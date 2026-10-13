package fr.coopmaths.mathalea

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import androidx.core.content.FileProvider
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

/** Feuille de partage d'Android pour un fichier texte (voir src-tauri/src/partage.rs) */
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
        type = "application/json"
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
}
