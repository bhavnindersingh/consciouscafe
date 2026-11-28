import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useAccountPrefill } from './useAccountPrefill';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

global.IS_REACT_ACT_ENVIRONMENT = true;

let root; let el; let form; let setOuter;
function Form({ withEmail = true }) {
  const [f, setF] = useState({ name: '', email: '', phone: '' });
  useAccountPrefill(setF, { email: withEmail });
  form = f; setOuter = setF;
  return null;
}
beforeEach(() => { el = document.createElement('div'); document.body.appendChild(el); root = createRoot(el); });
afterEach(() => { act(() => root.unmount()); el.remove(); });

const ASHA = { user: { id: 'a', email: 'asha@example.com', user_metadata: { full_name: 'Asha Raman' } } };
const BALA = { user: { id: 'b', email: 'bala@example.com', user_metadata: { full_name: 'Bala K' } } };
const OUT = { user: null };
const render = (auth, props = {}) => { useAuth.mockReturnValue(auth); act(() => { root.render(<Form {...props} />); }); };

test('signed in: the account’s name and email fill the form', () => {
  render(ASHA);
  expect(form).toMatchObject({ name: 'Asha Raman', email: 'asha@example.com' });
});

test('“Not you? Sign out” on a shared phone: the last person’s name and email go', () => {
  render(ASHA);
  render(OUT);
  expect(form).toMatchObject({ name: '', email: '' });
});

test('what the person typed themselves stays when they sign out', () => {
  render(ASHA);
  act(() => { setOuter((f) => ({ ...f, name: 'Asha R.', phone: '9840000000' })); });
  render(OUT);
  expect(form).toMatchObject({ name: 'Asha R.', email: '', phone: '9840000000' });
});

test('one person to another: the new account’s details, not the old', () => {
  render(ASHA);
  render(BALA);
  expect(form).toMatchObject({ name: 'Bala K', email: 'bala@example.com' });
});

test('checkout keeps its own email: only the name is filled', () => {
  render(ASHA, { withEmail: false });
  expect(form).toMatchObject({ name: 'Asha Raman', email: '' });
});
