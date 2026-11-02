// Finish colourways, shared by the 3D floor shader and the configurator UI
// (the UI must work before, or without, the 3D scene).
export const FINISHES = {
  flake: {
    graphite: { name: 'Graphite', colors: ['#3a3c40', '#16181b', '#62666c', '#c9ccce'] },
    tidal: { name: 'Tidal', colors: ['#2a3442', '#1a2c45', '#7d8d9e', '#d9dee3'] },
    sandstone: { name: 'Sandstone', colors: ['#6e6152', '#3d362f', '#a8987f', '#e6dfd2'] },
  },
  metallic: {
    midnight: { name: 'Midnight', colors: ['#06173a', '#1f74e8', '#030a1c', '#0d4c8a'] },
    pewter: { name: 'Pewter', colors: ['#55595f', '#b4b9bf', '#26292d', '#8a9097'] },
    copper: { name: 'Copper', colors: ['#3d2318', '#b8724a', '#1c110c', '#7a4329'] },
  },
  solid: {
    slate: { name: 'Slate', colors: ['#4b5058', '#4b5058', '#4b5058', '#4b5058'] },
    fog: { name: 'Fog', colors: ['#a9adb2', '#a9adb2', '#a9adb2', '#a9adb2'] },
    onyx: { name: 'Onyx', colors: ['#1d1e21', '#1d1e21', '#1d1e21', '#1d1e21'] },
  },
};
