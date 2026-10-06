import "./CookiePolicy.css";

import SEO from "../../components/seo/SEO";

import HomeNavbar from "../../components/home/HomeNavbar";
import CookieContent from "../../components/home/legal/CookieContent";
import HomeFooter from "../../components/home/HomeFooter";

function CookiePolicy() {
    return (
        <div className="legal-page cookie-policy-page">

            <SEO
                title="Cookie Policy | Kryolt"
                description="Read Kryolt's Cookie Policy to understand how cookies and similar technologies are used across our website and services."
                canonicalPath="/cookies"
            />

            <HomeNavbar />

            <main className="legal-main">

                <section className="legal-hero">
                    <div className="legal-hero-inner">

                        <span className="legal-eyebrow">
                            KRYOLT · LEGAL
                        </span>

                        <h1>Cookie Policy</h1>

                        <p>
                            Learn how Kryolt uses cookies and similar
                            technologies to improve website functionality,
                            user experience and our services.
                        </p>

                        <span className="legal-updated">
                            Last updated: July 2026
                        </span>

                    </div>
                </section>

                <section className="legal-content-area">

                    <CookieContent />

                </section>

            </main>

            <HomeFooter />

        </div>
    );
}

export default CookiePolicy;