const env = import.meta.env
const longitude = env.VITE_INITIAL_VIEW_LONGITUDE
const latitude = env.VITE_INITIAL_VIEW_LATITUDE
const zoom = env.VITE_INITIAL_VIEW_ZOOM
const pitch = env.VITE_INITIAL_VIEW_PITCH
// TODO: Add to final readme env var table
export default {
  MapInitialViewState: {
    longitude: longitude ?? 0,
    latitude: latitude ?? 0,
    zoom: zoom ?? 0,
    pitch: pitch ?? 60,
  },
};
