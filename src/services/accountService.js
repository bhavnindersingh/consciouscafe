import { supabase, supabaseUrl, supabaseAnonKey } from './supabase/supabaseClient';

/*
 * Your account — POS migration 20261129000000_customer_accounts.sql.
 *   my_account()          signed-in customers only: { email, is_host, events,
 *                         sessions, orders }, matched by user_id or confirmed email
 *   website_order_save()  anyone: checkout's record of what it sent on WhatsApp
 */

/** The signed-in person's bookings and orders. Throws 'not_signed_in' without a session. */
export async function getMyAccount() {
  const { data, error } = await supabase.rpc('my_account');
  if (error) throw error;
  return data || { email: null, is_host: false, events: [], sessions: [], orders: [] };
}

/**
 * Save checkout's order. A plain fetch rather than supabase-js, for one reason:
 * `keepalive`. Checkout opens WhatsApp in the same tap, which on a phone sends
 * this tab to the background, where an ordinary request can be cut off; a
 * keepalive one is finished by the browser. Never awaited by checkout — the
 * order itself travels on WhatsApp either way.
 *
 * `accessToken`: the signed-in session's, so the row carries their user_id;
 * the anon key otherwise.
 */
export async function saveWebsiteOrder(payload, accessToken) {
  const post = (token) => fetch(`${supabaseUrl}/rest/v1/rpc/website_order_save`, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  let res = await post(accessToken || supabaseAnonKey);
  // A session token that has just expired: save it anyway, as anon — the
  // order still reaches their account by its email.
  if (res.status === 401 && accessToken) res = await post(supabaseAnonKey);
  if (!res.ok) throw new Error(`website_order_save ${res.status}`);
}
