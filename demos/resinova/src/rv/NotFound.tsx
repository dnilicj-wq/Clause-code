import { Wordmark } from './Home';

export default function NotFound() {
  return (
    <main className="nf">
      <Wordmark w={220} />
      <h1 className="h2">This surface <em>hasn’t been poured yet.</em></h1>
      <a className="btn btn-gold" href="/">Back to the home page</a>
    </main>
  );
}
