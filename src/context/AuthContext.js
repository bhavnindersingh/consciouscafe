import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

/**
 * Who is signed in — only Sanctuary hosts ever are, through Supabase Auth:
 * Google, or a code emailed to them (sent via Resend as Supabase's SMTP).
 * Visitors never sign in.
 *
 * Children always render: the menu and every public page must paint without
 * waiting on the auth round-trip (a Google redirect adds a code exchange).
 * Pages that need the session read `loading` and wait themselves.
 *
 * A signed-in host is `authenticated` to the database, which on this project
 * is NOT staff — the POS tables refuse them. Everything public they see goes
 * through RPCs (get_public_menu, sanctuary_listings, …), which answer both.
 */
const AuthContext = createContext({ user: null, session: null, loading: true });

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

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    /** Leaves the site for Google; comes back to `returnPath` signed in. */
    signInWithGoogle: (returnPath = '/sanctuary/host') =>
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${returnPath}` },
      }),
    /**
     * Emails a one-time code (first time = creates the account). A code, not a
     * link: a PKCE link only works in the browser that asked for it, and hosts
     * often read mail on their phone. The Supabase email templates must show
     * {{ .Token }}.
     */
    sendEmailCode: (email) =>
      supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }),
    /** Exchanges the code for a session; onAuthStateChange then signs them in here. */
    verifyEmailCode: (email, token) =>
      supabase.auth.verifyOtp({ email, token, type: 'email' }),
    signOut: () => supabase.auth.signOut(),
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
