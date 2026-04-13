import { useState, useEffect } from "react";

// ── CONFIG ──
const INFO_BANNER = "";           // Leer lassen oder Text reinschreiben
const BLOCKED_SLOTS_FROM = "";    // z.B. "16:30"
const BLOCKED_SLOTS_TO = "";      // z.B. "21:00"

const SAUCES = ["Ketchup", "Majo", "Senf", "Tartare", "Zwiebel-Sauce", "Curry-Sauce", "Burger-Sauce", "Bosnasosse (hausgemacht)"];

const MENU = [
  { id: 1, cat: "Zum Eassa", name: "Rote", price: 6.10 },
  { id: 2, cat: "Zum Eassa", name: "Wiesse (Gschwollane)", price: 6.30 },
  { id: 3, cat: "Zum Eassa", name: "Curry + Brot", price: 6.30 },
  { id: 4, cat: "Zum Eassa", name: "Curry + Pommes", price: 10.40 },
  { id: 5, cat: "Zum Eassa", name: "Berliner Curry", price: 10.40 },
  { id: 6, cat: "Zum Eassa", name: "Bosna", price: 7.20 },
  { id: 7, cat: "Zum Eassa", name: "Bosna XXL", price: 13.60 },
  { id: 8, cat: "Zum Eassa", name: "Grillwürschtle", price: 5.90 },
  { id: 9, cat: "Zum Eassa", name: "Fleischlöable (Hamburger)", price: 6.80 },
  { id: 10, cat: "Zum Eassa", name: "Zack Zack (Schwein)", price: 6.90 },
  { id: 11, cat: "Zum Eassa", name: "Chickenburger", price: 8.60 },
  { id: 12, cat: "Zum Eassa", name: "Panierte Hennastreifa", price: 8.60 },
  { id: 30, cat: "Spezial", name: "Zack-Teller", price: 14.90, desc: "2x Zack, 2x Zwiebelringe, Pommes, Zwiebelsosse, Kräuterbutter" },
  { id: 31, cat: "Spezial", name: "Zack-Spezial", price: 8.40, desc: "Zack Zack, Soss Tartare, Salat, Käse und Rösti" },
  { id: 32, cat: "Spezial", name: "Spezial Baguette", price: 13.60, desc: "Riesenbaguette, 2x Zack, Salat, Zwiebelsosse" },
  { id: 13, cat: "Vegi", name: "Falafel Burger", price: 9.40 },
  { id: 14, cat: "Vegi", name: "Ibile", price: 5.90 },
  { id: 15, cat: "Vegi", name: "Zwiebelring", price: 6.80 },
  { id: 16, cat: "Vegi", name: "Panierta Bluamakohl", price: 6.80 },
  { id: 17, cat: "Vegi", name: "Pommes", price: 4.90 },
  { id: 18, cat: "Extras", name: "Zwiebla, Tomata, Gurka, Salot", price: 0.00 },
  { id: 19, cat: "Extras", name: "Käse", price: 0.50 },
  { id: 20, cat: "Extras", name: "Ananas", price: 0.90 },
  { id: 21, cat: "Extras", name: "Sauce", price: 0.50, isSauce: true },
  { id: 22, cat: "Getränke", name: "Mineral mit", price: 3.10 },
  { id: 23, cat: "Getränke", name: "Mineral ohne", price: 3.10 },
  { id: 24, cat: "Getränke", name: "Coca Cola (Zero)", price: 3.50 },
  { id: 25, cat: "Getränke", name: "Fanta", price: 3.50 },
  { id: 26, cat: "Getränke", name: "Mezzo", price: 3.50 },
  { id: 27, cat: "Getränke", name: "Sprite", price: 3.50 },
  { id: 37, cat: "Getränke", name: "Iso (vu üs)", price: 3.50 },
  { id: 28, cat: "Getränke", name: "Eistee Pfirsich", price: 3.50 },
  { id: 29, cat: "Getränke", name: "Eistee Zitrona", price: 3.50 },
  { id: 38, cat: "Getränke", name: "Apfel Gsprützt", price: 3.50 },
  { id: 39, cat: "Getränke", name: "Johann Gsprützt", price: 3.50 },
  { id: 40, cat: "Getränke", name: "Red Bull", price: 4.30 },
  { id: 33, cat: "Bier", name: "Bier 0,3 L", price: 3.70 },
  { id: 34, cat: "Bier", name: "Bier 0,5 L", price: 4.50 },
  { id: 35, cat: "Bier", name: "Radler 0,3 L", price: 3.70 },
];

