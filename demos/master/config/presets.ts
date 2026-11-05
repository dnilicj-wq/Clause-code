// Visual presets. Components read ONLY these tokens (as CSS variables), never hard-coded colours.
export type Preset = {
  key: string;
  name: string;
  vibe: string;
  dark: boolean;
  bg: string; bg2: string; surface: string; line: string;
  ink: string; muted: string;
  accent: string; accentInk: string; accent2: string;
  metal: [string, string, string]; // liquid-metal ramp (dark, mid, highlight)
  resin: { base: string; metal: string }; // default pour colours for the hero
  concrete: string;
  display: string; body: string; serif: string;
  radius: string;
};

export const presets: Record<string, Preset> = {
  'obsidian-copper': {
    key: 'obsidian-copper', name: 'Obsidian Copper', vibe: 'luxury', dark: true,
    bg: '#0B0A09', bg2: '#141210', surface: '#1B1815', line: 'rgba(255,240,225,.10)',
    ink: '#F4EEE6', muted: '#A79C90',
    accent: '#D08A55', accentInk: '#140C06', accent2: '#F1C9A0',
    metal: ['#2A1A10', '#B8774A', '#FFE2C4'],
    resin: { base: '#120D0A', metal: '#C98A57' },
    concrete: '#8E8A84',
    display: '"Clash Display", system-ui, sans-serif', body: '"General Sans", system-ui, sans-serif', serif: '"Instrument Serif", Georgia, serif',
    radius: '22px',
  },
  'industrial-steel': {
    key: 'industrial-steel', name: 'Industrial Steel', vibe: 'industrial', dark: true,
    bg: '#0A0D10', bg2: '#11161B', surface: '#182028', line: 'rgba(210,230,255,.10)',
    ink: '#E9EEF3', muted: '#8D9AA7',
    accent: '#F5B400', accentInk: '#141000', accent2: '#FFE08A',
    metal: ['#151B22', '#7D8B99', '#EAF2FA'],
    resin: { base: '#1A2028', metal: '#9AA9B8' },
    concrete: '#83868A',
    display: '"Clash Display", system-ui, sans-serif', body: '"Satoshi", system-ui, sans-serif', serif: '"Instrument Serif", Georgia, serif',
    radius: '10px',
  },
  'luxury-metallic': {
    key: 'luxury-metallic', name: 'Luxury Metallic', vibe: 'luxury', dark: true,
    bg: '#07070A', bg2: '#0E0E14', surface: '#16161E', line: 'rgba(230,220,255,.10)',
    ink: '#F2EFF8', muted: '#9C97AB',
    accent: '#C9B6FF', accentInk: '#120D22', accent2: '#EDE6FF',
    metal: ['#17131F', '#8D7BC2', '#F4EEFF'],
    resin: { base: '#0C0A12', metal: '#A994E6' },
    concrete: '#8A8890',
    display: '"Clash Display", system-ui, sans-serif', body: '"General Sans", system-ui, sans-serif', serif: '"Instrument Serif", Georgia, serif',
    radius: '28px',
  },
  'clean-domestic': {
    key: 'clean-domestic', name: 'Clean Domestic', vibe: 'clean', dark: false,
    bg: '#F5F2ED', bg2: '#ECE7DF', surface: '#FFFFFF', line: 'rgba(30,25,20,.10)',
    ink: '#1C1915', muted: '#6E665C',
    accent: '#2F6B5A', accentInk: '#FFFFFF', accent2: '#9CC9B7',
    metal: ['#3A3F3C', '#9DA7A1', '#FFFFFF'],
    resin: { base: '#D9D4CC', metal: '#8FA59B' },
    concrete: '#9A958E',
    display: '"Clash Display", system-ui, sans-serif', body: '"General Sans", system-ui, sans-serif', serif: '"Instrument Serif", Georgia, serif',
    radius: '20px',
  },
  'microcement-stone': {
    key: 'microcement-stone', name: 'Microcement Stone', vibe: 'clean', dark: false,
    bg: '#EFEAE2', bg2: '#E4DDD2', surface: '#F8F5F0', line: 'rgba(40,32,24,.12)',
    ink: '#2A241E', muted: '#7A6F63',
    accent: '#8C6A4F', accentInk: '#FFFFFF', accent2: '#C9B39E',
    metal: ['#4A3E33', '#B5A390', '#FFF8EE'],
    resin: { base: '#CFC6B8', metal: '#A89580' },
    concrete: '#A39C92',
    display: '"Clash Display", system-ui, sans-serif', body: '"General Sans", system-ui, sans-serif', serif: '"Instrument Serif", Georgia, serif',
    radius: '16px',
  },
};

export const presetKeys = Object.keys(presets);

export function presetVars(p: Preset): Record<string, string> {
  return {
    '--bg': p.bg, '--bg2': p.bg2, '--surface': p.surface, '--line': p.line,
    '--ink': p.ink, '--muted': p.muted, '--accent': p.accent, '--accent-ink': p.accentInk, '--accent2': p.accent2,
    '--metal0': p.metal[0], '--metal1': p.metal[1], '--metal2': p.metal[2],
    '--font-display': p.display, '--font-body': p.body, '--font-serif': p.serif, '--radius': p.radius,
  };
}
