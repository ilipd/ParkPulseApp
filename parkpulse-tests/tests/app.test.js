import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { load } from "./helpers.js";

describe("map and pins", () => {
  test("renders four garage pins with price and free count", () => {
    const a = load();
    const pins = a.$$(".pin");
    assert.equal(pins.length, 4);
    assert.match(pins[0].textContent, /P 34/);
    assert.match(pins[0].textContent, /€3\.60\/h/);
  });

  test("color-codes availability", () => {
    const a = load();
    assert.equal(a.ev("col(G[0])"), "var(--ok)"); // 34 free
    assert.equal(a.ev("col(G[1])"), "var(--mid)"); // 12 free
    assert.equal(a.ev("col(G[2])"), "var(--bad)"); // 3 free
  });

  test("EV count shown on pins that have free EV bays", () => {
    const a = load();
    assert.match(a.$('.pin[data-id="1"]').innerHTML, /6/);
    assert.equal(a.$('.pin[data-id="2"] i'), null); // no free EV bays
  });

  test("promotion badge only on garages with a promotion", () => {
    const a = load();
    assert.ok(a.$('.pin[data-id="1"] .tg'));
    assert.equal(a.$('.pin[data-id="2"] .tg'), null);
  });
});

describe("filters and search", () => {
  const dimmed = (a) => a.$$(".pin.dim").map((p) => p.dataset.id).sort();

  test("renders five filter chips", () => {
    assert.equal(load().$$(".chip").length, 5);
  });

  test("20+ spaces filter dims garages with fewer spaces", () => {
    const a = load();
    a.click('.chip[data-k="s20"]');
    assert.deepEqual(dimmed(a), ["2", "3"]);
  });

  test("EV filter dims garages without free EV bays", () => {
    const a = load();
    a.click('.chip[data-k="ev"]');
    assert.deepEqual(dimmed(a), ["2"]);
  });

  test("women's and accessible filters dim fully booked categories", () => {
    const a = load();
    a.click('.chip[data-k="wo"]');
    assert.deepEqual(dimmed(a), ["3"]);
  });

  test("promotions filter", () => {
    const a = load();
    a.click('.chip[data-k="pr"]');
    assert.deepEqual(dimmed(a), ["2"]);
  });

  test("filters combine and can be switched off again", () => {
    const a = load();
    a.click('.chip[data-k="s20"]');
    a.click('.chip[data-k="ev"]');
    assert.deepEqual(dimmed(a), ["2", "3"]);
    a.click('.chip[data-k="s20"]');
    a.click('.chip[data-k="ev"]');
    assert.deepEqual(dimmed(a), []);
  });

  test("search by name and by address, selecting a single match", () => {
    const a = load();
    a.type("#q", "hofgarten");
    assert.deepEqual(dimmed(a), ["1", "2", "3"]);
    assert.equal(a.ev("S.sel"), 4);
    a.type("#q", "maximilianstraße");
    assert.equal(a.ev("S.sel"), 2);
  });
});

describe("garage sheet", () => {
  test("sheet is hidden until a pin is selected", () => {
    const a = load();
    assert.ok(a.$("#sheet").classList.contains("hide"));
    a.pin(1);
    assert.ok(!a.$("#sheet").classList.contains("hide"));
    assert.match(a.$("#sheet").textContent, /Parkhaus Marienplatz/);
  });

  test("shows prices, walking time, capacity and four quick stats", () => {
    const a = load();
    a.pin(1);
    const t = a.$("#sheet").textContent;
    assert.match(t, /€3\.60\/h/);
    assert.match(t, /€28\.00\/day/);
    assert.match(t, /4 min/);
    assert.match(t, /420/);
    assert.equal(a.$$("#sheet .q > div").length, 4);
  });

  test("24h garage is always open", () => {
    const a = load();
    assert.equal(a.ev("isOpen(G[0])"), true);
    assert.equal(a.ev("isOpen(G[3])"), true);
  });

  test("details expand with EV, women, accessible, promotion and hours", () => {
    const a = load();
    a.pin(1);
    a.click("#more");
    const t = a.$("#sheet").textContent;
    assert.match(t, /6 of 12 charging bays/);
    assert.match(t, /9 of 20 women-designated/);
    assert.match(t, /3 of 8 accessible/);
    assert.match(t, /Evening flat rate/);
    assert.match(t, /Open 24 hours/);
  });

  test("garage without promotion says so", () => {
    const a = load();
    a.pin(2);
    a.click("#more");
    assert.match(a.$("#sheet").textContent, /No active promotions/);
  });

  test("sheet can be minimized and restored", () => {
    const a = load();
    a.pin(1);
    a.click("#mn");
    assert.equal(a.$("#sheet .q"), null);
    a.click("#mn2");
    assert.ok(a.$("#sheet .q"));
  });
});

describe("login", () => {
  test("login dialog is shown on start with 'Normal car' preselected", () => {
    const a = load({ skipLogin: false });
    assert.ok(a.$('[aria-label="Sign in"]'));
    assert.equal(a.$('[data-v="car"]').getAttribute("aria-pressed"), "true");
    assert.equal(a.$('[data-v="ev"]').getAttribute("aria-pressed"), "false");
  });

  test("username and password are required", () => {
    const a = load({ skipLogin: false });
    a.click("#si");
    assert.ok(a.$("#fu").classList.contains("err"));
    assert.ok(a.$("#fp").classList.contains("err"));
    assert.ok(a.$('[aria-label="Sign in"]'));
  });

  test("password field is masked", () => {
    assert.equal(load({ skipLogin: false }).$("#pw").type, "password");
  });

  test("any non-empty credentials sign in and apply vehicle filters", () => {
    const a = load({ skipLogin: false });
    a.click('[data-v="ev"]');
    a.$("#u").value = "anna";
    a.$("#pw").value = "x";
    a.click("#si");
    assert.equal(a.$('[aria-label="Sign in"]'), null);
    assert.equal(a.ev("S.user"), "anna");
    assert.equal(a.$("#avb").textContent.trim(), "A");
    assert.ok(a.ev("S.f.has('ev')") && a.ev("S.f.has('s20')"));
  });

  test("third-party providers sign in", () => {
    for (const p of ["Google", "LinkedIn", "Apple"]) {
      const a = load({ skipLogin: false });
      a.click(`[data-p="${p}"]`);
      assert.equal(a.ev("S.user"), `${p} user`);
    }
  });

  test("guest can skip login", () => {
    const a = load({ skipLogin: false });
    a.click("#gst");
    assert.equal(a.$('[aria-label="Sign in"]'), null);
    assert.equal(a.ev("S.user"), null);
  });
});

