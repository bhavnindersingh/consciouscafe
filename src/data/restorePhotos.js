/**
 * Photos for the two rooms at the top of /sanctuary/restore. While a room has
 * none it shows as a block of colour (cold slate, ember) with its word on it.
 *
 * To add one: put the photo in public/images/sanctuary/ and set its path here,
 * e.g. ice_bath: 'images/sanctuary/ice-bath-1.jpg'. It is cover-cropped and
 * darkened at the bottom so the words stay readable. A replaced photo needs a
 * NEW filename — /images/* is cached for a year (netlify.toml).
 */
export const RESTORE_PHOTOS = {
  ice_bath: null,
  sauna: null,
};
