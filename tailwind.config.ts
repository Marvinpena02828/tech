import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      // Default fonts
      sans: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "sans-serif",
      ],
      display: ["Poppins", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],

      // Custom fonts from public/fonts
      arial: ["Arial", "sans-serif"],
      "arial-bold": ["Arial_bold", "sans-serif"],
      mukta: ["Mukta Mahee", "sans-serif"],
      myriad: ["MyriadPro", "sans-serif"],
      "myriad-condensed": ["MyriadPro Condensed", "sans-serif"],
      neuropol: ["Neuropol", "sans-serif"],
      play: ["Play", "sans-serif"],
      poppins: ["Poppins", "sans-serif"],
      metropolis: ["Metropolis", "sans-serif"],
      Metropolis_medium: ["Metropolis_medium", "sans-serif"],
      "sf-pro": ["SF Pro Display", "sans-serif"],
    },
    extend: {
      height: {
        "28rem": "28rem",
        "32rem": "32rem",
      },
      minHeight: {
        "28rem": "28rem",
        "32rem": "32rem",
      },
      keyframes: {
        slideInTop: {
          from: { opacity: "0", transform: "translateY(-30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        zoomInFade: {
          from: { opacity: "0", transform: "scale(0.95) translateY(20px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleInCenter: {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "header-entrance":
          "slideInTop 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "header-logo":
          "slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards",
        "header-nav":
          "slideInTop 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
        "header-icons":
          "slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
        "hero-entrance":
          "zoomInFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "hero-content": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "section-entrance":
          "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "section-item": "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "icon-entrance":
          "scaleInCenter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideInRight: "slideInRight 0.3s ease-out forwards",
      },
    },

    colors: {
      "primary-blue": "var(--primary-blue)",
    },
  },
  plugins: [],
};

export default config;
