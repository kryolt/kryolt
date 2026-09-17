import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/dashboard/navigation/Sidebar";
import DashboardNavbar from "../components/dashboard/navigation/DashboardNavbar";

import "./DashboardLayout.css";

const MOBILE_BREAKPOINT = 640;

function DashboardLayout() {
    const location = useLocation();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined"
            ? window.innerWidth <= MOBILE_BREAKPOINT
            : false
    );

    // Track previous screen size state to avoid unnecessary toggles on F12
    const prevIsMobileRef = useRef(isMobile);

    /* =========================================================
       RESPONSIVE STATE (FIXED FOR F12 / DEVTOOLS RE-SIZING)
    ========================================================= */

    useEffect(() => {
        let resizeTimer;

        const handleResize = () => {
            clearTimeout(resizeTimer);

            // Debounce to prevent lag/unwanted state flips during DevTools open
            resizeTimer = setTimeout(() => {
                const mobile = window.innerWidth <= MOBILE_BREAKPOINT;

                // State update tabhi hoga jab boundary pass ho (Desktop <-> Mobile transition)
                if (prevIsMobileRef.current !== mobile) {
                    setIsMobile(mobile);
                    prevIsMobileRef.current = mobile;

                    if (!mobile) {
                        setMobileMenuOpen(false);
                    }
                }
            }, 100);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /* =========================================================
       PREVENT SIDEBAR FLIP ON SPECIAL KEYS (F12)
    ========================================================= */

    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            // Prevent sidebar toggle logic on F12 key press
            if (event.key === "F12") {
                event.stopPropagation();
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);

        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, []);

    /* =========================================================
       CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
    ========================================================= */

    useEffect(() => {
        const timer = setTimeout(() => {
            setMobileMenuOpen(false);
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, [location.pathname]);

    /* =========================================================
       ESCAPE KEY
    ========================================================= */

    useEffect(() => {
        if (!mobileMenuOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [mobileMenuOpen]);

    /* =========================================================
       LOCK BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
    ========================================================= */

    useEffect(() => {
        if (!isMobile || !mobileMenuOpen) {
            document.body.style.overflow = "";
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobile, mobileMenuOpen]);

    /* =========================================================
       DESKTOP SIDEBAR
    ========================================================= */

    const toggleDesktopSidebar = () => {
        if (isMobile) {
            return;
        }

        setSidebarCollapsed((previous) => !previous);
    };

    /* =========================================================
       MOBILE SIDEBAR
    ========================================================= */

    const toggleMobileMenu = () => {
        if (!isMobile) {
            return;
        }

        setMobileMenuOpen((previous) => !previous);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    /* =========================================================
       LAYOUT
    ========================================================= */

    const layoutClassName = [
        "dashboard-layout",
        sidebarCollapsed ? "sidebar-is-collapsed" : "",
        isMobile ? "layout-mobile" : "layout-desktop",
        mobileMenuOpen ? "mobile-menu-is-open" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={layoutClassName}>
            <Sidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileMenuOpen}
                isMobile={isMobile}
                onToggle={toggleDesktopSidebar}
                onToggleCollapse={toggleDesktopSidebar}
                onClose={closeMobileMenu}
            />

            <div className="dashboard-main">
                <div className="dashboard-navbar-wrap">
                    <DashboardNavbar
                        onMenuClick={toggleMobileMenu}
                        isMobile={isMobile}
                    />
                </div>

                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;