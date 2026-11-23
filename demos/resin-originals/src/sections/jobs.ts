// Dean's real jobs. Every still/clip is cut from his own Facebook reels (or his cover photo).
// Source URL per job is in content-inventory.md; captions only repeat what his posts say or what the footage shows.
export type Tag = 'Metallic' | 'Flake' | 'Quartz' | 'Commercial' | 'Home' | 'Garage';
export type Job = { slug: string; title: string; note: string; tags: Tag[]; src: string; still: string; clip?: string };

const FB = 'https://www.facebook.com/reel/';
const j = (slug: string, reel: string, title: string, note: string, tags: Tag[]): Job =>
  ({ slug, title, note, tags, src: FB + reel + '/', still: `/client/jobs/${slug}-v1.webp`, clip: `/client/jobs/${slug}-v1.mp4` });

export const JOBS: Job[] = [
  j('garage-red', '1746294663336612', 'Garage, black and red metallic', "Colours taken from the client's McLaren 720S.", ['Metallic', 'Garage']),
  j('reception', '2652333431876197', 'Reception, white and grey marble effect', "For an automotive technology manufacturer's UK site.", ['Commercial', 'Metallic']),
  j('garage-flake', '1776764213473424', 'Garage, flake with a track logo', "A logo of one of the owner's passions, set into the floor.", ['Flake', 'Garage']),
  j('home-cream', '1657863749299936', 'Home, cream metallic', 'High gloss, laid in a UK home.', ['Metallic', 'Home']),
  j('clinic-quartz', '1097325556221087', 'Eye clinic theatre, blue quartz', 'Seamless, with coving and upstands.', ['Quartz', 'Commercial']),
  j('luxury-bronze', '995389396926285', 'Luxury property, bronze metallic', 'A dark base with copper veins.', ['Metallic', 'Home']),
  { slug: 'kitchen-silver', title: 'Kitchen, silver metallic', note: 'The cover photo on our Facebook page.', tags: ['Metallic', 'Home'],
    src: 'https://www.facebook.com/photo/?fbid=113706091629994', still: '/client/jobs/kitchen-silver-v1.webp' },
  j('room-cream', '1365034302107066', 'Room, cream metallic', 'Designed with the client, then installed.', ['Metallic']),
  j('detail-pearl', '1628390941994156', 'Close up, pearl metallic', 'The detail you only see up close.', ['Metallic']),
];

export const FILTERS: ('All' | Tag)[] = ['All', 'Metallic', 'Flake', 'Quartz', 'Commercial', 'Home', 'Garage'];
