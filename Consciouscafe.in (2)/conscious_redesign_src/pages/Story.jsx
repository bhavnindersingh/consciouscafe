import React, { useState } from "react";
import { Reveal, Arrow } from "../components/primitives";
import { useGoNav } from "../nav";
import { CC } from "../data/menu";
import bhavninderImg from "../assets/founder-bhavninder.png";

const STORY_IMG = "images/Our Story page/Top photo on page.JPG";

const FOUNDERS = [
  { name: "Kirtana", role: "Co-founder", src: "images/Our Story page/Kirtana headshot.jpg" },
  { name: "Zulfi", role: "Co-founder", src: "images/Our Story page/Zulfiqar Headshot.png" },
  { name: "Bhavninder", role: "Co-founder", src: bhavninderImg, local: true },
  { name: "Pallavi", role: "Co-founder", src: "images/Our Story page/pallavi headshot.jpeg" },
];

const VALUES = [
  { n: "Mindfulness", p: "Presence and intention in every plate, pour and pause — the practice that holds the rest together." },
  { n: "Sustainability", p: "Sustainable food economics and eco-conscious habits, from sourcing along Auroville Road to a kitchen that wastes nothing." },
  { n: "Community", p: "A welcoming, shared space built for connection, conversation and unhurried growth." },
  { n: "Natural living", p: "The flavours of nature, celebrated through wholesome, plant-forward, conscious choices." },
];

/* portrait with graceful striped fallback. `local` srcs (imported assets)
   are used as-is; gumlet paths go through CC.img. */
function Portrait({ src, alt, opts, local }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? CC.ph(alt) : (local ? src : CC.img(src, opts))}
      alt={alt}
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

export default function Story() {
  const onNav = useGoNav();
  return (
    <main className="story-page">
      <header className="story-hero">
        <div className="story-hero-head">
          <Reveal><div className="kicker-row"><span className="idx">Our Story</span><span className="eyebrow">Est. Auroville Road</span></div></Reveal>
          <Reveal delay={1}>
            <h1 className="display">A love of food, yoga &amp; <em>community</em> — set one table.</h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="lede">Connecting people with the flavours of nature, the discipline of yoga, and the quiet of mindfulness.</p>
          </Reveal>
        </div>
        <Reveal delay={2} className="story-hero-figure">
          <Portrait src={STORY_IMG} alt="Our founders, in practice" opts={{ w: 1400, h: 1000, mode: "crop", q: 86 }} />
        </Reveal>
      </header>

      <section className="section story-mission">
        <div className="sm-grid">
          <Reveal className="sm-aside">
            <span className="eyebrow">The vision</span>
            <span className="sm-rule" aria-hidden="true"></span>
          </Reveal>
          <div className="sm-body">
            <Reveal>
              <p className="sm-lead">
                A shared love for food, yoga, and community brought our founders — <em>Kirtana, Zulfi, Bhavninder</em> and <em>Pallavi</em> — together, around a single idea: a vibrant, healthy community built on wellness, sustainable food, and a place to belong.
              </p>
            </Reveal>
            <Reveal delay={1}>
              <p className="sm-para">
                We try to infuse mindfulness into every part of how we live and work — a foundation of presence and purpose. By keeping to it, we hope to slowly share that sense of balance with you, and to keep growing and learning together.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section paper2">
        <div className="col-head">
          <Reveal><div className="kicker-row"><span className="idx">The founders</span><span className="eyebrow">Four people, one table</span></div></Reveal>
          <Reveal delay={1}>
            <h2 className="display" style={{ fontSize: "clamp(32px,5vw,72px)", maxWidth: "15ch", marginBottom: "clamp(36px,6vh,68px)" }}>
              The hands behind the <em>practice.</em>
            </h2>
          </Reveal>
        </div>
        <div className="founders">
          {FOUNDERS.map((f, i) => (
            <Reveal className="founder" delay={i + 1} key={f.name}>
              <div className="f-portrait">
                <Portrait src={f.src} alt={f.name} local={f.local} opts={{ w: 640, h: 800, mode: "crop", q: 84 }} />
              </div>
              <h3>{f.name}</h3>
              <span className="f-role">{f.role}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section forest">
        <div className="col-head">
          <Reveal><div className="kicker-row"><span className="idx" style={{ color: "rgba(255,255,255,.55)" }}>What guides us</span></div></Reveal>
          <Reveal delay={1}>
            <h2 className="display" style={{ fontSize: "clamp(32px,5vw,72px)", maxWidth: "16ch", marginBottom: "clamp(40px,7vh,80px)" }}>
              Four principles we keep <em>returning to.</em>
            </h2>
          </Reveal>
        </div>
        <div className="pillars val-grid">
          {VALUES.map((v, i) => (
            <Reveal className="pillar" delay={i + 1} key={v.n}>
              <div className="pn">0{i + 1}</div>
              <h4>{v.n}</h4>
              <p>{v.p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section story-close">
        <Reveal>
          <span className="eyebrow">More than a meal</span>
          <h2 className="display" style={{ fontSize: "clamp(34px,6vw,88px)", maxWidth: "16ch", margin: "20px auto 34px" }}>
            Come sit with us on <em>Auroville Road.</em>
          </h2>
        </Reveal>
        <Reveal delay={1} className="story-close-actions">
          <button className="btn forest" onClick={() => onNav("menu")}>See the menu</button>
          <button className="tlink" onClick={() => onNav("visit")}>Plan a visit <Arrow /></button>
        </Reveal>
      </section>
    </main>
  );
}
