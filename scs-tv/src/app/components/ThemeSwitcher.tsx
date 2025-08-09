"use client";
import { useEffect, useState } from "react";

const colorThemes = [

    {
        background: "#06631a",
        foreground: "transparent",
        accent: "transparent",
        dateTime: "#ffffff",
        sidebarOpacity: ".75"
    },

    // first
    {
        background: "var(--color-gray-200)", // "#ffffff", //     background-color: var(--color-gray-200);
        foreground: "var(--bg-gray-100)",
        accent: "var(--color-gray-100)",
        dateTime: "#000000",
        sidebarOpacity: "1"
    },

    {
        background: "#004442",
        foreground: "#22223b",
        accent: "#529852",
        dateTime: "#ffffff",
        sidebarOpacity: "1"
    },
];
const THEME_INTERVAL = 60 * 60 * 1000; // 60 minutes

export default function ThemeSwitcher() {
    const [themeIndex, setThemeIndex] = useState(0);

    useEffect(() => {
        // Set CSS variables on <body>
        const theme = colorThemes[themeIndex];
        if (typeof document !== "undefined") {
            const body = document.body;
            body.style.setProperty("--background", theme.background);
            body.style.setProperty("--foreground", theme.foreground);
            body.style.setProperty("--accent", theme.accent);
            body.style.setProperty("--dateTime", theme.dateTime);
            body.style.setProperty("--sidebarOpacity", theme.sidebarOpacity);
        }
    }, [themeIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setThemeIndex((prev) => (prev + 1) % colorThemes.length);
        }, THEME_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    return null;
}
