import Image from "next/image";

export function GreenLogo() {
  return (
    <Image
      src="/logo-olive-no-slogan.png"
      alt="Momento App"
      width={130}
      height={32}
      style={{ height: "32px", width: "auto" }}
      priority
    />
  );
}

export function GreenLogoSm() {
  return (
    <Image
      src="/logo-olive-no-slogan.png"
      alt="Momento App"
      width={100}
      height={26}
      style={{ height: "26px", width: "auto" }}
      priority
    />
  );
}

export function FooterLogo() {
  return (
    <Image
      src="/logo-champagne.png"
      alt="Momento App"
      width={120}
      height={30}
      style={{ height: "30px", width: "auto" }}
    />
  );
}

export function OliveLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo-olive-no-slogan.png"
      alt="Momento App"
      width={size * 4}
      height={size}
      style={{ height: `${size}px`, width: "auto" }}
      priority
    />
  );
}