import { render } from './render.mjs';
import { SigHtml } from '../sig-runtime/SigHtml';
import './layer-build.css';

// layer-build: props { variant, colours, pattern?, label, stages? }. See render.mjs.
export function LayerBuild(props: Record<string, unknown>) {
  return <SigHtml html={render(props)} />;
}
