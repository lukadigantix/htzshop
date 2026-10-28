import Image from "next/image";
import Link from "next/link";

// HTZ Shop logo (štit + wordmark), SVG 1784×354. Svetla varijanta ima beli wordmark za tamnu podlogu.
// className može da prepiše visinu po breakpointu (npr. "h-5 md:h-8"), širina prati odnos.
export default function Logo({ light = false, height = 40, className = "" }: { light?: boolean; height?: number; className?: string }) {
  const width = Math.round(height * (1784 / 354));
  return (
    <Link href="/" aria-label="HTZ Shop - početna" className="inline-flex shrink-0">
      <Image src={light ? "/images/logo/htz-logo-white.svg" : "/images/logo/htz-logo.svg"} alt="HTZ Shop" width={width} height={height} priority className={`w-auto ${className}`} style={{ height: className ? undefined : height }} />
    </Link>
  );
}
