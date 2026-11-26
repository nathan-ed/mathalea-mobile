// L'app installée sur le simulateur iPhone (build de débogage, WebView
// inspectable, notre moteur), pilotée comme un élève par Appium (XCUITest) :
// premier lancement, Réglages défilés au doigt (vrai glissé iOS), dossier de
// démonstration ajouté par son lien, un parcours répondu juste au clavier de MathALÉA jusqu'au
// bilan, Quitter vers l'accueil, thème sombre. Captures du vrai écran.
// Lancé par .github/workflows/emulateurs.yml (Appium et webdriverio installés
// à part, hors de package.json).
//   APP=<chemin .app> APPAREIL=<udid> CAPTURES=captures node appareil-ios.mjs
import { mkdirSync, writeSync } from "node:fs";
import { remote } from "webdriverio";

const captures = process.env.CAPTURES ?? "captures";
mkdirSync(captures, { recursive: true });
let echecs = 0;
const ok = (cond, msg) => {
  if (!cond) echecs++;
  // Écriture synchrone : un arrêt brutal de la suite ne perd pas le journal
  writeSync(1, `${cond ? "✔" : "✘"} ${msg}\n`);
};
const note = (msg) => writeSync(1, `${msg}\n`);
process.on("unhandledRejection", (e) => {
  writeSync(1, `✘ arrêt : ${e?.stack ?? e}\n`);
  process.exit(1);
});
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const nav = await remote({
  hostname: "127.0.0.1",
  port: 4723,
  logLevel: "warn",
  connectionRetryTimeout: 900_000,
  capabilities: {
    platformName: "iOS",
    "appium:automationName": "XCUITest",
    "appium:udid": process.env.APPAREIL,
    "appium:app": process.env.APP,
    "appium:bundleId": "fr.coopmaths.mathalea",
    "appium:noReset": false,
    "appium:wdaLaunchTimeout": 600_000,
    "appium:newCommandTimeout": 600,
    "appium:webviewConnectTimeout": 60_000,
    "appium:includeSafariInWebviews": false,
  },
});

// Scripts asynchrones (réponses attendues par le moteur) : 1 ms par défaut
await nav.setTimeout({ script: 60_000 });
let n = 0;
const capture = async (nom) => {
  await pause(700);
  await nav.saveScreenshot(
    `${captures}/${String(++n).padStart(2, "0")}-${nom}.png`,
  );
};

/** Contexte de la WebView de l'app (et non le natif) */
async function webview() {
  for (let i = 0; i < 60; i++) {
    const contextes = await nav.getContexts();
    const w = contextes.find((c) => String(c.id ?? c).startsWith("WEBVIEW"));
    if (w) {
      await nav.switchContext(String(w.id ?? w));
      return;
    }
    await pause(2000);
  }
  throw new Error("WebView introuvable (inspectable ?)");
}

/** Premier élément affiché (un même titre peut exister caché, par exemple dans un chapitre replié) */
async function affiche(xpath) {
  for (let i = 0; i < 20; i++) {
    for (const el of await nav.$$(xpath)) if (await el.isDisplayed().catch(() => false)) return el;
    await pause(500);
  }
  return nav.$(xpath);
}
const bouton = (debut) =>
  affiche(`//button[starts-with(normalize-space(.), ${JSON.stringify(debut)})]`);
const exact = (texte) =>
  affiche(`//button[normalize-space(.)=${JSON.stringify(texte)}]`);
async function attendre(el, ms = 60_000) {
  el = await el;
  await el.waitForDisplayed({ timeout: ms });
  return el;
}
async function toucher(el) {
  el = await el;
  await el.scrollIntoView({ block: "center" }).catch(() => {});
  await el.click();
  await pause(400);
}
const scrollY = () => nav.execute(() => window.scrollY);

/**
 * Vrai glissé du doigt (natif XCUITest), en points de l'écran. Geste rapide :
 * dragFromToForDuration appuie d'abord 0,3 s, ce qu'iOS prend parfois pour un
 * appui long (sélection) au lieu d'un défilement.
 */
async function glisser(deY, versY) {
  await nav.switchContext("NATIVE_APP");
  const { width } = await nav.getWindowSize();
  await nav.execute("mobile: dragFromToWithVelocity", {
    fromX: width / 2,
    fromY: deY,
    toX: width / 2,
    toY: versY,
    pressDuration: 0.05,
    holdDuration: 0.05,
    velocity: 1500,
  });
  await pause(900);
  await webview();
}

