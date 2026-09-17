import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

import { APP } from "../../config/appConfig";
import "./HomeNavbar.css";

const NAV_LINKS = [
    {
        label: "Home",
        to: "/",
    },
    {
        label: "Features",
        to: "/features",
    },
    {
        label: "Pricing",
        to: "/pricing",
    },
    {
        label: "About",
        to: "/about",
    },
    {
        label: "Contact",
        to: "/contact",
    },
];

function HomeNavbar({ onGetStartedClick }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const isActivePage = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    const handleGetStarted = () => {
        closeMenu();

        if (onGetStartedClick) {
            onGetStartedClick();
            return;
        }

        navigate("/dashboard");
    };

    return (
        <header className="home-navbar">

            {/* Logo */}
            <Link
                to="/"
                className="home-logo"
                onClick={closeMenu}
            >
                <img
                    src={APP.logo}
                    alt={APP.name}
                    className="home-logo-icon"
                />

                <span>{APP.name}</span>
            </Link>


            {/* Desktop / Mobile Navigation */}
            <nav
                className={`home-nav-links ${menuOpen ? "open" : ""
                    }`}
            >

                {NAV_LINKS.map((item) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className={
                            isActivePage(item.to)
                                ? "nav-link active"
                                : "nav-link"
                        }
                        onClick={closeMenu}
                    >
                        {item.label}
                    </Link>
                ))}


                {/* Mobile CTA */}
                <button
                    type="button"
                    className="start-btn mobile-only"
                    onClick={handleGetStarted}
                >
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                </button>

            </nav>


            {/* Desktop CTA */}
            <div className="home-nav-buttons">
                <button
                    type="button"
                    className="start-btn"
                    onClick={handleGetStarted}
                >
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                </button>
            </div>


            {/* Mobile Hamburger */}
            <button
                type="button"
                className={`menu-toggle ${menuOpen ? "is-open" : ""
                    }`}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={
                    menuOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                }
                aria-expanded={menuOpen}
            >
                {menuOpen ? (
                    <X size={27} strokeWidth={2.2} />
                ) : (
                    <Menu size={27} strokeWidth={2.2} />
                )}
            </button>

        </header>
    );
}

export default HomeNavbar;