import { LayerBuild } from '@/components/library/layer-build/LayerBuild';
const V = ['block', 'resin', 'tarmac', 'sandstone', 'polished-concrete', 'microcement', 'epoxy'];
export default function LayerBuildDemo() {
  return <div className="grid gap-4 sm:grid-cols-2">{V.map((v) => <div key={v} className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--line)' }}><LayerBuild variant={v} id={'demo-' + v} /></div>)}</div>;
}
