import { render } from './render.mjs';
import { SigHtml } from '../sig-runtime/SigHtml';
import './guarantee-stack.css';

// guarantee-stack: props { eyebrow?, heading?, items: [{ title, text }] }. Renders nothing with fewer than 2 real promises.
export function GuaranteeStack(props: Record<string, unknown>) {
  return <SigHtml html={render(props)} />;
}
