import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import "./CTA.css";

function CTA() {
    return (
        <section className="about-cta">
            <div className="about-cta-content">
                <div className="about-cta-mark" aria-hidden="true">
                    <span className="about-cta-mark__stroke about-cta-mark__stroke--long" />
                    <span className="about-cta-mark__stroke about-cta-mark__stroke--short" />
                </div>

                <h2>
                    Stop guessing. Start seeing what's next.
                </h2>

                <p>
                    Upload your first spreadsheet and see your dashboard,
                    forecasts, and insights in minutes — free to start.
                </p>

                <Link to="/" className="about-cta-btn">
                    Explore Kryolt
                    <ArrowRight size={18} />
                </Link>

            </div>
        </section>
    );
}

export default CTA;