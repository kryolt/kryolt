import {
    Mail,
    MessageCircle,
    Clock,
} from "lucide-react";

import "./ContactCards.css";

function ContactCards() {
    return (
        <section className="contact-cards-section">

            <div className="contact-card">
                <div className="contact-card-icon">
                    <Mail size={20} />
                </div>

                <h3>Email Us</h3>

                <p>
                    Send us your questions and we'll get back to you directly.
                </p>

                <a href="mailto:hello@kryolt.com" className="contact-card-link">
                    hello@kryolt.com
                </a>
            </div>

            <div className="contact-card">
                <div className="contact-card-icon">
                    <MessageCircle size={20} />
                </div>

                <h3>Customer Support</h3>

                <p>
                    Already using Kryolt? Our support team can help with
                    uploads, dashboards, or your account.
                </p>

                <span className="contact-card-tag">
                    Get Support
                </span>
            </div>

            <div className="contact-card">
                <div className="contact-card-icon">
                    <Clock size={20} />
                </div>

                <h3>Response Time</h3>

                <p>
                    Every message is read by our team, not a queue you'll
                    wait behind.
                </p>

                <span className="contact-card-tag">
                    Within 1–2 business days
                </span>
            </div>

        </section>
    );
}

export default ContactCards;