import { render } from './render.mjs';
import { SigHtml } from '../sig-runtime/SigHtml';
import './owner-signature.css';

// owner-signature: props { name, sig, line?, role? }; sig = signaturePaths(name, font) from signature-path.mjs at build time (Node). Confirmed first names only.
export function OwnerSignature(props: Record<string, unknown>) {
  return <SigHtml html={render(props)} />;
}
