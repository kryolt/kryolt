import "./PrivacyPolicy.css";

import HomeNavbar from "../../components/home/HomeNavbar";
import PrivacyContent from "../../components/home/legal/PrivacyContent";
import HomeFooter from "../../components/home/HomeFooter";

function PrivacyPolicy() {
    return (
        <div className="legal-page privacy-page">
            <HomeNavbar />

            <main className="legal-main">
                <section className="legal-hero">
                    <div className="legal-hero-inner">
                        <span className="legal-eyebrow">Kryolt · Legal</span>

                        <h1>Privacy Policy</h1>

                        <p>
                            Your privacy matters to us. Learn how Kryolt
                            collects, uses, protects and manages your
                            information when you use our platform.
                        </p>

                        <span className="legal-updated">
                            Last updated: July 2026
                        </span>
                    </div>
                </section>

                <section className="legal-content-area">
                    <PrivacyContent />
                </section>
            </main>

            <HomeFooter />
        </div>
    );
}

export default PrivacyPolicy;