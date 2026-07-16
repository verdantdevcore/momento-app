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

/**
 * The logo for surfaces using `.chrome-surface`.
 *
 * That chrome is olive in light mode — the same olive as the logo itself — so
 * the olive mark would disappear into it. Both marks are rendered and CSS
 * shows one (see .chrome-logo--* in globals.css) rather than branching on
 * useTheme(), because the theme provider defaults to dark on the server and
 * only applies the stored theme in an effect, which would flash the wrong
 * mark on first paint.
 */
export function ChromeLogo({ height = 32 }: { height?: number }) {
  const style = { height: `${height}px`, width: "auto" } as const;
  return (
    <>
      <Image
        className="chrome-logo--dark"
        src="/logo-olive-no-slogan.png"
        alt="Momento App"
        width={height * 4}
        height={height}
        style={style}
        priority
      />
      <Image
        className="chrome-logo--light"
        src="/logo-champagne.png"
        alt="Momento App"
        width={height * 4}
        height={height}
        style={style}
        priority
      />
    </>
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