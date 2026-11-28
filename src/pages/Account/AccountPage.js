import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getMyAccount } from '../../services/accountService';
import { formatWhen, formatDay, formatClock, elsewhere } from '../../utils/sanctuary';
import {
  firstName, timeline, eventState, sessionState, placesLabel, itemsSummary, reorderPlan, rupees, listAnd, organiserLabel,
} from '../../utils/account';
import SignInCard from '../Sanctuary/SignInCard';
import { DateTile, KindTag, PageSkeleton } from '../Sanctuary/parts';
import '../Sanctuary/sanctuary.css';
import './account.css';

/*
 * /account — Your account. Anyone who reserved a place at a Sanctuary event,
 * booked an ice bath or sauna session, or sent a food order signs in (Google,
 * or an emailed code) and sees them here: everything made while signed in, or
 * with the email they sign in with — from before they had an account, too.
 * One read: my_account() (POS migration 20261129000000). Rows are the
 * Sanctuary's (sanctuary.css .sn-row); account.css adds the rest.
 */

const WHATSAPP_URL = 'https://wa.me/918754561269';

function EventRow({ e }) {
  const state = eventState(e);
  const place = elsewhere(e.location);
  return (
    <Link className="sn-row ac-row" to={`/sanctuary/${e.offering_id}`}>
      <DateTile iso={e.starts_at} />
      <div className="sn-row-main">
        <span className="sn-row-tags">
          <KindTag kind={e.kind} />
          {state ? <span className="ac-state">{state}</span> : null}
        </span>
        <span className="sn-row-title">{e.title}</span>
        <span className="sn-row-meta">{formatWhen(e.starts_at, e.ends_at)}{place ? <> · {place}</> : null}</span>
      </div>
      <div className="sn-row-side">
        <span className="ac-qty">{placesLabel(e.seats)}</span>
        <span className="sn-row-go">See the event</span>
      </div>
    </Link>
  );
}

function SessionRow({ s }) {
  const state = sessionState(s);
  return (
    <div className="sn-row ac-row">
      <DateTile iso={s.slot_start} />
      <div className="sn-row-main">
        <span className="sn-row-tags">
          <span className="ac-tag">Ice bath &amp; sauna</span>
          {state ? <span className="ac-state">{state}</span> : null}
        </span>
        <span className="sn-row-title">{s.service_name}</span>
        <span className="sn-row-meta">{formatWhen(s.slot_start, s.slot_end)}</span>
      </div>
      <div className="sn-row-side">
        <span className="ac-qty">{placesLabel(s.seats)}</span>
        <span className="sn-price">{rupees((s.amount_paise || 0) / 100)}</span>
      </div>
    </div>
  );
}

const TimelineRow = ({ x }) => (x.type === 'event' ? <EventRow e={x.item} /> : <SessionRow s={x.item} />);

function OrderRow({ o, canReorder, onReorder, note }) {
  return (
    <li>
      <div className="sn-row ac-row">
        <DateTile iso={o.created_at} />
        <div className="sn-row-main">
          <span className="sn-row-tags">
            <span className="ac-tag">Sent by WhatsApp</span>
            <span className="ac-ref">{o.ref}</span>
          </span>
          <span className="sn-row-title ac-items">{itemsSummary(o.items)}</span>
          <span className="sn-row-meta">
            {formatDay(o.created_at)}, {formatClock(o.created_at)}
            {o.packaging_known ? null : <> · packaging added when we confirmed</>}
          </span>
        </div>
        <div className="sn-row-side">
          <span className="sn-price">{rupees(o.total)}</span>
          <button type="button" className="sn-act strong" onClick={() => onReorder(o)} disabled={!canReorder}>Order again</button>
        </div>
      </div>
      {note ? <p className="ac-note" role="status">{note}</p> : null}
    </li>
  );
}

function SignedOut() {
  return (
    <div className="sn-signin">
      <div className="sn-signin-head">
        <h1 className="display">Your bookings and orders</h1>
        <p className="lede">
          Sign in with the email you booked or ordered with — everything made with it shows up here,
          including what you booked before you had an account.
        </p>
      </div>
      <ul className="ac-what" aria-label="What you’ll find">
        <li><strong>Places you’ve reserved</strong> at the Sanctuary’s classes, workshops and evenings.</li>
        <li><strong>Ice bath &amp; sauna sessions</strong> you’ve booked online.</li>
        <li><strong>Food orders</strong> you’ve sent us from the menu, with a quick way to order again.</li>
      </ul>
      <SignInCard
        sub="New here or back again — it’s the same way in."
        returnPath="/account"
        fine="We use your email only to find your bookings and orders. You never need an account to book or order."
      />
    </div>
  );
}

// where they stand with us, said the way the header's menu says it (organiserLabel)
const ORG_LINE = {
  requested: 'Your introduction is with our team.',
  paused: 'Your organising is paused for now.',
  declined: 'We couldn’t take your request on this time.',
};

function Organiser({ isHost }) {
  const { hostRow } = useAuth();
  return isHost ? (
    <section className="ac-org" aria-label="Organising">
      <p>{ORG_LINE[hostRow?.status] || 'You organise with us.'}</p>
      <Link className="btn" to="/sanctuary/host">{organiserLabel(hostRow) || 'Your events'}</Link>
    </section>
  ) : (
    <p className="ac-org-quiet">Teach a class or run a workshop? <Link className="tlink" to="/sanctuary/host">Organise with us</Link></p>
  );
}

