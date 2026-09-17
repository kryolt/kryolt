import HomeNavbar from "../../components/home/HomeNavbar";
import FAQSection from "../../components/home/FAQ";
import HomeFooter from "../../components/home/HomeFooter";

import "./FAQ.css";

function FAQ() {
    return (
        <div className="website-page faq-page">

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