const CATS = ["Zum Eassa", "Spezial", "Vegi", "Extras", "Getränke", "Bier"];
const CAT_ICONS = { "Zum Eassa": "🔥", "Spezial": "⭐", "Vegi": "🌿", "Extras": "➕", "Getränke": "🥤", "Bier": "🍺" };

const HOURS = {
  1: [["11:30","13:30"],["17:00","20:00"]],
  2: [["11:30","13:30"],["16:30","21:00"]],
  3: [["11:30","13:30"],["16:30","21:00"]],
  4: [["11:30","13:30"],["16:30","21:00"]],
  5: [["11:30","13:30"],["16:30","21:00"]]
};

function genSlots() {
  const now = new Date();
  const ranges = HOURS[now.getDay()] || [];
  const slots = [];
  for (const [s, e] of ranges) {
    const [sh, sm] = s.split(":").map(Number);
    const [eh, em] = e.split(":").map(Number);
    let h = sh, m = sm;
    while (h < eh || (h === eh && m <= em - 15)) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (h * 60 + m >= now.getHours() * 60 + now.getMinutes() + 15) {
        slots.push(t);
      }
      m += 15;
      if (m >= 60) { h++; m = 0; }
    }
  }
  return slots;
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
  const [showSaucePicker, setShowSaucePicker] = useState(false);

  useEffect(() => {
    setSlots(genSlots());
  }, []);

  const add = (id) => {
    const item = MENU.find(m => m.id === id);
    if (item?.isSauce) {
      setShowSaucePicker(true);
      return;
    }
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const rem = (id) => {
    setCart(c => {
      const n = { ...c };
      if (n[id] > 1) n[id]--;
      else delete n[id];
      return n;
    });
  };

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU.find(m => m.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const items = Object.entries(cart).map(([id, qty]) => {
    const base = MENU.find(m => m.id === parseInt(id));
    if (parseInt(id) === 21 && sauceChoices.length > 0) {
      return { ...base, qty, name: `Sauce (${sauceChoices.join(", ")})` };
    }
    return { ...base, qty };
  });

  return (
    <div style={{ minHeight: "100vh", background: "#2d2d2d", color: "#f0ebe0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#8a9e8a", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "28px", fontWeight: "700" }}>🔥 Manu's Hoasse Kischta</div>
        <div style={{ fontSize: "14px", opacity: 0.9 }}>Gewerbestraße 2 · 6710 Nenzing</div>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "16px" }}>

        {step === "menu" && (
          <>
            <h1 style={{ textAlign: "center", margin: "24px 0 8px", fontSize: "24px" }}>Zum Eassa und z Trinka</h1>
            <p style={{ textAlign: "center", color: "#aaa" }}>Wähle Kategorie und füge Artikel hinzu.</p>

            {/* Kategorien */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "12px 0", marginBottom: "16px" }}>
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: cat === c ? "#8a9e8a" : "#3a3a3a",
                    color: cat === c ? "#fff" : "#ccc",
                    border: "none",
                    whiteSpace: "nowrap",
                    fontWeight: "600"
                  }}
                >
                  {CAT_ICONS[c]} {c}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {MENU.filter(item => item.cat === cat).map(item => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} style={{ background: "#3a3a3a", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "600" }}>{item.name}</div>
                      {item.desc && <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>{item.desc}</div>}
                      <div style={{ color: "#d4943a", fontWeight: "700", marginTop: "4px" }}>€ {item.price.toFixed(2)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {qty > 0 && <button onClick={() => rem(item.id)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#555", color: "#fff", border: "none" }}>-</button>}
                      {qty > 0 && <span style={{ minWidth: "20px", textAlign: "center", fontWeight: "700" }}>{qty}</span>}
                      <button onClick={() => add(item.id)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#8a9e8a", color: "#fff", border: "none" }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {count > 0 && (
              <button
                onClick={() => setStep("checkout")}
                style={{ marginTop: "30px", width: "100%", padding: "16px", background: "#8a9e8a", color: "#fff", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: "700" }}
              >
                Zum Warenkorb → € {total.toFixed(2)}
              </button>
            )}
          </>
        )}

        {/* Hier kommt später Checkout + Done Screen */}
        {step === "checkout" && (
          <div>
            <button onClick={() => setStep("menu")} style={{ color: "#8a9e8a", marginBottom: "20px" }}>← Zurück</button>
            <h2>Dini Bstellung</h2>
            <p>Checkout wird gerade fertig programmiert...</p>
          </div>
        )}
      </div>
    </div>
  );
}