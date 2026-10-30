// L'app installée sur le simulateur iPhone (build de débogage, WebView
// inspectable, notre moteur), pilotée comme un élève par Appium (XCUITest) :
// premier lancement, Réglages défilés au doigt (vrai glissé iOS), parcours de
// démonstration, un parcours répondu juste au clavier de MathALÉA jusqu'au
// bilan, Quitter vers l'accueil, thème sombre. Captures du vrai écran.
// Lancé par .github/workflows/emulateurs.yml (Appium et webdriverio installés
// à part, hors de package.json).
//   APP=<chemin .app> APPAREIL=<udid> CAPTURES=captures node appareil-ios.mjs
import { mkdirSync } from "node:fs";
import { remote } from "webdriverio";

const captures = process.env.CAPTURES ?? "captures";
mkdirSync(captures, { recursive: true });
let echecs = 0;
const ok = (cond, msg) => {
  if (!cond) echecs++;
  console.log(cond ? "✔" : "✘", msg);
};
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

/** Vrai glissé du doigt (natif XCUITest), en points de l'écran */
async function glisser(deY, versY) {
  await nav.switchContext("NATIVE_APP");
  const { width } = await nav.getWindowSize();
  await nav.execute("mobile: dragFromToForDuration", {
    fromX: width / 2,
    fromY: deY,
    toX: width / 2,
    toY: versY,
    duration: 0.3,
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

// 2. Réglages : défilement au doigt, puis démonstration chargée par l'enseignant
await toucher(
  await affiche(
    '//button[@aria-label="Réglages" or normalize-space(.)="Réglages"]',
  ),
);
const interrupteur = await attendre(await affiche('//*[@role="switch"]'));
const { height } = await nav.getWindowSize();
await glisser(height * 0.8, height * 0.2);
ok(
  (await scrollY()) > 100,
  `Réglages : le doigt fait descendre la page (${await scrollY()})`,
);
await capture("reglages-defiles");
await toucher(interrupteur);
await toucher(
  await attendre(await exact("Charger les parcours de démonstration")),
);
await pause(3000);
await capture("demonstration-chargee");
await toucher(await affiche('//*[@role="switch"]'));
const enregistrer = await exact("Enregistrer et quitter");
if (await enregistrer.isDisplayed().catch(() => false))
  await toucher(enregistrer);
else await nav.back();
await pause(1000);
const classe = await bouton("Démonstration");
if (await classe.isDisplayed().catch(() => false)) await toucher(classe);
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
    c === "-" ? ["-", "−", "–"] : c === "." || c === "," ? [","] : [c];
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
  else await nav.keys(c);
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
  const verifier = await nav.$(
    '(//button[normalize-space(.)="Vérifier"])[last()]',
  );
  const position = await nav.execute(() => {
    const v = [...document.querySelectorAll("button")]
      .filter((b) => b.innerText.trim() === "Vérifier")
      .at(-1)
      ?.getBoundingClientRect();
    const k = document
      .getElementById("mathalea-virtual-keyboard")
      ?.getBoundingClientRect();
    return { bas: v ? v.bottom : null, clavier: k && k.height ? k.top : null };
  });
  ok(
    position.bas != null &&
      (position.clavier == null || position.bas <= position.clavier + 2),
    `question ${tour + 1} : « Vérifier » au-dessus du clavier`,
  );
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
await toucher(await exact("Quitter"));
await toucher(await attendre(await exact("Reprendre plus tard")));
ok(
  await (
    await affiche(
      '//button[@aria-label="Réglages" or normalize-space(.)="Réglages"]',
    )
  ).isDisplayed(),
  "Quitter : « Reprendre plus tard » ramène à l’accueil",
);
ok(
  await (await affiche('//*[normalize-space(.)="En cours"]'))
    .isDisplayed()
    .catch(() => false),
  "accueil : la séance quittée est « En cours »",
);
await capture("accueil-en-cours");

// 5. Thème sombre de l'iPhone
await nav.switchContext("NATIVE_APP");
await nav.execute("mobile: setAppearance", { style: "dark" });
await pause(1500);
await webview();
await capture("accueil-sombre");
await toucher(await bouton("Fractions"));
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
