import React, { useState, useEffect } from "react";
import { Arrow } from "./primitives";

/* Three intents, one editorial sheet. Submit is front-end only — wire the
   handlers to a real endpoint / email service / CRM in production. */
const SANC_INTENTS = {
  waitlist: {
    flag: "Opening 2026",
    title: "Join the waitlist",
    sub: "Be first through the doors when the shala, temple and ice spa open beside the café — with an early-access window before anyone else.",
    fields: ["name", "email", "interest"],
    submit: "Join the waitlist",
    doneH: "You're on the list.",
    doneP: "We'll write to {email} the moment doors open.",
  },
  notify: {
    flag: "Opening 2026",
    title: "Notify me when it opens",
    sub: "One quiet email when the Sanctuary is ready to receive you. Nothing else, ever.",
    fields: ["email"],
    submit: "Notify me",
    doneH: "Noted.",
    doneP: "A single note will reach {email} the day the Sanctuary opens.",
  },
  host: {
    flag: "Private & group bookings",
    title: "Host at the Sanctuary",
    sub: "Workshops, retreats, sound circles or private sessions — tell us what you have in mind and we'll shape the space around it.",
    fields: ["name", "email", "phone", "type", "dates", "message"],
    submit: "Send enquiry",
    doneH: "Thank you.",
    doneP: "Your enquiry is with our team — we'll reply to {email} within two working days.",
  },
};

const INTEREST_OPTS = ["Yoga shala", "Movement & gym", "The temple", "Ice spa", "All of it"];
const HOST_TYPE_OPTS = ["Workshop", "Retreat or residency", "Sound & meditation circle", "Private session", "Corporate / team day", "Something else"];

function SancField({ name, value, onChange }) {
  const set = (v) => onChange(name, v);
  if (name === "name") return <label className="sa-field"><span>Your name</span><input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder="First & last" /></label>;
  if (name === "email") return <label className="sa-field"><span>Email</span><input type="email" value={value} onChange={(e) => set(e.target.value)} placeholder="you@email.com" /></label>;
  if (name === "phone") return <label className="sa-field"><span>Phone <em>(optional)</em></span><input type="tel" value={value} onChange={(e) => set(e.target.value)} placeholder="+91" /></label>;
  if (name === "dates") return <label className="sa-field"><span>Preferred dates <em>(optional)</em></span><input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder="e.g. a weekend in March" /></label>;
  if (name === "interest") return (
    <label className="sa-field"><span>What draws you</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        <option value="">Choose one…</option>
        {INTEREST_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  if (name === "type") return (
    <label className="sa-field"><span>Kind of gathering</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        <option value="">Choose one…</option>
        {HOST_TYPE_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  if (name === "message") return <label className="sa-field sa-wide"><span>Tell us more</span><textarea rows={3} value={value} onChange={(e) => set(e.target.value)} placeholder="Numbers, intention, anything we should know…"></textarea></label>;
  return null;
}

export function SanctuaryModal({ intent, onClose }) {
  const cfg = intent ? SANC_INTENTS[intent] : null;
  const [form, setForm] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => { setForm({}); setSent(false); }, [intent]);
  useEffect(() => {
    if (!intent) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [intent, onClose]);

  if (!cfg) return null;
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const emailOk = /\S+@\S+\.\S+/.test(form.email || "");
  const canSend = emailOk && (!cfg.fields.includes("name") || (form.name || "").trim().length > 1);
  const onSubmit = (e) => { e.preventDefault(); if (canSend) setSent(true); };
  const isHost = intent === "host";

  return (
    <div className="sa-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sa-panel" role="dialog" aria-modal="true" aria-label={cfg.title}>
        <button className="sa-close" onClick={onClose} aria-label="Close">×</button>

        {!sent ? (
          <React.Fragment>
            <span className="sa-flag"><span className="dot"></span>Conscious Sanctuary · {cfg.flag}</span>
            <h3 className="display">{cfg.title}</h3>
            <p className="sa-sub">{cfg.sub}</p>
            <form className="sa-form" onSubmit={onSubmit}>
              <div className={isHost ? "sa-grid2" : ""}>
                {cfg.fields.map((f) => <SancField key={f} name={f} value={form[f] || ""} onChange={setField} />)}
              </div>
              <button type="submit" className="btn forest sa-submit" disabled={!canSend}>{cfg.submit} <Arrow /></button>
              <p className="sa-fine">We use your details only for this — no lists sold, no noise.</p>
            </form>
          </React.Fragment>
        ) : (
          <div className="sa-done">
            <span className="sa-tick" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12.5l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3 className="display">{cfg.doneH}</h3>
            <p className="sa-sub">{cfg.doneP.replace("{email}", form.email || "you")}</p>
            <button className="btn forest sa-submit" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
