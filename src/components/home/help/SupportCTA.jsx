import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";

function SupportCTA() {
    return (
        <section className="support-cta">

            <div className="support-cta-icon">
                <MessageCircle size={24} />
            </div>

            <div className="support-cta-content">

                <span>
                    Need more help?
                </span>

                <h2>
                    Can't find what you're looking for?
                </h2>

                <p>
                    Our support team is here to help you with your questions
                    and guide you through your Kryolt experience.
                </p>

            </div>

            <Link
                to="/contact"
                className="support-cta-button"
            >
                Contact Support
                <ArrowRight size={18} />
            </Link>

        </section>
    );
}

export default SupportCTA;