import { useEffect, useRef, useState, useCallback, useId } from "react";
import { CalendarDays, ChevronDown, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/useAuth";
import { useUser } from "../../../context/UserContext";

import ProfileMenu from "../../ProfileMenu";
import "./DashboardNavbar.css";

const SEARCH_ITEMS = [
    {
        label: "Dashboard",
        description: "Business overview",
        path: "/dashboard",
        keywords: "dashboard home overview business",
    },
    {
        label: "Upload Data",
        description: "Upload CSV or Excel data",
        path: "/dashboard/upload",
        keywords: "upload csv excel data import",
    },
    {
        label: "Profile",
        description: "Manage your profile",
        path: "/dashboard/profile",
        keywords: "profile account user",
    },
    {
        label: "AI Insights",
        description: "Business intelligence insights",
        path: "/dashboard/ai-insights",
        keywords: "ai insights intelligence recommendations",
    },
    {
        label: "Reports",
        description: "View business reports",
        path: "/dashboard/reports",
        keywords: "reports analytics report",
    },
    {
        label: "Customers",
        description: "Customer analytics",
        path: "/dashboard/customers",
        keywords: "customers customer clients",
    },
    {
        label: "Settings",
        description: "Manage application settings",
        path: "/dashboard/settings",
        keywords: "settings preferences configuration",
    },
];

export default function DashboardNavbar({ onMenuClick, isMobile = false }) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { user } = useUser();

    const [profileOpen, setProfileOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const profileRef = useRef(null);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchListId = useId();

    /* --- User Profile Data Normalization --- */
    const displayName =
        user?.name ||
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "User";

    const email = currentUser?.email || user?.email || "";
    const photoURL = user?.avatar || currentUser?.photoURL || "";
    const firstLetter = displayName.trim().charAt(0).toUpperCase() || "U";

    /* --- Filtered Search Results --- */
    const normalizedSearch = searchValue.trim().toLowerCase();

    const searchResults = normalizedSearch
        ? SEARCH_ITEMS.filter((item) => {
            const searchableText = `${item.label} ${item.description} ${item.keywords}`.toLowerCase();
            return searchableText.includes(normalizedSearch);
        }).slice(0, 6)
        : [];

    /* --- Outside Click and Escape Handler --- */
    const handleOutsideClick = useCallback(
        (event) => {
            if (
                profileOpen &&
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }

            if (
                searchOpen &&
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setSearchOpen(false);
            }
        },
        [profileOpen, searchOpen]
    );

    const handleEscape = useCallback((event) => {
        if (event.key === "Escape") {
            setProfileOpen(false);
            setSearchOpen(false);
            setActiveIndex(-1);
        }
    }, []);

    useEffect(() => {
        if (!profileOpen && !searchOpen) return;

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [profileOpen, searchOpen, handleOutsideClick, handleEscape]);

    /* --- Global Shortcut ('/') Handler --- */
    useEffect(() => {
        const handleShortcut = (event) => {
            const isTyping = ["INPUT", "TEXTAREA"].includes(
                document.activeElement?.tagName
            );
            if (event.key === "/" && !isTyping) {
                event.preventDefault();
                searchInputRef.current?.focus();
                setSearchOpen(true);
            }
        };

        document.addEventListener("keydown", handleShortcut);
        return () => document.removeEventListener("keydown", handleShortcut);
    }, []);

    /* --- Action Handlers --- */
    const handleMenuClick = () => {
        if (typeof onMenuClick === "function") {
            onMenuClick();
        }
        setProfileOpen(false);
        setSearchOpen(false);
    };

    const handleProfileToggle = () => {
        setProfileOpen((prev) => !prev);
        setSearchOpen(false);
    };

    const handleSearchResult = (path) => {
        setSearchValue("");
        setSearchOpen(false);
        setActiveIndex(-1);
        navigate(path);
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Escape") {
            setSearchOpen(false);
            searchInputRef.current?.blur();
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : 0
            );
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : searchResults.length - 1
            );
        } else if (event.key === "Enter") {
            if (activeIndex >= 0 && searchResults[activeIndex]) {
                handleSearchResult(searchResults[activeIndex].path);
            } else if (searchResults.length > 0) {
                handleSearchResult(searchResults[0].path);
            }
        }
    };

    const formattedDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <header className="dashboard-navbar">
            {/* LEFT SECTION */}
            <div className="dashboard-navbar-left">
                {isMobile && (
                    <button
                        type="button"
                        className="navbar-menu-button"
                        onClick={handleMenuClick}
                        aria-label="Open navigation menu"
                        aria-controls="dashboard-sidebar"
                        title="Open navigation"
                    >
                        <Menu size={21} strokeWidth={2.2} />
                    </button>
                )}

                {/* SEARCH BAR */}
                <div
                    className={`navbar-search-wrapper ${searchOpen ? "search-active" : ""}`}
                    ref={searchRef}
                >
                    <div className="navbar-search">
                        <Search
                            className="navbar-search-icon"
                            size={17}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        <input
                            ref={searchInputRef}
                            type="search"
                            value={searchValue}
                            onFocus={() => setSearchOpen(true)}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                                setSearchOpen(true);
                                setActiveIndex(-1);
                            }}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search reports, customers..."
                            aria-label="Search reports and customers"
                            role="combobox"
                            aria-expanded={searchOpen && normalizedSearch.length > 0}
                            aria-controls={searchListId}
                            aria-autocomplete="list"
                        />
                        <span className="navbar-search-shortcut" aria-hidden="true">
                            /
                        </span>
                    </div>

                    {/* SEARCH RESULTS DROPDOWN */}
                    {searchOpen && normalizedSearch.length > 0 && (
                        <div
                            id={searchListId}
                            className="navbar-search-results"
                            role="listbox"
                        >
                            {searchResults.length > 0 ? (
                                searchResults.map((item, index) => (
                                    <button
                                        type="button"
                                        key={item.path}
                                        role="option"
                                        aria-selected={activeIndex === index}
                                        className={`navbar-search-result ${activeIndex === index ? "selected" : ""}`}
                                        onClick={() => handleSearchResult(item.path)}
                                    >
                                        <span className="search-result-icon">
                                            <Search size={15} strokeWidth={2} />
                                        </span>
                                        <span className="search-result-content">
                                            <strong>{item.label}</strong>
                                            <small>{item.description}</small>
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="navbar-search-empty">
                                    <span className="search-empty-icon">
                                        <Search size={17} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <strong>No results found</strong>
                                        <small>Try Dashboard, Reports or Customers</small>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="dashboard-navbar-right">
                {/* DATE BADGE */}
                <div className="navbar-date" aria-label={`Current date ${formattedDate}`}>
                    <span className="navbar-status-dot" aria-hidden="true" />
                    <CalendarDays size={15} strokeWidth={2} aria-hidden="true" />
                    <span>{formattedDate}</span>
                </div>

                {/* USER PROFILE */}
                <div className="navbar-profile-wrapper" ref={profileRef}>
                    <button
                        type="button"
                        className={`navbar-user ${profileOpen ? "active" : ""}`}
                        onClick={handleProfileToggle}
                        aria-label="Open profile menu"
                        aria-haspopup="menu"
                        aria-expanded={profileOpen}
                    >
                        <span className="navbar-user-avatar">
                            {photoURL ? (
                                <img src={photoURL} alt={displayName} />
                            ) : (
                                <span className="navbar-user-initial">{firstLetter}</span>
                            )}
                        </span>

                        <span className="navbar-user-info">
                            <strong>{displayName}</strong>
                            <small>{email || "Business Account"}</small>
                        </span>

                        <ChevronDown
                            className={`navbar-user-chevron ${profileOpen ? "rotated" : ""}`}
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </button>

                    <ProfileMenu
                        open={profileOpen}
                        onClose={() => setProfileOpen(false)}
                    />
                </div>
            </div>
        </header>
    );
}