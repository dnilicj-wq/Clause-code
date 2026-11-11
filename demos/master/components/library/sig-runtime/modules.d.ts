// Types for the plain-JS signature modules (shared with the static generator, so no TS there).
declare module '*/sig-runtime.js' { export function initSig(root?: ParentNode): () => void; }
declare module '*/illos.mjs' { export const ILLOS: Record<string, (p: Record<string, unknown>) => string>; export function illo(key: string, props?: Record<string, unknown>): string; }
declare module '*/render.mjs' { export function render(props: Record<string, unknown>): string; export const DEFAULTS: Record<string, unknown>; export const STAGES: Record<string, string[]>; export const NEUTRAL_STEPS: { title: string; text: string }[]; }
