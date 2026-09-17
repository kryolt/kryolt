import { MessageCircle } from "lucide-react";

import "./ContactHero.css";

function ContactHero() {
    return (
        <section className="contact-hero">
            <div className="contact-hero-mark" aria-hidden="true">
                <span className="contact-hero-mark__stroke contact-hero-mark__stroke--long" />
                <span className="contact-hero-mark__stroke contact-hero-mark__stroke--short" />
            </div>

            <div className="contact-hero-content">
                <span className="contact-badge">
                    <MessageCircle size={14} />
                    Contact Kryolt
                </span>

                <h1>
                    Let's build smarter business decisions together.
                </h1>

                <p>
                    Have a question, need help, or want to learn more about
                    Kryolt? Our team is here to help.
                </p>
            </div>
        </section>
    );
}

export default ContactHero;