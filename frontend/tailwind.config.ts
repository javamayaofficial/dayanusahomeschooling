import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      navy: { DEFAULT:"#0B2447",50:"#EAF0F8",100:"#C7D6EC",600:"#123A6B",800:"#0B2447",900:"#071834" },
      gold: { DEFAULT:"#E0A73E",50:"#FBF3E3",400:"#E9B85C",600:"#C0841F",700:"#9C6A16" },
    },
    fontFamily: { sans: ["var(--font-jakarta)","system-ui","sans-serif"] },
    borderRadius: { xl2: "1.25rem" },
  }},
  plugins: [],
};
export default config;
