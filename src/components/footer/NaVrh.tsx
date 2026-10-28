"use client";

/* „Na vrh" - jedno dugme umesto skrolovanja nazad kroz celu stranu (tamni footer: žuti krug sa tamnom strelicom). */
export default function NaVrh() {
  return (
    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group inline-flex items-center gap-3 text-[14px] font-medium text-white">
      Na vrh
      <span className="grid size-11 place-items-center rounded-full bg-brand text-on-brand transition duration-300 group-hover:-translate-y-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}
