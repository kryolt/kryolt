import { useState } from "react";
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

    const toggleFAQ = (index) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section id="faq" className="faq">
            <div className="faq-heading">
                <span>FAQ</span>
                <h2>Frequently Asked Questions</h2>
                <p>Everything you need to know about Kryolt</p>
            </div>

            <div className="faq-container">
                {faqs.map((item, index) => {
                    const isActive = activeIndex === index;

                    return (
                        <div
                            className={`faq-item ${isActive ? "active" : ""
                                }`}
                            key={index}
                        >
                            <button
                                type="button"
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                                aria-expanded={isActive}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <span>{item.question}</span>

                                <span className="faq-icon">
                                    <Plus
                                        size={14}
                                        strokeWidth={2.5}
                                    />
                                </span>
                            </button>

                            <div
                                id={`faq-answer-${index}`}
                                className="faq-answer-wrap"
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