export default function AccountPage({ products = [] }) {
  const { user, loading, signOut } = useAuth();
  const { addToCart, setBagOpen } = useCart();
  const [account, setAccount] = useState(null);
  const [failure, setFailure] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [notes, setNotes] = useState({}); // ref → what "Order again" did
  const uid = user?.id;

  useEffect(() => {
    // a different person (or nobody): never show the last one's page meanwhile
    setAccount(null);
    setNotes({});
    if (!uid) return undefined;
    let alive = true;
    setFailure(null);
    getMyAccount()
      .then((a) => alive && setAccount(a))
      .catch((e) => alive && setFailure(e));
    return () => { alive = false; };
  }, [uid, attempt]);

  const { upcoming, past } = useMemo(() => timeline(account), [account]);

  const reorder = (o) => {
    const { add, gone } = reorderPlan(o.items, products);
    add.forEach((p) => addToCart(p));
    const goneLine = gone.length ? `${listAnd(gone)} ${gone.length === 1 ? 'isn’t' : 'aren’t'} on today’s menu.` : '';
    setNotes((n) => ({
      ...n,
      [o.ref]: add.length ? `Added to your bag at today’s prices.${goneLine ? ` ${goneLine}` : ''}` : `None of these dishes are on today’s menu.`,
    }));
    if (add.length) setBagOpen(true);
  };

  let body;
  if (loading) body = <PageSkeleton kind="list" label="Loading your account" />;
  else if (!user) body = <SignedOut />;
  else {
    const name = firstName(user);
    const head = (
      <header className="ac-head">
        <h1 className="display">{name ? `Hello, ${name}` : 'Your account'}</h1>
        <p className="ac-who">
          Signed in as <strong>{user.email}</strong>
          <button type="button" className="sn-act" onClick={() => signOut()}>Sign out</button>
        </p>
      </header>
    );
    let content;
    if (failure && /not_signed_in/.test(failure.message || '')) {
      // a session the database doesn't take as a customer's (a staff login)
      content = (
        <div className="sn-empty">
          <p className="sn-empty-h">This sign-in can’t show bookings.</p>
          <p>Sign out, then sign in with the email you booked or ordered with.</p>
          <button className="btn" onClick={() => signOut()}>Sign out</button>
        </div>
      );
    } else if (failure) {
      content = (
        <div className="sn-empty">
          <p className="sn-empty-h">We couldn’t load your bookings.</p>
          <p>Check your connection and try again.</p>
          <button className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </div>
      );
    } else if (!account) {
      content = <PageSkeleton kind="list" label="Loading your bookings and orders" />;
    } else {
      const nothing = !account.events.length && !account.sessions.length && !account.orders.length;
      const iceNote = !account.sessions.length
        ? <p className="ac-aside">Ice bath &amp; sauna sessions appear here once online booking opens — for now they’re booked on WhatsApp.</p>
        : null;
      content = nothing ? (
        <div className="sn-empty ac-empty">
          <p className="sn-empty-h">Nothing here yet.</p>
          <p>
            Bookings and orders made with <strong>{account.email || user.email}</strong> appear here — including
            ones from before you signed in.
          </p>
          <div className="ac-acts">
            <Link className="btn" to="/sanctuary">See what’s on</Link>
            <Link className="tlink" to="/menu">See the menu</Link>
          </div>
          {iceNote}
        </div>
      ) : (
        <>
          <section className="ac-sec" aria-labelledby="ac-up-h">
            <h2 id="ac-up-h" className="ac-h">Coming up</h2>
            {upcoming.length ? (
              <>
                <ul className="sn-list">{upcoming.map((x) => <li key={x.key}><TimelineRow x={x} /></li>)}</ul>
                <p className="ac-aside">
                  Can’t make it? <a className="tlink" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
                </p>
              </>
            ) : (
              <p className="ac-quiet">Nothing booked just now. <Link className="tlink" to="/sanctuary">See what’s on</Link></p>
            )}
            {iceNote}
          </section>

          <section className="ac-sec" aria-labelledby="ac-orders-h">
            <h2 id="ac-orders-h" className="ac-h">Food orders</h2>
            {account.orders.length ? (
              <>
                <p className="ac-sub">What you’ve sent us from the menu. We confirm each one in the WhatsApp chat.</p>
                <ul className="sn-list">
                  {account.orders.map((o) => (
                    <OrderRow key={o.ref} o={o} canReorder={products.length > 0} onReorder={reorder} note={notes[o.ref]} />
                  ))}
                </ul>
              </>
            ) : (
              <p className="ac-quiet">No orders yet. <Link className="tlink" to="/menu">See the menu</Link></p>
            )}
          </section>

          {past.length ? (
            <section className="ac-sec" aria-labelledby="ac-past-h">
              <h2 id="ac-past-h" className="ac-h">Past</h2>
              <ul className="sn-list">{past.map((x) => <li key={x.key}><TimelineRow x={x} /></li>)}</ul>
            </section>
          ) : null}
        </>
      );
    }
    body = (
      <div className="ac-page">
        {head}
        {content}
        {account ? <Organiser isHost={!!account.is_host} /> : null}
      </div>
    );
  }

  return (
    <main className="sn-view sn-host-view ac-view">
      <SEO title="Your account | Conscious Café" url="/account" noIndex />
      {body}
    </main>
  );
}
