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
  return (
    <span className="flex items-center">
      <CodeBoxLogo size="sm" />
    </span>
  );
}
