import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ── CONFIG: Info-Banner (hier Text ändern oder leer lassen um auszublenden) ──
const INFO_BANNER = "";
// Beispiel: const INFO_BANNER = "Am Freitag, 25.04.26 bleibt unser Imbiss am Nachmittag GESCHLOSSEN. Mittags 11:30-13:30 sind wir für Euch da!";
// ── Wenn ein Banner aktiv ist, werden betroffene Abholzeiten gesperrt ──
const BLOCKED_SLOTS_FROM = ""; // z.B. "16:30" um Nachmittag zu sperren
const BLOCKED_SLOTS_TO = "";   // z.B. "21:00"
// ─────────────────────────────────────────────────────────────────────────────

const CLOSED_MSGS_BREAK = [
  "grad Pause ☕",
  "bald wieder da!",
  "komm spöter no emol 🕐",
  "kurze Verschnaufpause 😅",
  "gleich wieder! 👊",
];
const CLOSED_MSGS_END = [
  "heit nixe mehr 🤷",
  "für heit fertig 🌙",
  "da Manu macht Feierabend 🍺",
  "bis morn! 👋",
  "jetzt wird aufgräumt 🧹",
];
const CLOSED_MSGS_DAY = [
  "heit Ruhetag 🌿",
  "da Manu hat frei 😎",
  "koan Betrieb heit 🙏",
];

const SAUCES = ["Ketchup", "Majo", "Senf", "Tartare", "Zwiebel-Sauce", "Curry-Sauce", "Burger-Sauce", "Bosnasosse (hausgemacht)"];

const MENU = [
  { id: 1,  cat: "Zum Eassa", name: "Rote",                        price: 6.10,  prep: 5  },
  { id: 2,  cat: "Zum Eassa", name: "Wiesse (Gschwollane)",         price: 6.30,  prep: 5  },
  { id: 3,  cat: "Zum Eassa", name: "Curry + Brot",                 price: 6.30,  prep: 5  },
  { id: 4,  cat: "Zum Eassa", name: "Curry + Pommes",               price: 10.40, prep: 8  },
  { id: 5,  cat: "Zum Eassa", name: "Berliner Curry",               price: 10.40, prep: 8  },
  { id: 6,  cat: "Zum Eassa", name: "Bosna",                        price: 7.20,  prep: 7  },
  { id: 7,  cat: "Zum Eassa", name: "Bosna XXL",                    price: 13.60, prep: 10 },
  { id: 8,  cat: "Zum Eassa", name: "Grillwürschtle",               price: 5.90,  prep: 6  },
  { id: 9,  cat: "Zum Eassa", name: "Fleischlöable (Hamburger)",    price: 6.80,  prep: 8  },
  { id: 10, cat: "Zum Eassa", name: "Zack Zack (Schwein)",          price: 6.90,  prep: 8  },
  { id: 11, cat: "Zum Eassa", name: "Chickenburger",                price: 8.60,  prep: 10 },
  { id: 12, cat: "Zum Eassa", name: "Panierte Hennastreifa",        price: 8.60,  prep: 10 },
  { id: 30, cat: "Spezial",   name: "Zack-Teller",                  price: 14.90, prep: 15, desc: "2x Zack, 2x Zwiebelringe, Pommes, Zwiebelsosse, Kräuterbutter" },
  { id: 31, cat: "Spezial",   name: "Zack-Spezial",                 price: 8.40,  prep: 12, desc: "Zack Zack, Soss Tartare, Salat, Käse und Rösti" },
  { id: 32, cat: "Spezial",   name: "Spezial Baguette",             price: 13.60, prep: 12, desc: "Riesenbaguette, 2x Zack, Salat, Zwiebelsosse" },
  { id: 13, cat: "Vegi",      name: "Falafel Burger",               price: 9.40,  prep: 8  },
  { id: 14, cat: "Vegi",      name: "Ibile",                        price: 5.90,  prep: 5  },
  { id: 15, cat: "Vegi",      name: "Zwiebelring",                  price: 6.80,  prep: 5  },
  { id: 16, cat: "Vegi",      name: "Panierta Bluamakohl",          price: 6.80,  prep: 7  },
  { id: 17, cat: "Vegi",      name: "Pommes",                       price: 4.90,  prep: 5  },
  { id: 18, cat: "Extras",    name: "Zwiebla, Tomata, Gurka, Salot",price: 0.00,  prep: 0  },
  { id: 19, cat: "Extras",    name: "Käse",                         price: 0.50,  prep: 0  },
  { id: 20, cat: "Extras",    name: "Ananas",                       price: 0.90,  prep: 0  },
  { id: 21, cat: "Extras",    name: "Sauce",                        price: 0.50,  prep: 0, isSauce: true },
  { id: 22, cat: "Getränke",  name: "Mineral mit",                  price: 3.10,  prep: 0  },
  { id: 23, cat: "Getränke",  name: "Mineral ohne",                 price: 3.10,  prep: 0  },
  { id: 24, cat: "Getränke",  name: "Coca Cola (Zero)",             price: 3.50,  prep: 0  },
  { id: 25, cat: "Getränke",  name: "Fanta",                        price: 3.50,  prep: 0  },
  { id: 26, cat: "Getränke",  name: "Mezzo",                        price: 3.50,  prep: 0  },
  { id: 27, cat: "Getränke",  name: "Sprite",                       price: 3.50,  prep: 0  },
  { id: 37, cat: "Getränke",  name: "Iso (vu üs)",                  price: 3.50,  prep: 0  },
  { id: 28, cat: "Getränke",  name: "Eistee Pfirsich",              price: 3.50,  prep: 0  },
  { id: 29, cat: "Getränke",  name: "Eistee Zitrona",               price: 3.50,  prep: 0  },
  { id: 38, cat: "Getränke",  name: "Apfel Gsprützt",               price: 3.50,  prep: 0  },
  { id: 39, cat: "Getränke",  name: "Johann Gsprützt",              price: 3.50,  prep: 0  },
  { id: 40, cat: "Getränke",  name: "Red Bull",                     price: 4.30,  prep: 0  },
  { id: 33, cat: "Bier",      name: "Bier 0,3 L",                   price: 3.70,  prep: 0  },
  { id: 34, cat: "Bier",      name: "Bier 0,5 L",                   price: 4.50,  prep: 0  },
  { id: 35, cat: "Bier",      name: "Radler 0,3 L",                 price: 3.70,  prep: 0  },
];

