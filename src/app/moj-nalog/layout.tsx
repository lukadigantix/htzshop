import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { BocnaKolona, PomocDole } from "@/components/nalog/NalogOkvir";
import { TrakaMenija } from "@/components/nalog/Meni";

export const metadata: Metadata = { title: "Moj nalog - HTZ Shop", robots: { index: false } };

/**
 * Okvir svih strana naloga: leva tamna kolona (računar) ili traka odeljaka (telefon), sadržaj desno. Kolona ostaje
 * na mestu dok se menjaju strane; učitava se samo sadržaj (loading.tsx). Bez prijave proxy.ts vodi na /prijava.
 */
export default function NalogLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1">
      <div className="container-site pb-16 pt-6 md:pb-24 md:pt-10 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-12">
        <aside className="hidden lg:block">
          <Suspense fallback={<div aria-hidden className="h-[560px] animate-pulse rounded-[6px] bg-primary/90" />}>
            <BocnaKolona />
          </Suspense>
        </aside>
        <div className="min-w-0">
          <TrakaMenija />
          {children}
          <PomocDole />
        </div>
      </div>
    </main>
  );
}
