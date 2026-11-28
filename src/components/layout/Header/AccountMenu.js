import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { imageUrl } from '../../../services/sanctuaryService';
import { accountMenu } from '../../../utils/account';

// drawn to sit beside the bag (same box, same stroke)
const PersonIcon = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" strokeLinecap="round" />
  </svg>
);

const MENU_ID = 'nav-menu-list';

/**
 * The header's way into your account, after the bag. Signed out it's a person
 * icon that goes to /account to sign in. Signed in it becomes you — your
 * initial in a ring (an organiser's own photo, once they have one) — and opens
 * a menu: who you're signed in as, your bookings and orders, an organiser's
 * events and profile, and Sign out. The WAI-ARIA menu-button pattern: focus
 * goes to the first item, ↑/↓/Home/End move, Escape closes back to the icon,
 * Tab or a tap elsewhere closes it, and it closes on any page change.
 *
 * `onSignedOut(message)`: the header shows how signing out went.
 */
export default function AccountMenu({ active = false, onSignedOut }) {
  const { user, loading, hostRow, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const button = useRef(null);
  const list = useRef(null);

  const signedIn = !loading && !!user;
  const me = signedIn ? accountMenu(user, hostRow) : null;
  const photo = signedIn ? imageUrl(hostRow?.avatar_path) : null;

  useEffect(() => { setOpen(false); }, [pathname, signedIn]);

  // opened: focus the first item; a tap anywhere else closes it
  useEffect(() => {
    if (!open) return undefined;
    list.current?.querySelector('[role="menuitem"]')?.focus();
    const away = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const onMenuKey = (e) => {
    const all = [...(list.current?.querySelectorAll('[role="menuitem"]') || [])];
    const i = all.indexOf(document.activeElement);
    const go = (n) => { e.preventDefault(); all[(n + all.length) % all.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(all.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); button.current?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  const onButtonKey = (e) => {
    if (signedIn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); setOpen(true); }
  };

  const out = async () => {
    setOpen(false);
    button.current?.focus();
    const { error } = (await signOut()) || {};
    onSignedOut?.(error ? 'We couldn’t sign you out — check your connection and try again.' : 'You’re signed out.');
  };

  const label = signedIn ? 'Your account' : 'Sign in';
  return (
    <div className="nav-acct-wrap" ref={wrap}>
      <button
        ref={button}
        type="button"
        className={`nav-acct${active ? ' active' : ''}${signedIn ? ' is-in' : ''}${open ? ' open' : ''}`}
        onClick={() => (signedIn ? setOpen((o) => !o) : navigate('/account'))}
        onKeyDown={onButtonKey}
        aria-label={label}
        title={signedIn ? `Signed in as ${me.email}` : label}
        {...(signedIn ? { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': MENU_ID } : {})}
      >
        {signedIn ? (
          <span className="nav-acct-me" aria-hidden="true">
            {photo ? <img src={photo} alt="" /> : me.initial}
          </span>
        ) : <PersonIcon />}
      </button>

      {open && me && (
        <div className="nav-menu" onKeyDown={onMenuKey}>
          <p className="nav-menu-who">
            {me.name ? <span className="nav-menu-name">{me.name}</span> : <span className="nav-menu-as">Signed in as</span>}
            <span className="nav-menu-email">{me.email}</span>
          </p>
          <ul className="nav-menu-list" id={MENU_ID} role="menu" aria-label="Your account" ref={list}>
            {me.items.map((it) => (
              <li role="none" key={it.to}>
                <Link role="menuitem" className="nav-menu-item" to={it.to} onClick={() => setOpen(false)}>{it.label}</Link>
              </li>
            ))}
            <li role="separator" className="nav-menu-sep" />
            <li role="none">
              <button role="menuitem" type="button" className="nav-menu-item nav-menu-out" onClick={out}>Sign out</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
