/* The service's two read paths before and after the migration is live, with
   the Supabase client mocked — nothing here reaches the network. */
jest.mock('./supabase/supabaseClient', () => ({ supabase: { rpc: jest.fn() } }));

import { supabase } from './supabase/supabaseClient';
import { getMenu, getSlots, getCalendar } from './wellnessService';

const NOT_IN_CACHE = {
  code: 'PGRST202',
  message: 'Could not find the function public.wellness_menu without parameters in the schema cache',
  details: null, hint: null,
};

beforeEach(() => supabase.rpc.mockReset());

describe('before the migration is applied', () => {
  test('wellness_menu missing reads as "nothing bookable yet", not an error', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: NOT_IN_CACHE });
    await expect(getMenu()).resolves.toEqual({ settings: null, services: [] });
    expect(supabase.rpc).toHaveBeenCalledWith('wellness_menu');
  });

  test('wellness_slots missing reads as no slots', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { ...NOT_IN_CACHE, message: 'Could not find the function public.wellness_slots(p_days, p_from) in the schema cache' } });
    await expect(getSlots('2026-11-10')).resolves.toEqual([]);
    expect(supabase.rpc).toHaveBeenCalledWith('wellness_slots', { p_from: '2026-11-10', p_days: 7 });
  });
});

describe('once it is live', () => {
  test('the menu comes through, services defaulting to []', async () => {
    const settings = { slot_minutes: 60, book_ahead_days: 14, max_seats: 4, gst_rate: 18, hold_minutes: 10 };
    supabase.rpc.mockResolvedValue({ data: { settings, services: [{ key: 'sauna' }] }, error: null });
    await expect(getMenu()).resolves.toEqual({ settings, services: [{ key: 'sauna' }] });
    supabase.rpc.mockResolvedValue({ data: { settings, services: null }, error: null });
    await expect(getMenu()).resolves.toEqual({ settings, services: [] });
  });

  test('a genuine failure still throws', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } });
    await expect(getMenu()).rejects.toMatchObject({ code: '42501' });
    supabase.rpc.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(getSlots('2026-11-10')).rejects.toThrow('Failed to fetch');
  });
});

describe('the calendar', () => {
  test('reads wellness_calendar for a week from a date', async () => {
    const rows = [{ slot_start: '2026-11-26T04:00:00+00:00', slot_end: '2026-11-26T05:00:00+00:00', state: 'unavailable' }];
    supabase.rpc.mockResolvedValue({ data: rows, error: null });
    await expect(getCalendar('2026-11-26')).resolves.toEqual(rows);
    expect(supabase.rpc).toHaveBeenCalledWith('wellness_calendar', { p_from: '2026-11-26', p_days: 7 });
  });

  test('before its migration, null (no calendar), not an error', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { ...NOT_IN_CACHE, message: 'Could not find the function public.wellness_calendar(p_days, p_from) in the schema cache' } });
    await expect(getCalendar('2026-11-26')).resolves.toBeNull();
  });
});
