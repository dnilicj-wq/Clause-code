import { render } from './render.mjs';
import { SigHtml } from '../sig-runtime/SigHtml';
import './proof-tiles.css';

// proof-tiles: props { eyebrow?, heading?, lead?, items: 6 × { illo, title, text?, props? } }. Only promises the client makes.
export function ProofTiles(props: Record<string, unknown>) {
  return <SigHtml html={render(props)} />;
}
