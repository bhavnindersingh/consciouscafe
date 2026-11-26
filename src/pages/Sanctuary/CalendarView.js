import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  byDay, monthGrid, monthOf, monthTitle, shiftMonth, istToday, formatClock, formatDay, formatLongDay, istToIso,
} from '../../utils/sanctuary';
import { WEEKDAYS } from '../../constants/sanctuary';
import { GatheringRow, useFocusTrap } from './parts';

const MAX_IN_CELL = 2;
const POP_W = 420; // the pop-up beside a day, when the grid has the room
const GAP = 8;
const SHEET = '(max-width: 600px)'; // a phone: the pop-up is a sheet from the bottom (sanctuary.css)

/**
 * Where the pop-up sits, in px inside the grid (both rects from
 * getBoundingClientRect): right of its day when there's room, else left of it,
 * else over it — never past the grid's edge. A day in the lower half opens
 * upward (`y` is then the distance from the grid's bottom).
 */
export function popPlacement(grid, cell, width = POP_W) {
  const w = Math.min(width, grid.width);
  const x = cell.left - grid.left;
  let left;
  if (x + cell.width + GAP + w <= grid.width) left = x + cell.width + GAP;
  else if (x - GAP - w >= 0) left = x - GAP - w;
  else left = Math.max(0, Math.min(x, grid.width - w));
  const up = cell.top - grid.top + cell.height / 2 > grid.height / 2;
  return { left, width: w, up, y: up ? grid.bottom - cell.bottom : cell.top - grid.top };
}

const placeOf = (stage, cell) => popPlacement(stage.getBoundingClientRect(), cell.getBoundingClientRect());

/**
 * One day's gatherings: beside the day, or a sheet on a phone. ×, Escape or a
 * tap outside closes it, and focus goes back to the day.
 */
