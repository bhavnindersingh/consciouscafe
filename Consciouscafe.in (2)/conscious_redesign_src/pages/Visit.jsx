import React from "react";
import { Reveal, Arrow } from "../components/primitives";
import { useGoNav } from "../nav";
import { CC } from "../data/menu";

export default function Visit() {
  const onNav = useGoNav();
  const hours = [
    { d: "Mon, Wed — Sun", h: "9:30 — 21:00" },
    { d: "Tuesday", h: "Closed" },
  ];
  const notes = [
    { k: "The landmark", t: "On Auroville Road, a few minutes from the Visitor Centre. Look for the canopy of trees and the open courtyard." },
    { k: "Getting here", t: "Easiest by two-wheeler or car from Pondicherry (~20 min). Auto-rickshaws know it by name. Cycle parking at the gate." },
    { k: "Before you come", t: "Walk-ins are welcome. For long tables and larger groups, a quick message ahead helps us hold the right space." },
  ];

  return (
    <main className="visit-view">
      <header className="visit-hero">
        <img src={CC.img(CC.find(24).src, { w: 1920, h: 1080, mode: "crop", q: 88 })} alt="A table at Conscious Café" />
        <div className="visit-hero-inner">
          <div style={{ maxWidth: 1500, margin: "0 auto", width: "100%" }}>
            <span className="eyebrow on-dark reveal">Visit · Auroville Road</span>
            <h1 className="display reveal">Come sit<br /><em>a while.</em></h1>
            <p className="hero-sub reveal">An open courtyard under the trees — slow mornings, long lunches, and a kitchen that never rushes you out.</p>
          </div>
        </div>
      </header>

      <section className="section visit-shell">
        <Reveal className="visit-info">
          <span className="eyebrow">The café</span>
          <h2 className="visit-name">Conscious Café</h2>
          <p className="visit-addr">Kuilapalayam Main Road<br />Auroville Road, Tamil Nadu 605101</p>

          <div className="hours-block">
            <span className="visit-label">Hours</span>
            {hours.map((r) => (
              <div className="hours-row" key={r.d}><span>{r.d}</span><span className="dots"></span><span>{r.h}</span></div>
            ))}
          </div>

          <div className="contact-block">
            <span className="visit-label">Reach us</span>
            <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a>
            <a href="tel:+918754561269">+91 87545 61269</a>
          </div>

          <div className="visit-cta">
            <a className="btn forest" href={CC.MAPS} target="_blank" rel="noopener noreferrer">Get directions <Arrow /></a>
            <button className="btn" onClick={() => onNav("menu")}>View the menu <Arrow /></button>
          </div>
        </Reveal>

        <Reveal delay={1} className="visit-map">
          <iframe
            title="Conscious Café location"
            src="https://www.google.com/maps?q=Conscious%20Cafe%20Auroville&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <a className="map-open" href={CC.MAPS} target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a>
        </Reveal>
      </section>

      <section className="section paper2 here-section">
        <Reveal><div className="kicker-row"><span className="idx">Getting here</span><span className="eyebrow">A few notes</span></div></Reveal>
        <div className="here-grid">
          {notes.map((n, i) => (
            <Reveal className="here-card" delay={i + 1} key={n.k}>
              <div className="pn">0{i + 1}</div>
              <h4>{n.k}</h4>
              <p>{n.t}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
