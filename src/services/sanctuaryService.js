/**
 * Conscious Sanctuary data — the POS database's sanctuary_* objects
 * (Manager Conscious Cafe, migrations 20261104200000_sanctuary.sql and
 * 20261105000000_sanctuary_v2.sql).
 *
 * Visitors (anon or signed in) only ever call the public functions;
 * the tables themselves are host- and admin-only under RLS. Hosts read and
 * write their own rows directly with their Google session.
 */
import { supabase } from './supabase/supabaseClient';
import { IMAGE_BUCKET, IMAGE_TYPES, IMAGE_MAX_BYTES } from '../constants/sanctuary';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// ── Public ─────────────────────────────────────────────────────────────────

/** Upcoming published gatherings by approved hosts, soonest first. */
export async function listGatherings() {
  return unwrap(await supabase.rpc('sanctuary_listings')) || [];
}

/** One published or cancelled gathering (past ones too, for shared links), or null. */
export async function getGathering(id) {
  const rows = unwrap(await supabase.rpc('sanctuary_offering', { p_id: id })) || [];
  return rows[0] || null;
}

/** Upcoming dates of one weekly series. */
export async function listSeriesDates(seriesId) {
  return unwrap(await supabase.rpc('sanctuary_listings').eq('series_id', seriesId)) || [];
}

/** An approved host's public page: { id, display_name, bio, link } or null. */
export async function getHost(id) {
  const rows = unwrap(await supabase.rpc('sanctuary_host', { p_id: id })) || [];
  return rows[0] || null;
}

/** That host's upcoming gatherings. */
export async function listHostGatherings(hostId) {
  return unwrap(await supabase.rpc('sanctuary_listings').eq('host_id', hostId)) || [];
}

/**
 * Reserve places. Throws the database's refusal as-is — its `message` is one of
 * invalid / not_found / closed / too_many / already_booked / full
 * (see rsvpErrorMessage in utils/sanctuary.js).
 */
export async function reservePlaces({ offeringId, name, phone, email, seats }) {
  const rows = unwrap(await supabase.rpc('sanctuary_rsvp', {
    p_offering_id: offeringId,
    p_name: name,
    p_phone: phone,
    p_email: email || null,
    p_seats: seats,
  })) || [];
  return rows[0] || null;
}

export function imageUrl(path) {
  if (!path) return null;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

// ── Host ───────────────────────────────────────────────────────────────────

/** The signed-in person's host row, or null if they haven't asked to host yet. */
export async function getMyHost(userId) {
  return unwrap(await supabase.from('sanctuary_hosts').select('*').eq('user_id', userId).maybeSingle());
}

/** Ask to host. The database forces status 'requested' and takes email from the sign-in. */
export async function requestToHost(userId, { displayName, phone, link, bio }) {
  return unwrap(await supabase.from('sanctuary_hosts').insert({
    user_id: userId,
    display_name: displayName,
    phone: phone || null,
    link: link || null,
    bio: bio || null,
  }).select('*').single());
}

export async function updateMyHost(userId, { displayName, phone, link, bio }) {
  return unwrap(await supabase.from('sanctuary_hosts').update({
    display_name: displayName,
    phone: phone || null,
    link: link || null,
    bio: bio || null,
  }).eq('user_id', userId).select('*').single());
}

/** Every gathering this host owns (RLS returns only theirs). */
export async function listMyGatherings() {
  return unwrap(await supabase.from('sanctuary_offerings').select('*').order('starts_at')) || [];
}

export async function getMyGathering(id) {
  return unwrap(await supabase.from('sanctuary_offerings').select('*').eq('id', id).maybeSingle());
}

/** Insert (no id) or update. `row` uses DB column names — see validateOffering(). */
export async function saveGathering(hostId, row, id = null) {
  const q = id
    ? supabase.from('sanctuary_offerings').update(row).eq('id', id)
    : supabase.from('sanctuary_offerings').insert({ ...row, host_id: hostId });
  return unwrap(await q.select('*').single());
}

/** A weekly series in one insert (all or nothing). `rows` from seriesRows(). */
export async function createSeries(hostId, rows) {
  return unwrap(await supabase.from('sanctuary_offerings')
    .insert(rows.map((r) => ({ ...r, host_id: hostId }))).select('id')) || [];
}

/**
 * "This and following": every not-cancelled date of the series from `fromIso`
 * on takes `value`'s details and its IST start time and length; each keeps its
 * own day. Returns how many dates changed.
 */
export async function updateSeries(seriesId, fromIso, value, startTime, minutes) {
  return unwrap(await supabase.rpc('sanctuary_update_series', {
    p_series_id: seriesId,
    p_from: fromIso,
    p_kind: value.kind,
    p_title: value.title,
    p_description: value.description,
    p_location: value.location,
    p_image_path: value.image_path,
    p_price_inr: value.price_inr,
    p_capacity: value.capacity,
    p_start_time: startTime,
    p_minutes: minutes,
  }));
}

/** Move every date of a series that is `from` and not yet started to `to`. */
export async function setSeriesStatus(seriesId, from, to) {
  return unwrap(await supabase.from('sanctuary_offerings').update({ status: to })
    .eq('series_id', seriesId).eq('status', from).gt('starts_at', new Date().toISOString()).select('id')) || [];
}

/** The series' drafts (the database refuses to delete anything else). */
export async function deleteSeriesDrafts(seriesId) {
  unwrap(await supabase.from('sanctuary_offerings').delete().eq('series_id', seriesId).eq('status', 'draft'));
}

export async function setGatheringStatus(id, status) {
  return unwrap(await supabase.from('sanctuary_offerings').update({ status }).eq('id', id).select('*').single());
}

/** Drafts only — the database refuses the rest (published ones are cancelled instead). */
export async function deleteDraft(id) {
  unwrap(await supabase.from('sanctuary_offerings').delete().eq('id', id).eq('status', 'draft'));
}

/** RSVPs for the host's own gatherings; pass an id for one gathering. */
export async function listRsvps(offeringId = null) {
  let q = supabase.from('sanctuary_rsvps').select('*').order('created_at');
  if (offeringId) q = q.eq('offering_id', offeringId);
  return unwrap(await q) || [];
}

export async function setRsvpStatus(id, status) {
  return unwrap(await supabase.from('sanctuary_rsvps').update({ status }).eq('id', id).select('*').single());
}

/** Upload under the host's own folder (the storage policy requires it). Returns the path. */
export async function uploadImage(userId, file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG or WebP image.');
  if (file.size > IMAGE_MAX_BYTES) throw new Error('Images up to 5 MB, please.');
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  unwrap(await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false }));
  return path;
}
