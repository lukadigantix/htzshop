// Pravni dokumenti (Uslovi korišćenja, Politika privatnosti) → PDF: Chrome bez prozora štampa samu stranu (stil za štampu je
// u globals.css i components/info/Uslovi.tsx), pa su tekst na sajtu i u PDF-u uvek isti. Sajt mora da radi; iz korena projekta:
//   node docs/obrasci/uslovi-pdf.mjs [adresa sajta, podrazumevano http://localhost:3001]
// Imena fajlova prate USLOVI_PDF i PRIVATNOST_PDF u src/lib/dokumenti.ts (datum donošenja).
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SAJT = process.argv[2] ?? "http://localhost:3001";
const dokumenti = readFileSync(new URL("../../src/lib/dokumenti.ts", import.meta.url), "utf8");
const DOKUMENTI = [
  { strana: "/uslovi-koriscenja/", konstanta: "USLOVI_PDF", naziv: "Uslovi korišćenja" },
  { strana: "/politika-privatnosti/", konstanta: "PRIVATNOST_PDF", naziv: "Politika privatnosti" },
].map((d) => {
  const ime = dokumenti.match(new RegExp(`${d.konstanta} = \`\\$\\{F\\}([^\`]+)\``))?.[1];
  if (!ime) throw new Error(`${d.konstanta} nije pronađen u src/lib/dokumenti.ts`);
  return { ...d, ime };
});
const PORT = 9334;

const chrome = spawn(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "uslovi-pdf-"))}`, "about:blank"],
  { stdio: "ignore" },
);
const cekaj = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  // adresa stranice u Chrome-u, pa veza (čeka se „open" odmah, inače događaj prođe pre slušaoca)
  let adresa;
  for (let i = 0; i < 40 && !adresa; i++) {
    try {
      adresa = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((x) => x.type === "page")?.webSocketDebuggerUrl;
    } catch {}
    if (!adresa) await cekaj(250);
  }
  const ws = new WebSocket(adresa);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const odgovori = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && odgovori.has(m.id)) {
      odgovori.get(m.id)(m);
      odgovori.delete(m.id);
    }
  });
  const posalji = (method, params = {}) =>
    new Promise((r) => {
      odgovori.set(++id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await posalji("Page.enable");
  for (const d of DOKUMENTI) {
    await posalji("Page.navigate", { url: `${SAJT}${d.strana}` });
    await cekaj(6000);
    const podnozje = `<div style="width:100%;margin:0 18mm;font:7.5pt Helvetica,Arial,sans-serif;color:#5f6368;display:flex;justify-content:space-between;border-top:0.3mm solid #c9cbcf;padding-top:2mm">
      <span><b style="color:#202124">HTZ Shop</b> | ${d.naziv} | htzshop.rs</span><span>Strana <span class="pageNumber"></span> od <span class="totalPages"></span></span></div>`;
    const r = await posalji("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: podnozje,
    });
    if (!r.result?.data) throw new Error(JSON.stringify(r.error ?? r));
    writeFileSync(new URL(`../../public/files/${d.ime}`, import.meta.url), Buffer.from(r.result.data, "base64"));
    console.log(`public/files/${d.ime}`);
  }
  ws.close();
} finally {
  chrome.kill();
}
