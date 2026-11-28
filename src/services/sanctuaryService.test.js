import { requestToHost } from './sanctuaryService';
import { supabase } from './supabase/supabaseClient';

jest.mock('./supabase/supabaseClient', () => ({ supabase: { from: jest.fn() }, supabaseUrl: 'https://x.test', supabaseAnonKey: 'anon' }));

// from('sanctuary_hosts').insert(row).select('*').single() → each answer in turn
function answers(...results) {
  const inserted = [];
  supabase.from.mockImplementation(() => ({
    insert: (row) => {
      inserted.push(row);
      return { select: () => ({ single: async () => results[inserted.length - 1] }) };
    },
  }));
  return inserted;
}

const ASK = { displayName: 'Asha Rao', phone: '', link: 'https://asha.example', intro: 'I hold sound baths.' };

beforeEach(() => supabase.from.mockReset());

test('an introduction goes to intro — never to the profile’s public bio', async () => {
  const sent = answers({ data: { user_id: 'u1', status: 'requested' }, error: null });
  await expect(requestToHost('u1', ASK)).resolves.toEqual({ user_id: 'u1', status: 'requested' });
  expect(supabase.from).toHaveBeenCalledWith('sanctuary_hosts');
  expect(sent).toEqual([{ user_id: 'u1', display_name: 'Asha Rao', phone: null, link: 'https://asha.example', intro: 'I hold sound baths.' }]);
  expect(sent[0]).not.toHaveProperty('bio');
});

test('before POS 20261130000000 (no intro column) the request still lands — without it, not in bio', async () => {
  const sent = answers(
    { data: null, error: { code: 'PGRST204', message: "Could not find the 'intro' column of 'sanctuary_hosts' in the schema cache" } },
    { data: { user_id: 'u1', status: 'requested' }, error: null },
  );
  await expect(requestToHost('u1', ASK)).resolves.toEqual({ user_id: 'u1', status: 'requested' });
  expect(sent).toHaveLength(2);
  expect(sent[1]).toEqual({ user_id: 'u1', display_name: 'Asha Rao', phone: null, link: 'https://asha.example' });
});

test('any other refusal is the caller’s to show — no retry', async () => {
  const sent = answers({ data: null, error: { code: '23505', message: 'duplicate key value' } });
  await expect(requestToHost('u1', ASK)).rejects.toMatchObject({ code: '23505' });
  expect(sent).toHaveLength(1);
});
