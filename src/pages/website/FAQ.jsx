import HomeNavbar from "../../components/home/HomeNavbar";
import FAQSection from "../../components/home/FAQ";
import HomeFooter from "../../components/home/HomeFooter";

import "./FAQ.css";

import SEO from "../../components/seo/SEO";

function FAQ() {
    return (
        <div className="website-page faq-page">

            <SEO
                title="Frequently Asked Questions | Kryolt"
                description="Find answers to common questions about Kryolt, AI business intelligence, dashboards, business analytics, reports and data insights."
                canonicalPath="/faq"
            />

            {/* Main Website Navbar */}
            <HomeNavbar />

            {/* FAQ Content */}
            <main className="faq-page-content">
                <FAQSection />
            </main>
            <HomeFooter />

        </div>
    );
}

export default FAQ;