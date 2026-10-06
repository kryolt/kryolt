import { useId, useState } from "react";
import "./FAQ.css";
import { Plus } from "lucide-react";

const faqs = [
    {
        question: "What is Kryolt?",
        answer:
            "Kryolt is a business intelligence platform that helps businesses turn their sales data into clear dashboards, reports, and actionable insights."
    },
    {
        question: "How does Kryolt work?",
        answer:
            "Simply upload your CSV or Excel file, and Kryolt transforms your business data into easy-to-understand dashboards, visualizations, reports, and insights."
    },
    {
        question: "Do I need coding or technical knowledge?",
        answer:
            "No. Kryolt is designed for business owners and teams, so you can analyze your data without writing code or having advanced technical knowledge."
    },
    {
        question: "Is my business data secure?",
        answer:
            "Data security is an important part of Kryolt. We are building the platform with appropriate security practices to help protect your business data."
    },
    {
        question: "Can I try Kryolt for free?",
        answer:
            "Yes. Kryolt offers a free option that allows you to explore the platform and experience its core analytics features."
    },
    {
        question: "Who is Kryolt built for?",
        answer:
            "Kryolt is built for small businesses, retailers, startups, and teams that want simple, practical, and accessible business analytics."
    }
];

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);
    const baseId = useId();

    const toggleFAQ = (index) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section id="faq" className="faq" aria-labelledby="faq-title">
            <div className="faq-heading">
                <span>FAQ</span>
                <h2 id="faq-title">Frequently Asked Questions</h2>
                <p>Everything you need to know about Kryolt</p>
            </div>

            <div className="faq-container">
                {faqs.map((item, index) => {
                    const isActive = activeIndex === index;
                    const buttonId = `${baseId}-q-${index}`;
                    const answerId = `${baseId}-a-${index}`;

                    return (
                        <div
                            className={`faq-item ${isActive ? "active" : ""}`}
                            key={item.question}
                        >
                            {/* Heading wraps the button: h2 (section) -> h3 (question) */}
                            <h3 className="faq-heading-item">
                                <button
                                    type="button"
                                    id={buttonId}
                                    className="faq-question"
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={isActive}
                                    aria-controls={answerId}
                                >
                                    <span>{item.question}</span>

                                    <span className="faq-icon" aria-hidden="true">
                                        <Plus size={14} strokeWidth={2.5} />
                                    </span>
                                </button>
                            </h3>

                            <div
                                id={answerId}
                                className="faq-answer-wrap"
                                role="region"
                                aria-labelledby={buttonId}
                            >
                                <div className="faq-answer-inner">
                                    <p className="faq-answer">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default FAQ;