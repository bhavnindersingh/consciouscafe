import { saveWebsiteOrder } from './accountService';
import { supabaseUrl, supabaseAnonKey } from './supabase/supabaseClient';

afterEach(() => { delete global.fetch; });

test('the order save survives the tab going to WhatsApp: keepalive, to the RPC', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  await saveWebsiteOrder({ p_ref: 'W-ABC123' }, 'user-token');
  const [url, init] = global.fetch.mock.calls[0];
  expect(url).toBe(`${supabaseUrl}/rest/v1/rpc/website_order_save`);
  expect(init.method).toBe('POST');
  expect(init.keepalive).toBe(true);
  expect(init.headers.apikey).toBe(supabaseAnonKey);
  expect(init.headers.Authorization).toBe('Bearer user-token');
  expect(JSON.parse(init.body)).toEqual({ p_ref: 'W-ABC123' });
});

test('signed out, it goes as anon; a refusal is an error for the caller to ignore', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 400 }));
  await expect(saveWebsiteOrder({ p_ref: 'W-ABC123' })).rejects.toThrow('website_order_save 400');
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${supabaseAnonKey}`);
});

test('an expired session token: saved again as anon, so the order still reaches the account by email', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: false, status: 401 })
    .mockResolvedValueOnce({ ok: true, status: 204 });
  await saveWebsiteOrder({ p_ref: 'W-ABC123' }, 'stale-token');
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer stale-token');
  expect(global.fetch.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${supabaseAnonKey}`);
  expect(global.fetch.mock.calls[1][1].keepalive).toBe(true);
});
