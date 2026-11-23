// Port of Looping Words with GSAP (Osmo / 21st.dev @osmosupply). The catalogue copy ships without its CSS;
// the CSS below is rebuilt from Osmo's published resource (same class names, em-based sizing, corner selector).
// Changes: index kept in a ref (StrictMode-safe), preset tokens, reduced motion = static first word, Osmo credit
// moved to CREDITS.md. Needs 4+ words (the loop trick appends the first item when 3 from the end).
import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

const CSS = `
.looping-words{height:2.7em;padding:0 .1em;line-height:.9;position:relative;font-family:var(--font-display);font-weight:600;letter-spacing:-.02em}
.looping-words__containers{width:100%;height:100%;position:relative;overflow:hidden}
.looping-words__list{text-align:center;white-space:nowrap;flex-flow:column;align-items:center;margin:0;padding:0;list-style:none;display:flex;position:relative}
.looping-words__p{margin:0;color:var(--ink)}
.looping-words__fade{pointer-events:none;position:absolute;inset:0;background-image:linear-gradient(180deg,var(--lw-bg,var(--bg)) 5%,transparent 40%,transparent 60%,var(--lw-bg,var(--bg)) 95%)}
.looping-words__selector{pointer-events:none;width:100%;height:.9em;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.looping-words__edge{position:absolute;top:0;left:0;width:.125em;height:.125em;border-top:.035em solid var(--accent);border-left:.035em solid var(--accent)}
.looping-words__edge.is--2{left:auto;right:0;transform:rotate(90deg)}
.looping-words__edge.is--3{top:auto;bottom:0;left:auto;right:0;transform:rotate(180deg)}
.looping-words__edge.is--4{top:auto;bottom:0;transform:rotate(270deg)}
`;

export function LoopingWords({ words, className, style }: { words: string[]; className?: string; style?: React.CSSProperties }) {
  const wordListRef = useRef<HTMLUListElement>(null);
  const edgeElementRef = useRef<HTMLDivElement>(null);
  const idx = useRef(0);
  const totalWords = words.length;
  const wordHeight = 100 / totalWords;

  const updateEdgeWidth = useCallback(() => {
    const wordList = wordListRef.current; const edge = edgeElementRef.current;
    if (!wordList || !edge) return;
    const centerWord = wordList.children[(idx.current + 1) % totalWords] as HTMLLIElement;
    if (centerWord) {
      const pct = (centerWord.getBoundingClientRect().width / wordList.getBoundingClientRect().width) * 100;
      gsap.to(edge, { width: `${pct}%`, duration: 0.5, ease: 'expo.out' });
    }
  }, [totalWords]);

  const moveWords = useCallback(() => {
    const wordList = wordListRef.current; if (!wordList) return;
    idx.current++;
    gsap.to(wordList, {
      yPercent: -wordHeight * idx.current, duration: 1.2, ease: 'elastic.out(1, 0.85)', onStart: updateEdgeWidth,
      onComplete: () => {
        if (idx.current >= totalWords - 3) {
          wordList.appendChild(wordList.children[0]);
          idx.current--;
          gsap.set(wordList, { yPercent: -wordHeight * idx.current });
        }
      },
    });
  }, [wordHeight, updateEdgeWidth, totalWords]);

  useEffect(() => {
    updateEdgeWidth();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tl = gsap.timeline({ repeat: -1, delay: 1 });
    tl.call(moveWords).to({}, { duration: 2 });
    return () => { tl.kill(); };
  }, [moveWords, updateEdgeWidth]);

  return (
    <div className={className} style={style}>
      <style>{CSS}</style>
      <div className="looping-words">
        <div className="looping-words__containers">
          <ul className="looping-words__list" ref={wordListRef}>
            {words.map((w, i) => <li key={i} className="looping-words__list"><p className="looping-words__p">{w}</p></li>)}
          </ul>
        </div>
        <div className="looping-words__fade" />
        <div className="looping-words__selector" ref={edgeElementRef}>
          <div className="looping-words__edge" /><div className="looping-words__edge is--2" /><div className="looping-words__edge is--3" /><div className="looping-words__edge is--4" />
        </div>
      </div>
    </div>
  );
}
