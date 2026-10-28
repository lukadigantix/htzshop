"use client";

import { useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, useMap } from "@/components/ui/map";
import { contact } from "@/data/site";

/*
  Mapa radnje (mapcn, MapLibre + OpenFreeMap podloga, bez API ključa). Sajt je samo svetao, pa je tema fiksna.
  cooperativeGestures: točkić i jedan prst skroluju stranicu, zum je Ctrl/⌘ + točkić ili dva prsta.
  Na desktopu preko leve strane mape stoji kartica radnje, pa se centar pomera udesno (padding) da marker ostane vidljiv.
*/
const ŠTIT =
  "M125,0h46l125,63v133c0,66-66,116-148,158C66,312,0,262,0,196V63L125,0ZM130,26h31l6,9-6,79h16l14-71c36,18,59,50,67,82h7c6,0,9,3,9,9v5H23v-5c0-6,3-9,9-9h7c8-32,31-64,67-82l14,71h16l-12-79,6-9ZM56,157h44v42h96v-42h44v104l-44,35v-58h-96v58l-44-35v-104Z";

/**
 * Podloga je OpenFreeMap „positron" umesto mapcn podrazumevane Carto: Carto pločice imaju samo lokalni naziv (ćirilica),
 * a ove imaju i `name:sr-Latn`. Stil piše „latinica + ćirilica" - ostavljamo samo srpsku latinicu (sa dijakriticima).
 * Slojevi bez naziva (brojevi puteva u štitovima) se ne diraju.
 */
const PODLOGA = "https://tiles.openfreemap.org/styles/positron";
function Latinica() {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded) return;
    for (const layer of map.getStyle().layers ?? []) {
      if (layer.type !== "symbol" || !JSON.stringify(map.getLayoutProperty(layer.id, "text-field") ?? "").includes("name")) continue;
      map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:sr-Latn"], ["get", "name:latin"], ["get", "name"]]);
    }
  }, [map, isLoaded]);
  return null;
}

/** Prostor koji zauzima kartica radnje preko mape (od 1024 px). */
function MestoZaKarticu({ levo }: { levo: number }) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const primeni = () => map.easeTo({ padding: { left: mq.matches ? levo : 0, top: 0, right: 0, bottom: 0 }, duration: 0 });
    primeni();
    mq.addEventListener("change", primeni);
    return () => mq.removeEventListener("change", primeni);
  }, [map, isLoaded, levo]);
  return null;
}

/** `levo`: širina kartice preko leve strane mape od 1024 px (Kontakt); 0 kad kartice nema (O nama). */
export default function Mapa({ name, levo = 440 }: { name: string; levo?: number }) {
  const { lat, lng } = contact.coords;
  return (
    <Map theme="light" styles={{ light: PODLOGA }} center={[lng, lat]} zoom={15.5} cooperativeGestures attributionControl={{ compact: true }}>
      <Latinica />
      {levo > 0 && <MestoZaKarticu levo={levo} />}
      <MapMarker longitude={lng} latitude={lat}>
        <MarkerContent>
          <span className="relative grid size-14 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 [animation-duration:2.4s]" />
            <span className="relative grid size-14 place-items-center rounded-full bg-brand shadow-[0_10px_24px_-6px_rgba(32,33,36,0.6)] ring-4 ring-white">
              <svg viewBox="0 0 296 354" className="h-7 w-auto" aria-hidden>
                <path fill="#202124" fillRule="evenodd" d={ŠTIT} />
              </svg>
            </span>
          </span>
          <MarkerLabel position="bottom" className="mt-2 rounded-full bg-primary px-3 py-1 text-[12px] text-white shadow-sm">
            {name}
          </MarkerLabel>
        </MarkerContent>
      </MapMarker>
      <MapControls position="bottom-right" showZoom showFullscreen />
    </Map>
  );
}