const CATS = ["Zum Eassa", "Spezial", "Vegi", "Extras", "Getränke", "Bier"];
const CAT_ICONS = { "Zum Eassa": "🔥", "Spezial": "⭐", "Vegi": "🌿", "Extras": "➕", "Getränke": "🥤", "Bier": "🍺" };
const HOURS = { 1:[["11:30","13:30"],["17:00","20:00"]], 2:[["11:30","13:30"],["16:30","21:00"]], 3:[["11:30","13:30"],["16:30","21:00"]], 4:[["11:30","13:30"],["16:30","21:00"]], 5:[["11:30","13:30"],["16:30","21:00"]], 6:[["10:00","22:00"]] };

const WEEK_HOURS = [
  { day: "Montag",     hours: "11:30–13:30, 17:00–20:00" },
  { day: "Dienstag",   hours: "11:30–13:30, 16:30–21:00" },
  { day: "Mittwoch",   hours: "11:30–13:30, 16:30–21:00" },
  { day: "Donnerstag", hours: "11:30–13:30, 16:30–21:00" },
  { day: "Freitag",    hours: "11:30–13:30, 16:30–21:00" },
  { day: "Samstag",    hours: "Ruhetag", isRest: true },
  { day: "Sonntag",    hours: "Ruhetag", isRest: true },
];

function genSlots(extra = 0, baseLead = 25) {
  const now = new Date(), ranges = HOURS[now.getDay()];
  if (!ranges) return [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slots = [];
  for (const [s, e] of ranges) {
    const [sh, sm] = s.split(":").map(Number), [eh, em] = e.split(":").map(Number);
    const startMin = sh * 60 + sm, endMin = eh * 60 + em;
    if (nowMin > endMin) continue;
    if (startMin > nowMin + 30) continue;
    let h = sh, m = sm;
    while (h < eh || (h === eh && m <= em - 15)) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (h * 60 + m >= nowMin + baseLead + extra) {
        if (BLOCKED_SLOTS_FROM && BLOCKED_SLOTS_TO) {
          const [bfh, bfm] = BLOCKED_SLOTS_FROM.split(":").map(Number);
          const [bth, btm] = BLOCKED_SLOTS_TO.split(":").map(Number);
          const slotMin = h * 60 + m;
          if (slotMin < bfh * 60 + bfm || slotMin >= bth * 60 + btm) slots.push(t);
        } else {
          slots.push(t);
        }
      }
      m += 15; if (m >= 60) { h++; m = 0; }
    }
  }
  return slots;
}

