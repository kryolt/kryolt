import "./CustomerHero.css";
import { Sparkles, Users } from "lucide-react";

function CustomerHero({ totalCustomers = 0 }) {
    const formattedCount = Number(totalCustomers || 0).toLocaleString("en-IN");

    return (
        <section
            className="customer-hero"
            aria-labelledby="customer-hero-heading"
        >
            {/* Background Decorative SVG */}
            <div className="customer-mark" aria-hidden="true">
                <svg viewBox="0 0 100 100" fill="none">
                    <path d="M40 12 L40 46 L70 12 Z" fill="currentColor" />
                    <path d="M40 46 L40 88 L70 88 L52 66 Z" fill="currentColor" />
                </svg>
            </div>

            {/* Left Section */}
            <div className="customer-hero-left">
                <div className="customer-hero-chip">
                    <Sparkles
                        className="customer-chip-icon"
                        aria-hidden="true"
                    />
                    <span>Customer Intelligence</span>
                </div>

                <h1 id="customer-hero-heading">
                    Customer Analytics
                </h1>

                <p>
                    Understand customer behaviour, identify top customers,
                    and discover growth opportunities.
                </p>
            </div>

            {/* Right Section (Compact Side-by-Side Circle) */}
            <div className="customer-hero-right">
                <div className="customer-total-badge">
                    <div className="customer-total-ring">
                        <div className="customer-total-circle">
                            <Users
                                className="customer-total-icon"
                                aria-hidden="true"
                            />
                            <h2>{formattedCount}</h2>
                            <span>Total Customers</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CustomerHero;
