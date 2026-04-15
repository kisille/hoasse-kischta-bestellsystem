import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const ADMIN_PIN = "1234";
const BG = "#2d2d2d", BGL = "#3a3a3a", CR = "#f0ebe0", CRD = "rgba(240,235,224,0.5)", S = "#8a9e8a", OR = "#d4943a";

const TODAY = new Date().toLocaleDateString("de-AT", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function StatusBadge({ status }) {
  const map = { pending: ["#d4943a", "Offen"], done: [S, "Fertig ✓"], cancelled: ["#e05252", "Storniert"] };
  const [color, label] = map[status] || [CRD, status];
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "22", borderRadius: 5, padding: "2px 8px" }}>{label}</span>;
}

export default function Admin() {
  const [pin, setPin] = useState("");
  const [pinOk, setPinOk] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(0);
  const [filter, setFilter] = useState("pending");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: ord }, { data: set }] = await Promise.all([
      supabase.from("orders").select("*").eq("pickup_date", TODAY_ISO).order("pickup_time"),
      supabase.from("settings").select("*"),
    ]);
    setOrders(ord || []);
    (set || []).forEach(({ key, value }) => {
      if (key === "paused") setPaused(value === "true");
      if (key === "extra_minutes") setExtraMinutes(Number(value));
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!pinOk) return;
    fetchAll();
    const iv = setInterval(fetchAll, 30000);
    return () => clearInterval(iv);
  }, [pinOk, fetchAll]);

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const setSetting = async (key, value) => {
    await supabase.from("settings").update({ value: String(value) }).eq("key", key);
    if (key === "paused") setPaused(value);
    if (key === "extra_minutes") setExtraMinutes(value);
  };

  if (!pinOk) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: BGL, borderRadius: 14, padding: 28, width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: CR, textAlign: "center", marginBottom: 20 }}>Admin-Zugang</div>
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(false); }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (pin === ADMIN_PIN) { setPinOk(true); }
                else { setPinError(true); setPin(""); }
              }
            }}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, boxSizing: "border-box", background: "#3f3f3f", border: pinError ? "1px solid #e05252" : "1px solid rgba(240,235,224,0.12)", color: CR, fontSize: 18, textAlign: "center", outline: "none", letterSpacing: 6, fontFamily: "inherit" }}
          />
          {pinError && <div style={{ color: "#e05252", fontSize: 12, marginTop: 6, textAlign: "center" }}>Falscher PIN</div>}
          <button
            onClick={() => { if (pin === ADMIN_PIN) setPinOk(true); else { setPinError(true); setPin(""); } }}
            style={{ width: "100%", marginTop: 14, padding: "12px", background: S, border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
          >Einlogga</button>
        </div>
      </div>
    );
  }

  const shown = orders.filter(o => filter === "all" || o.status === filter);
  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', sans-serif", color: CR }}>
      {/* Header */}
      <div style={{ background: S, padding: "16px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Manu's Admin</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{TODAY}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loading && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>lädt…</div>}
            <button onClick={fetchAll} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>↻</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px 16px 100px" }}>

        {/* Admin Controls */}
        <div style={{ background: BGL, borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid rgba(240,235,224,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: CRD, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Steuerung</div>

          {/* Pause Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Bestellungen pausieren</div>
              <div style={{ fontSize: 12, color: CRD }}>Kunden sehen "Grad viel los"</div>
            </div>
            <button
              onClick={() => setSetting("paused", !paused)}
              style={{ width: 52, height: 28, borderRadius: 14, background: paused ? "#e05252" : "rgba(240,235,224,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
            >
              <span style={{ position: "absolute", top: 3, left: paused ? 26 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s", display: "block" }} />
            </button>
          </div>

          {/* Extra Zeit */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Zusatzzeit</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 15, 30, 45].map(m => (
                <button key={m} onClick={() => setSetting("extra_minutes", m)} style={{ flex: 1, padding: "7px 0", borderRadius: 7, background: extraMinutes === m ? S : "rgba(240,235,224,0.06)", border: extraMinutes === m ? "none" : "1px solid rgba(240,235,224,0.1)", color: extraMinutes === m ? "#fff" : CRD, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {m === 0 ? "Normal" : `+${m} Min`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["pending", `Offen (${pendingCount})`], ["done", "Fertig"], ["cancelled", "Storniert"], ["all", "Alle"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ flex: 1, padding: "7px 4px", borderRadius: 7, background: filter === val ? S : "rgba(240,235,224,0.06)", border: filter === val ? "none" : "1px solid rgba(240,235,224,0.1)", color: filter === val ? "#fff" : CRD, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
          ))}
        </div>

        {/* Bestellungen */}
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: CRD, fontSize: 14 }}>
            {filter === "pending" ? "Keine offenen Bestellungen" : "Keine Einträge"}
          </div>
        ) : (
          shown.map(o => (
            <div key={o.id} style={{ background: BGL, borderRadius: 12, padding: 16, marginBottom: 10, border: o.status === "pending" ? "1px solid rgba(138,158,138,0.2)" : "1px solid rgba(240,235,224,0.06)", opacity: o.status !== "pending" ? 0.65 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: OR }}>{o.pickup_time} Uhr</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{o.name}</div>
                  <a href={`tel:${o.phone}`} style={{ fontSize: 13, color: S, textDecoration: "none" }}>{o.phone}</a>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ borderTop: "1px solid rgba(240,235,224,0.06)", paddingTop: 10, marginBottom: 10 }}>
                {(o.items || []).map((it, i) => (
                  <div key={i} style={{ fontSize: 13, display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>{it.qty}× {it.name}</span>
                    <span style={{ color: CRD }}>€ {(it.price * it.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(240,235,224,0.06)", fontWeight: 800 }}>
                  <span>Gesamt</span>
                  <span style={{ color: OR }}>€ {Number(o.total).toFixed(2)}</span>
                </div>
                {o.notes && <div style={{ marginTop: 6, fontSize: 12, color: CRD, fontStyle: "italic" }}>📝 {o.notes}</div>}
              </div>
              {o.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => updateStatus(o.id, "done")} style={{ flex: 1, padding: "9px", borderRadius: 8, background: S, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Fertig ✓</button>
                  <button onClick={() => updateStatus(o.id, "cancelled")} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "rgba(224,82,82,0.15)", border: "1px solid rgba(224,82,82,0.3)", color: "#e05252", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Storniert</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
