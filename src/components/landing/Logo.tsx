import Image from "next/image";

export function GreenLogo() {
  return (
    <Image
      src="/logo-olive-no-slogan.png"
      alt="Momento App"
      width={160}
      height={38}
      style={{ height: "38px", width: "auto" }}
      priority
    />
  );
}

export function FooterLogo() {
  return (
    <Image
      src="/logo-champagne.png"
      alt="Momento App"
      width={144}
      height={36}
      style={{ height: "36px", width: "auto" }}
    />
  );
}
