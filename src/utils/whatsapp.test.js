import { formatWhatsAppMessage } from './whatsapp';

const CART = [{ id: 7, name: 'Millet bowl', price: 320, quantity: 1, posCategory: 'Mains' }];
const INFO = { name: 'Asha', phone: '98400 00000', email: 'a@b.in', address: '1 Road', distance: '2', notes: '' };

test('the message opens with the order ref, so the chat and Your account meet', () => {
  const text = decodeURIComponent(formatWhatsAppMessage(CART, INFO, { Mains: 20 }, 'W-7K3Q9P').message);
  expect(text.split('\n').slice(0, 2)).toEqual(['🥗 New Order from Consciouscafe.in ', '🧾 Ref: W-7K3Q9P']);
});

test('without a ref the message is as before', () => {
  const text = decodeURIComponent(formatWhatsAppMessage(CART, INFO, { Mains: 20 }).message);
  expect(text).not.toContain('Ref:');
  expect(text.startsWith('🥗 New Order from Consciouscafe.in \n\n👤')).toBe(true);
});
