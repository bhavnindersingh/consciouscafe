import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "../components/primitives";
import { CC } from "../data/menu";
import { useCart } from "../cart/CartContext";

export function DishCard({ p, onOpen, onAdd }) {
  return (
    <div className="dish-card" onClick={() => onOpen(p.id)}>
      <div className="dc-media">
        <img
          src={CC.img(p.src, { w: 720, h: 900, mode: "crop", q: 84 })}
          alt={p.name}
          loading="lazy"
          onError={(e) => { if (!e.target.dataset.fb) { e.target.dataset.fb = "1"; e.target.src = CC.ph(p.name); } }}
        />
        {p.bestseller && <span className="dc-bestseller">House Favourite</span>}
        <button className="dc-add" aria-label={`Add ${p.name}`} onClick={(e) => { e.stopPropagation(); onAdd(p); }}>+</button>
      </div>
      <div className="dc-head">
        <h4>{p.name}</h4>
        <span className="dc-price">₹{p.price}</span>
      </div>
      <p>{p.desc}.</p>
      <span className="dc-diet">{p.diet}</span>
    </div>
  );
}

export default function Menu() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const onOpen = (id) => navigate(`/menu/${id}`);

  const [group, setGroup] = useState(CC.GROUPS[0].id);
  const [cat, setCat] = useState(CC.byGroup(CC.GROUPS[0].id)[0].id);

  const cats = CC.byGroup(group);
  const items = CC.byCategory(cat);

  const pickGroup = (gid) => {
    if (gid === group) return;
    setGroup(gid);
    setCat(CC.byGroup(gid)[0].id);
  };

  return (
    <main className="menu-view" id="menu">
      <div className="menu-hero">
        <Reveal><span className="eyebrow">The Menu · Auroville Road</span></Reveal>
        <Reveal delay={1}><h1 className="display">A season,<br /><em>plated.</em></h1></Reveal>
        <Reveal delay={2}><p className="lede">Everything is plant-forward and made in-house. Start with what you're after — a plate, a pour, or something sweet.</p></Reveal>
      </div>

      <div className="group-switch">
        {CC.GROUPS.map((g, i) => (
          <button key={g.id} className={`group-tab ${group === g.id ? "active" : ""}`} onClick={() => pickGroup(g.id)}>
            <span className="gt-idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="gt-name">{g.name}</span>
            <span className="gt-note">{g.note}</span>
            <span className="gt-count">{CC.groupCount(g.id)} items</span>
          </button>
        ))}
      </div>

      <div className="menu-shell">
        <div className="menu-cats" key={group}>
          {cats.map((c) => (
            <button key={c.id} className={`menu-cat ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>
              <span>
                <span className="mc-name">{c.name}</span>
                <span className="mc-note">{c.note}</span>
              </span>
              <span className="mc-count">{CC.byCategory(c.id).length}</span>
            </button>
          ))}
        </div>
        <div className="menu-items" key={cat}>
          {items.map((p) => <DishCard key={p.id} p={p} onOpen={onOpen} onAdd={addToCart} />)}
        </div>
      </div>
    </main>
  );
}
