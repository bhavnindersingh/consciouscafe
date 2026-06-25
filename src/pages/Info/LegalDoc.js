import React, { useEffect, useRef, useState } from 'react';

/**
 * Editorial layout for long-form legal documents (privacy, terms).
 * A quiet header, a comfortable single reading column, and a sticky,
 * numbered table of contents that tracks the section in view.
 *
 * Props:
 *   eyebrow      — small label above the title (e.g. "Conscious Café · Legal")
 *   title        — document title
 *   updated      — human-readable "last updated" date
 *   intro        — lede paragraph(s) (JSX)
 *   disclaimer   — optional callout note (JSX)
 *   sections     — [{ id, title, body }] — body is JSX
 */
const LegalDoc = ({ eyebrow, title, updated, intro, disclaimer, sections }) => {
  const [active, setActive] = useState(sections[0]?.id);
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const jump = (e, id) => {
    e.preventDefault();
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const num = (i) => String(i + 1).padStart(2, '0');

  return (
    <main className="legal-view">
      <header className="legal-head">
        {eyebrow && <p className="eyebrow legal-eyebrow">{eyebrow}</p>}
        <h1 className="display legal-title">{title}</h1>
        {updated && <p className="legal-updated">Last updated · {updated}</p>}
        {intro && <div className="legal-lede">{intro}</div>}
        {disclaimer && <aside className="legal-note">{disclaimer}</aside>}
      </header>

      <div className="legal-body">
        <nav className="legal-toc" aria-label="On this page">
          <p className="legal-toc-label">On this page</p>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id} className={active === s.id ? 'is-active' : ''}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                  <span className="legal-toc-num">{num(i)}</span>
                  <span className="legal-toc-text">{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal-content">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              ref={(el) => (refs.current[s.id] = el)}
              className="legal-section"
            >
              <h2>
                <span className="legal-section-num" aria-hidden="true">{num(i)}</span>
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LegalDoc;
