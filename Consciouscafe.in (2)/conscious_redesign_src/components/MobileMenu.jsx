import React from "react";
import { useGoNav } from "../nav";
import { useCart } from "../cart/CartContext";
import hibiscus from "../assets/hibiscus.png";

const ITEMS = [
  { id: "home", label: "Home", note: "The kitchen, the ethos" },
  { id: "menu", label: "Menu", note: "A season, plated" },
  { id: "story", label: "Story", note: "Why we cook this way" },
  { id: "gather", label: "Sanctuary", note: "Shala · temple · ice spa" },
  { id: "visit", label: "Visit", note: "Auroville Road" },
];

export function MobileMenu({ open, onClose }) {
  const goNav = useGoNav();
  const { count, setBagOpen } = useCart();
  return (
    <div className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="mm-top">
        <span className="mm-brand">Conscious Café</span>
        <button className="mm-close" onClick={onClose} aria-label="Close menu">×</button>
      </div>
      <nav className="mm-list">
        {ITEMS.map((n, i) => (
          <button key={n.id} className="mm-item" onClick={() => { goNav(n.id); onClose(); }}>
            <span className="mm-idx">0{i + 1}</span>
            <span className="mm-text"><span className="mm-label">{n.label}</span><span className="mm-note">{n.note}</span></span>
            <span className="mm-arr">→</span>
          </button>
        ))}
      </nav>
      <div className="mm-foot">
        <button className="mm-bag" onClick={() => { setBagOpen(true); onClose(); }}>
          View bag{count > 0 ? ` · ${count}` : ""}
        </button>
        <div className="mm-contact">
          <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
          <a href="tel:+918754561269">+91 87545 61269</a>
          <span>Daily 9:30 — 21:00 · closed Tuesdays</span>
        </div>
      </div>
      <img className="mm-flower" src={hibiscus} alt="" aria-hidden="true" />
    </div>
  );
}
