import React from 'react';

/**
 * Marks a dish that is still showing its POS upload instead of a curated photo.
 *
 * `hasLocalImage` is false when no `imageMap.js` entry backs the dish, so the
 * picture on screen is the 600px POS thumbnail — fine on a POS tile, soft
 * anywhere this site puts it. The badge makes that visible instead of leaving a
 * quietly blurry card nobody notices: `npm run check:images` lists the dishes,
 * this is the same fact on the page itself.
 *
 * Renders nothing when the dish has its proper photo, so callers can drop it in
 * unconditionally.
 */
const PhotoPending = ({ hasPhoto, className = '' }) => {
  if (hasPhoto) return null;
  return (
    <span className={`photo-pending ${className}`.trim()} title="Awaiting a proper photo — showing the low-resolution POS upload">
      <span aria-hidden="true">⚠</span> Photo pending
    </span>
  );
};

export default PhotoPending;
