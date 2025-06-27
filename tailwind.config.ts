
import type { Config } from "tailwindcss";
import { themeConfig } from "./src/config/tailwind/theme";
import { animationsConfig } from "./src/config/tailwind/animations";
import { utilitiesConfig } from "./src/config/tailwind/utilities";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		...themeConfig,
		extend: {
			...themeConfig.extend,
			...animationsConfig
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: { addUtilities: any }) {
			addUtilities(utilitiesConfig);
		}
	],
} satisfies Config;
