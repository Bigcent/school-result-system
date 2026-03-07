export const THEMES = {
    royal: {
      name: "Royal Blue",
      primary: "#1B3A6B",
      secondary: "#2B5EA7",
      accent: "#4A90D9",
      light: "#D6E4F0",
      lightest: "#EBF2FA",
    },
    navy: {
      name: "Navy",
      primary: "#0A1929",
      secondary: "#1A3A5C",
      accent: "#2E6B9E",
      light: "#C8DDF0",
      lightest: "#E8F0F8",
    },
    sky: {
      name: "Sky Blue",
      primary: "#0C4A6E",
      secondary: "#0369A1",
      accent: "#38BDF8",
      light: "#BAE6FD",
      lightest: "#E0F2FE",
    },
    cobalt: {
      name: "Cobalt",
      primary: "#1E3A5F",
      secondary: "#2563EB",
      accent: "#60A5FA",
      light: "#BFDBFE",
      lightest: "#EFF6FF",
    },
    teal: {
      name: "Teal Blue",
      primary: "#134E4A",
      secondary: "#0F766E",
      accent: "#2DD4BF",
      light: "#CCFBF1",
      lightest: "#F0FDFA",
    },
    slate: {
      name: "Slate Blue",
      primary: "#1E293B",
      secondary: "#334155",
      accent: "#64748B",
      light: "#CBD5E1",
      lightest: "#F1F5F9",
    },
    forest: {
      name: "Forest Green",
      primary: "#1B4332",
      secondary: "#2D6A4F",
      accent: "#52B788",
      light: "#D8F3DC",
      lightest: "#F0FFF4",
    },
    maroon: {
      name: "Maroon",
      primary: "#4A1525",
      secondary: "#7B2D3F",
      accent: "#C2506A",
      light: "#F5D0D8",
      lightest: "#FDF2F4",
    },
    purple: {
      name: "Purple",
      primary: "#2E1065",
      secondary: "#5B21B6",
      accent: "#8B5CF6",
      light: "#DDD6FE",
      lightest: "#F5F3FF",
    },
  };
  
  export function getTheme(themeId) {
    return THEMES[themeId] || THEMES.royal;
  }