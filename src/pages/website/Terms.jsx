import "./Terms.css";

import HomeNavbar from "../../components/home/HomeNavbar";
import TermsContent from "../../components/home/legal/TermsContent";
import HomeFooter from "../../components/home/HomeFooter";

function Terms() {
    return (
        <div className="legal-page terms-page">

            <HomeNavbar />

            <main className="legal-main">

                <section className="legal-hero">
                    <div className="legal-hero-inner">

                        <span className="legal-eyebrow">
                            KRYOLT · LEGAL
                        </span>

                        <h1>Terms &amp; Conditions</h1>

                        <p>
                            Please review the terms that govern your use of
                            Kryolt, our platform and our services.
                        </p>

                        <span className="legal-updated">
                            Last updated: July 2026
                        </span>

                    </div>
                </section>

                <section className="legal-content-area">

                    <TermsContent />

                </section>

            </main>

            <HomeFooter />

        </div>
    );
}

export default Terms;