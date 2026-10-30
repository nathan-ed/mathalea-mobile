// L'app installée sur un émulateur Android (APK de débogage, notre moteur),
// pilotée comme un élève dans sa vraie WebView : premier lancement, Réglages,
// parcours de démonstration, défilement au doigt, un parcours répondu juste
// au clavier de MathALÉA jusqu'au bilan, Quitter vers l'accueil, thème sombre.
// Lancé par .github/workflows/emulateurs.yml (Android 11 et Android récent).
// Il faut adb, un émulateur démarré et l'app installée.
//   CAPTURES=captures node e2e/appareil-android.mjs
import { mkdirSync } from "node:fs";
import { _android as android } from "playwright";

const PAQUET = "fr.coopmaths.mathalea";
const captures = process.env.CAPTURES ?? "captures";
mkdirSync(captures, { recursive: true });
let echecs = 0;
const ok = (cond, msg) => {
  if (!cond) echecs++;
  console.log(cond ? "✔" : "✘", msg);
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const [appareil] = await android.devices();
if (!appareil) throw new Error("aucun appareil adb");
console.log(
  `Appareil : ${appareil.model()} (${appareil.serial()}), Android ${(await appareil.shell("getprop ro.build.version.release")).toString().trim()}`,
);
let n = 0;
const capture = async (nom) => {
  await pause(600);
  await appareil.screenshot({
    path: `${captures}/${String(++n).padStart(2, "0")}-${nom}.png`,
  });
};

async function lancer() {
  await appareil.shell(`am force-stop ${PAQUET}`);
  await appareil.shell(
    `monkey -p ${PAQUET} -c android.intent.category.LAUNCHER 1`,
  );
  const vue = await appareil.webView({ pkg: PAQUET }, { timeout: 60_000 });
  const page = await vue.page();
  page.setDefaultTimeout(30_000);
  await page.waitForLoadState("domcontentloaded");
  return page;
}

let page = await lancer();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(e.message));
const consoles = [];
page.on("console", (m) => consoles.push(`${m.type()}: ${m.text()}`));
process.on("uncaughtException", async (e) => {
  console.log(`✘ arrêt : ${e.message.split("\n")[0]}`);
  console.log(`Console de la WebView :\n${consoles.slice(-40).join("\n")}`);
  console.log(`Page : ${(await page.evaluate(() => document.body?.innerText?.slice(0, 500)).catch(() => "?"))}`);
  await capture("erreur").catch(() => {});
  process.exit(1);
});
console.log(`WebView : ${await page.evaluate(() => navigator.userAgent)}`);
const scrollY = () => page.evaluate(() => scrollY);

