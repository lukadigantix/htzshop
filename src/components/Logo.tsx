import Image from "next/image";
import Link from "next/link";

// Pravi HTZ Shop logo, vektorizovan iz originala (public/images/logo/htz-logo-original-1294.png).
export default function Logo({ light = false, height = 40 }: { light?: boolean; height?: number }) {
  const width = Math.round(height * (1294 / 674));
  return (
    <Link href="/" aria-label="HTZ Shop - početna" className="inline-flex shrink-0">
      <Image src={light ? "/images/logo/htz-logo-white.svg" : "/images/logo/htz-logo.svg"} alt="HTZ Shop" width={width} height={height} priority />
    </Link>
  );
}
