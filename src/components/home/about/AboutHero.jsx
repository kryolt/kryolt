import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

import "./AboutHero.css";

function AboutHero() {
    return (
        <section className="about-hero">
            {/* Brand-mark echo: two angled bars referencing the Kryolt "K"
                geometry, bleeding off the right edge as the hero's signature
                element rather than a generic gradient blob. */}
            <div className="about-hero-mark" aria-hidden="true">
                <span className="about-hero-mark__stroke about-hero-mark__stroke--long" />
                <span className="about-hero-mark__stroke about-hero-mark__stroke--short" />
            </div>

            <div className="about-hero-grid" aria-hidden="true"></div>

            <div className="about-hero-inner">
                <div className="about-hero-content">
                    <span className="about-hero-badge">
                        <Sparkles size={14} />
                        About Kryolt
                    </span>

                    <h1>
                        Your data already knows what's next.
                        <span> Kryolt tells you first.</span>
                    </h1>

                    <p>
                        Upload a spreadsheet and get dashboards, forecasts, and
                        plain-English insights in minutes — no analyst, no
                        formulas, no waiting for someone else's report.
                    </p>

                    <div className="about-hero-actions">
                        <Link to="/" className="about-primary-btn">
                            Explore Kryolt
                            <ArrowRight size={17} />
                        </Link>

                        <Link to="/contact" className="about-secondary-btn">
                            Talk to us
                        </Link>
                    </div>
                </div>

                {/* Floating product-preview card: gives the hero a concrete,
                    subject-grounded focal point instead of empty gradient space. */}
                <div className="about-hero-preview" role="presentation">
                    <div className="about-hero-preview__header">
                        <span className="about-hero-preview__dot" />
                        Live insight
                    </div>
                    <div className="about-hero-preview__body">
                        <TrendingUp size={20} />
                        <div>
                            <strong>Revenue dip flagged 3 days early</strong>
                            <p>Weekend orders trending 12% below forecast</p>
                        </div>
                    </div>
                    <div className="about-hero-preview__footer">
                        Updated just now
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutHero;