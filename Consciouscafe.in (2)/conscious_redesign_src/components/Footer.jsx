import React from "react";
import { Reveal, Arrow } from "./primitives";
import { useGoNav } from "../nav";
import { CC } from "../data/menu";

export function Footer() {
  const goNav = useGoNav();
  return (
    <footer className="footer" id="visit">
      <div className="footer-top">
        <Reveal>
          <span className="eyebrow on-dark" style={{ color: "rgba(255,255,255,.55)" }}>Come sit a while</span>
          <h3 style={{ marginTop: 18 }}>Find us under<br /><em style={{ fontStyle: "italic" }}>the canopy.</em></h3>
          <div style={{ marginTop: 30 }}>
            <button className="btn on-dark" onClick={() => goNav("menu")}>Explore the Menu <Arrow /></button>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <div className="col-label">Visit</div>
          <p className="line">Kuilapalayam Main Road</p>
          <p className="line">Auroville Road, Tamil Nadu 605101</p>
          <p className="line" style={{ marginTop: 14 }}>Daily 9:30 — 21:00 · closed Tuesdays</p>
          <a href={CC.MAPS} target="_blank" rel="noopener noreferrer" style={{ marginTop: 14 }}>Get directions →</a>
        </Reveal>
        <Reveal delay={2}>
          <div className="col-label">Connect</div>
          <a href="https://www.instagram.com/consciouscafe.sanctuary/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
          <a href="tel:+918754561269">+91 87545 61269</a>
          <a href="#sanctuary" style={{ marginTop: 14 }} onClick={(e) => { e.preventDefault(); goNav("gather"); }}>Host at the Sanctuary →</a>
        </Reveal>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Conscious Café · Auroville Road</span>
        <span>Plant-forward · Slow-made · Earth-first</span>
      </div>
    </footer>
  );
}
