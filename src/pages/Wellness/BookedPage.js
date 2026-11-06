import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { getStatus } from '../../services/wellnessService';
import { BOOKING_PATH, CAFE_PHONE, CAFE_PHONE_TEL, CAFE_WHATSAPP_URL, STATUS_POLL_MS } from '../../constants/wellness';
import { cleanOrderId, isBookingState, keepPolling, stateCopy, rupees, slotLine } from '../../utils/wellness';
import { googleCalendarUrl } from '../../utils/sanctuary';
import { DEFAULT_LOCATION } from '../../constants/sanctuary';
import { Arrow, Reveal, Spinner } from '../Sanctuary/parts';
import '../Sanctuary/sanctuary.css';
import './wellness.css';

/* Where PhonePe sends the guest back: /sanctuary/restore/booked?order=CSW…
   wellness-status is asked every few seconds while the payment is `pending`,
   for up to ~90 s; after that the page says so and gives the number. The
   other states are final the first time they are seen. */

const BookedPage = () => {
  const [params] = useSearchParams();
  const order = cleanOrderId(params.get('order'));
  const [view, setView] = useState(order ? 'pending' : 'missing'); // a booking state, or 'waiting' / 'missing'
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!order) return undefined;
    let on = true;
    let timer = null;
    const startedAt = Date.now();
    const ask = async () => {
      let state = 'pending';
      try {
        const res = await getStatus(order);
        if (!on) return;
        setInfo(res);
        state = isBookingState(res.state) ? res.state : 'pending';
      } catch (e) {
        if (!on) return;
        if (e && e.word === 'not_found') { setView('missing'); return; }
        // a blip — keep asking while there is time
      }
      if (keepPolling(state, startedAt)) { setView('pending'); timer = setTimeout(ask, STATUS_POLL_MS); }
      else setView(state === 'pending' ? 'waiting' : state);
    };
    ask();
    return () => { on = false; if (timer) clearTimeout(timer); };
  }, [order]);

  const copy = stateCopy(view, { name: info?.name });
  const known = info && info.slotStart && info.slotEnd;
  const showFacts = known && ['confirmed', 'pending', 'waiting', 'refund', 'cancelled'].includes(view);
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}${BOOKING_PATH}` : BOOKING_PATH;

  return (
    <main className="sn-view wl-view">
      <SEO title="Your booking | Conscious Sanctuary" description="The ice bath and Ayurvedic sauna at Conscious Sanctuary, Auroville Road." noIndex />
      <div className="wl-result">
        <div className="wl-result-inner">
          <Reveal><span className="eyebrow">Ice bath &amp; Ayurvedic sauna</span></Reveal>
          {/* a live region: the pending → confirmed change is announced */}
          <div role="status" aria-live="polite">
            <Reveal delay={1} as="h1" className="display">{copy.heading}</Reveal>
            <Reveal delay={2} as="p" className="lede">{copy.body}</Reveal>
          </div>

          {view === 'pending' && <Spinner label="Checking with PhonePe" />}

          {showFacts && (
            <Reveal delay={2}>
              <dl className="sn-facts">
                <div><dt>Session</dt><dd>{info.serviceName || info.service}</dd></div>
                <div><dt>When</dt><dd>{slotLine(info.slotStart, info.slotEnd)}</dd></div>
                <div><dt>Places</dt><dd>{info.seats} {info.seats === 1 ? 'person' : 'people'}</dd></div>
                {Number.isFinite(info.amountPaise) && (
                  <div>
                    <dt>{view === 'refund' ? 'Refund' : view === 'confirmed' ? 'Paid' : 'Amount'}</dt>
                    <dd>
                      {rupees(info.amountPaise)}
                      {Number.isFinite(info.gstPaise) && info.gstPaise > 0 ? ` (includes ${rupees(info.gstPaise)} GST)` : ''}
                    </dd>
                  </div>
                )}
                {order && <div><dt>Order</dt><dd>{order}</dd></div>}
              </dl>
            </Reveal>
          )}

          <Reveal delay={3} className="wl-result-acts">
            {view === 'confirmed' && known && (
              <a className="btn" href={googleCalendarUrl({ title: `${info.serviceName || 'Ice bath & sauna'} — Conscious Sanctuary`, starts_at: info.slotStart, ends_at: info.slotEnd, location: DEFAULT_LOCATION }, pageUrl)} target="_blank" rel="noopener noreferrer">
                Add to Google Calendar <Arrow />
              </a>
            )}
            {(view === 'failed' || view === 'refund') && <Link className="btn forest" to={BOOKING_PATH}>{view === 'failed' ? 'Try again' : 'Pick another time'} <Arrow /></Link>}
            {(view === 'waiting' || view === 'cancelled' || view === 'missing') && <a className="btn" href={CAFE_PHONE_TEL}>Call {CAFE_PHONE} <Arrow /></a>}
            {view !== 'pending' && <Link className="sn-act" to="/sanctuary">See what else is on</Link>}
          </Reveal>

          {(view === 'confirmed' || view === 'pending' || view === 'waiting') && (
            <p className="wl-cancel-line">
              Need to cancel? Call or WhatsApp <a href={CAFE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{CAFE_PHONE}</a> — we refund in full.
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default BookedPage;
