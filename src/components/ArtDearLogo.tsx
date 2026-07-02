import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const LOGO_VERSION = "20260702";
export const LOGO_SRC = `/images/logo-light.png?v=${LOGO_VERSION}`;
export const LOGO_DIMENSIONS = { width: 900, height: 225 } as const;
export const HEADER_LOGO_HEIGHT = 54;

type ArtDearLogoProps = {
  height?: number;
  href?: string;
  className?: string;
  priority?: boolean;
};

export function ArtDearLogo({
  height = HEADER_LOGO_HEIGHT,
  href = "/",
  className,
  priority = false,
}: ArtDearLogoProps) {
  const logoWidth = Math.round((LOGO_DIMENSIONS.width / LOGO_DIMENSIONS.height) * height);

  return (
    <Link href={href} className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={LOGO_SRC}
        alt="ART DEER"
        width={logoWidth}
        height={height}
        priority={priority}
        unoptimized
        className="block object-contain object-left"
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
