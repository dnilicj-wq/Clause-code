import { render } from './render.mjs';
import { SigHtml } from '../sig-runtime/SigHtml';
import './benefit-illustrations.css';

// benefit-illustrations: props { eyebrow?, heading?, lead?, items: [{ illo, title, text, props? }] }.
export function BenefitIllustrations(props: Record<string, unknown>) {
  return <SigHtml html={render(props)} />;
}
