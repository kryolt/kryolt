import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Upload,
    Sparkles,
    LineChart,
    Users,
    User,
    Settings,
    ChevronsLeft,
    ChevronsRight,
    Crown,
    HardDrive,
    ArrowUpRight,
    Lock,
    X,
} from "lucide-react";

import { useUser } from "../../../context/UserContext";
import { APP } from "../../../config/appConfig";

import "./Sidebar.css";

const menuGroups = [
    {
        title: "Workspace",
        items: [
            {
                to: "/dashboard",
                icon: LayoutDashboard,
                label: "Dashboard",
                end: true,
            },
            {
                to: "/dashboard/upload",
                icon: Upload,
                label: "Upload Data",
            },
            {
                to: "/dashboard/profile",
                icon: User,
                label: "Profile",
            },
        ],
    },
    {
        title: "Analytics",
        items: [
            {
                to: "/dashboard/insights",
                icon: Sparkles,
                label: "AI Insights",
                premium: true,
            },
            {
                to: "/dashboard/reports",
                icon: LineChart,
                label: "Reports",
                premium: true,
            },
            {
                to: "/dashboard/customers",
                icon: Users,
                label: "Customers",
            },
        ],
    },
];

export default function Sidebar({
    collapsed = false,
    mobileOpen = false,
    isMobile = false,
    onToggle,
    onToggleCollapse,
    onClose,
}) {
    const navigate = useNavigate();
    const { user } = useUser();

    const subscription = user?.subscription || null;
    const subscriptionStatus = String(
        subscription?.status || user?.subscriptionStatus || ""
    ).trim().toLowerCase();

    const subscriptionPlan = String(subscription?.plan || "").trim().toLowerCase();
    const userPlan = String(user?.plan || "free").trim().toLowerCase();

    const hasActiveSubscription =
        subscriptionStatus === "active" &&
        (subscriptionPlan === "professional" || subscriptionPlan === "business");

    const plan = hasActiveSubscription ? subscriptionPlan : userPlan;
    const isFreePlan = plan === "free";
    const isProfessionalPlan = plan === "professional";
    const isBusinessPlan = plan === "business";
    const isPaidPlan = isProfessionalPlan || isBusinessPlan;

    let planTitle = "Free Plan";
    let planDescription = "Unlock AI Reports & Premium Analytics";

    if (isProfessionalPlan) {
        planTitle = "Professional Plan";
        planDescription = "Premium features are active";
    }

    if (isBusinessPlan) {
        planTitle = "Business Plan";
        planDescription = "All advanced features are active";
    }

    const storageUsed = Math.max(Number(user?.storageUsed ?? 0), 0);

    const formatStorage = (value) =>
        value >= 1024
            ? `${(value / 1024).toFixed(2)} GB`
            : `${value.toFixed(2)} MB`;

    const storageUsedText = formatStorage(storageUsed);

    const handleLockedClick = () => {
        navigate("/pricing", { replace: true });
    };

    const handlePlanCardClick = () => {
        navigate(isFreePlan ? "/pricing" : "/dashboard/settings", { replace: true });
        if (isMobile) onClose?.();
    };

    const handleNavigation = () => {
        if (isMobile) onClose?.();
    };

    const handleCollapseClick = () => {
        if (isMobile) {
            onClose?.();
            return;
        }
        if (typeof onToggleCollapse === "function") {
            onToggleCollapse();
            return;
        }
        onToggle?.();
    };

    const sidebarClassName = [
        "sidebar",
        collapsed ? "collapsed" : "",
        isMobile ? "mobile-sidebar" : "",
        mobileOpen ? "mobile-open" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <>
            {isMobile && mobileOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={onClose}
                />
            )}

            <aside
                id="dashboard-sidebar"
                className={sidebarClassName}
                aria-label="Dashboard navigation"
            >
                <div className="sidebar-header">
                    <div className="brand">
                        {!collapsed && (
                            <div className="brand-text">
                                <h3>{APP?.name || "Kryolt"}</h3>
                                <p>Business Intelligence</p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="collapse-btn"
                        onClick={handleCollapseClick}
                        aria-label={
                            isMobile
                                ? "Close sidebar"
                                : collapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                        }
                    >
                        {isMobile ? (
                            <X size={19} strokeWidth={2} />
                        ) : collapsed ? (
                            <ChevronsRight size={18} strokeWidth={2} />
                        ) : (
                            <ChevronsLeft size={18} strokeWidth={2} />
                        )}
                    </button>
                </div>

                <div className="sidebar-scroll">
                    {menuGroups.map((group) => (
                        <section className="sidebar-group" key={group.title}>
                            {!collapsed && (
                                <div className="sidebar-group-title">{group.title}</div>
                            )}

                            <nav className="sidebar-nav">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const locked = item.premium && !isPaidPlan;

                                    if (locked) {
                                        return (
                                            <button
                                                type="button"
                                                key={item.to}
                                                className="sidebar-menu-item is-locked"
                                                onClick={handleLockedClick}
                                                title={collapsed ? `${item.label} - Upgrade required` : undefined}
                                            >
                                                <span className="sidebar-menu-icon">
                                                    <Icon size={19} strokeWidth={2} />
                                                </span>

                                                {!collapsed && (
                                                    <>
                                                        <span className="sidebar-menu-label">
                                                            {item.label}
                                                        </span>
                                                        <Lock size={13} className="sidebar-lock" strokeWidth={2} />
                                                    </>
                                                )}
                                            </button>
                                        );
                                    }

                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            end={item.end}
                                            replace
                                            onClick={handleNavigation}
                                            className={({ isActive }) =>
                                                [
                                                    "sidebar-menu-item",
                                                    isActive ? "is-active" : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")
                                            }
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <span className="sidebar-menu-icon">
                                                <Icon size={19} strokeWidth={2} />
                                            </span>

                                            {!collapsed && (
                                                <span className="sidebar-menu-label">
                                                    {item.label}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </section>
                    ))}

                    {!collapsed && (
                        <div className="sidebar-storage-card">
                            <div className="storage-heading">
                                <HardDrive size={17} strokeWidth={2} />
                                <span>Storage</span>
                            </div>

                            <div className="storage-meta">
                                <span title={`${storageUsedText} used`}>
                                    {storageUsedText} used
                                </span>

                                <strong title="Data is stored locally in this browser">
                                    Local
                                </strong>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <NavLink
                        to="/dashboard/settings"
                        replace
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            ["sidebar-settings-link", isActive ? "is-active" : ""]
                                .filter(Boolean)
                                .join(" ")
                        }
                        title={collapsed ? "Settings" : undefined}
                    >
                        <span className="sidebar-menu-icon">
                            <Settings size={19} strokeWidth={2} />
                        </span>

                        {!collapsed && (
                            <>
                                <span className="sidebar-menu-label">Settings</span>
                                <ArrowUpRight size={14} className="settings-arrow" strokeWidth={2} />
                            </>
                        )}
                    </NavLink>

                    {!collapsed ? (
                        <button
                            type="button"
                            className={`sidebar-plan-card ${plan}-plan`}
                            onClick={handlePlanCardClick}
                        >
                            <div className="plan-icon">
                                <Crown size={18} strokeWidth={2} />
                            </div>

                            <div className="plan-content">
                                <strong>{planTitle}</strong>
                                <span>{planDescription}</span>
                            </div>

                            <ArrowUpRight className="plan-arrow" size={14} strokeWidth={2} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="sidebar-plan-collapsed"
                            onClick={handlePlanCardClick}
                            title={planTitle}
                            aria-label={planTitle}
                        >
                            <Crown size={18} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}