// Finish colourways, shared by the 3D floor shader and the configurator UI
// (the UI must work before, or without, the 3D scene).
export const FINISHES = {
  flake: {
    graphite: { name: 'Graphite', colors: ['#3a3c40', '#16181b', '#62666c', '#c9ccce'] },
    tidal: { name: 'Tidal', colors: ['#2a3442', '#1a2c45', '#7d8d9e', '#d9dee3'] },
    sandstone: { name: 'Sandstone', colors: ['#6e6152', '#3d362f', '#a8987f', '#e6dfd2'] },
  },
  metallic: {
    crimson: { name: 'Crimson', colors: ['#2a0811', '#ece6e3', '#050405', '#c91e48'] },
    pewter: { name: 'Pewter', colors: ['#55595f', '#b4b9bf', '#26292d', '#8a9097'] },
    midnight: { name: 'Midnight', colors: ['#141a2e', '#3f63b8', '#070910', '#25346a'] },
  },
  solid: {
    slate: { name: 'Slate', colors: ['#4b5058', '#4b5058', '#4b5058', '#4b5058'] },
    fog: { name: 'Fog', colors: ['#a9adb2', '#a9adb2', '#a9adb2', '#a9adb2'] },
    onyx: { name: 'Onyx', colors: ['#1d1e21', '#1d1e21', '#1d1e21', '#1d1e21'] },
  },
};
