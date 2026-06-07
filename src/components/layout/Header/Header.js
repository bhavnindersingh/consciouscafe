import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Arrow = ({ s = 16 }) => (
  <svg className="arr" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'home', label: 'home', path: '/' },
  { id: 'menu', label: 'menu', path: '/menu' },
  { id: 'story', label: 'story', anchor: true },
  { id: 'gather', label: 'sanctuary', anchor: true },
  { id: 'visit', label: 'visit', anchor: true },
];

const Header = ({ cartItems = [], onCartToggle }) => {
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cartItems.reduce((t, i) => t + (i.quantity || 1), 0);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (item) => {
    setMobileOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.anchor) {
      if (!isHome) {
        navigate('/');
        setTimeout(() => scrollToAnchor(item.id), 80);
      } else {
        scrollToAnchor(item.id);
      }
    }
  };

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
  };

  const forceSolid = location.pathname !== '/';
  const isSolid = solid || forceSolid;

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav className={`nav ${isSolid ? 'solid' : ''}`} role="banner">
        <div className="nav-links">
          <button className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => handleNav(NAV_ITEMS[0])}>home</button>
          <button className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`} onClick={() => handleNav(NAV_ITEMS[1])}>menu</button>
          <button className="nav-link" onClick={() => handleNav(NAV_ITEMS[2])}>story</button>
        </div>

        <button className="brand" onClick={() => navigate('/')}>
          <span className="b1">Conscious Café</span>
          <span className="b2">Auroville Road · est. 2016</span>
        </button>

        <div className="nav-right">
          <button className="nav-link" onClick={() => handleNav(NAV_ITEMS[3])}>sanctuary</button>
          <button className="nav-link" onClick={() => handleNav(NAV_ITEMS[4])}>visit</button>
          <button className="bag" onClick={onCartToggle} aria-label={`Shopping bag, ${cartCount} items`}>
            bag {cartCount > 0 && <span className="count">{cartCount}</span>}
          </button>
          <button className="nav-burger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => handleNav(n)}>{n.label}</button>
        ))}
      </div>
    </>
  );
};

export default Header;