await webview();
console.log(`WebView : ${await nav.execute(() => navigator.userAgent)}`);
const erreurs = [];
await nav.execute(() => {
  window.__erreurs = [];
  addEventListener("error", (e) => window.__erreurs.push(String(e.message)));
});

/** Feuille de partage ouverte deux fois de suite (la fenêtre qui la porte doit
 * disparaître à la fin) : « Copy » et « Save to Files » visibles en entier,
 * dans l'écran (0.6.1 et 0.8.0 : feuille coupée en bas à droite) */
async function essaisPartage() {
  await nav.switchContext("NATIVE_APP");
  const { width: largeurEcran, height: hauteurEcran } = await nav.getWindowSize();
  for (const fois of [1, 2]) {
    await webview();
    await nav.execute(() => window.__TAURI_INTERNALS__.invoke("partager_fichier", { nom: "essai.txt", texte: "essai" }));
    await nav.switchContext("NATIVE_APP");
    const boutons = ["'Copy', 'Copier'", "'Save to Files', 'Enregistrer dans Fichiers'"];
    for (const noms of boutons) {
      const b = await nav.$(`-ios predicate string:label IN {${noms}}`);
      // La première ouverture charge les applications de partage : plus lente
      const la = await b.waitForExist({ timeout: 90_000 }).then(() => true).catch(() => false);
      if (!la) {
        ok(false, `partage ${fois} : ${noms} introuvable`);
        continue;
      }
      await pause(1500);
      const r = await b.getElementRect(b.elementId);
      ok(
        r.x >= 0 && r.y >= 0 && r.x + r.width <= largeurEcran && r.y + r.height <= hauteurEcran,
        `partage ${fois} : « ${await b.getAttribute("label")} » en entier dans l'écran (x ${Math.round(r.x)}, y ${Math.round(r.y)}, ${Math.round(r.width)} × ${Math.round(r.height)} ; écran ${largeurEcran} × ${hauteurEcran})`,
      );
    }
    await capture(`partage-${fois}`);
    // Fermer comme un élève : la 1re fois en glissant la feuille vers le bas, la
    // 2e par un toucher à côté (au-dessus de la feuille)
    const ouverte = async () => {
      for (const r of await nav.$$("-ios predicate string:label IN {'Copy', 'Copier'}"))
        if (await r.isDisplayed().catch(() => false)) return true;
      return false;
    };
    const fermer = await nav.$("-ios predicate string:label IN {'Close', 'Fermer'}");
    let geste;
    if (await fermer.isDisplayed().catch(() => false)) {
      geste = "bouton Fermer";
      await fermer.click();
    } else if (fois === 1) {
      geste = "glissée vers le bas";
      await nav.execute("mobile: dragFromToForDuration", { fromX: Math.round(largeurEcran / 2), fromY: Math.round(hauteurEcran * 0.6), toX: Math.round(largeurEcran / 2), toY: hauteurEcran - 10, duration: 0.3 });
    } else {
      geste = "toucher à côté";
      await nav.execute("mobile: tap", { x: Math.round(largeurEcran / 2), y: 160 });
    }
    await pause(2500);
    const encore = await ouverte();
    ok(!encore, `partage ${fois} : feuille fermée (${geste})`);
    await capture(`partage-${fois}-fermee`);
    if (encore) {
      // Repli pour la suite des essais : glisser vers le bas
      await nav.execute("mobile: dragFromToForDuration", { fromX: Math.round(largeurEcran / 2), fromY: Math.round(hauteurEcran * 0.6), toX: Math.round(largeurEcran / 2), toY: hauteurEcran - 10, duration: 0.3 });
      await pause(2500);
      note(`  partage ${fois} : après un glissement vers le bas, ${(await ouverte()) ? "toujours ouverte" : "fermée"}`);
    }
  }
  await webview();
}

