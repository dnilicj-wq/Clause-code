import { Booking, Planner } from './Forms';
export default function FormsBundle({ which }: { which: 'booking' | 'planner' }) {
  return which === 'booking' ? <Booking /> : <Planner />;
}
