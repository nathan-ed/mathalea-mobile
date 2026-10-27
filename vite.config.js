import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

/**
 * Relais de téléchargement pour le navigateur (pnpm dev, vite preview) : kDrive
 * et Dropbox refusent les requêtes d'une page web (CORS, redirection de kDrive
 * dès qu'un en-tête Origin étranger est présent). Le serveur de développement
 * va chercher le fichier lui-même, comme la commande Rust « telecharger » dans
 * l'app. GET /__telecharger?url=<adresse>, en https (http seulement en local).
 */
function relaisTelechargement() {
  /** @param {import('vite').Connect.Server} serveur */
  const brancher = (serveur) =>
    serveur.use("/__telecharger", async (/** @type {any} */ req, /** @type {any} */ res) => {
      try {
        const cible = new URL(new URL(req.url ?? "", "http://x").searchParams.get("url") ?? "");
        const local = ["127.0.0.1", "localhost"].includes(cible.hostname);
        if (cible.protocol !== "https:" && !(cible.protocol === "http:" && local)) {
          res.statusCode = 400;
          return res.end("Adresse refusée");
        }
        const r = await fetch(cible, { redirect: "follow" });
        res.statusCode = r.status;
        const type = r.headers.get("content-type");
        if (type) res.setHeader("content-type", type);
        res.end(new Uint8Array(await r.arrayBuffer()));
      } catch (e) {
        res.statusCode = 502;
        res.end(String(e));
      }
    });
  // Heure d'un serveur (en-tête Date), illisible depuis une page web (CORS) :
  // GET /__heure?url=<adresse https> renvoie { date }, comme le lit l'app (heure.svelte.ts)
  /** @param {import('vite').Connect.Server} serveur */
  const brancherHeure = (serveur) =>
    serveur.use("/__heure", async (/** @type {any} */ req, /** @type {any} */ res) => {
      try {
        const cible = new URL(new URL(req.url ?? "", "http://x").searchParams.get("url") ?? "");
        if (cible.protocol !== "https:") {
          res.statusCode = 400;
          return res.end("Adresse refusée");
        }
        const r = await fetch(cible, { method: "HEAD", cache: "no-store" });
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ date: r.headers.get("date") }));
      } catch (e) {
        res.statusCode = 502;
        res.end(String(e));
      }
    });
  return {
    name: "relais-telechargement",
    /** @param {import('vite').ViteDevServer} s */
    configureServer(s) {
      brancher(s.middlewares);
      brancherHeure(s.middlewares);
    },
    /** @param {import('vite').PreviewServer} s */
    configurePreviewServer(s) {
      brancher(s.middlewares);
      brancherHeure(s.middlewares);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [relaisTelechargement(), sveltekit()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
