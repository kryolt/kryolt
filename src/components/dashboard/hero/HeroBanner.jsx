import { useEffect, useState } from "react";
import {
    TrendingUp,
    Sparkles,
    Rocket,
    ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../../context/useAuth";
import { useUser } from "../../../context/UserContext";
import "./HeroBanner.css";

function HeroBanner() {
    const { currentUser } = useAuth();
    const { user } = useUser();

    const userName =
        user?.name ||
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "User";

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";

        return "Good evening";
    };

    const [greeting, setGreeting] = useState(getGreeting);

    useEffect(() => {
        const updateGreeting = () => {
            setGreeting(getGreeting());
        };

        updateGreeting();

        const interval = setInterval(updateGreeting, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const readouts = [
        { icon: TrendingUp, label: "Business" },
        { icon: Sparkles, label: "Insights" },
        { icon: Rocket, label: "Growth" },
        { icon: ShieldCheck, label: "Health" },
    ];

    return (
        <section className="kb" aria-label="Hero Banner">
            {/* Pulse Line Animation */}
            <svg
                className="kb-pulse"
                viewBox="0 0 800 24"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path d="M0 12 H60 L70 2 L80 22 L90 12 H180 L190 2 L200 22 L210 12 H300 L310 2 L320 22 L330 12 H420 L430 2 L440 22 L450 12 H540 L550 2 L560 22 L570 12 H660 L670 2 L680 22 L690 12 H800" />
            </svg>

            <div className="kb-glow" aria-hidden="true" />

            <div className="kb-body">
                {/* LEFT CONTENT */}
                <div className="kb-main">
                    <div className="kb-eyebrow">
                        <span className="kb-dot" aria-hidden="true" />

                        <span>
                            {greeting}, {userName}
                        </span>
                    </div>

                    <h1 className="kb-heading">
                        Welcome back to{" "}
                        <span className="kb-brand">Kryolt</span>
                    </h1>

                    <p className="kb-desc">
                        Transform your business data into smart reports and
                        insights.
                    </p>
                </div>

                {/* RIGHT CARDS */}
                <div className="kb-readouts">
                    {readouts.map(({ icon: Icon, label }) => (
                        <div className="kb-readout" key={label}>
                            <span className="kb-readout-icon">
                                <Icon size={14} strokeWidth={2.2} />
                            </span>

                            <div className="kb-readout-text">
                                <strong>{label}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HeroBanner;