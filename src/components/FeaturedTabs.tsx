"use client";

import { useState } from "react";
import Link from "next/link";
import type { IzdvojenTab } from "@/lib/katalog";
import Kartica from "./katalog/Kartica";

export default function FeaturedTabs({ tabs }: { tabs: IzdvojenTab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <section className="container-site py-16 md:py-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Izdvajamo iz ponude</p>
          <h2 className="h-section mt-3">Oprema koju majstori stalno poručuju</h2>
        </div>
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"><div className="inline-flex w-max rounded-full border border-subtle bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-[14px] font-medium transition ${t.key === active ? "bg-primary text-white" : "text-secondary hover:text-primary"}`}
            >
              {t.label}
            </button>
          ))}
        </div></div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-6 xl:grid-cols-4 xl:gap-8">
        {tab.items.map((p) => (
          <Kartica key={p.slug} p={p} />
        ))}
      </div>

      <div className="mt-10 flex justify-center md:mt-12">
        <Link href="/prodavnica/" className="btn-secondary">
          Prikaži sve proizvode
        </Link>
      </div>
    </section>
  );
}
