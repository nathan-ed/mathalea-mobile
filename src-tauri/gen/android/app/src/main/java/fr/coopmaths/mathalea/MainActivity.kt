package fr.coopmaths.mathalea

import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    // Affichage bord à bord : Android ne réduit plus la page quand le clavier
    // s'ouvre, il la recouvre. Les barres d'actions du bas (Valider,
    // Enregistrer…) passaient dessous : un premier toucher pour fermer le
    // clavier, un second pour le bouton. La page s'arrête donc au-dessus du
    // clavier. La barre de navigation reste comptée par la page (--marge-bas,
    // marges.ts) : on retire sa hauteur pour ne pas la compter deux fois.
    val contenu = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(contenu) { vue, insets ->
      val clavier = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      val navigation = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom
      vue.setPadding(0, 0, 0, if (clavier > 0) maxOf(0, clavier - navigation) else 0)
      insets
    }
  }
}
