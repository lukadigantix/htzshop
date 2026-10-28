/*
  Razdvajač u redu teksta umesto tačke „·" (sitna je i sedi nisko): tanka uspravna crta visine slova,
  poravnata po sredini teksta, u boji teksta sa manjom providnošću. Čitač ekrana čuje zarez.
*/
export default function Razdvajac({ className = "" }: { className?: string }) {
  return (
    <>
      <span className="sr-only">, </span>
      <span aria-hidden className={`mx-2 inline-block h-[0.8em] w-px shrink-0 bg-current align-[-0.06em] opacity-35 ${className}`} />
    </>
  );
}