// Essais du partage seulement (branche d'essais de Claude, ou PARTAGE_SEUL=1) :
// pas de parcours d'élève, quelques minutes au lieu d'une demi-heure
if (process.env.PARTAGE_SEUL || process.env.GITHUB_REF_NAME === "ccr-3626951a-ud6bbr") {
  await attendre(bouton("France"), 120_000);
  await capture("premier-lancement");
  await essaisPartage();
  // Après le partage, la fenêtre de la feuille a disparu : l'app répond de nouveau
  // à un vrai toucher (une fenêtre restée par-dessus bloquerait tout l'écran)
  await nav.switchContext("NATIVE_APP");
  const france = await nav.$("-ios predicate string:label BEGINSWITH 'France'");
  await france.waitForExist({ timeout: 20_000 }).catch(() => {});
  const rf = await france.getElementRect(france.elementId).catch(() => null);
  if (rf) await nav.execute("mobile: tap", { x: Math.round(rf.x + rf.width / 2), y: Math.round(rf.y + rf.height / 2) });
  await pause(3000);
  await webview();
  const accueil = await nav.execute(() => !!document.querySelector('button[aria-label="Réglages"]'));
  ok(!!rf && accueil, "après le partage, un vrai toucher sur « France » ouvre l'accueil");
  await capture("apres-partage");
  await nav.deleteSession();
  note(echecs ? `ESSAIS DU PARTAGE : ${echecs} ÉCHEC(S)` : "ESSAIS DU PARTAGE : TOUT VERT");
  process.exit(echecs ? 1 : 0);
}

// 1. Premier lancement : programme
await attendre(bouton("France"), 120_000);
await capture("premier-lancement");
await toucher(await bouton("France"));
await attendre(
  await affiche(
    '//button[@aria-label="Réglages" or normalize-space(.)="Réglages"]',
  ),
);
ok(true, "premier lancement : France choisie, accueil de l’élève");

// 2. Réglages : défilement au doigt
await toucher(
  await affiche(
    '//button[@aria-label="Réglages" or normalize-space(.)="Réglages"]',
  ),
);
await attendre(await exact("Guide d’utilisation"));
const { height } = await nav.getWindowSize();
await glisser(height * 0.8, height * 0.2);
// Un second geste si le premier n'a pas pris (simulateur encore occupé)
if ((await scrollY()) <= 100) await glisser(height * 0.8, height * 0.2);
ok(
  (await scrollY()) > 100,
  `Réglages : le doigt fait descendre la page (${await scrollY()})`,
);
await capture("reglages-defiles");
await nav.execute(() => history.back()); // comme le geste de retour
await pause(1000);
// Dossier de démonstration (fichier public de la forge, lu comme le dossier
// partagé d'un enseignant) : collé dans le champ de l'accueil, comme un élève
const DEMO = "https://forge.apps.education.fr/coopmaths/mathalea-mobile/-/raw/main/static/demo/parcours-demonstration.json";
const champ = await attendre(await nav.$("#lien-accueil"));
await toucher(champ);
await champ.setValue(DEMO);
await toucher(await attendre(await exact("Ajouter le dossier")));
await attendre(await bouton("Nombres relatifs"));
ok(true, "démonstration : la classe et ses parcours sur l’accueil");
await capture("accueil-demonstration");

// 3. Parcours « Nombres relatifs » répondu juste, au clavier de MathALÉA
await toucher(await bouton("Nombres relatifs"));
await toucher(
  await affiche(
    '//button[starts-with(normalize-space(.), "Commencer") or starts-with(normalize-space(.), "Continuer")]',
  ),
);
const entrainement = await exact("Commencer l’entraînement");
if (await entrainement.waitForDisplayed({ timeout: 5000 }).catch(() => false))
  await toucher(entrainement);
await attendre(await nav.$("main math-field"), 120_000);
await pause(1500);
await capture("premiere-question");

