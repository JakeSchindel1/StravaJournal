import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EF",
        ink: "#161615",
        stone: "#CEC7BB"
      },
      boxShadow: {
        journal: "0 40px 90px -42px rgba(18, 18, 16, 0.42)",
        float: "0 25px 65px -45px rgba(15, 15, 14, 0.5)"
      }
    }
  },
  plugins: []
};

export default config;
