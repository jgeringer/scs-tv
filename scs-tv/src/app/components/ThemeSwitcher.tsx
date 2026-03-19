"use client";
import { useEffect, useState } from "react";

const colorThemes = [
    {
        background: "#06631a",
        foreground: "transparent",
        accent: "transparent",
        dateTime: "#ffffff",
        sidebarOpacity: ".75",
        mainText: "#309a00",
    },
    // first
    {
        background: "var(--color-gray-200)", // "#ffffff", //     background-color: var(--color-gray-200);
        foreground: "var(--bg-gray-100)",
        accent: "var(--color-gray-100)",
        dateTime: "#000000",
        sidebarOpacity: "1",
        mainText: "#309a00",
    },

    {
        background: "#004442",
        foreground: "#22223b",
        accent: "#529852",
        dateTime: "#ffffff",
        sidebarOpacity: "1",
        mainText: "#309a00",
    },
];

const temporaryMessageTheme =
// custom message theme. make the background a gold/green gradient and the text a dark green
{
    background: "linear-gradient(215deg, #FFD700, #006400)",
    foreground: "#006400",
    accent: "transparent",
    dateTime: "#ffffff",
    sidebarOpacity: ".75",
    mainText: "gold",
}

const THEME_INTERVAL = 60 * 60 * 1000; // 60 minutes

export default function ThemeSwitcher() {
    const [themeIndex, setThemeIndex] = useState(0);
    const [hasTemporaryMessage, setHasTemporaryMessage] = useState(false);

    useEffect(() => {
        // Check if there's a temporary message in localStorage
        const storedMessage = localStorage.getItem('temporaryMessage');
        setHasTemporaryMessage(!!storedMessage && storedMessage.length > 0);
    }, []);

    useEffect(() => {
        // Set CSS variables on <body>
        const theme = hasTemporaryMessage ? temporaryMessageTheme : colorThemes[themeIndex];
        if (typeof document !== "undefined") {
            const body = document.body;
            body.style.setProperty("--background", theme.background);
            body.style.setProperty("--foreground", theme.foreground);
            body.style.setProperty("--accent", theme.accent);
            body.style.setProperty("--dateTime", theme.dateTime);
            body.style.setProperty("--sidebarOpacity", theme.sidebarOpacity);
            body.style.setProperty("--mainText", theme.mainText);
            
            // Apply mainText color to .main-text elements
            const mainTextElements = document.querySelectorAll('.main-text');
            mainTextElements.forEach((element) => {
                (element as HTMLElement).style.color = theme.mainText;
            });
        }
    }, [themeIndex, hasTemporaryMessage]);

    useEffect(() => {
        // Listen for temporary message changes from the modal
        const handleTemporaryMessageChanged = () => {
            const storedMessage = localStorage.getItem('temporaryMessage');
            setHasTemporaryMessage(!!storedMessage && storedMessage.length > 0);
        };

        window.addEventListener('temporaryMessageChanged', handleTemporaryMessageChanged);
        return () => window.removeEventListener('temporaryMessageChanged', handleTemporaryMessageChanged);
    }, []);

    useEffect(() => {
        // Only cycle themes if there's no temporary message
        if (hasTemporaryMessage) return;

        const interval = setInterval(() => {
            setThemeIndex((prev) => (prev + 1) % colorThemes.length);
        }, THEME_INTERVAL);
        return () => clearInterval(interval);
    }, [hasTemporaryMessage]);

    return null;
}
