import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LIMITS, HOST_AUTH_COPY } from '../../constants/sanctuary';
import { cleanEmail, cleanCode, authErrorKind } from '../../utils/sanctuary';
import { Field } from './parts';
import './sanctuary.css';

/*
 * The one way in, for everyone who signs in on this site — organisers at
 * /sanctuary/host and customers at /account: Google, or a code emailed to
 * them. On success the auth context swaps the page underneath for what the
 * person came for. Styles: sanctuary.css (.sn-signin-card and the form parts).
 */

// The database isn't there yet (migration not applied) or the provider is off.
export const notOpenYet = (e) => /PGRST20[25]|42P01|does not exist|provider is not enabled|Unsupported provider/i
  .test(`${e?.code || ''} ${e?.message || ''}`);

/**
 * Email → code → signed in. `onSent(true|false)`: a code is out (or not) — the
 * card then makes the code's Sign in the one primary button.
 */
export function EmailSignIn({ onSent }) {
  const { sendEmailCode, verifyEmailCode } = useAuth();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!wait) return undefined;
    const t = setTimeout(() => setWait((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const [emailErr, setEmailErr] = useState(null);
  const [codeErr, setCodeErr] = useState(null);
  const send = async (raw) => {
    const to = cleanEmail(raw);
    if (!to) { setEmailErr(HOST_AUTH_COPY.bad_email); document.getElementById('sn-h-email')?.focus(); return; }
    setBusy(true); setFailure(null);
    const { error } = await sendEmailCode(to);
    setBusy(false);
    const kind = authErrorKind(error);
    // Rate-limited means a code went out moments ago — let them use it.
    if (!error || kind === 'slow_down') { setSentTo(to); setCode(''); setWait(LIMITS.codeResendSeconds); onSent?.(true); }
    if (error) setFailure(HOST_AUTH_COPY[kind]);
  };

  const verify = async (e) => {
    e.preventDefault();
    const token = cleanCode(code);
    if (!token) { setCodeErr('Type the code from the email — just the numbers.'); document.getElementById('sn-h-code')?.focus(); return; }
    setBusy(true); setFailure(null);
    const { error } = await verifyEmailCode(sentTo, token);
    if (error) { setBusy(false); setFailure(HOST_AUTH_COPY[authErrorKind(error)]); }
  };

  if (!sentTo) {
    return (
      <form className="sn-form" onSubmit={(e) => { e.preventDefault(); if (!busy) send(email); }} noValidate>
        <div className="sn-inline">
          <Field label="Your email" htmlFor="sn-h-email" error={emailErr}>
            <input id="sn-h-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setEmailErr(null); }} maxLength={LIMITS.emailMax}
              onBlur={() => setEmailErr(email.trim() && !cleanEmail(email) ? HOST_AUTH_COPY.bad_email : null)} />
          </Field>
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</button>
        </div>
        {failure && <p className="sn-failure" role="alert">{failure}</p>}
      </form>
    );
  }

  return (
    <form className="sn-form" onSubmit={verify} noValidate>
      <p className="sn-sent">We’ve emailed a sign-in code to <strong>{sentTo}</strong>. It can take a minute — check spam too.</p>
      <div className="sn-inline sn-code">
        <Field label="Code from the email" htmlFor="sn-h-code" error={codeErr}>
          <input id="sn-h-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={12}
            value={code} onChange={(e) => { setCode(e.target.value); setCodeErr(null); }} autoFocus
            onBlur={() => setCodeErr(code.trim() && !cleanCode(code) ? 'Just the numbers from the email.' : null)} />
        </Field>
        <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Checking…' : 'Sign in'} </button>
      </div>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <div className="sn-gate-actions">
        <button type="button" className="sn-act" disabled={busy || wait > 0} onClick={() => send(sentTo)}>
          {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
        </button>
        <button type="button" className="sn-act" disabled={busy} onClick={() => { setSentTo(null); setFailure(null); onSent?.(false); }}>
          Use a different email
        </button>
      </div>
    </form>
  );
}

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
);

/**
 * The sign-in card: Google, or an emailed code. `returnPath` is where Google
 * brings them back (it must be on the Supabase redirect allow-list).
 */
export default function SignInCard({
  heading = 'Sign in',
  sub,
  returnPath,
  fine,
  unavailable = 'Signing in opens very soon. Until then, message us on WhatsApp.',
}) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [codeSent, setCodeSent] = useState(false); // then the code's Sign in is the primary button
  const [failure, setFailure] = useState(null);
  const go = async () => {
    setBusy(true); setFailure(null);
    const { error } = await signInWithGoogle(returnPath);
    if (error) {
      setBusy(false);
      setFailure(notOpenYet(error) ? unavailable : 'We couldn’t reach Google just now. Please try again.');
    }
  };
  return (
    <section className="sn-signin-card" aria-labelledby="sn-signin-h">
      <h2 id="sn-signin-h" className="sn-signin-h">{heading}</h2>
      {sub ? <p className="sn-signin-sub">{sub}</p> : null}
      <button className={`btn${codeSent ? '' : ' forest'} sn-google`} onClick={go} disabled={busy}>
        <GoogleMark />
        {busy ? 'Opening Google…' : 'Sign in with Google'}
      </button>
      {failure && <p className="sn-failure" role="alert">{failure}</p>}
      <p className="sn-or">or with your email</p>
      <EmailSignIn onSent={setCodeSent} />
      {fine ? <p className="sn-fine">{fine}</p> : null}
    </section>
  );
}
