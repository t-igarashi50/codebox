import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08131a",
        bench: "#f7f8fb",
        bolt: "#f97316",
        blueprint: "#2563eb"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(8, 19, 26, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