/** Séance enregistrée par l'app (SQLite) et réponses attendues, régénérées par le moteur chargé */
const attendues = await nav.executeAsync((fini) => {
  (async () => {
    const { invoke } = window.__TAURI_INTERNALS__;
    await invoke("plugin:sql|load", { db: "sqlite:parcours.db" });
    const [ligne] = await invoke("plugin:sql|select", {
      db: "sqlite:parcours.db",
      query: "SELECT valeur FROM copies WHERE cle = $1",
      values: ["seance:relatifs-5e"],
    });
    const seance = JSON.parse(ligne.valeur);
    const man = await (await fetch("/moteur/manifest.json")).json();
    const m = await import("/moteur/" + man.entree);
    const res = {};
    for (const k of seance.etapes) {
      const ex = await m.preparerExercice(
        { ...seance.contenu.etapes[k], alea: seance.graines[k] },
        k,
      );
      res[k] = ex.interne.autoCorrection.map((a) => {
        const v = a?.valeur?.reponse?.value;
        return Array.isArray(v) ? String(v[0]) : v == null ? null : String(v);
      });
    }
    return res;
  })().then(fini, (e) => fini({ erreur: String(e) }));
});
console.log(`Réponses attendues : ${JSON.stringify(attendues)}`);

/** Touche du clavier de MathALÉA pour un caractère */
async function taper(c) {
  const voulus =
    c === "-" ? ["-", "−", "–", "\u2014"] : c === "." || c === "," ? [","] : [c];
  const i = await nav.execute(
    (voulus) =>
      [
        ...document.querySelectorAll("#mathalea-virtual-keyboard button"),
      ].findIndex(
        (b) =>
          b.offsetParent && voulus.includes(b.innerText.replace(/\s/g, "")),
      ),
    voulus,
  );
  if (i >= 0)
    await (await nav.$$("#mathalea-virtual-keyboard button"))[i].click();
  else {
    console.log(`  touche « ${c} » absente du clavier : clavier du téléphone`);
    await nav.keys(c);
  }
  await pause(150);
}

let verifiees = 0;
for (let tour = 0; tour < 20; tour++) {
  const champ = await nav.$('main math-field[id^="champTexteEx"]');
  if (!(await champ.isDisplayed().catch(() => false))) break;
  const [, ex, q] = /Ex(\d+)Q(\d+)/.exec(await champ.getAttribute("id"));
  const reponse = String(attendues[ex]?.[q] ?? "")
    .replace(/\{,\}/g, ",")
    .replace(/\\,|\s/g, "")
    .replace(".", ",");
  await toucher(champ);
  await pause(700);
  if (tour === 0) await capture("clavier-ouvert");
  for (const c of reponse) await taper(c);
  // Ce que le champ contient vraiment (touche « − » du clavier sur iPhone)
  console.log(`  saisi « ${reponse} » → champ ${JSON.stringify(await champ.getProperty("value"))}`);
  const verifier = await nav.$(
    '(//button[normalize-space(.)="Vérifier"])[last()]',
  );
  // Le clavier passe derrière la barre d'actions (56d36cf) : « Vérifier »
  // reste touchable sans fermer le clavier (rien par-dessus son centre)
  const touchable = await nav.execute(() => {
    const v = [...document.querySelectorAll("button")]
      .filter((b) => b.innerText.trim() === "Vérifier")
      .at(-1);
    if (!v) return false;
    const r = v.getBoundingClientRect();
    const x = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !!x && (x === v || v.contains(x));
  });
  ok(touchable, `question ${tour + 1} : « Vérifier » touchable, clavier ouvert`);
  ok(
    await verifier.isEnabled(),
    `question ${tour + 1} : « Vérifier » actif après « ${reponse} »`,
  );
  await verifier.click();
  await pause(1300);
  verifiees++;
  const suite = await affiche(
    '//button[normalize-space(.)="Question suivante" or normalize-space(.)="Voir le bilan"]',
  );
  if (!(await suite.isDisplayed().catch(() => false))) break;
  const bilan = (await suite.getText()).includes("bilan");
  await suite.click();
  await pause(1600);
  if (bilan) break;
}
await pause(1500);
const texte = await nav.execute(
  () => document.querySelector("main")?.innerText ?? "",
);
await capture("bilan");
ok(
  verifiees >= 9 && /9 \/ 9|100 %/.test(texte),
  `bilan : 9 / 9 (${verifiees} vérifiées)`,
);

// 4. Quitter une séance commencée : retour à l'accueil, la tuile « En cours »
const accueil = await affiche(
  '//button[starts-with(normalize-space(.), "Retour à l’accueil")]',
);
if (await accueil.isDisplayed().catch(() => false)) await toucher(accueil);
await toucher(
  (await nav.$$('//button[starts-with(normalize-space(.), "Fractions")]')).at(
    -1,
  ),
);
await toucher(
  await affiche(
    '//button[starts-with(normalize-space(.), "Commencer") or starts-with(normalize-space(.), "Continuer")]',
  ),
);
if (await entrainement.waitForDisplayed({ timeout: 5000 }).catch(() => false))
  await toucher(entrainement);
