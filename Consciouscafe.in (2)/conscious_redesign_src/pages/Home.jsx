import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Reveal, Arrow } from "../components/primitives";
import { SanctuaryModal } from "../components/SanctuaryModal";
import { useGoNav } from "../nav";
import { CC } from "../data/menu";
import hibiscus from "../assets/hibiscus.png";

function Hero({ onNav, motion = true }) {
  const [isPhone, setIsPhone] = useState(typeof window !== "undefined" && window.matchMedia("(max-width:760px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:760px)");
    const handler = () => setIsPhone(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return (
    <header className="hero" id="home">
      <div className="hero-media">
        <img src={CC.HERO.poster} alt="Conscious Café" />
        {motion && (
          <div className={`hero-video${isPhone && CC.HERO.videoMobileIsPortrait ? " portrait" : ""}`}>
            <iframe key={isPhone ? "m" : "d"} title="Conscious Café" src={isPhone ? CC.HERO.videoMobile : CC.HERO.video} allow="autoplay; encrypted-media; picture-in-picture"></iframe>
          </div>
        )}
      </div>
      <img className="hero-flower" src={hibiscus} alt="" aria-hidden="true" />
      <div className="hero-side">Auroville Road · South India</div>
      <div className="scroll-cue"><span>scroll</span><span className="rail"></span></div>
      <div className="hero-inner">
        <div style={{ maxWidth: 1500, margin: "0 auto", width: "100%" }}>
          <Reveal as="div"><span className="eyebrow on-dark">Plant-forward kitchen · since 2016</span></Reveal>
          <h1 className="display reveal in">Eat like the<br /><em>earth is watching.</em></h1>
          <p className="hero-sub reveal in">A slow kitchen on Auroville Road — whole foods, plant-led plates, and gatherings that move at the speed of presence.</p>
          <div className="hero-cta">
            <button className="btn on-dark" onClick={() => onNav("menu")}>View the Menu <Arrow /></button>
            <button className="btn on-dark" style={{ borderColor: "transparent", paddingLeft: 0 }} onClick={() => onNav("gather")}>Sanctuary →</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Manifesto() {
  return (
    <section className="section" id="manifesto">
      <div className="manifesto">
        <Reveal><div className="kicker-row"><span className="idx">01 — Ethos</span><span className="eyebrow">A way of cooking</span></div></Reveal>
        <Reveal delay={1}>
          <p className="display" style={{ fontSize: "clamp(30px,5vw,78px)" }}>
            We cook with what the season offers — <span className="mut">grains, roots, leaf and ferment</span> — and let restraint do the seasoning. Nothing rushed, nothing wasted, <em>everything considered.</em>
          </p>
        </Reveal>
        <div className="manifesto-foot">
          <Reveal delay={2}><p className="lede" style={{ maxWidth: "30ch" }}>Sourced within reach of our doors, prepared by hands that know the difference.</p></Reveal>
          <Reveal delay={3}><button className="tlink">Read our sourcing <Arrow /></button></Reveal>
        </div>
      </div>
    </section>
  );
}

function DishImg({ p, opts, alt }) {
  const [err, setErr] = useState(false);
  return <img src={err ? CC.ph(p.name) : CC.img(p.src, opts)} alt={alt || p.name} loading="lazy" onError={() => setErr(true)} />;
}

function Signatures({ onOpen }) {
  const lead = CC.find(26);
  const trio = [CC.find(32), CC.find(11), CC.find(41)];
  return (
    <section className="section" id="signatures">
      <div className="col-head">
        <Reveal><div className="kicker-row"><span className="idx">04 — Signatures</span><span className="eyebrow">What the regulars order</span></div></Reveal>
        <Reveal delay={1}>
          <h2 className="display" style={{ fontSize: "clamp(32px,5vw,76px)", maxWidth: "15ch", marginBottom: 0 }}>
            Plates worth the trip to <em>Auroville Road.</em>
          </h2>
        </Reveal>
      </div>

      <div className="sig">
        <Reveal className="sig-lead">
          <div className="sig-figure" role="button" tabIndex={0} onClick={() => onOpen(lead.id)}>
            <DishImg p={lead} opts={{ w: 1200, h: 1500, mode: "crop", q: 86 }} />
            <span className="tag">{lead.bestseller ? "House Favourite" : CC.catName(lead.category)}</span>
          </div>
        </Reveal>
        <div className="sig-leadbody">
          <Reveal delay={1}>
            <span className="eyebrow">{CC.catName(lead.category)}</span>
            <h3>{lead.name}</h3>
            <p>{lead.desc}.</p>
            <div className="sig-meta">
              <span className="price">₹{lead.price}</span>
              <span>{lead.diet}</span>
              {lead.kcal && <span>{lead.kcal} kcal</span>}
            </div>
            <button className="tlink" onClick={() => onOpen(lead.id)}>View dish <Arrow /></button>
          </Reveal>
        </div>
      </div>

      <div className="sig-grid">
        {trio.map((p, i) => (
          <Reveal className="sig-card" delay={i + 1} key={p.id}>
            <div className="sig-figure" role="button" tabIndex={0} onClick={() => onOpen(p.id)}>
              <DishImg p={p} opts={{ w: 1000, h: 1200, mode: "crop", q: 84 }} />
            </div>
            <div className="sc-body" onClick={() => onOpen(p.id)}>
              <div><h4>{p.name}</h4><span className="sc-cat">{CC.catName(p.category)}</span></div>
              <span className="sc-price">₹{p.price}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Strip() {
  const words = ["Whole foods", "Slow mornings", "Wood-fired", "Garden greens", "House ferments", "Made by hand", "Zero rush"];
  const row = [...words, ...words];
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">{row.map((w, i) => <span className="strip-item" key={i}>{w}</span>)}</div>
    </div>
  );
}

function Pillars() {
  const items = [
    { n: "Plant-forward", h: "Plates that begin with the garden", p: "Vegetables lead, proteins follow. Vegan by default, never by compromise — flavour first, always." },
    { n: "Local sourcing", h: "Grown within reach of our doors", p: "Millets, roots and greens from farms along Auroville Road. We cook the season, so the menu breathes with the year." },
    { n: "Nothing wasted", h: "A kitchen that closes its loops", p: "Peels become stock, stems become pesto, ferments carry nothing to the bin. Restraint is the recipe." },
  ];
  return (
    <section className="section forest" id="ethos">
      <div className="col-head">
        <Reveal><div className="kicker-row"><span className="idx" style={{ color: "rgba(255,255,255,.55)" }}>02 — Why we exist</span></div></Reveal>
        <Reveal delay={1}>
          <h2 className="display" style={{ fontSize: "clamp(32px,5vw,76px)", maxWidth: "16ch", marginBottom: "clamp(40px,7vh,84px)" }}>
            Conscious is not a <em>flavour.</em> It is a practice.
          </h2>
        </Reveal>
      </div>
      <div className="pillars">
        {items.map((it, i) => (
          <Reveal className="pillar" delay={i + 1} key={it.n}>
            <div className="pn">0{i + 1}</div><h4>{it.h}</h4><p>{it.p}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Gatherings({ onNav }) {
  const [intent, setIntent] = useState(null);
  const offerings = [
    { t: "Yoga Shala", d: "Daily mat practice, breath & meditation" },
    { t: "Movement & Gym", d: "Strength, mobility and conditioning classes" },
    { t: "The Temple", d: "A quiet room for stillness, sound & sit" },
    { t: "Ice Spa", d: "Cold plunge, contrast therapy & recovery" },
  ];
  return (
    <section className="section" id="gather">
      <div className="col-head">
        <Reveal><div className="kicker-row"><span className="idx">03 — Conscious Sanctuary</span><span className="eyebrow">In the making · opening 2026</span></div></Reveal>
        <Reveal delay={1}>
          <h2 className="display" style={{ fontSize: "clamp(32px,5vw,76px)", maxWidth: "18ch", marginBottom: "clamp(40px,6vh,72px)" }}>
            A shala, a temple, an ice spa — <em>taking shape</em> beside the café.
          </h2>
        </Reveal>
      </div>
      <div className="gather-grid">
        <Reveal className="sanctuary-card">
          <span className="soon-flag">Coming soon</span>
          <span className="eyebrow">A space for body & spirit</span>
          <h4>Conscious Sanctuary</h4>
          <p>Next door to the kitchen, we are building a place to move and to rest — a yoga shala, strength and movement classes, a temple to sit in, and a cold-water ice spa. Made slowly, the way everything here is.</p>
          <div style={{ marginTop: 24 }}><button className="btn on-dark" onClick={() => setIntent("waitlist")}>Join the waitlist <Arrow /></button></div>
        </Reveal>
        <div className="gather-stack">
          {offerings.map((o, i) => (
            <Reveal className="gather-mini" delay={i + 1} key={o.t}>
              <div className="gm-num">{String(i + 1).padStart(2, "0")}</div>
              <div><h5>{o.t}</h5><span className="gm-desc">{o.d}</span></div>
              <span className="soon-pill">Soon</span>
            </Reveal>
          ))}
          <Reveal delay={3}><button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setIntent("notify")}>Notify me when it opens <Arrow /></button></Reveal>
        </div>

        <Reveal className="host-banner" as="div">
          <div className="hb-copy">
            <span className="eyebrow">Private & group bookings</span>
            <h4>Planning a workshop or retreat? Host it at the Sanctuary.</h4>
          </div>
          <button className="btn" onClick={() => setIntent("host")}>Host at the Sanctuary <Arrow /></button>
        </Reveal>
      </div>

      <SanctuaryModal intent={intent} onClose={() => setIntent(null)} />
    </section>
  );
}

export default function Home() {
  const onNav = useGoNav();
  const navigate = useNavigate();
  const onOpen = (id) => navigate(`/menu/${id}`);
  return (
    <main>
      <Hero onNav={onNav} />
      <Manifesto />
      <Strip />
      <section style={{ background: "var(--paper)" }}><Signatures onOpen={onOpen} /></section>
      <Pillars />
      <Gatherings onNav={onNav} />
    </main>
  );
}
