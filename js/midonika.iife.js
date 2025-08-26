var Midonika = (function (i) {
  "use strict";
  const d = (n, t = {}, ...s) => {
      const e = Object.assign(document.createElement(n), t);
      for (const a of s) e.append(a);
      return e;
    },
    o = () => {
      const n = new Date(),
        t = (s) => String(s).padStart(2, "0");
      return `[${t(n.getHours())}:${t(n.getMinutes())}:${t(n.getSeconds())}]`;
    },
    m = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
    l = (n) => {
      const t = m[n % 12],
        s = Math.floor(n / 12) - 1;
      return `${t}${s}`;
    },
    v = (n) => (n & 15) + 1,
    f = (n) => n & 240;
  function g({ data: n, src: t }) {
    const [s, e = 0, a = 0] = n,
      c = v(s);
    switch (f(s)) {
      case 144: {
        const u = a !== 0;
        return `${o()} ${u ? "NOTE ON " : "NOTE OFF"} ch${c} ${l(e)} (${e}) vel=${a} src="${t}"`;
      }
      case 128:
        return `${o()} NOTE OFF ch${c} ${l(e)} (${e}) vel=${a} src="${t}"`;
      case 176:
        return `${o()} CC ch${c} ${e} value=${a} src="${t}"`;
      case 224: {
        const u = ((a << 7) | e) - 8192;
        return `${o()} PB ch${c} ${u} src="${t}"`;
      }
      case 160:
        return `${o()} AT(poly) ch${c} ${l(e)} (${e}) val=${a} src="${t}"`;
      case 208:
        return `${o()} AT(ch) ch${c} val=${e} src="${t}"`;
      case 192:
        return `${o()} PC ch${c} ${e} src="${t}"`;
      default:
        return `${o()} 0x${s.toString(16)} ${e} ${a} src="${t}"`;
    }
  }
  class M {
    constructor({ onDevices: t, onMessage: s, onStatus: e }) {
      (this._access = null),
        (this._onDevices = t),
        (this._onMessage = s),
        (this._onStatus = e);
    }
    async init() {
      if (!navigator.requestMIDIAccess) {
        this._onStatus("Web MIDI is not supported in this browser.");
        return;
      }
      try {
        this._onStatus("Requesting MIDI access…"),
          (this._access = await navigator.requestMIDIAccess({ sysex: !1 })),
          (this._access.onstatechange = () => this._refreshDevices()),
          this._onStatus("MIDI ready."),
          this._refreshDevices(),
          this._wireInputs();
      } catch (t) {
        this._onStatus(`MIDI error: ${(t == null ? void 0 : t.message) || t}`);
      }
    }
    _refreshDevices() {
      const t = Array.from(this._access.inputs.values()),
        s = Array.from(this._access.outputs.values());
      this._onDevices({
        inputs: t.map((e) => ({
          id: e.id,
          name: e.name,
          manufacturer: e.manufacturer,
        })),
        outputs: s.map((e) => ({
          id: e.id,
          name: e.name,
          manufacturer: e.manufacturer,
        })),
      }),
        this._wireInputs();
    }
    _wireInputs() {
      for (const t of this._access.inputs.values())
        t.onmidimessage = (s) => {
          const e = t.name || "MIDI",
            a = g({ data: s.data, src: e });
          this._onMessage(a);
        };
    }
  }
  function _(n) {
    const t = d("div", { className: "midonika-panel" });
    (t.innerHTML = `
    <details open class="panel">
      <summary class="title">MIDI Devtools</summary>
      <section class="io">
        <div class="col"><h2>Inputs</h2><ul class="bullets" data-mid="inputs"></ul></div>
        <div class="col"><h2>Outputs</h2><ul class="bullets" data-mid="outputs"></ul></div>
      </section>
      <section class="events">
        <h2>Live events</h2>
       <pre class="log" data-mid="log" aria-live="polite"></pre>
       <div class="footer-row">
         <p class="status" data-mid="status" role="status"></p>
         <button class="clear" data-mid="clear">Clear</button>
       </div>
       </section>
    </details>
    <p class="status" data-mid="status" role="status"></p>
  `),
      n.appendChild(t);
    const s = (r) => t.querySelector(`[data-mid="${r}"]`),
      e = s("inputs"),
      a = s("outputs"),
      c = s("log"),
      p = s("status");
    return (
      s("clear").addEventListener("click", () => {
        c.textContent = "";
      }),
      {
        renderDevices: ({ inputs: r = [], outputs: D = [] }) => {
          e.replaceChildren(...r.map($)), a.replaceChildren(...D.map($));
        },
        appendLog: (r) => {
          c.append(
            r +
              `
`,
          ),
            (c.scrollTop = c.scrollHeight);
        },
        setStatus: (r) => {
          p.textContent = r ?? "";
        },
        clear: () => {
          c.textContent = "";
        },
      }
    );
  }
  function $(n) {
    const t = n.name || "Unknown",
      s = n.manufacturer ? ` (${n.manufacturer})` : "";
    return d("li", {}, document.createTextNode(`${t}${s}`));
  }
  function h(n, t = {}) {
    const s = typeof n == "string" ? document.querySelector(n) : n;
    if (!s) throw new Error("Midonika: container not found");
    const e = _(s),
      a = new M({
        onDevices: e.renderDevices,
        onMessage: e.appendLog,
        onStatus: e.setStatus,
      });
    return (
      t.autoStart !== !1 && a.init(),
      {
        start: () => a.init(),
        clear: () => e.clear(),
        destroy: () => {
          s.innerHTML = "";
        },
      }
    );
  }
  const S = { createMidonika: h };
  return (
    (i.createMidonika = h),
    (i.default = S),
    Object.defineProperties(i, {
      __esModule: { value: !0 },
      [Symbol.toStringTag]: { value: "Module" },
    }),
    i
  );
})({});
