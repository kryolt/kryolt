import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import "./ContactForm.css";

function ContactForm() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Contact form submitted:", formData);

        // TODO: replace with real API call, e.g.
        // await contactService.sendMessage(formData);

        setSubmitted(true);

        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <section className="contact-form-section">

            <div className="contact-form-info">

                <span className="contact-section-label">
                    Get in touch
                </span>

                <h2>
                    Have something to discuss?
                </h2>

                <p>
                    Whether you have a question about Kryolt, need product
                    support, or want to explore a business partnership,
                    send us a message.
                </p>

            </div>

            {submitted ? (
                <div className="contact-form-success">
                    <CheckCircle2 size={28} />
                    <h3>Message sent</h3>
                    <p>
                        Thanks for reaching out — we'll get back to you
                        within 1–2 business days.
                    </p>
                    <button
                        type="button"
                        className="contact-form-success-btn"
                        onClick={() => setSubmitted(false)}
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form
                    className="contact-form"
                    onSubmit={handleSubmit}
                >

                    <div className="contact-form-row">

                        <div className="contact-field">
                            <label>Name</label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className="contact-field">
                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                    </div>

                    <div className="contact-field">

                        <label>Subject</label>

                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="How can we help?"
                            required
                        />

                    </div>

                    <div className="contact-field">

                        <label>Message</label>

                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message..."
                            rows="6"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="contact-submit-btn"
                    >
                        Send Message
                    </button>

                </form>
            )}

        </section>
    );
}

export default ContactForm;