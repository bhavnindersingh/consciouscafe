import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/seo/SEO/SEO';
import { breadcrumb } from '../../utils/seoData';
import { getHost, listHostGatherings } from '../../services/sanctuaryService';
import { isUuid, collapseSeries } from '../../utils/sanctuary';
import { Arrow, Reveal, Spinner, GatheringRow } from './parts';
import './sanctuary.css';

/** /sanctuary/hosts/:hostId — an approved host's public page. */
const HostProfilePage = () => {
  const { hostId } = useParams();
  const [host, setHost] = useState(undefined); // undefined = loading, null = not found
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setHost(undefined); setError(null);
    if (!isUuid(hostId)) { setHost(null); return undefined; }
    Promise.all([getHost(hostId), listHostGatherings(hostId)])
      .then(([h, rows]) => { if (alive) { setHost(h); setItems(rows); } })
      .catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [hostId]);

  const list = useMemo(() => collapseSeries(items), [items]);

  if (error) {
    return (
      <main className="sn-view sn-detail-view">
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">We couldn’t load this page.</p>
          <p>Check your connection and try again.</p>
          <button className="btn" onClick={() => window.location.reload()}>Reload <Arrow /></button>
        </div>
      </main>
    );
  }
  if (host === undefined) return <main className="sn-view sn-detail-view"><Spinner /></main>;
  if (host === null) {
    return (
      <main className="sn-view sn-detail-view">
        <SEO title="Host not found | Conscious Sanctuary" noIndex />
        <div className="sn-empty sn-pad">
          <p className="sn-empty-h">This host isn’t on the calendar.</p>
          <p>The link may be incomplete, or they’re taking a break.</p>
          <Link className="btn" to="/sanctuary">See what’s on <Arrow /></Link>
        </div>
      </main>
    );
  }

  const first = host.display_name.split(' ')[0];
  return (
    <main className="sn-view sn-detail-view">
      <SEO
        title={`${host.display_name} | Conscious Sanctuary`}
        description={(host.bio || `Classes, workshops and events with ${host.display_name} at Conscious Sanctuary, Auroville Road.`).slice(0, 160)}
        url={`/sanctuary/hosts/${host.id}`}
        structuredData={[
          { '@context': 'https://schema.org', '@type': 'Person', name: host.display_name, ...(host.link ? { url: host.link } : {}) },
          breadcrumb([{ name: 'Home', path: '/' }, { name: 'Sanctuary', path: '/sanctuary' }, { name: host.display_name, path: `/sanctuary/hosts/${host.id}` }]),
        ]}
      />
      <div className="sn-hostpage">
        <Reveal><Link className="sn-back" to="/sanctuary">← All gatherings</Link></Reveal>
        <Reveal delay={1} as="h1" className="display sn-hostpage-name">{host.display_name}</Reveal>
        {host.bio && (
          <Reveal delay={2} className="sn-prose sn-hostpage-bio">
            {host.bio.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
          </Reveal>
        )}
        {host.link && /^https?:\/\//i.test(host.link) && (
          <Reveal delay={2}>
            <a className="sn-hostpage-link" href={host.link} target="_blank" rel="noopener noreferrer nofollow">
              {host.link.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')} ↗
            </a>
          </Reveal>
        )}

        <section className="sn-hostpage-list" aria-labelledby="sn-hp-h">
          <h2 id="sn-hp-h" className="sn-month-h">Coming up with {first}</h2>
          {list.length ? (
            <ul className="sn-list">{list.map((o) => <li key={o.id}><GatheringRow o={o} showHost={false} /></li>)}</ul>
          ) : (
            <div className="sn-empty">
              <p className="sn-empty-h">Nothing on the calendar right now.</p>
              <p>New dates appear here as soon as {first} adds them.</p>
              <Link className="btn" to="/sanctuary">See what else is on <Arrow /></Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default HostProfilePage;
