import { render } from './render.mjs';
import { SigHtml } from '../sig-runtime/SigHtml';
import './step-rail.css';

// step-rail: props { eyebrow?, heading, lead?, steps: [{ title, text }] }. Client's own process only.
export function StepRail(props: Record<string, unknown>) {
  return <SigHtml html={render(props)} />;
}
