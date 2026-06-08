import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BagIcon } from "./primitives";
import { useGoNav } from "../nav";
import { useCart } from "../cart/CartContext";

/* Maps a pathname to the prototype's "view" id, for active-link styling. */
function viewFromPath(pathname) {
  if (pathname.startsWith("/menu")) return "menu";
  if (pathname.startsWith("/story") || pathname.startsWith("/about")) return "story";
  if (pathname.startsWith("/visit")) return "visit";
  return "home";
}

export function Nav({ onBurger, mobileOpen }) {
  const goNav = useGoNav();
  const { count, setBagOpen } = useCart();
  const location = useLocation();
  const view = viewFromPath(location.pathname);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isSolid = scrolled || view !== "home";

  return (
    <nav className={`nav ${isSolid ? "solid" : ""}`}>
      <div className="nav-links">
        <button className={`nav-link ${view === "home" ? "active" : ""}`} onClick={() => goNav("home")}>home</button>
        <button className={`nav-link ${view === "menu" ? "active" : ""}`} onClick={() => goNav("menu")}>menu</button>
        <button className={`nav-link ${view === "story" ? "active" : ""}`} onClick={() => goNav("story")}>story</button>
      </div>

      <button className="brand" onClick={() => goNav("home")}>
        <span className="b1">Conscious Café</span>
      </button>

      <div className="nav-right">
        <button className="nav-link" onClick={() => goNav("gather")}>sanctuary</button>
        <button className={`nav-link ${view === "visit" ? "active" : ""}`} onClick={() => goNav("visit")}>visit</button>
        <button className="bag" onClick={() => setBagOpen(true)}>
          <BagIcon /> <span className="bag-label">bag</span> {count > 0 && <span className="count">{count}</span>}
        </button>
        <button className={`nav-burger ${mobileOpen ? "is-open" : ""}`} onClick={onBurger} aria-label="Menu" aria-expanded={mobileOpen}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
