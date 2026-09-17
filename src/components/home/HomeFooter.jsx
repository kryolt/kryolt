import { Link } from "react-router-dom";
import { APP } from "../../config/appConfig";

import "./HomeFooter.css";

// ===============================
// SOCIAL ICONS
// ===============================

const IconInstagram = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle
            cx="17.1"
            cy="6.9"
            r="0.9"
            fill="currentColor"
            stroke="none"
        />
    </svg>
);

const IconX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" />
    </svg>
);

const IconFacebook = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14.5 21v-7.6h2.4l.4-3h-2.8V8.4c0-.87.24-1.46 1.5-1.46h1.4V4.34A19 19 0 0 0 15 4.2c-2.27 0-3.82 1.39-3.82 3.93v2.27H8.7v3h2.48V21h3.32Z" />
    </svg>
);

const IconLinkedIn = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        <path d="M7.5 10.2v6.3M7.5 7.6v.02M11.7 16.5v-3.7c0-1.6.9-2.6 2.3-2.6 1.3 0 2 .9 2 2.6v3.7" />
    </svg>
);

const IconYouTube = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
        <path
            d="M10.3 9.6v4.8l4.3-2.4-4.3-2.4Z"
            fill="currentColor"
            stroke="none"
        />
    </svg>
);

// ===============================
// SOCIAL LINKS
// ===============================

const socialLinks = [
    {
        Icon: IconInstagram,
        label: "Instagram",
        url: APP.socials?.instagram || "",
    },
    {
        Icon: IconX,
        label: "X",
        url: APP.socials?.x || "",
    },
    {
        Icon: IconFacebook,
        label: "Facebook",
        url: APP.socials?.facebook || "",
    },
    {
        Icon: IconLinkedIn,
        label: "LinkedIn",
        url: APP.socials?.linkedin || "",
    },
    {
        Icon: IconYouTube,
        label: "YouTube",
        url: APP.socials?.youtube.channel || "",
    },
];

// ===============================
// FOOTER
// ===============================

function HomeFooter() {
    return (
        <footer className="footer">

            {/* Decorative Background Mark */}
            <div className="footer-bg-mark" aria-hidden="true">
                K
            </div>

            <div className="footer-container">

                {/* =========================
                    BRAND
                ========================= */}

                <div className="footer-brand">

                    <Link to="/" className="footer-logo">

                        <img
                            src={APP.logo}
                            alt={APP.name}
                        />

                        <span>{APP.name}</span>

                    </Link>

                    <p className="footer-description">
                        {APP.tagline ||
                            "AI-powered business intelligence that helps you understand your data, discover insights and make smarter decisions."}
                    </p>

                    {/* Social Links */}

                    <div className="footer-social">

                        {socialLinks.map(
                            ({ Icon, label, url }) => {

                                if (!url) return null;

                                return (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                    >
                                        <Icon />
                                    </a>
                                );
                            }
                        )}

                    </div>

                </div>


                {/* =========================
                    PRODUCT
                ========================= */}

                <div className="footer-column">
                    <h3>Product</h3>

                    <ul>
                        <li>
                            <Link to="/features">
                                Features
                            </Link>
                        </li>

                        <li>
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link to="/dashboard/insights">
                                AI Insights
                            </Link>
                        </li>

                        <li>
                            <Link to="/dashboard/reports">
                                Reports
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* =========================
                    COMPANY
                ========================= */}

                <div className="footer-column">

                    <h3>Company</h3>

                    <ul>

                        <li>
                            <Link to="/about">
                                About Us
                            </Link>
                        </li>

                        <li>
                            <Link to="/contact">
                                Contact
                            </Link>
                        </li>

                        <li>
                            <Link to="/faq">
                                FAQ
                            </Link>
                        </li>

                        <li>
                            <Link to="/help">
                                Help Center
                            </Link>
                        </li>

                        <li>
                            <Link to="/docs">
                                Documentation
                            </Link>
                        </li>

                    </ul>

                </div>


                {/* =========================
                    LEGAL
                ========================= */}

                <div className="footer-column">

                    <h3>Legal</h3>

                    <ul>

                        <li>
                            <Link to="/privacy">
                                Privacy Policy
                            </Link>
                        </li>

                        <li>
                            <Link to="/terms">
                                Terms of Service
                            </Link>
                        </li>

                        <li>
                            <Link to="/cookies">
                                Cookie Policy
                            </Link>
                        </li>

                        <li>
                            <Link to="/refund-policy">
                                Refund Policy
                            </Link>
                        </li>

                    </ul>

                </div>

            </div>


            {/* =========================
                BOTTOM
            ========================= */}

            <div className="footer-bottom">

                <p>
                    © {new Date().getFullYear()} {APP.name}.
                    All rights reserved.
                </p>

                <div className="footer-bottom-links">

                    <Link to="/privacy">
                        Privacy
                    </Link>

                    <Link to="/terms">
                        Terms
                    </Link>

                    <Link to="/cookies">
                        Cookies
                    </Link>

                    <Link to="/refund-policy">
                        Refund
                    </Link>

                </div>

            </div>

        </footer>
    );
}

export default HomeFooter;