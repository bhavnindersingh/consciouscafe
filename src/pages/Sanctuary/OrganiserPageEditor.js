import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { updateMyHost, uploadImage, removeImage, imageUrl } from '../../services/sanctuaryService';
import { LIMITS, IMAGE_TYPES } from '../../constants/sanctuary';
import { Field, useFieldErrors, useKeyboardOpen } from './parts';

const ACCEPT = IMAGE_TYPES.join(',');

/** The profile's rules: { errors, value } (value: the trimmed text fields). */
function validateProfile(form) {
  const v = {
    displayName: form.displayName.trim(), tagline: form.tagline.trim(), bio: form.bio.trim(), link: form.link.trim(),
    phone: form.phone.trim(), placeName: form.placeName.trim(), placeAddress: form.placeAddress.trim(),
  };
  const errors = {};
  if (v.displayName.length < LIMITS.hostNameMin || v.displayName.length > LIMITS.hostNameMax) errors.displayName = 'The name people will see, 2–80 characters.';
  if (v.tagline.length > LIMITS.taglineMax) errors.tagline = `Up to ${LIMITS.taglineMax} characters.`;
  if (v.link && !/^https?:\/\/\S+\.\S+/i.test(v.link)) errors.link = 'A full link, starting with https://';
  if (v.phone.length > LIMITS.hostPhoneMax) errors.phone = 'That number is too long.';
  if (v.placeAddress && !v.placeName) errors.placeName = 'Name the place, too.';
  return { errors, value: v };
}

// What's kept on this device as you type — everything but the phone number.
const KEEP = ['displayName', 'tagline', 'bio', 'link', 'placeName', 'placeAddress', 'avatarPath', 'coverPath', 'galleryPaths'];

/**
 * /sanctuary/host/profile — the organiser builds their public page
 * (/sanctuary/hosts/:id): a cover, a profile photo, who they are, and their
 * own space with photos of it. Photos upload as they're chosen (bucket
 * sanctuary-images, their own folder); Save writes the page. A photo this
 * editor uploaded and then replaced or dropped is deleted; a saved one never is
 * by this screen (it may still be on the live page until Save).
 */
