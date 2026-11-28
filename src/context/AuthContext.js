import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import { getMyHost } from '../services/sanctuaryService';

/**
 * Who is signed in, through Supabase Auth: Google, or a code emailed to them
 * (sent via Resend as Supabase's SMTP). Anyone may sign in — a customer to see
 * their bookings and orders (/account), an organiser to run their events
 * (/sanctuary/host). Nobody needs to, to book or order.
 *
 * `isHost` — an organiser is someone with a sanctuary_hosts row (any status),
 * NOT anyone with a session. null while it isn't known yet (the session or
 * the row is still loading), then true / false; false when signed out.
 *
 * Children always render: the menu and every public page must paint without
 * waiting on the auth round-trip (a Google redirect adds a code exchange).
 * Pages that need the session read `loading` and wait themselves.
 *
 * A signed-in person is `authenticated` to the database, which on this project
 * is NOT staff — the POS tables refuse them (stage 4). Everything public they
 * see goes through RPCs (get_public_menu, sanctuary_listings, …), and their
 * own bookings and orders through my_account() (POS migration 20261129000000).
 */
const AuthContext = createContext({ user: null, session: null, loading: true, isHost: null, hostRow: null });

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      setLoading(false);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  // Whether this person organises with us: their sanctuary_hosts row, read once
  // per signed-in user (and again on refreshHost — after they introduce
  // themselves, or save their profile — so the header's menu keeps up).
  const uid = session?.user?.id ?? null;
  const [host, setHost] = useState({ uid: null, row: null });
  const [hostCheck, setHostCheck] = useState(0);
  useEffect(() => {
    if (!uid) return undefined;
    let alive = true;
    getMyHost(uid)
      .then((row) => alive && setHost({ uid, row: row || null }))
      .catch(() => alive && setHost({ uid, row: null }));
    return () => { alive = false; };
  }, [uid, hostCheck]);
  const known = !loading && !!uid && host.uid === uid;
  const isHost = loading ? null : !uid ? false : known ? !!host.row : null;
  // the row itself (status, display_name, avatar_path…) — null until known, or for a non-organiser
  const hostRow = known ? host.row : null;

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    isHost,
    hostRow,
    refreshHost: () => setHostCheck((n) => n + 1),
    /** Leaves the site for Google; comes back to `returnPath` signed in. */
    signInWithGoogle: (returnPath = '/account') =>
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${returnPath}` },
      }),
    /**
     * Emails a one-time code (first time = creates the account). A code, not a
     * link: a PKCE link only works in the browser that asked for it, and people
     * often read mail on their phone. The Supabase email templates must show
     * {{ .Token }}.
     */
    sendEmailCode: (email) =>
      supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }),
    /** Exchanges the code for a session; onAuthStateChange then signs them in here. */
    verifyEmailCode: (email, token) =>
      supabase.auth.verifyOtp({ email, token, type: 'email' }),
    /**
     * Signs out on this device only — what "Sign out" means to anyone; Supabase's
     * default (global) would sign them out on their phone too. Resolves to
     * { error }: when the server can't be reached Supabase keeps the session,
     * so the caller says so instead of looking signed out.
     */
    signOut: () => supabase.auth.signOut({ scope: 'local' }),
  }), [session, loading, isHost, hostRow]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
