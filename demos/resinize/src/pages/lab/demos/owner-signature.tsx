import { OwnerSignature } from '@/components/library/owner-signature/OwnerSignature';
import sig from '@/components/library/owner-signature/sample-tom.json';
export default function Demo() { return <OwnerSignature name="Tom" sig={sig} line="Sample owner line (demo only)." role="Owner" />; }
