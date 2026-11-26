import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Checkout from './Checkout';
import { useAuth } from '../../context/AuthContext';
import { saveWebsiteOrder } from '../../services/accountService';
import { ORDER_REF_PATTERN } from '../../utils/account';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/accountService', () => ({ saveWebsiteOrder: jest.fn() }));
jest.mock('../../hooks/usePackagingRates', () => ({ usePackagingRates: () => ({ rates: { Mains: 20 }, loading: false }) }));

global.IS_REACT_ACT_ENVIRONMENT = true;

const CART = [{ id: 7, name: 'Millet bowl', price: 320, quantity: 2, posCategory: 'Mains' }];

let root; let el; let calls; let onOrderComplete;
beforeEach(() => {
  el = document.createElement('div'); document.body.appendChild(el);
  calls = [];
  saveWebsiteOrder.mockReset();
  saveWebsiteOrder.mockImplementation(() => { calls.push('save'); return Promise.resolve(); });
  window.open = jest.fn(() => { calls.push('open'); });
  window.alert = jest.fn();
  onOrderComplete = jest.fn();
});
afterEach(() => { act(() => root.unmount()); el.remove(); });

function mount(auth = { user: null, session: null }) {
  useAuth.mockReturnValue({ signOut: jest.fn(), ...auth });
  root = createRoot(el);
  act(() => { root.render(<Checkout isOpen cartItems={CART} onClose={() => {}} onOrderComplete={onOrderComplete} />); });
}
function type(id, value) {
  const input = el.querySelector(`#${id}`);
  const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const fill = ({ email = true } = {}) => {
  type('name', 'Asha');
  type('phone', '98400 00000');
  if (email) type('email', 'asha@example.com');
  type('address', '1 Test Road, Auroville');
  type('distance', '2.5');
};
const submit = () => act(() => { el.querySelector('.co-submit').click(); });
const sentText = () => decodeURIComponent(window.open.mock.calls[0][0].split('?text=')[1]);

test('the order is saved first, then WhatsApp opens in the same tap, carrying the same ref', () => {
  mount();
  fill();
  submit();
  expect(calls).toEqual(['save', 'open']);
  const [payload, token] = saveWebsiteOrder.mock.calls[0];
  expect(payload.p_ref).toMatch(ORDER_REF_PATTERN);
  expect(payload).toMatchObject({
    p_name: 'Asha', p_phone: '98400 00000', p_email: 'asha@example.com', p_address: '1 Test Road, Auroville', p_distance_km: 2.5,
    p_items: [{ id: '7', name: 'Millet bowl', qty: 2, price: 320 }], p_subtotal: 640, p_packaging: 40, p_packaging_known: true,
  });
  expect(token).toBeUndefined();
  expect(sentText()).toContain(`Ref: ${payload.p_ref}`);
  expect(onOrderComplete).toHaveBeenCalled();
});

test('a save that fails never stops the order', async () => {
  saveWebsiteOrder.mockImplementation(() => { calls.push('save'); return Promise.reject(new Error('offline')); });
  mount();
  fill();
  submit();
  await act(async () => {});
  expect(window.open).toHaveBeenCalledTimes(1);
  expect(onOrderComplete).toHaveBeenCalled();
});

test('signed in: the account’s email, fixed; its name; the session goes with the save', () => {
  mount({
    user: { id: 'u1', email: 'asha@example.com', user_metadata: { full_name: 'Asha Raman' } },
    session: { access_token: 'tok' },
  });
  expect(el.querySelector('#email')).toBeNull();
  expect(el.querySelector('.acct-email-value').textContent).toBe('asha@example.com');
  expect(el.querySelector('#name').value).toBe('Asha Raman');
  type('phone', '98400 00000');
  type('address', '1 Test Road, Auroville');
  type('distance', '2.5');
  submit();
  const [payload, token] = saveWebsiteOrder.mock.calls[0];
  expect(payload.p_email).toBe('asha@example.com');
  expect(payload.p_name).toBe('Asha Raman');
  expect(token).toBe('tok');
  expect(sentText()).toContain('Email: asha@example.com');
});

test('an incomplete form saves nothing and opens nothing', () => {
  mount();
  type('name', 'Asha');
  submit();
  expect(saveWebsiteOrder).not.toHaveBeenCalled();
  expect(window.open).not.toHaveBeenCalled();
});
