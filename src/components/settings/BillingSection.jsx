import {
    Crown,
    HardDrive,
    ArrowRight,
    ChevronRight,
    IndianRupee,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

import { getPlanById } from "../../config/pricingConfig";

import "./BillingSection.css";

function BillingSection() {

    const navigate = useNavigate();

    const {
        user,
        loading,
        isFreePlan,
        isProfessional,
        isBusiness,
    } = useUser();

    if (loading) return null;

    // ======================================
    // USER DATA
    // ======================================

    const used = Number(user?.storageUsed ?? 0);

    // ======================================
    // CURRENT PLAN
    // ======================================

    const planId = isBusiness
        ? "business"
        : isProfessional
            ? "professional"
            : "free";

    const planName = isBusiness
        ? "Business"
        : isProfessional
            ? "Professional"
            : "Free";

    const currentPlanConfig = getPlanById(planId);

    // ======================================
    // PRICING
    // ======================================

    const price = currentPlanConfig?.price ?? 0;

    // Upgrade button

    return (

        <div className="billing-page">

            {/* ===== Header ===== */}
            <div className="billing-top">

                <div>
                    <h1>Billing</h1>
                    <p>Manage your subscription and billing information.</p>
                </div>

                <div className="plan-pill">
                    <Crown size={16} />
                    {planName}
                </div>

            </div>

            {/* ===== Hero subscription card ===== */}
            <div className="subscription-card">

                <div className="subscription-info">

                    <span className="mini-title">CURRENT PLAN</span>

                    <h2>{planName}</h2>

                    <div className="price-row">
                        <IndianRupee size={22} className="price-icon" />
                        <span className="price-value">{price}</span>
                        <span className="price-suffix">/ month</span>
                    </div>

                    <span className="status-badge">
                        <span className="status-dot" />
                        Active
                    </span>

                    <p className="renew-note">
                        {isFreePlan
                            ? "Upgrade anytime to unlock Premium features."
                            : "Your subscription renews every month."}
                    </p>

                    {isFreePlan ? (
                        <button
                            className="upgrade-btn"
                            onClick={() => navigate("/pricing")}
                        >
                            Upgrade Plan
                            <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="manage-btn"
                            onClick={() => navigate("/pricing")}
                        >
                            Manage Plan
                            <ChevronRight size={18} />
                        </button>
                    )}

                </div>

                <div className="crown-illustration" aria-hidden="true">
                    <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="platformTop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#FFFFFF" />
                                <stop offset="1" stopColor="#DCE7FB" />
                            </linearGradient>
                            <linearGradient id="platformSide" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#C7D8F5" />
                                <stop offset="1" stopColor="#A9C1EC" />
                            </linearGradient>
                            <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#5B8DEF" />
                                <stop offset="1" stopColor="#2F5FD6" />
                            </linearGradient>
                        </defs>

                        <ellipse cx="110" cy="150" rx="78" ry="14" fill="#2563EB" opacity="0.08" />

                        <polygon points="110,86 190,116 110,146 30,116" fill="url(#platformTop)" stroke="#E3ECFB" strokeWidth="1.5" />
                        <polygon points="30,116 110,146 110,164 30,134" fill="url(#platformSide)" />
                        <polygon points="190,116 110,146 110,164 190,134" fill="#B9CDF2" />

                        <g transform="translate(110,60)">
                            <path
                                d="M -34 32 L -34 8 L -18 24 L 0 -6 L 18 24 L 34 8 L 34 32 Z"
                                fill="url(#crownGrad)"
                            />
                            <rect x="-34" y="30" width="68" height="10" rx="3" fill="#2F5FD6" />
                            <circle cx="-34" cy="8" r="4.5" fill="#8FB2F7" />
                            <circle cx="0" cy="-6" r="5" fill="#8FB2F7" />
                            <circle cx="34" cy="8" r="4.5" fill="#8FB2F7" />
                        </g>

                        <g fill="#8FB2F7">
                            <path d="M172 62 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
                            <path d="M44 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
                        </g>
                    </svg>
                </div>

            </div>

            {/* ===== Quick stats ===== */}
            <div className="stat-card">
                <span className="icon-circle icon-blue">
                    <HardDrive size={20} />
                </span>

                <span className="stat-label">Storage</span>

                <h3>{used.toFixed(2)} MB</h3>

                <span className="stat-sub">Used locally in this browser</span>
            </div>

            {/* ===== Storage usage ===== */}
            <div className="storage-card">
                <div className="card-header">
                    <div>
                        <h3>Storage Usage</h3>
                        <p>
                            Storage currently used by your workspace in this browser.
                        </p>
                    </div>

                    <HardDrive size={20} />
                </div>

                <div className="progress">
                    <div style={{ width: "100%" }} />
                </div>

                <div className="progress-footer">
                    <span>{used.toFixed(2)} MB used</span>
                    <span>Local storage</span>
                </div>
            </div>

        </div>

    );

}

export default BillingSection;