export default function OrganiserPageEditor({ host, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(() => ({
    displayName: host.display_name || '',
    tagline: host.tagline || '',
    bio: host.bio || '',
    link: host.link || '',
    phone: host.phone || '',
    placeName: host.place_name || '',
    placeAddress: host.place_address || '',
    avatarPath: host.avatar_path || null,
    coverPath: host.cover_path || null,
    galleryPaths: host.gallery_paths || [],
  }));
  const [failure, setFailure] = useState(null);
  const { errors, blur, clear, all } = useFieldErrors(validateProfile, form);
  const typing = useKeyboardOpen();
  // unsaved work is kept on this device until it's saved or discarded
  const draftKey = `sn-profile-draft:${host.user_id}`;
  const initial = useRef(null);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    initial.current = JSON.stringify(Object.fromEntries(KEEP.map((k) => [k, form[k]])));
    try {
      const kept = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (kept && JSON.stringify(kept) !== initial.current) { setForm((f) => ({ ...f, ...kept })); setRestored(true); }
    } catch { /* a broken draft is ignored */ }
  }, []);
  const kept = JSON.stringify(Object.fromEntries(KEEP.map((k) => [k, form[k]])));
  const dirty = initial.current !== null && kept !== initial.current;
  useEffect(() => {
    if (initial.current === null) return undefined;
    const t = setTimeout(() => {
      try { if (dirty && !saved) localStorage.setItem(draftKey, kept); else localStorage.removeItem(draftKey); } catch { /* storage off */ }
    }, 400);
    return () => clearTimeout(t);
  }, [kept, dirty, saved, draftKey]);
  useEffect(() => {
    if (!dirty || saved) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saved]);
  const discard = () => {
    try { localStorage.removeItem(draftKey); } catch { /* fine */ }
    setForm((f) => ({ ...f, ...JSON.parse(initial.current) })); setRestored(false);
  };
  const [uploading, setUploading] = useState(null); // 'cover' | 'avatar' | 'gallery'
  const [photoFailure, setPhotoFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const uploadedHere = useRef(new Set());
  const savedPaths = useRef(new Set([host.avatar_path, host.cover_path, ...(host.gallery_paths || [])].filter(Boolean)));

  useEffect(() => { setSaved(false); }, [form]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    clear(k);
  };
  const drop = (path) => {
    if (path && uploadedHere.current.has(path) && !savedPaths.current.has(path)) {
      uploadedHere.current.delete(path);
      removeImage(path).catch(() => {});
    }
  };
  const upload = async (file) => {
    const path = await uploadImage(host.user_id, file);
    uploadedHere.current.add(path);
    return path;
  };

  const pickOne = (key, which) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(which); setPhotoFailure(null);
    try {
      const path = await upload(file);
      setForm((f) => { drop(f[key]); return { ...f, [key]: path }; });
    } catch (err) { setPhotoFailure(err.message || 'That photo didn’t upload. Try another one.'); }
    setUploading(null);
  };
  const clearOne = (key) => setForm((f) => { drop(f[key]); return { ...f, [key]: null }; });

  const room = LIMITS.galleryMax - form.galleryPaths.length;
  const addGallery = async (e) => {
    const files = [...(e.target.files || [])].slice(0, room);
    e.target.value = '';
    if (!files.length) return;
    setUploading('gallery'); setPhotoFailure(null);
    for (const file of files) {
      try {
        // one at a time: a phone's connection, and each photo shows as it lands
        // eslint-disable-next-line no-await-in-loop
        const path = await upload(file);
        setForm((f) => ({ ...f, galleryPaths: [...f.galleryPaths, path].slice(0, LIMITS.galleryMax) }));
      } catch (err) { setPhotoFailure(err.message || 'A photo didn’t upload. Try it again.'); }
    }
    setUploading(null);
  };
  const removeGallery = (path) => setForm((f) => { drop(path); return { ...f, galleryPaths: f.galleryPaths.filter((p) => p !== path) }; });

  const submit = async (e) => {
    e.preventDefault();
    if (uploading) { setFailure('A photo is still uploading. Save again once it’s finished.'); return; }
    const { errors: errs, value: v } = all();
    if (Object.keys(errs).length) {
      const id = { displayName: 'sn-p-name', tagline: 'sn-p-tag', link: 'sn-p-link', phone: 'sn-p-phone', placeName: 'sn-p-place' }[Object.keys(errs)[0]];
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: 'center' }); el?.focus({ preventScroll: true });
      return;
    }
    setBusy(true); setFailure(null);
    try {
      const row = await updateMyHost(host.user_id, {
        displayName: v.displayName, phone: v.phone, link: v.link, bio: v.bio,
        page: { tagline: v.tagline, placeName: v.placeName, placeAddress: v.placeAddress, avatarPath: form.avatarPath, coverPath: form.coverPath, galleryPaths: form.galleryPaths },
      });
      // what's on the page now is saved: no longer this editor's to delete
      savedPaths.current = new Set([row.avatar_path, row.cover_path, ...(row.gallery_paths || [])].filter(Boolean));
      onSaved(row);
      try { localStorage.removeItem(draftKey); } catch { /* fine */ }
      initial.current = JSON.stringify(Object.fromEntries(KEEP.map((k) => [k, form[k]])));
      setRestored(false);
      setSaved(true);
    } catch (err) {
      setFailure(err.message || 'Could not save. Please try again.');
    }
    setBusy(false);
  };

  const cover = imageUrl(form.coverPath);
  const avatar = imageUrl(form.avatarPath);
  const initials = (form.displayName || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="sn-editor sn-pageed">
      <Link className="sn-back" to="/sanctuary/host">← Your events</Link>
      <h1 className="display sn-dash-h">Your profile</h1>
      {restored && (
        <p className="sn-notice" role="status">
          Your unsaved changes from last time are back.
          <button type="button" className="sn-act" onClick={discard}>Discard them</button>
        </p>
      )}
      <p className="sn-hint sn-pageed-lede">
        Your organiser profile — what people see when they tap your name: who you are, where you hold things, and photos of your space and work.{' '}
        <Link to={`/sanctuary/hosts/${host.user_id}`}>Visit your profile</Link>
      </p>

      <form className="sn-pageed-form" onSubmit={submit} noValidate>
        <section className="sn-step">
          <h2 className="sn-step-h">Photos</h2>
          <div className={`sn-pageed-cover${cover ? ' has' : ''}`}>
            {cover ? <img src={cover} alt="" /> : <span className="sn-hint">A wide photo across the top of your profile — your space, your work.</span>}
            <div className="sn-pageed-avatar">
              {avatar ? <img src={avatar} alt="" /> : <span aria-hidden="true">{initials}</span>}
            </div>
          </div>
          <div className="sn-pageed-photoacts">
            <span className="sn-label">Cover</span>
            <label className="sn-act">
              {uploading === 'cover' ? 'Uploading…' : cover ? 'Replace' : 'Add a cover'}
              <input type="file" className="sr-only" accept={ACCEPT} onChange={pickOne('coverPath', 'cover')} disabled={Boolean(uploading)} />
            </label>
            {cover && <button type="button" className="sn-act" aria-label="Remove cover" onClick={() => clearOne('coverPath')}>Remove</button>}
            <span className="sn-label">Profile photo</span>
            <label className="sn-act">
              {uploading === 'avatar' ? 'Uploading…' : avatar ? 'Replace' : 'Add a photo'}
              <input type="file" className="sr-only" accept={ACCEPT} onChange={pickOne('avatarPath', 'avatar')} disabled={Boolean(uploading)} />
            </label>
            {avatar && <button type="button" className="sn-act" aria-label="Remove profile photo" onClick={() => clearOne('avatarPath')}>Remove</button>}
          </div>
          <p className="sn-hint">JPG, PNG or WebP, up to 5 MB each.</p>
        </section>

        <section className="sn-step">
          <h2 className="sn-step-h">About you</h2>
          <Field label="Name people will see" error={errors.displayName} htmlFor="sn-p-name">
            <input id="sn-p-name" onBlur={blur('displayName')} value={form.displayName} onChange={set('displayName')} maxLength={LIMITS.hostNameMax} autoComplete="name" />
          </Field>
          <Field label="In a line (optional)" error={errors.tagline} hint="Under your name: “Hatha and breathwork”, “Potter and teacher”." htmlFor="sn-p-tag">
            <input id="sn-p-tag" onBlur={blur('tagline')} value={form.tagline} onChange={set('tagline')} maxLength={LIMITS.taglineMax} />
          </Field>
          <Field label="About your work (optional)" hint="What you teach or hold, and how long you’ve been at it. A blank line starts a new paragraph." htmlFor="sn-p-bio">
            <textarea id="sn-p-bio" rows={6} value={form.bio} onChange={set('bio')} maxLength={LIMITS.bioMax} />
          </Field>
          <Field label="Website or Instagram (optional)" error={errors.link} htmlFor="sn-p-link">
            <input id="sn-p-link" onBlur={blur('link')} type="url" placeholder="https://" value={form.link} onChange={set('link')} maxLength={LIMITS.linkMax} />
          </Field>
          <Field label="Phone (optional — for us, never shown)" error={errors.phone} htmlFor="sn-p-phone">
            <input id="sn-p-phone" onBlur={blur('phone')} type="tel" value={form.phone} onChange={set('phone')} maxLength={LIMITS.hostPhoneMax} autoComplete="tel" />
          </Field>
        </section>

        <section className="sn-step">
          <h2 className="sn-step-h">Your space <span className="sn-step-note">Optional</span></h2>
          <p className="sn-hint">If you hold things at your own place, name it here. New events start there, and your profile shows where it is.</p>
          <div className="sn-grid2">
            <Field label="Place (optional)" error={errors.placeName} htmlFor="sn-p-place">
              <input id="sn-p-place" onBlur={blur('placeName')} value={form.placeName} onChange={set('placeName')} maxLength={LIMITS.placeNameMax} placeholder="Garden Shala" />
            </Field>
            <Field label="Address or area (optional)" htmlFor="sn-p-addr">
              <input id="sn-p-addr" value={form.placeAddress} onChange={set('placeAddress')} maxLength={LIMITS.placeAddressMax} placeholder="Near Certitude, Auroville" />
            </Field>
          </div>
          <span className="sn-label">Photos of your space and work · {form.galleryPaths.length} of {LIMITS.galleryMax}</span>
          <ul className="sn-pageed-gallery">
            {form.galleryPaths.map((path) => (
              <li key={path}>
                <img src={imageUrl(path)} alt="" loading="lazy" />
                <button type="button" className="sn-pageed-x" aria-label="Remove this photo" onClick={() => removeGallery(path)}>×</button>
              </li>
            ))}
            {room > 0 && (
              <li>
                <label className="sn-pageed-add">
                  <input type="file" className="sr-only" accept={ACCEPT} multiple onChange={addGallery} disabled={Boolean(uploading)} />
                  <span>{uploading === 'gallery' ? 'Uploading…' : '+ Add photos'}</span>
                </label>
              </li>
            )}
          </ul>
          {photoFailure && <p className="sn-failure" role="alert">{photoFailure}</p>}
        </section>

        {failure && <p className="sn-failure" role="alert">{failure}</p>}
        {/* On a phone this row is pinned to the bottom of the screen, out of the keyboard's way. */}
        <div className={`sn-pageed-save${typing ? ' kb-open' : ''}`}>
          <button type="submit" className="btn forest" disabled={busy}>{busy ? 'Saving…' : 'Save your profile'} </button>
          {saved && <span className="sn-pageed-saved" role="status">Saved. <Link to={`/sanctuary/hosts/${host.user_id}`}>Visit your profile</Link></span>}
        </div>
      </form>
    </div>
  );
}
