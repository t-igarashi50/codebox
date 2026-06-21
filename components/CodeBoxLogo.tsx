type CodeBoxLogoProps = {
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: 40,
  md: 92,
  lg: 110
};

export function CodeBoxLogo({ size = "md" }: CodeBoxLogoProps) {
  const height = sizeClass[size];
  const scale = height / 64;

  return (
    <span
      aria-label="CodeBox"
      className="relative block overflow-hidden"
      role="img"
      style={{ height: `${height}px`, width: `${300 * scale}px` }}
    >
      <img
        alt=""
        className="absolute max-w-none select-none"
        draggable={false}
        src="/logo.png"
        style={{
          height: "auto",
          left: `${-68 * scale}px`,
          top: `${-67 * scale}px`,
          width: `${320 * scale}px`
        }}
      />
    </span>
  );
}

export function CodeBoxWordmark() {
  const iconScale = 40 / 64;
  const textScale = 46 / 64;

  return (
    <span className="flex items-center gap-1" aria-label="CodeBox" role="img">
      <span className="relative block h-10 w-[64px] overflow-hidden">
        <img
          alt=""
          className="absolute max-w-none select-none"
          draggable={false}
          src="/logo.png"
          style={{
            height: "auto",
            left: `${-68 * iconScale}px`,
            top: `${-67 * iconScale}px`,
            width: `${320 * iconScale}px`
          }}
        />
      </span>
      <span className="relative block h-[44px] w-[142px] overflow-hidden">
        <img
          alt=""
          className="absolute max-w-none select-none"
          draggable={false}
          src="/logo.png"
          style={{
            height: "auto",
            left: `${-160 * textScale}px`,
            top: `${-68 * textScale}px`,
            width: `${320 * textScale}px`
          }}
        />
      </span>
    </span>
  );
}
