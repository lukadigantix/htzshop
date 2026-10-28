"use client";

import { useEffect, useState } from "react";

/*
  Poruke u sredini gornje trake: jedna po jedna, na 4 s nova klizne odozdo (stara ode nagore).
  Na hover staje, da se može pročitati; „smanji pokrete" - smena bez klizanja (globals.css, .tb-poruka).
*/
export default function Poruke({ poruke }: { poruke: string[] }) {
  const [i, setI] = useState(0);
  const [stoji, setStoji] = useState(false);

  useEffect(() => {
    if (stoji || poruke.length < 2) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % poruke.length), 4000);
    return () => window.clearInterval(t);
  }, [stoji, poruke.length]);

  return (
    <p onMouseEnter={() => setStoji(true)} onMouseLeave={() => setStoji(false)} aria-live="off" className="relative h-6 overflow-hidden leading-6">
      <span key={i} className="tb-poruka flex items-center justify-center gap-2.5 whitespace-nowrap">
        <span className="size-1 rotate-45 bg-brand" aria-hidden />
        {poruke[i]}
        <span className="size-1 rotate-45 bg-brand" aria-hidden />
      </span>
    </p>
  );
}
