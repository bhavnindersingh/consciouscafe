import React, { useEffect, useState } from 'react';
import { getCalendar } from '../../services/wellnessService';
import { calendarDays, calendarWeeks, dayTile } from '../../utils/wellness';
import { formatClock, formatDay, formatLongDay, istToday } from '../../utils/sanctuary';

/* The week's session times, from wellness_calendar(): every time in the
   opening hours, open / full / unavailable — drawn even while online booking
   is off, when every time is unavailable. Days run across on a wide screen
   (a column a day) and down on a phone (a row a day, its times wrapping).
   While booking is on, an open time is a button that picks its day in the
   booking steps above (`onPick`); otherwise nothing here is a control.
   If the function can't be read the section isn't drawn — the page's
   WhatsApp and booking paths don't depend on it. */

const iso = (date) => `${date}T06:30:00Z`; // noon IST: no edge rolls the day over

const STATE_WORD = { open: 'open', full: 'full', unavailable: 'unavailable' };

function Slot({ s, date, onPick }) {
  const time = formatClock(s.start);
  const word = s.past ? 'past' : STATE_WORD[s.state];
  if (onPick && s.state === 'open' && !s.past) {
    return (
      <button type="button" className="wl-cal-slot is-open" onClick={() => onPick(date)}
        aria-label={`Book ${formatLongDay(iso(date))}, ${time}`}>
        {time}
      </button>
    );
  }
  return (
    <span className={`wl-cal-slot is-${s.past ? 'past' : s.state}`}>
      {time}<span className="sr-only">, {word}</span>
      {s.state === 'full' && !s.past && <span className="wl-cal-full" aria-hidden="true">Full</span>}
    </span>
  );
}

export default function SlotCalendar({ bookAheadDays, open = false, slotMinutes, onPick }) {
  const weeks = calendarWeeks(bookAheadDays ?? 14, istToday());
  const [week, setWeek] = useState(0);
  const [cache, setCache] = useState({}); // { weekStart: rows[] | null (not deployed) | Error }
  const { start, days: span } = weeks[Math.min(week, weeks.length - 1)];
  const got = cache[start];

  useEffect(() => {
    if (!start || cache[start] !== undefined) return undefined;
    let on = true;
    getCalendar(start, span)
      .then((rows) => on && setCache((c) => ({ ...c, [start]: rows })))
      .catch((e) => on && setCache((c) => ({ ...c, [start]: e instanceof Error ? e : new Error('failed') })));
    return () => { on = false; };
  }, [start, span, cache]);

  // Not deployed, or unreadable on the first week: no calendar at all.
  if (!start || got === null || (week === 0 && got instanceof Error)) return null;

  const days = Array.isArray(got) ? calendarDays(got, start, span) : [];
  const anyOpen = days.some((d) => d.slots.some((s) => s.state === 'open' && !s.past));
  const last = days.length ? days[days.length - 1].date : start;
  const length = slotMinutes === 60 ? 'an hour' : slotMinutes ? `${slotMinutes} minutes` : null;

  return (
    <section className="section tight wl-more wl-cal" aria-labelledby="wl-cal-h">
      <div className="wl-cal-head">
        <h2 className="wl-sec-h" id="wl-cal-h">Session times</h2>
        {weeks.length > 1 && (
          <div className="wl-cal-nav">
            <button type="button" className="wl-cal-step" onClick={() => setWeek((w) => w - 1)} disabled={week === 0} aria-label="Earlier week">‹</button>
            <span className="wl-cal-range" aria-live="polite">{formatDay(iso(start))} – {formatDay(iso(last))}</span>
            <button type="button" className="wl-cal-step" onClick={() => setWeek((w) => w + 1)} disabled={week >= weeks.length - 1} aria-label="Later week">›</button>
          </div>
        )}
      </div>
      <p className="wl-step-hint">
        {open
          ? `Pick an open time to book it${length ? `; each session is ${length}` : ''}.`
          : 'Online booking isn’t open yet, so every time shows as unavailable. Message us on WhatsApp to ask for one.'}
      </p>

      {got === undefined ? (
        <p className="wl-step-hint" role="status">Finding times…</p>
      ) : got instanceof Error ? (
        <p className="wl-step-hint" role="status">We couldn’t load these times. <button type="button" className="sn-act strong" onClick={() => setCache((c) => { const n = { ...c }; delete n[start]; return n; })}>Try again</button></p>
      ) : (
        <>
          <ol className="wl-cal-days">
            {days.map((d) => {
              const t = dayTile(d.date);
              return (
                <li className="wl-cal-day" key={d.date}>
                  <h3 className="wl-cal-dayh" aria-label={formatLongDay(iso(d.date))}>
                    <span className="wl-cal-dow">{t.weekday}</span> <span className="wl-cal-date">{t.day} {t.month}</span>
                  </h3>
                  {d.slots.length === 0 ? <p className="wl-cal-shut">Closed</p> : (
                    <ul className="wl-cal-times">
                      {d.slots.map((s) => <li key={s.start}><Slot s={s} date={d.date} onPick={open ? onPick : undefined} /></li>)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
          {open && (
            <p className="wl-cal-key" aria-hidden="true">
              <span className="wl-cal-slot is-open">Open</span>
              <span className="wl-cal-slot is-full">Full</span>
              <span className="wl-cal-slot is-unavailable">Unavailable</span>
            </p>
          )}
          {open && !anyOpen && <p className="wl-step-hint">Nothing open this week — try the next one.</p>}
        </>
      )}
    </section>
  );
}