await attendre(await nav.$("main .contenu-mathalea"), 120_000);
await toucher(await affiche('//button[@aria-label="Quitter" or normalize-space(.)="Quitter"]'));
await toucher(await attendre(await exact("Reprendre plus tard")));
ok(
  await (
    await affiche(
      '//button[@aria-label="Réglages" or normalize-space(.)="Réglages"]',
    )
  ).isDisplayed(),
  "Quitter : « Reprendre plus tard » ramène à l’accueil",
);
// La séance quittée est reprise par l'action proposée (« Reprendre »), plus répétée dans « En cours »
ok(
  await (await affiche('//button[normalize-space(.)="Reprendre"]'))
    .isDisplayed()
    .catch(() => false),
  "accueil : la séance quittée se reprend (« Reprendre »)",
);
await capture("accueil-en-cours");

// 4 bis. Imprimer : la feuille de partage d'iOS s'ouvre en entier dans l'écran.
// Sans ancrage, iOS 26 l'ouvrait en bulle partant du coin en bas à droite, à
// moitié hors de l'écran (0.6.1, puis 0.8.0 sur un iPhone de Nathan).
await toucher(
  (await nav.$$('//button[starts-with(normalize-space(.), "Fractions")]')).at(-1),
);
await toucher(await attendre(affiche('//button[@aria-label="Imprimer"]')));
await toucher(await attendre(exact("Créer le PDF")));
await nav.switchContext("NATIVE_APP");
const { width: largeurEcran } = await nav.getWindowSize();
const copier = await nav.$(
  "-ios predicate string:label IN {'Copy', 'Copier', 'Save to Files', 'Enregistrer dans Fichiers'}",
);
// « Copier » existe même coupé (isDisplayed faux quand il sort de l'écran)
const feuilleOuverte = await copier
  .waitForExist({ timeout: 180_000 })
  .then(() => true)
  .catch(() => false);
await capture("feuille-de-partage");
if (feuilleOuverte) {
  const r = await copier.getElementRect(copier.elementId);
  ok(
    // « Copier » en bas à gauche de la feuille : visible en entier, dans la moitié gauche
    r.x >= 0 && r.x + r.width <= largeurEcran && r.x + r.width / 2 < largeurEcran / 2,
    `feuille de partage dans l'écran (« ${await copier.getAttribute("label")} » à x = ${Math.round(r.x)}, largeur de l'écran ${largeurEcran})`,
  );
  const fermer = await nav.$("-ios predicate string:label IN {'Close', 'Fermer'}");
  if (await fermer.isDisplayed().catch(() => false)) await fermer.click();
  else await nav.execute("mobile: swipe", { direction: "down" });
  await pause(1000);
} else ok(false, "feuille de partage ouverte après « Créer le PDF »");

await essaisPartage();
await webview();
await toucher(await affiche('//button[@aria-label="Revenir en arrière"]'));

// 5. Thème sombre de l'iPhone
await nav.switchContext("NATIVE_APP");
await nav.execute("mobile: setAppearance", { style: "dark" });
await pause(1500);
await webview();
await capture("accueil-sombre");
await toucher(await bouton("Fractions"));
// Depuis la 0.8.0, la ligne ouvre la page du parcours : « Continuer » reprend la séance
await toucher(
  await affiche(
    '//button[starts-with(normalize-space(.), "Commencer") or starts-with(normalize-space(.), "Continuer")]',
  ),
);
await attendre(await nav.$("main .contenu-mathalea"), 120_000);
await pause(1500);
await capture("seance-sombre");
await nav.switchContext("NATIVE_APP");
await nav.execute("mobile: setAppearance", { style: "light" });
await webview();

erreurs.push(...(await nav.execute(() => window.__erreurs ?? [])));
ok(erreurs.length === 0, `aucune erreur JavaScript ${erreurs.join(" | ")}`);
await nav.deleteSession();
console.log(echecs ? `${echecs} ÉCHEC(S)` : "TOUT VERT");
process.exit(echecs ? 1 : 0);
