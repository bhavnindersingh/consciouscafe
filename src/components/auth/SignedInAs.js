import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * In a booking form or checkout, for someone signed in: their account's email
 * in place of the email field — fixed, so what they book is always found under
 * Your account. Signing out brings the ordinary field back. Styles: App.css
 * (.acct-email), so it works in checkout's drawer and the Sanctuary's forms alike.
 */
export default function SignedInAs({ email }) {
  const { signOut } = useAuth();
  return (
    <div className="acct-email">
      <span className="acct-email-label">Email</span>
      <span className="acct-email-value">{email}</span>
      <span className="acct-email-note">
        From your account, so this shows under Your account.{' '}
        <button type="button" className="acct-email-out" onClick={() => signOut()}>Not you? Sign out</button>
      </span>
    </div>
  );
}