const S = "#8a9e8a", SL = "#a3b5a3", BG = "#2d2d2d", BGL = "#3a3a3a", CR = "#f0ebe0", CRD = "rgba(240,235,224,0.5)", OR = "#d4943a";

const phoneOk = p => {
  const c = p.replace(/[\s\-]/g, "");
  return /^(\+\d{10,15}|00\d{10,15}|06\d{8,12}|\d{10,15})$/.test(c);
};

function SaucePicker({ onConfirm, onCancel }) {
  const [sel, setSel] = useState([]);
  const toggle = s => setSel(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onCancel}>
      <div style={{ background: BG, borderRadius: 14, padding: 20, width: "100%", maxWidth: 340, border: `1px solid rgba(240,235,224,0.1)` }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: CR }}>Sauce wähla</h3>
        <div style={{ fontSize: 12, color: CRD, marginBottom: 14 }}>Pro Sauce 0,50 € · Mehrere möglich</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SAUCES.map(s => (
            <button key={s} onClick={() => toggle(s)} style={{
              padding: "10px 12px", borderRadius: 8, fontSize: 14, textAlign: "left",
              background: sel.includes(s) ? "rgba(138,158,138,0.2)" : "rgba(240,235,224,0.04)",
              border: sel.includes(s) ? `1px solid ${SL}` : "1px solid rgba(240,235,224,0.08)",
              color: sel.includes(s) ? CR : CRD, cursor: "pointer", transition: "all 0.2s",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>{s}</span>
              {sel.includes(s) && <span style={{ color: S, fontWeight: 700 }}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "rgba(240,235,224,0.06)", border: "1px solid rgba(240,235,224,0.1)", color: CRD, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Abbrecha</button>
          <button onClick={() => onConfirm(sel)} disabled={sel.length === 0} style={{ flex: 1, padding: "11px", borderRadius: 8, background: sel.length > 0 ? S : "rgba(240,235,224,0.08)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: sel.length > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
            {sel.length > 0 ? `${sel.length}× hinzufüga` : "Wähla"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState({});
  const [sauceChoices, setSauceChoices] = useState([]);
  const [step, setStep] = useState("menu");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState([]);
  const [cat, setCat] = useState("Zum Eassa");
  const [anim, setAnim] = useState(false);
  const [showSaucePicker, setShowSaucePicker] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [slotCounts, setSlotCounts] = useState({});
  const [paused, setPaused] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(0);
  const [slotCapacity, setSlotCapacity] = useState(3);
  const [staffed, setStaffed] = useState(false);
  const [btnLabel, setBtnLabel] = useState("Bstellung ufgea 🔥");
  const [btnLabelOpacity, setBtnLabelOpacity] = useState(1);
  const flashing = useRef(false);
  const msgQueue = useRef([]);
  const msgContext = useRef("");
  const nextClosedMsg = (context, msgs) => {
    if (msgQueue.current.length === 0 || msgContext.current !== context) {
      msgQueue.current = [...msgs].sort(() => Math.random() - 0.5);
      msgContext.current = context;
    }
    return msgQueue.current.pop();
  };
  useEffect(() => { setSlots(genSlots()); setTimeout(() => setAnim(true), 100); }, []);
  useEffect(() => {
    if (step !== "checkout") return;
    const today = new Date().toISOString().slice(0, 10);
    supabase.from("settings").select("*").then(({ data }) => {
      if (!data) return;
      data.forEach(({ key, value }) => {
        if (key === "paused") setPaused(value === "true");
        if (key === "extra_minutes") setExtraMinutes(Number(value));
        if (key === "slot_capacity") setSlotCapacity(Number(value));
        if (key === "staffed") setStaffed(value === "true");
      });
    });
    supabase.from("orders").select("pickup_time")
      .eq("pickup_date", today).neq("status", "cancelled")
      .then(({ data }) => {
        const counts = {};
        (data || []).forEach(({ pickup_time }) => {
          counts[pickup_time] = (counts[pickup_time] || 0) + 1;
        });
        setSlotCounts(counts);
      });
  }, [step]);

  const add = id => {
    const item = MENU.find(m => m.id === id);
    if (item && item.isSauce) { setShowSaucePicker(true); return; }
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };
  const rem = id => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const handleSauceConfirm = (sauces) => {
    setShowSaucePicker(false);
    setSauceChoices(prev => [...prev, ...sauces]);
    setCart(c => ({ ...c, [21]: (c[21] || 0) + sauces.length }));
  };

  const checkoutRem = id => {
    const qty = cart[id] || 0;
    if (qty <= 1) {
      const n = { ...cart };
      delete n[id];
      setCart(n);
      if (+id === 21) setSauceChoices([]);
      if (Object.keys(n).length === 0) setStep("menu");
    } else {
      setCart(c => ({ ...c, [id]: c[id] - 1 }));
      if (+id === 21) setSauceChoices(p => p.slice(0, -1));
    }
  };
  const checkoutAdd = id => {
    const item = MENU.find(m => m.id === +id);
    if (item?.isSauce) { setShowSaucePicker(true); return; }
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const fireClosedFlash = () => {
    if (flashing.current) return;
    flashing.current = true;
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const hasLaterToday = (HOURS[new Date().getDay()] || []).some(([s]) => {
      const [sh, sm] = s.split(":").map(Number); return sh * 60 + sm > nowMin;
    });
    const context = !open ? "day" : hasLaterToday ? "break" : "end";
    const DAY_NAMES = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
    const todayN = new Date().getDay();
    const nextOpenOffset = [1,2,3,4,5,6,7].find(i => HOURS[(todayN + i) % 7]);
    const nextOpenName = DAY_NAMES[(todayN + nextOpenOffset) % 7];
    const tomorrowOpen = !!HOURS[(todayN + 1) % 7];
    const dayClosingMsg = tomorrowOpen ? "morn wieder! 👋" : `am ${nextOpenName} wieder! 👋`;
    const dynamicDayMsgs = [...CLOSED_MSGS_DAY, dayClosingMsg];
    const msgs = context === "day" ? dynamicDayMsgs : context === "break" ? CLOSED_MSGS_BREAK : CLOSED_MSGS_END;
    const msg = nextClosedMsg(context, msgs);
    setBtnLabelOpacity(0);
    setTimeout(() => {
      setBtnLabel(msg);
      setBtnLabelOpacity(1);
      setTimeout(() => {
        setBtnLabelOpacity(0);
        setTimeout(() => {
          setBtnLabel("Bstellung ufgea 🔥");
          setBtnLabelOpacity(1);
          flashing.current = false;
        }, 200);
      }, 2500);
    }, 200);
  };

  const sauceQty = cart[21] || 0;
  const total = Object.entries(cart).reduce((s, [id, q]) => { const i = MENU.find(m => m.id === +id); return s + (i ? i.price * q : 0); }, 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const items = Object.entries(cart).map(([id, q]) => {
    const base = MENU.find(m => m.id === +id);
    if (+id === 21 && sauceChoices.length > 0) {
      return { ...base, qty: q, name: "Sauce (" + sauceChoices.join(", ") + ")" };
    }
    return { ...base, qty: q };
  });
  const open = !!HOURS[new Date().getDay()];
  const currentlyOpen = (() => {
    const now = new Date(), ranges = HOURS[now.getDay()];
    if (!ranges) return false;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return ranges.some(([s, e]) => {
      const [sh, sm] = s.split(":").map(Number), [eh, em] = e.split(":").map(Number);
      return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em;
    });
  })();
  const dayN = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][new Date().getDay()];
  const iS = { width: "100%", padding: "12px 14px", borderRadius: 8, boxSizing: "border-box", background: BGL, border: "1px solid rgba(240,235,224,0.12)", color: CR, fontSize: 15, outline: "none", fontFamily: "inherit" };
  const totalPrep = items.reduce((sum, it) => sum + (it.prep || 0) * it.qty, 0);
  const parallel = staffed ? 3 : 2;
  const orderExtra = Math.round(totalPrep / parallel);
  const effectiveCapacity = staffed ? 5 : slotCapacity;
  const baseLead = staffed ? 20 : 25;
  const availableSlots = genSlots(extraMinutes + orderExtra, baseLead)
    .filter(s => (slotCounts[s] || 0) < effectiveCapacity)
    .slice(0, currentlyOpen ? 12 : 2);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', sans-serif", color: CR }}>
      {showSaucePicker && <SaucePicker onConfirm={handleSauceConfirm} onCancel={() => setShowSaucePicker(false)} />}

      {/* HEADER */}
      <div style={{ background: S, boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: "#000", flexShrink: 0 }}>
            <img src="https://storage.e.jimdo.com/cdn-cgi/image/quality=85,fit=scale-down,format=auto,trim=0;0;0;0,width=1024,height=768/image/407616401/e596ea86-7cc4-4c11-bda9-454b0aad9c1b.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, fontFamily: "'Roboto', sans-serif" }}>Manu's Hoasse Kischta</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Gewerbestraße 2 · 6710 Nenzing</div>
          </div>
        </div>
        {step === "menu" && (
          <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 14px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                onClick={() => setShowHours(h => !h)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? "rgba(0,0,0,0.15)" : "rgba(180,30,30,0.5)", borderRadius: 8, padding: "4px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", userSelect: "none" }}
              >
                <span>{open ? `✓ Heute offen (${dayN})` : `✗ Heute gschlossa (${dayN})`}</span>
                <span style={{ opacity: 0.65, fontSize: 9 }}>{showHours ? "▲" : "▼"}</span>
              </div>
              {showHours && (
                <>
                  <div onClick={() => setShowHours(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 51, background: "#262626", border: "1px solid rgba(240,235,224,0.12)", borderRadius: 10, overflow: "hidden", minWidth: 260, boxShadow: "0 6px 28px rgba(0,0,0,0.55)" }} onClick={e => e.stopPropagation()}>
                    {WEEK_HOURS.map(({ day, hours, isRest }) => {
                      const isCurrent = day === dayN;
                      return (
                        <div key={day} style={{ padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: isCurrent ? "rgba(138,158,138,0.18)" : "transparent", borderBottom: "1px solid rgba(240,235,224,0.05)" }}>
                          <span style={{ color: isCurrent ? CR : CRD, fontSize: 13, fontWeight: isCurrent ? 700 : 400 }}>{day}</span>
                          <span style={{ color: isCurrent ? OR : (isRest ? "rgba(240,235,224,0.3)" : CRD), fontSize: 12, fontWeight: isCurrent ? 700 : 400 }}>{hours}</span>
                        </div>
                      );
                    })}
                    <div style={{ padding: "7px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(240,235,224,0.03)" }}>
                      <span style={{ color: "rgba(240,235,224,0.35)", fontSize: 12 }}>Feiertage</span>
                      <span style={{ color: "rgba(240,235,224,0.35)", fontSize: 12 }}>Geschlossen</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 100px" }}>

        {/* INFO BANNER */}
        {INFO_BANNER && step === "menu" && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "rgba(212,148,58,0.12)", border: "1px solid rgba(212,148,58,0.3)", fontSize: 13, color: OR, lineHeight: 1.5, fontWeight: 600 }}>
            ⚠️ {INFO_BANNER}
          </div>
        )}

        {/* ===== MENU ===== */}
        {step === "menu" && (
          <div style={{ opacity: anim ? 1 : 0, transition: "opacity 0.4s" }}>
            <div style={{ padding: INFO_BANNER ? "16px 0 8px" : "24px 0 8px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: CR, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Roboto', sans-serif" }}>Z Eassa und z Trinka</h2>
              <div style={{ fontSize: 12, color: CRD, marginTop: 4 }}>Wähl us und bstell zur Abholung</div>
            </div>

            {/* Category Tabs */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "12px 0", scrollbarWidth: "none" }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  background: cat === c ? S : "rgba(240,235,224,0.06)",
                  border: cat === c ? `1px solid ${SL}` : "1px solid rgba(240,235,224,0.08)",
                  color: cat === c ? "#fff" : CRD,
                  borderRadius: 8, padding: "8px 14px", fontSize: 12,
                  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.25s",
                }}>{CAT_ICONS[c]} {c}</button>
              ))}
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {MENU.filter(m => m.cat === cat).map(item => {
                const qty = item.isSauce ? sauceQty : (cart[item.id] || 0);
                return (
                  <div key={item.id} style={{
                    background: qty > 0 ? "rgba(138,158,138,0.12)" : "rgba(240,235,224,0.03)",
                    border: qty > 0 ? "1px solid rgba(138,158,138,0.35)" : "1px solid rgba(240,235,224,0.06)",
                    borderRadius: 12, padding: "12px 14px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.25s",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: CR }}>{item.name}</div>
                      {item.isSauce && <div style={{ fontSize: 11, color: CRD, marginTop: 2 }}>Ketchup, Majo, Senf, Tartare, Zwiebel, Curry, Burger, Bosnasosse</div>}
                      {item.desc && <div style={{ fontSize: 11, color: CRD, marginTop: 2 }}>{item.desc}</div>}
                      {item.isSauce && sauceChoices.length > 0 && (
                        <div style={{ fontSize: 11, color: S, marginTop: 3, fontWeight: 600 }}>Gwählt: {sauceChoices.join(", ")}</div>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 700, color: OR, marginTop: 4 }}>{item.price === 0 ? "gratis" : `€ ${item.price.toFixed(2)}`}{item.isSauce ? " pro Sauce" : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {qty > 0 && !item.isSauce && (
                        <>
                          <button onClick={() => rem(item.id)} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(240,235,224,0.08)", border: "1px solid rgba(240,235,224,0.15)", color: CR, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, boxSizing: "border-box" }}><span style={{ display: "block", lineHeight: 1 }}>−</span></button>
                          <span style={{ fontWeight: 700, fontSize: 15, minWidth: 18, textAlign: "center" }}>{qty}</span>
                        </>
                      )}
                      {item.isSauce && qty > 0 && (
                        <>
                          <button onClick={() => { setCart(c => { const n = {...c}; delete n[21]; return n; }); setSauceChoices([]); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(240,235,224,0.08)", border: "1px solid rgba(240,235,224,0.15)", color: CR, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, boxSizing: "border-box" }}><span style={{ display: "block", lineHeight: 1 }}>✕</span></button>
                          <span style={{ fontWeight: 700, fontSize: 15, minWidth: 18, textAlign: "center" }}>{qty}</span>
                        </>
                      )}
                      <button onClick={() => add(item.id)} style={{ width: 30, height: 30, borderRadius: "50%", background: S, border: "none", color: "#fff", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, boxSizing: "border-box" }}><span style={{ display: "block", lineHeight: 1 }}>+</span></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "rgba(138,158,138,0.08)", border: "1px solid rgba(138,158,138,0.15)", fontSize: 12, color: CRD, lineHeight: 1.5 }}>
              <strong style={{ color: S }}>📍 Nur Abholung</strong> · Bstell online, hol ab zur gwählta Ziit. Tel: +43 (0)660 3832646
            </div>
          </div>
        )}

        {/* ===== CHECKOUT ===== */}
        {step === "checkout" && (
          <div style={{ paddingTop: 20 }}>
            <button onClick={() => setStep("menu")} style={{ background: "none", border: "none", color: S, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 14, fontWeight: 600, fontFamily: "'Roboto', sans-serif" }}>← Zruck zur Karta</button>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px", fontFamily: "'Roboto', sans-serif" }}>Dini Bstellung</h2>
            <div style={{ background: "rgba(240,235,224,0.03)", borderRadius: 12, border: "1px solid rgba(240,235,224,0.06)", overflow: "hidden" }}>
              {items.map((it, i) => (
                <div key={it.id} style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < items.length - 1 ? "1px solid rgba(240,235,224,0.06)" : "none" }}>
                  <span style={{ fontSize: 13, flex: 1, marginRight: 8, lineHeight: 1.3 }}>{it.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => checkoutRem(it.id)} style={{ width: 26, height: 26, minWidth: 26, borderRadius: "50%", background: "rgba(240,235,224,0.08)", border: "1px solid rgba(240,235,224,0.18)", color: CR, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, margin: 0, lineHeight: 1, boxSizing: "border-box" }}><span style={{ display: "block", lineHeight: 1 }}>−</span></button>
                    <span style={{ fontWeight: 700, fontSize: 13, width: 18, textAlign: "center", display: "inline-block", lineHeight: "26px" }}>{it.qty}</span>
                    <button onClick={() => checkoutAdd(it.id)} style={{ width: 26, height: 26, minWidth: 26, borderRadius: "50%", background: S, border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, margin: 0, lineHeight: 1, boxSizing: "border-box" }}><span style={{ display: "block", lineHeight: 1 }}>+</span></button>
                    <span style={{ fontWeight: 700, color: OR, fontSize: 13, minWidth: 50, textAlign: "right" }}>€ {(it.price * it.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", background: "rgba(138,158,138,0.1)", borderTop: "1px solid rgba(138,158,138,0.2)" }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Gesamt</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: OR }}>€ {total.toFixed(2)}</span>
              </div>
            </div>
            {INFO_BANNER && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(212,148,58,0.12)", border: "1px solid rgba(212,148,58,0.3)", fontSize: 12, color: OR, lineHeight: 1.4, fontWeight: 600 }}>
                ⚠️ {INFO_BANNER}
              </div>
            )}
            {paused ? (
              <div style={{ marginTop: 20, padding: "18px 16px", borderRadius: 12, background: "rgba(212,148,58,0.1)", border: "1px solid rgba(212,148,58,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: OR, marginBottom: 4 }}>Grad viel los!</div>
                <div style={{ fontSize: 13, color: CRD }}>Bitte in a paar Minuta nochmal versuchen.</div>
              </div>
            ) : (
              <>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: CRD, display: "block", marginBottom: 5 }}>Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Din Name" style={{ ...iS, borderColor: nameTouched && !name ? "rgba(224,82,82,0.6)" : "rgba(240,235,224,0.12)" }} />
                    {nameTouched && !name && <div style={{ color: "#e05252", fontSize: 12, marginTop: 5, fontWeight: 500 }}>Bitte din Namen igea</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: CRD, display: "block", marginBottom: 5 }}>Telefonnummer *</label>
                    <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => setPhoneTouched(true)} placeholder="+43..." style={{ ...iS, borderColor: phoneTouched && !phoneOk(phone) ? "rgba(224,82,82,0.6)" : "rgba(240,235,224,0.12)" }} />
                    {phoneTouched && !phoneOk(phone) && <div style={{ color: "#e05252", fontSize: 12, marginTop: 5, fontWeight: 500 }}>Bitte a gültige Telefonnummer igea</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: CRD, display: "block", marginBottom: 5 }}>Abholziit *</label>
                    {availableSlots.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 6, borderRadius: 8, border: timeTouched && !time ? "1px solid rgba(224,82,82,0.6)" : "1px solid transparent", transition: "border-color 0.2s" }}>
                        {availableSlots.slice(0, 12).map(s => (
                          <button key={s} onClick={() => { setTime(s); setTimeTouched(false); }} style={{ padding: "7px 13px", borderRadius: 7, background: time === s ? S : "rgba(240,235,224,0.06)", border: time === s ? `1px solid ${SL}` : "1px solid rgba(240,235,224,0.1)", color: time === s ? "#fff" : CRD, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{s}</button>
                        ))}
                      </div>
                    ) : <div style={{ padding: 10, fontSize: 13, color: CRD }}>Aktuell koane Abholziita verfügbar</div>}
                    {timeTouched && !time && availableSlots.length > 0 && <div style={{ color: "#e05252", fontSize: 12, marginTop: 5, fontWeight: 500 }}>Bitte a Abholziit wähla</div>}
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: CRD, display: "block", marginBottom: 5 }}>Anmerkunga (optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="z.B. ohni Zwiebla, extra Sauce..." rows={3} style={{ ...iS, resize: "vertical" }} /></div>
                </div>
                <style>{`@keyframes formShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`}</style>
                <div style={{ animation: shaking ? "formShake 0.4s ease" : "none" }}>
                  <button
                    onClick={async () => {
                      if (name && phoneOk(phone) && time) {
                        setSubmitting(true);
                        setSubmitError("");
                        const today = new Date().toISOString().slice(0, 10);
                        const { error } = await supabase.from("orders").insert({
                          pickup_date: today,
                          pickup_time: time,
                          name, phone,
                          items: items.map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price })),
                          total,
                          notes,
                        });
                        setSubmitting(false);
                        if (error) { setSubmitError("Fehler beim Speichern – bitte nochmal versuchen."); return; }
                        setStep("done");
                        return;
                      }
                      if (availableSlots.length === 0) { fireClosedFlash(); return; }
                      setNameTouched(true);
                      setPhoneTouched(true);
                      setTimeTouched(true);
                      setShaking(true);
                      setTimeout(() => setShaking(false), 400);
                    }}
                    style={{ width: "100%", marginTop: 18, padding: "14px", background: (name && phoneOk(phone) && time) ? S : "rgba(240,235,224,0.08)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "background 0.3s", opacity: submitting ? 0.7 : 1 }}
                  >
                    <span style={{ transition: "opacity 0.2s", opacity: btnLabelOpacity, display: "inline-block" }}>
                      {submitting ? "Wird gschickt…" : btnLabel}
                    </span>
                  </button>
                </div>
                {submitError && <div style={{ color: "#e05252", fontSize: 12, marginTop: 8, textAlign: "center", fontWeight: 500 }}>{submitError}</div>}
              </>
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: "rgba(240,235,224,0.3)", textAlign: "center" }}>Bezahlung bi da Abholung (Bar oder Karta)</div>
          </div>
        )}

        {/* ===== DONE ===== */}
        {step === "done" && (
          <div style={{ paddingTop: 50, textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Roboto', sans-serif" }}>Bstellung ufgea!</h2>
            <p style={{ color: CRD, fontSize: 14 }}>Danke {name}! Dini Bstellung isch iganga.</p>
            <div style={{ background: "rgba(240,235,224,0.03)", borderRadius: 12, border: "1px solid rgba(240,235,224,0.06)", padding: 18, marginTop: 20, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: CRD }}>Abholziit</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: OR, marginBottom: 14 }}>{time} Uhr</div>
              <div style={{ fontSize: 12, color: CRD }}>Adresse</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Gewerbestraße 2, 6710 Nenzing</div>
              <div style={{ fontSize: 12, color: CRD, marginBottom: 4 }}>Dini Bstellung</div>
              {items.map(it => <div key={it.id} style={{ fontSize: 13, padding: "3px 0" }}>{it.qty}× {it.name} — € {(it.price * it.qty).toFixed(2)}</div>)}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(240,235,224,0.08)", fontWeight: 800, fontSize: 15 }}>Gesamt: <span style={{ color: OR }}>€ {total.toFixed(2)}</span></div>
              {notes && <div style={{ marginTop: 10, fontSize: 12, color: CRD }}>Anmerkunga: {notes}</div>}
            </div>
            <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "rgba(138,158,138,0.08)", border: "1px solid rgba(138,158,138,0.15)", fontSize: 12, color: CRD, lineHeight: 1.5 }}>Da Manu bereitet dini Bstellung frisch zua. Bezahlung bi da Abholung.</div>
            <button onClick={() => { setCart({}); setSauceChoices([]); setStep("menu"); setName(""); setPhone(""); setTime(""); setNotes(""); }} style={{ marginTop: 18, padding: "12px 24px", background: "rgba(240,235,224,0.06)", border: "1px solid rgba(240,235,224,0.1)", borderRadius: 8, color: CR, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Neui Bstellung</button>
          </div>
        )}
      </div>

      {/* FLOATING CART */}
      {step === "menu" && count > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: S, boxShadow: "0 -4px 20px rgba(0,0,0,0.4)", zIndex: 100 }}>
          <button onClick={() => { setPhoneTouched(false); setStep("checkout"); }} style={{ width: "100%", maxWidth: 520, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "rgba(0,0,0,0.2)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{count}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Zum Warakorb</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>€ {total.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
