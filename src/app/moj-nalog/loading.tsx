/** Kostur sadržaja naloga dok stižu porudžbine i adrese; leva kolona i traka odeljaka ostaju na mestu. */
export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Učitavanje…
      </span>
      <div aria-hidden className="h-9 w-32 animate-pulse rounded-full bg-surface" />
      <div aria-hidden className="mt-5 h-11 w-80 max-w-full animate-pulse rounded-[4px] bg-surface" />
      <div aria-hidden className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-[6px] bg-primary/85 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-[6px] bg-surface" />
        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-[6px] bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
