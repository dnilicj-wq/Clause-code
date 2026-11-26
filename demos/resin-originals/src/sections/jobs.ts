// Dean's real jobs. Facebook items: stills/clips cut from his own reels (source URL per job in content-inventory.md).
// Dean items: his own photos/clips sent on WhatsApp 23-24 Nov 2026 (tools/dean-media.py). Titles only say what the photo shows;
// no locations or job details, because he gave none.
export type Tag = 'Metallic' | 'Flake' | 'Quartz' | 'Commercial' | 'Home' | 'Garage';
export type Job = { slug: string; title: string; note: string; tags: Tag[]; src?: string; still: string; clip?: string };

const FB = 'https://www.facebook.com/reel/';
const j = (slug: string, reel: string, title: string, note: string, tags: Tag[]): Job =>
  ({ slug, title, note, tags, src: FB + reel + '/', still: `/client/jobs/${slug}-v1.webp`, clip: `/client/jobs/${slug}-v1.mp4` });

const D = '/client/dean/';
const photo = (slug: string, title: string, tags: Tag[]): Job => ({ slug, title, note: "From Dean's own photos.", tags, still: `${D}${slug}-640.webp` });
const clip = (slug: string, title: string, tags: Tag[]): Job => ({ slug, title, note: "From Dean's own videos.", tags, still: `${D}${slug}.webp`, clip: `${D}${slug}.mp4` });

export const JOBS: Job[] = [
  clip('blue-led', 'Blue metallic under LED lighting', ['Metallic']),
  photo('blue-games', 'Games room, blue metallic', ['Metallic', 'Home']),
  photo('pearl-kitchen', 'Open-plan kitchen, pearl metallic', ['Metallic', 'Home']),
  clip('flake-garage', 'Garage, grey flake', ['Flake', 'Garage']),
  photo('vein-dining', 'Dining area, white with a black vein', ['Home']),
  photo('dark-bronze', 'Dark bronze metallic', ['Metallic']),
  clip('white-metallic', 'White metallic', ['Metallic']),
  photo('marble-kitchen', 'Kitchen, grey and white marble effect', ['Metallic', 'Home']),
  photo('silver-room', 'Silver metallic', ['Metallic', 'Home']),
  photo('red-close', 'Red metallic, close up', ['Metallic']),
  j('home-cream', '1657863749299936', 'Home, cream metallic', 'Laid in a UK home.', ['Metallic', 'Home']),
  j('garage-red', '1746294663336612', 'Garage, black and red metallic', "Colours taken from the client's McLaren 720S.", ['Metallic', 'Garage']),
  j('reception', '2652333431876197', 'Reception, white and grey marble effect', "For an automotive technology manufacturer's UK site.", ['Commercial', 'Metallic']),
  j('garage-flake', '1776764213473424', 'Garage, flake with a track logo', "A logo of one of the owner's passions, set into the floor.", ['Flake', 'Garage']),
  j('clinic-quartz', '1097325556221087', 'Eye clinic theatre, blue quartz', 'Seamless, with coving and upstands.', ['Quartz', 'Commercial']),
  j('luxury-bronze', '995389396926285', 'Luxury property, custom metallic', 'No two floors are ever identical.', ['Metallic', 'Home']),
  { slug: 'kitchen-silver', title: 'Kitchen, silver metallic', note: 'High-gloss finish.', tags: ['Metallic', 'Home'],
    src: 'https://www.facebook.com/photo/?fbid=113706091629994', still: '/client/jobs/kitchen-silver-v1.webp' },
  j('room-cream', '1365034302107066', 'Room, cream metallic', 'Designed with the client, then installed.', ['Metallic']),
  j('detail-pearl', '1628390941994156', 'Close up, pearl metallic', 'The detail you only see up close.', ['Metallic']),
];

export const FILTERS: ('All' | Tag)[] = ['All', 'Metallic', 'Flake', 'Quartz', 'Commercial', 'Home', 'Garage'];

// Gallery: the rest of Dean's keepers (WhatsApp photos), not repeated in the Floors grid.
export const GALLERY: { slug: string; alt: string }[] = [
  { slug: 'blue-cinema', alt: 'Blue metallic epoxy floor in a cinema room' },
  { slug: 'blue-bar', alt: 'Blue metallic epoxy floor in a room with a bar' },
  { slug: 'blue-bathroom', alt: 'Blue metallic epoxy floor in a bathroom' },
  { slug: 'pearl-kitchen-2', alt: 'Pearl metallic epoxy floor in an open-plan kitchen' },
  { slug: 'vein-hall', alt: 'White epoxy floor with a black vein in a hallway by a staircase' },
  { slug: 'silver-hall', alt: 'Silver metallic epoxy floor in a hallway' },
  { slug: 'silver-room-2', alt: 'Silver metallic epoxy floor in a room' },
  { slug: 'silver-toilet', alt: 'Silver metallic epoxy floor in a toilet' },
  { slug: 'grey-large', alt: 'Grey metallic epoxy floor in a large room' },
  { slug: 'grey-large-2', alt: 'Grey metallic epoxy floor in a large room, other end' },
  { slug: 'marble-kitchen-2', alt: 'Grey and white marble effect epoxy floor in a kitchen' },
  { slug: 'speckled-room', alt: 'Grey speckled epoxy floor in an empty room' }, // TODO(Dan): flake or quartz? Dean to confirm
];