describe("navigation", () => {
  test("route helpers: distance format and point along path", () => {
    const a = load();
    assert.equal(a.ev("fmt(480)"), "480 m");
    assert.equal(a.ev("fmt(1500)"), "1.5 km");
    a.pin(4);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    assert.deepEqual(JSON.parse(a.ev("JSON.stringify(posAt(0))")), [180, 577]);
    assert.deepEqual(JSON.parse(a.ev("JSON.stringify(posAt(N.total))")), [230, 480]);
  });

  test("navigation starts, shows dashed route and car with distance", () => {
    const a = load();
    a.pin(1);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    assert.ok(a.ev("!!N"));
    assert.equal(a.$("#car").hidden, false);
    assert.match(a.$("#cl").textContent, /m$/);
    assert.ok(a.$("#route").getAttribute("d").startsWith("M180 577"));
    // sheet minimizes so the car stays visible; nav status stays in the sheet
    assert.ok(a.$("#sheet .nv"));
    assert.equal(a.$("#book").disabled, true);
  });

  test("car marker changes color when approaching destination", () => {
    const a = load();
    a.pin(1);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    assert.ok(!a.$("#car").classList.contains("near"));
    a.ev("N.d=N.total-(150/M);place()");
    assert.ok(a.$("#car").classList.contains("near"));
  });

  test("arrival button appears only below 50 m", () => {
    const a = load();
    a.pin(1);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    a.ev("N.d=N.total-(60/M);place()");
    assert.equal(a.$("#arr"), null);
    a.ev("N.d=N.total-(40/M);place()");
    assert.ok(a.$("#arr"));
    assert.match(a.$("#arr").textContent, /arrived at the parking garage/);
  });

  test("booking is disabled until arrival is confirmed", () => {
    const a = load();
    a.pin(1);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    assert.equal(a.$("#book").disabled, true);
    a.ev("N.d=N.total-10;place()");
    assert.equal(a.$("#book").disabled, true);
    a.click("#arr");
    assert.equal(a.$("#book").disabled, false);
  });

  test("selecting another garage resets navigation", () => {
    const a = load();
    a.pin(1);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    a.pin(2);
    assert.equal(a.ev("N"), null);
    assert.equal(a.$("#car").hidden, true);
    assert.match(a.$("#toast").textContent, /Navigation reset/);
  });
});

describe("notifications", () => {
  test("newer message replaces older one and gets a full 7 seconds", () => {
    const a = load();
    const delays = [];
    a.w.setTimeout = (f, d) => { delays.push(d); return delays.length; };
    a.ev("toast('first')");
    a.ev("toast('second')");
    assert.equal(a.$$(".toast").length, 1);
    assert.equal(a.$("#toast").textContent, "second");
    assert.deepEqual(delays, [7000, 7000]);
  });
});

describe("rewards", () => {
  test("first booking earns 1 point and shows 1/5 progress", () => {
    const a = load();
    a.book(1);
    assert.equal(a.ev("R.pts"), 1);
    assert.match(a.$("#sheet").textContent, /1\/5 toward free hour/);
    assert.equal(a.$$("#sheet .pg i.on").length, 1);
    assert.match(a.$("#toast").textContent, /1\/5 toward your free hour/);
  });

  test("fifth booking unlocks a free hour and shows confirmation", () => {
    const a = load();
    [1, 2, 3, 4].forEach((id) => a.book(id));
    assert.equal(a.ev("R.free"), 0);
    a.pin(1);
    a.w.requestAnimationFrame = () => 0;
    a.click("#go");
    a.ev("N.d=N.total-10;place()");
    a.click("#arr");
    a.click("#book");
    assert.equal(a.ev("R.pts"), 5);
    assert.equal(a.ev("R.free"), 1);
    assert.ok(a.$('[aria-label="Reward unlocked"]'));
    assert.match(a.$("#sheet").textContent, /5\/5/);
  });

  test("sixth booking applies the free first hour", () => {
    const a = load();
    [1, 2, 3, 4, 1].forEach((id) => a.book(id));
    assert.equal(a.$(".fh"), null);
    a.book(2);
    assert.equal(a.ev("R.pts"), 6);
    assert.equal(a.ev("R.used"), 1);
    assert.ok(a.$(".fh"));
    assert.match(a.$(".fh").textContent, /1st hour free/);
  });

  test("profile dialog shows points, progress and free hours", () => {
    const a = load({ skipLogin: false });
    a.$("#u").value = "anna";
    a.$("#pw").value = "x";
    a.click("#si");
    [1, 2, 3].forEach((id) => a.book(id));
    a.click("#avb");
    const t = a.$('[aria-label="Profile"]').textContent;
    assert.match(t, /Total points\s*3/);
    assert.match(t, /3\/5/);
    assert.match(t, /Free hours earned\s*0 h/);
  });
});