/** Glissé du doigt (vrais événements tactiles de la WebView) */
async function glisser(x, y1, y2) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: y1 }],
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y1 + ((y2 - y1) * i) / 12 }],
    });
    await pause(16);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await pause(700);
}
/** Toucher du doigt au centre d'un élément (vrais événements tactiles de la WebView) */
async function tapLoc(loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error("élément invisible");
  const point = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
const toucher = async (loc) => {
  await loc.scrollIntoViewIfNeeded();
  await tapLoc(loc);
  await pause(300);
};

// 0. WebView trop ancienne (Android 11 sans mise à jour) : l'app le dit et
// propose la mise à jour ; rien d'autre à essayer sur cet appareil
await page
  .getByRole("button", { name: /^\s*France|Mettre à jour Android System WebView/ })
  .first()
  .waitFor({ timeout: 90_000 });
if (await page.getByText("Mise à jour nécessaire").isVisible()) {
  await capture("webview-ancienne");
  ok(
    await page.getByRole("button", { name: "Mettre à jour Android System WebView" }).isVisible(),
    `WebView ${await page.evaluate(() => /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1])} : écran « Mise à jour nécessaire » avec le bouton du Play Store`,
  );
  console.log("WebView trop ancienne sur cet émulateur : parcours de l'élève non joué.");
  await appareil.close();
  process.exit(echecs ? 1 : 0);
}

// 1. Premier lancement : programme
await capture("premier-lancement");
await toucher(page.getByRole("button", { name: /^\s*France/ }).first());
await page.getByRole("button", { name: "Réglages" }).first().waitFor();
ok(true, "premier lancement : France choisie, accueil de l’élève");

// 2. Réglages : défilement au doigt, puis démonstration chargée par l'enseignant
await toucher(page.getByRole("button", { name: "Réglages" }).first());
await page.getByRole("switch", { name: /Je suis enseignant/ }).waitFor();
const hauteur = await page.evaluate(() => innerHeight);
await glisser(180, hauteur - 120, 120);
ok(
  (await scrollY()) > 100,
  `Réglages : le doigt fait descendre la page (${await scrollY()})`,
);
await capture("reglages-defiles");
await toucher(page.getByRole("switch", { name: /Je suis enseignant/ }));
await toucher(
  page.getByRole("button", { name: "Charger les parcours de démonstration" }),
);
await page
  .getByRole("status")
  .filter({ hasText: /démonstration/i })
  .waitFor({ timeout: 60_000 })
  .catch(() => {});
await capture("demonstration-chargee");
await toucher(page.getByRole("switch", { name: /Je suis enseignant/ }));
const quitter = page.getByRole("button", { name: "Enregistrer et quitter" });
if (await quitter.isVisible().catch(() => false)) await toucher(quitter);
else await page.goBack();
await pause(800);
const classe = page.getByRole("button", { name: /^\s*Démonstration/ });
if (
  await classe
    .first()
    .isVisible()
    .catch(() => false)
)
  await toucher(classe.first());
await page
  .getByRole("button", { name: /^\s*Nombres relatifs/ })
  .first()
  .waitFor({ timeout: 60_000 });
ok(true, "démonstration : la classe et ses parcours sur l’accueil");
await capture("accueil-demonstration");

// 3. Parcours « Nombres relatifs » répondu juste, au clavier de MathALÉA
await toucher(
  page.getByRole("button", { name: /^\s*Nombres relatifs/ }).first(),
);
await toucher(
  page.getByRole("button", { name: /^(Commencer|Continuer)/ }).first(),
);
const entrainement = page.getByRole("button", {
  name: "Commencer l’entraînement",
});
if (await entrainement.isVisible({ timeout: 4000 }).catch(() => false))
  await toucher(entrainement);
await page.locator("main math-field").first().waitFor({ timeout: 90_000 });
await pause(1500);
await capture("premiere-question");

/** Séance enregistrée par l'app (SQLite) et réponses attendues, régénérées par le moteur chargé */
const attendues = await page.evaluate(async () => {
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
});
console.log(`Réponses attendues : ${JSON.stringify(attendues)}`);

/** Touche du clavier de MathALÉA pour un caractère, sinon le clavier du téléphone */
async function taper(c) {
  const touches = page.locator("#mathalea-virtual-keyboard button:visible");
  const textes = await touches.evaluateAll((bs) =>
    bs.map((b) => b.innerText.replace(/\s/g, "")),
  );
  const voulus =
    c === "-" ? ["-", "−", "–", "\u2014"] : c === "." || c === "," ? [","] : [c];
  const i = textes.findIndex((t) => voulus.includes(t));
  if (i >= 0) await tapLoc(touches.nth(i));
  else await page.keyboard.type(c);
  await pause(120);
}

let verifiees = 0;
for (let tour = 0; tour < 20; tour++) {
  const champ = page.locator('main math-field[id^="champTexteEx"]').first();
  if (!(await champ.isVisible().catch(() => false))) break;
  const [, ex, q] = /Ex(\d+)Q(\d+)/.exec(await champ.getAttribute("id"));
  const reponse = (attendues[ex]?.[q] ?? "")
    .replace(/\{,\}/g, ",")
    .replace(/\\,|\s/g, "")
    .replace(".", ",");
  await toucher(champ);
  await pause(600);
  if (tour === 0) await capture("clavier-ouvert");
  for (const c of reponse) await taper(c);
  const verifier = page
    .getByRole("button", { name: "Vérifier", exact: true })
    .last();
  // La barre d'actions reste au-dessus du clavier : touchable sans le fermer
  const b = await verifier.boundingBox();
  const k = await page
    .locator("#mathalea-virtual-keyboard")
    .boundingBox()
    .catch(() => null);
  ok(
    !!b && (!k || b.y + b.height <= k.y + 2),
    `question ${tour + 1} : « Vérifier » au-dessus du clavier`,
  );
  ok(
    await verifier.isEnabled(),
    `question ${tour + 1} : « Vérifier » actif après « ${reponse} »`,
  );
  await tapLoc(verifier);
  await pause(1200);
  verifiees++;
  const suite = page.getByRole("button", {
    name: /^(Question suivante|Voir le bilan)$/,
  });
  if (!(await suite.isVisible().catch(() => false))) break;
  const bilan = (await suite.innerText()).includes("bilan");
  await tapLoc(suite);
  await pause(1500);
  if (bilan) break;
}
await page.getByRole("button", { name: "Retour à l’accueil" }).first().waitFor({ timeout: 30_000 });
const texte = await page.locator("main").innerText();
await capture("bilan");
ok(
  verifiees >= 9 && /9 \/ 9|100 %/.test(texte),
  `bilan : 9 / 9 (${verifiees} vérifiées)`,
);

// 4. Quitter une séance commencée : retour à l'accueil, la tuile « En cours » reprend
await toucher(
  page.getByRole("button", { name: /Retour à l’accueil|Retour/ }).first(),
).catch(() => {});
await page.getByRole("button", { name: "Réglages" }).first().waitFor();
await toucher(page.getByRole("button", { name: /^\s*Fractions/ }).last());
await toucher(
  page.getByRole("button", { name: /^(Commencer|Continuer)/ }).first(),
);
if (await entrainement.isVisible({ timeout: 4000 }).catch(() => false))
  await toucher(entrainement);
await page
  .locator("main .contenu-mathalea")
  .first()
  .waitFor({ timeout: 90_000 });
await toucher(page.getByRole("button", { name: "Quitter", exact: true }));
await toucher(page.getByRole("button", { name: "Reprendre plus tard" }));
ok(
  await page.getByRole("button", { name: "Réglages" }).first().isVisible(),
  "Quitter : « Reprendre plus tard » ramène à l’accueil",
);
ok(
  await page.getByText("En cours", { exact: true }).isVisible(),
  "accueil : la séance quittée est « En cours »",
);
await capture("accueil-en-cours");

// 5. Thème sombre du téléphone
await appareil.shell("cmd uimode night yes");
await pause(3000);
page = await lancer();
await page
  .getByRole("button", { name: "Réglages" })
  .first()
  .waitFor({ timeout: 90_000 });
await page.waitForTimeout(1500);
const sombre = await page.evaluate(() => ({
  telephone: matchMedia("(prefers-color-scheme: dark)").matches,
  app: document.documentElement.classList.contains("dark"),
  reglage: localStorage.getItem("theme"),
}));
console.log(`Thème sombre : ${JSON.stringify(sombre)}`);
const nuit = (await appareil.shell("cmd uimode night")).toString().trim();
console.log(`Mode nuit d'Android : ${nuit}`);
if (sombre.telephone) ok(sombre.app, `mode nuit du téléphone : l'app passe en sombre (${JSON.stringify(sombre)})`);
else console.log("La WebView de l'émulateur n'annonce pas le mode nuit : thème choisi dans les Réglages.");
if (!sombre.app) {
  // Thème « Sombre » choisi dans les Réglages de l'app
  await toucher(page.getByRole("button", { name: "Réglages" }).first());
  await toucher(page.getByRole("radio", { name: "Sombre" }));
  await pause(600);
  ok(await page.evaluate(() => document.documentElement.classList.contains("dark")), "Réglages, Apparence « Sombre » : l'app passe en sombre");
  await page.goBack();
  await pause(800);
}
await capture("accueil-sombre");
await toucher(page.getByRole("button", { name: /^\s*Fractions/ }).first());
await page
  .locator("main .contenu-mathalea")
  .first()
  .waitFor({ timeout: 90_000 });
await pause(1500);
await capture("seance-sombre");
await appareil.shell("cmd uimode night no");

ok(erreurs.length === 0, `aucune erreur JavaScript ${erreurs.join(" | ")}`);
await appareil.close();
console.log(echecs ? `${echecs} ÉCHEC(S)` : "TOUT VERT");
process.exit(echecs ? 1 : 0);
