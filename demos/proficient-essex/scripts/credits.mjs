// node --experimental-strip-types scripts/credits.mjs  → rewrites CREDITS.md from the registry
import { writeFileSync } from 'node:fs';
const { registry } = await import('../components/library/registry.ts');
const rows = registry.filter((e) => e.source !== 'custom' && !e.source.startsWith('custom'));
const md = `# Credits

Components are ported from free, public sources and re-skinned to the preset tokens. No paid 21st.dev API, Magic MCP or shadcn registry was used.
Where a 21st.dev component had no original repo, the code came from the public scrape at github.com/Deepender25/21st.dev-Component-Skill- (pinned commit 3de2165); see \`library-inbox/SOURCES.md\` for the exact raw URL and confidence per file.

| Component | Author | Licence | Source | Status |
|---|---|---|---|---|
${rows.map((e) => `| ${e.name} | ${e.author} | ${e.licence || 'not stated'} | ${e.source.split(' ')[0]} | ${e.status} |`).join('\n')}

Custom (Clientgateway): ${registry.filter((e) => e.source.startsWith('custom')).map((e) => e.name).join(', ')}.
The pour shader's metallic field is adapted from Clientgateway's own \`demos/gafflow/pour.js\`.

Images: see \`public/demo/CREDITS.md\` (Pexels licence; every photo is labelled "Example image").
Fonts: Clash Display, General Sans (Fontshare ITF Free Font Licence), Instrument Serif and Caveat (SIL OFL).
`;
writeFileSync(new URL('../CREDITS.md', import.meta.url), md);
console.log('CREDITS.md rows:', rows.length);
