import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Reveal } from "../components/primitives";
import { DishCard } from "./Menu";
import { CC } from "../data/menu";
import { useCart } from "../cart/CartContext";

export default function Dish() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const p = CC.find(Number(id));
  const [qty, setQty] = useState(1);

  useEffect(() => { window.scrollTo(0, 0); setQty(1); }, [id]);
  if (!p) return null;

  const onBack = () => navigate("/menu");
  const onOpen = (pid) => navigate(`/menu/${pid}`);
  const related = CC.byCategory(p.category).filter((x) => x.id !== p.id).slice(0, 3);

  const nutri = [];
  if (p.kcal) nutri.push({ v: p.kcal, l: "kcal" });
  nutri.push({ v: (p.diet || "").split(" ")[0], l: "diet" });
  nutri.push({ v: CC.catName(p.category), l: "course" });

  return (
    <main className="dish-view-wrap" id="menu">
      <div className="dish-view">
        <div className="dish-img">
          <button className="back" onClick={onBack}><span style={{ fontSize: 14 }}>←</span> Back to menu</button>
          <img
            src={CC.img(p.src, { w: 1300, h: 1500, mode: "crop", q: 90 })}
            alt={p.name}
            onError={(e) => { if (!e.target.dataset.fb) { e.target.dataset.fb = "1"; e.target.src = CC.ph(p.name); } }}
          />
        </div>
        <div className="dish-detail">
          <Reveal>
            <span className="eyebrow">{CC.catName(p.category)}{p.bestseller ? " · House Favourite" : ""}</span>
            <h1>{p.name}</h1>
            <p className="d-desc">{p.desc}.</p>
            <div className="d-price">₹{p.price.toLocaleString("en-IN")}</div>
            <div className="d-nutri">
              {nutri.map((n, i) => (
                <div className="n" key={i}><span className="nv" style={{ textTransform: "capitalize" }}>{n.v}</span><span className="nl">{n.l}</span></div>
              ))}
            </div>
            <div className="d-actions">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="qv">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <button className="btn forest" onClick={() => addToCart(p, qty)}>Add to Bag · ₹{(p.price * qty).toLocaleString("en-IN")}</button>
            </div>
          </Reveal>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section paper2">
          <Reveal><div className="kicker-row"><span className="idx">More from</span><span className="eyebrow">{CC.catName(p.category)}</span></div></Reveal>
          <div className="menu-items" style={{ padding: 0, gridTemplateColumns: "repeat(3,1fr)" }}>
            {related.map((r) => <DishCard key={r.id} p={r} onOpen={onOpen} onAdd={addToCart} />)}
          </div>
        </section>
      )}
    </main>
  );
}
