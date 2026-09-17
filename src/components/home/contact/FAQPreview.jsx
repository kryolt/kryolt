import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import "./FAQPreview.css";

function FAQPreview() {
    return (
        <section className="contact-faq-preview">

            <div>

                <span className="contact-section-label">
                    Need more help?
                </span>

                <h2>
                    Find answers to common questions.
                </h2>

                <p>
                    Explore our frequently asked questions to learn more
                    about Kryolt, our platform and how it works.
                </p>

            </div>

            <Link
                to="/faq"
                className="contact-faq-btn"
            >
                Visit FAQ
                <ArrowRight size={18} />
            </Link>

        </section>
    );
}

export default FAQPreview;