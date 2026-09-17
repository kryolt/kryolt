import "./Testimonials.css";
import { APP } from "../../config/appConfig";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        text: `The AI insights are incredibly useful. I can now identify my best products and improve profits without complicated spreadsheets.`,
        name: "Rahul Sharma",
        role: "Retail Store Owner",
        rating: 5
    },
    {
        text: `${APP.name} helped us understand our sales performance instantly. Reports that took hours now take just seconds.`,
        name: "Priya Verma",
        role: "E-commerce Seller",
        rating: 5
    },
    {
        text: `Uploading CSV files and generating dashboards is amazingly simple. Perfect solution for small businesses.`,
        name: "Amit Patel",
        role: "Business Consultant",
        rating: 5
    }
];

function Testimonials() {
    return (
        <section className="testimonials">

            <div className="testimonials-heading">
                <span>TESTIMONIALS</span>
                <h2>Loved by Businesses</h2>
                <p>
                    Thousands of business owners trust {APP.name} to analyze
                    their sales and make better decisions.
                </p>
            </div>

            <div className="testimonials-grid">
                {testimonials.map((item) => (
                    <div className="testimonial-card" key={item.name}>

                        <Quote className="quote-icon" size={32} strokeWidth={0} aria-hidden="true" />

                        <div
                            className="stars"
                            aria-label={`Rated ${item.rating} out of 5 stars`}
                        >
                            {Array.from({ length: item.rating }).map((_, i) => (
                                <Star key={i} size={16} fill="#2E5CE8" strokeWidth={0} aria-hidden="true" />
                            ))}
                        </div>

                        <blockquote>
                            {item.text}
                        </blockquote>

                        <div className="user">
                            <div className="avatar" aria-hidden="true">
                                {item.name.charAt(0)}
                            </div>

                            <div>
                                <h4>{item.name}</h4>
                                <span>{item.role}</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </section>
    );
}

export default Testimonials;