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
  const iconScale = 40 / 306;

  return (
    <span className="flex items-center gap-2" aria-label="CodeBox">
      <span className="relative block h-10 w-[42px] overflow-hidden" aria-hidden="true">
        <img
          alt=""
          className="absolute max-w-none select-none"
          draggable={false}
          src="/logo.png"
          style={{
            height: "auto",
            left: `${-331 * iconScale}px`,
            top: `${-315 * iconScale}px`,
            width: `${1536 * iconScale}px`
          }}
        />
      </span>
      <span className="text-[30px] font-black leading-none tracking-normal">
        <span className="text-[#071846]">Code</span><span className="text-[#7C6BFF]">Box</span>
      </span>
    </span>
  );
}
