import logoIcon from "../assets/branding/Kryolt.jpeg";
import wordmark from "../assets/branding/KryoltWordMark.jpeg";

export const APP = {
    name: "Kryolt",
    logo: logoIcon,
    wordmark: wordmark,
    tagline: "AI Business Dashboard",
    version: "1.0.0",
    company: "kryolt",
    contactEmail: "hello@kryolt.com",
    supportEmail: "support@kryolt.com",
    website: "https://kryolt.com",
    founded: "2026",
    copyright: `© ${new Date().getFullYear()} Kryolt. All Rights Reserved.`,

    // NOTE: HomeFooter reads APP.socials.website / .youtube — these were
    // missing before, so those two icons were silently rendering disabled.
    // Added them here since both accounts already exist (kryolt.com,
    // youtube.com/@Kryolt).
    socials: {
        instagram: "https://instagram.com/kryolt_",
        x: "https://x.com/kryolt",
        facebook: "https://facebook.com/kryolt",
        linkedin: "https://www.linkedin.com/company/kryolt/",
        youtube: {
            channel: "https://www.youtube.com/@Kryolt",
            demo: "https://youtu.be/lWcyQVtoLG0?si=AnC2bsoRNnSXI13R",
        },
    },
};