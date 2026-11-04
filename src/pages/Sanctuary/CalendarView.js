import React, { useEffect, useMemo, useState } from 'react';
import {
  byDay, monthGrid, monthOf, monthTitle, shiftMonth, istToday, formatClock, formatDay, istToIso,
} from '../../utils/sanctuary';
import { WEEKDAYS } from '../../constants/sanctuary';
import { GatheringRow } from './parts';

const MAX_IN_CELL = 2;

/** A month of gatherings. Pick a day to see its list below the grid. */
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
  const [picked, setPicked] = useState(null);

  // Each month opens on its first day with something on.
  useEffect(() => {
    const first = Object.keys(days).sort().find((k) => monthOf(k) === month && k >= today);
    setPicked(first || null);
  }, [month, days, today]);

  const weeks = monthGrid(month);
  const list = picked ? days[picked] || [] : [];

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

      <div className="sn-cal-grid" role="grid" aria-label={monthTitle(month)}>
        <div className="sn-cal-row sn-cal-dow" role="row">
          {WEEKDAYS.map((w) => <span key={w.value} role="columnheader" aria-label={w.name}>{w.short}</span>)}
        </div>
        {weeks.map((week) => (
          <div className="sn-cal-row" role="row" key={week[0].date}>
            {week.map((c) => {
              const on = c.inMonth ? days[c.date] || [] : [];
              const cls = [
                'sn-cal-day',
                c.inMonth ? '' : 'out',
                c.date < today ? 'past' : '',
                c.date === today ? 'today' : '',
                on.length ? 'has' : '',
                picked === c.date ? 'picked' : '',
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
                  aria-pressed={picked === c.date}
                  aria-label={`${formatDay(istToIso(c.date, '12:00'))}: ${on.length} ${on.length === 1 ? 'gathering' : 'gatherings'}`}
                  onClick={() => setPicked(c.date)}
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

      <div className="sn-cal-list" aria-live="polite">
        {picked ? (
          <>
            <h4 className="sn-cal-list-h">{formatDay(istToIso(picked, '12:00'))}</h4>
            <ul className="sn-list">
              {list.map((o) => <li key={o.id}><GatheringRow o={o} /></li>)}
            </ul>
          </>
        ) : (
          <p className="sn-cal-hint">Nothing more on in {monthTitle(month).split(' ')[0]}. Try the next month.</p>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
