import { JSDOM } from "jsdom";
import fs from "node:fs";

// Loads index.html in jsdom with scripts enabled and returns handy accessors.
export function load({ skipLogin = true } = {}) {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  const doc = w.document;
  const app = {
    w,
    doc,
    // evaluate in the page scope (gives access to top-level const/let such as S, N, R, G)
    ev: (code) => w.eval(code),
    $: (sel) => doc.querySelector(sel),
    $$: (sel) => [...doc.querySelectorAll(sel)],
    click: (sel) => { const el = doc.querySelector(sel); if (!el) throw new Error("not found: " + sel); el.click(); },
    type: (sel, value) => { const el = doc.querySelector(sel); el.value = value; el.dispatchEvent(new w.Event("input", { bubbles: true })); },
    pin: (id) => app.click(`.pin[data-id="${id}"]`),
    // run a full booking: select garage, navigate, arrive, confirm, book
    book(id) {
      app.pin(id);
      app.w.requestAnimationFrame = () => 0; // freeze the animation, we move the car manually
      app.click("#go");
      app.ev("N.d=N.total-10;place()");
      app.click("#arr");
      app.click("#book");
      const dlg = app.$('[aria-label="Reward unlocked"] button');
      if (dlg) dlg.click();
    },
  };
  if (skipLogin) app.click("#gst");
  return app;
}
