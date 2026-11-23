import { useEffect } from 'react';
export default function NotFound() {
  useEffect(() => { document.title = 'Page not found · AGD Venetian Plastering'; }, []);
  return (
    <main className="nf">
      <div>
        <h1 className="h2">This wall’s still bare.</h1>
        <p className="lede">The page you wanted isn’t here.</p>
        <a className="btn btn-berry" href="/">Back to the home page</a>
      </div>
    </main>
  );
}
