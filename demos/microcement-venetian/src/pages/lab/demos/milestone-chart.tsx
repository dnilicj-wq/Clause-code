import { MilestoneChart } from '@/components/library/milestone-chart/MilestoneChart';

// General epoxy cure stages; exact times depend on the product and the temperature (matches the trade-pack FAQ).
const stages = [
  { at: 0, label: 'Poured', detail: 'Topcoat goes down. Keep the door shut and the dust out.' },
  { at: 1, label: 'Walk on it', detail: 'Usually light foot traffic from the next day.' },
  { at: 3, label: 'Light use', detail: 'Bikes, boxes and furniture back in, gently.' },
  { at: 5, label: 'Car back in', detail: 'Cars usually go back on after a few days.' },
  { at: 7, label: 'Full cure', detail: 'Full chemical resistance. Spills wipe straight off.' },
];
export default function MilestoneDemo() {
  return (
    <MilestoneChart title="From pour to parked car" milestones={stages} max={7} unit={(n) => (n === 0 ? 'Day 0' : `Day ${n}`)}
      caption="Typical, varies by product and temperature. We confirm the cure time for your floor before we start." />
  );
}
