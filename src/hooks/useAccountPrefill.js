import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountPrefill } from '../utils/account';

/**
 * Booking forms and checkout, for someone signed in: their account's name in
 * the name field (if they haven't typed one) and — with `email` — their
 * account's email, fixed. And the other way round: when they sign out ("Not
 * you? Sign out" on a shared phone), whatever came from the account goes, so
 * the next person never books under the last one's name or email. Anything
 * the person typed themselves stays.
 *
 * Keyed on the strings, not the user object, and a no-op when nothing changes.
 * Returns { accountEmail, accountName } for the form to use.
 */
export function useAccountPrefill(setForm, { email = true } = {}) {
  const { user } = useAuth();
  const accountEmail = user?.email || null;
  const accountName = accountPrefill(user).name;
  const last = useRef({ email: null, name: '' });

  useEffect(() => {
    const prev = last.current;
    setForm((f) => {
      let next = f;
      const put = (k, v) => { if (next[k] !== v) next = { ...next, [k]: v }; };
      // the name: fill an empty field; follow the account while it's untouched
      if (!f.name || f.name === prev.name) put('name', accountName || '');
      if (email) {
        if (accountEmail) put('email', accountEmail);
        else if (prev.email && f.email === prev.email) put('email', '');
      }
      return next;
    });
    last.current = { email: accountEmail, name: accountName };
  }, [accountEmail, accountName, email, setForm]);

  return { accountEmail, accountName };
}