function DayPop({ date, list, place, back, onClose }) {
  const box = useRef(null);
  const closeBtn = useRef(null);
  useFocusTrap(box, onClose, closeBtn, back);
  useEffect(() => {
    const sheet = window.matchMedia?.(SHEET)?.matches;
    if (!sheet) box.current?.scrollIntoView?.({ block: 'nearest' });
    // Outside it and its day: close. The scrim closes on click instead, so the
    // tap doesn't land on whatever is under it.
    const down = (e) => {
      if (box.current?.contains(e.target) || back.current?.contains(e.target) || e.target.closest?.('.sn-pop-scrim')) return;
      onClose();
    };
    document.addEventListener('pointerdown', down);
    const before = document.body.style.overflow;
    if (sheet) document.body.style.overflow = 'hidden'; // the page stays put under the sheet
    return () => {
      document.removeEventListener('pointerdown', down);
      if (sheet) document.body.style.overflow = before;
    };
  }, [onClose, back]);

  const style = { '--pop-x': `${place.left}px`, '--pop-y': `${place.y}px`, '--pop-w': `${place.width}px` };
  return (
    <>
      <div className="sn-pop-scrim" onClick={onClose} aria-hidden="true" />
      <div className={`sn-pop${place.up ? ' up' : ''}`} role="dialog" aria-modal="true" aria-labelledby="sn-pop-h" ref={box} style={style}>
        <div className="sn-pop-head">
          <h4 id="sn-pop-h" className="sn-pop-h">{formatLongDay(istToIso(date, '12:00'))}</h4>
          <button type="button" className="sn-pop-close" ref={closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <ul className="sn-list sn-pop-list">
          {list.map((o) => <li key={o.id}><GatheringRow o={o} timeOnly /></li>)}
        </ul>
      </div>
    </>
  );
}

/** A month of gatherings. Pick a day and its gatherings open in a pop-up. */
const CalendarView = ({ items }) => {
  const today = istToday();
  const days = useMemo(() => byDay(items), [items]);
  const firstMonth = monthOf(today);
  const lastMonth = useMemo(() => {
    const keys = Object.keys(days).sort();
    return keys.length ? monthOf(keys[keys.length - 1]) : firstMonth;
  }, [days, firstMonth]);

  // Open on this month, or on the first month with anything on.
  const [month, setMonth] = useState(() => {
    const keys = Object.keys(days).sort();
    return keys.length && !keys.some((k) => monthOf(k) === firstMonth) ? monthOf(keys[0]) : firstMonth;
  });

  // The open day: { date, place }. Only a click opens it — never the page itself.
  const [open, setOpen] = useState(null);
  const stage = useRef(null);
  const back = useRef(null); // the open day's button: focus goes back to it
  const close = useCallback(() => setOpen(null), []);
  const pick = (date, el) => {
    if (open?.date === date) { setOpen(null); return; }
    back.current = el;
    setOpen({ date, place: placeOf(stage.current, el) });
  };

  useEffect(() => { setOpen(null); }, [month, items]);

  const isOpen = Boolean(open);
  useEffect(() => {
    if (!isOpen) return undefined;
    const move = () => setOpen((o) => (o && back.current && stage.current ? { ...o, place: placeOf(stage.current, back.current) } : o));
    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [isOpen]);

  const weeks = monthGrid(month);
  const ahead = Object.keys(days).some((k) => monthOf(k) === month && k >= today);
  const monthName = monthTitle(month).split(' ')[0];

  return (
    <div className="sn-cal">
      <div className="sn-cal-head">
        <h3 className="sn-cal-title">{monthTitle(month)}</h3>
        <div className="sn-cal-nav">
          <button type="button" className="sn-cal-step" onClick={() => setMonth((m) => shiftMonth(m, -1))}
            disabled={month <= firstMonth} aria-label="Previous month">‹</button>
          <button type="button" className="sn-cal-step" onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={month >= lastMonth} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="sn-cal-stage" ref={stage}>
        <div className="sn-cal-grid" role="grid" aria-label={monthTitle(month)}>
          <div className="sn-cal-row sn-cal-dow" role="row">
            {WEEKDAYS.map((w) => <span key={w.value} role="columnheader" aria-label={w.name}>{w.short}</span>)}
          </div>
          {weeks.map((week) => (
            <div className="sn-cal-row" role="row" key={week[0].date}>
              {week.map((c) => {
                const on = c.inMonth ? days[c.date] || [] : [];
                const here = open?.date === c.date;
                const cls = [
                  'sn-cal-day',
                  c.inMonth ? '' : 'out',
                  c.date < today ? 'past' : '',
                  c.date === today ? 'today' : '',
                  on.length ? 'has' : '',
                  here ? 'picked' : '',
                ].filter(Boolean).join(' ');
                if (!on.length) {
                  return <div key={c.date} role="gridcell" className={cls}><span className="sn-cal-num">{c.inMonth ? c.day : ''}</span></div>;
                }
                return (
                  <button
                    key={c.date}
                    type="button"
                    role="gridcell"
                    className={cls}
                    aria-haspopup="dialog"
                    aria-expanded={here}
                    aria-label={`${formatDay(istToIso(c.date, '12:00'))}: ${on.length} ${on.length === 1 ? 'event' : 'events'}`}
                    onClick={(e) => pick(c.date, e.currentTarget)}
                  >
                    <span className="sn-cal-num">{c.day}</span>
                    <span className="sn-cal-items">
                      {on.slice(0, MAX_IN_CELL).map((o) => (
                        <span key={o.id} className={`sn-cal-item k-${o.kind}`}>
                          <span className="sn-cal-time">{formatClock(o.starts_at)}</span> {o.title}
                        </span>
                      ))}
                      {on.length > MAX_IN_CELL && <span className="sn-cal-more">+{on.length - MAX_IN_CELL} more</span>}
                    </span>
                    <span className="sn-cal-dots" aria-hidden="true">
                      {on.slice(0, 3).map((o) => <span key={o.id} className={`k-${o.kind}`} />)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {open && (
          <DayPop key={open.date} date={open.date} list={days[open.date] || []} place={open.place} back={back} onClose={close} />
        )}
      </div>

      <p className="sn-cal-hint">
        {ahead
          ? 'Pick a day to see what’s on and reserve a place.'
          : `Nothing more on in ${monthName}. ${month < lastMonth ? 'Try the next month.' : 'New events appear here as organisers add them.'}`}
      </p>
    </div>
  );
};

export default CalendarView;
