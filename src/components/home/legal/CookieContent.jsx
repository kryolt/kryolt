import "./CookieContent.css";

function CookieContent() {
    return (
        <article className="cookie-content">

            <section className="cookie-section">
                <h2>1. What Are Cookies?</h2>

                <p>
                    Cookies are small text files that are stored on your
                    device when you visit a website. They help websites
                    remember information about your visit and provide a
                    smoother and more personalized experience.
                </p>
            </section>

            <section className="cookie-section">
                <h2>2. How We Use Cookies</h2>

                <p>
                    Kryolt may use cookies and similar technologies to provide
                    essential website functionality, remember user preferences,
                    understand how visitors interact with our website and
                    improve our products and services.
                </p>
            </section>

            <section className="cookie-section">
                <h2>3. Types of Cookies We May Use</h2>

                <div className="cookie-list">

                    <div className="cookie-item">
                        <h3>Essential Cookies</h3>

                        <p>
                            These cookies are necessary for important website
                            features and basic functionality to work properly.
                        </p>
                    </div>

                    <div className="cookie-item">
                        <h3>Preference Cookies</h3>

                        <p>
                            These cookies help remember your settings and
                            preferences to provide a more convenient experience.
                        </p>
                    </div>

                    <div className="cookie-item">
                        <h3>Analytics Cookies</h3>

                        <p>
                            These cookies may help us understand how visitors
                            interact with our website so we can improve the
                            experience and performance of our services.
                        </p>
                    </div>

                </div>
            </section>

            <section className="cookie-section">
                <h2>4. Managing Cookies</h2>

                <p>
                    Most web browsers allow you to control, block or delete
                    cookies through your browser settings. Please note that
                    disabling certain cookies may affect the availability or
                    functionality of some features on our website.
                </p>
            </section>

            <section className="cookie-section">
                <h2>5. Third-Party Technologies</h2>

                <p>
                    Some services used by Kryolt may use cookies or similar
                    technologies to provide analytics, authentication,
                    security or other operational functionality. These
                    third-party services may have their own privacy and cookie
                    policies.
                </p>
            </section>

            <section className="cookie-section">
                <h2>6. Updates to This Policy</h2>

                <p>
                    We may update this Cookie Policy from time to time to
                    reflect changes in our services, technologies or applicable
                    requirements. Any changes will be published on this page
                    with an updated revision date.
                </p>
            </section>

            <section className="cookie-section">
                <h2>7. Contact Us</h2>

                <p>
                    If you have questions about this Cookie Policy or how
                    Kryolt uses cookies, please contact us at:
                </p>

                <a
                    href="mailto:hello@kryolt.com"
                    className="cookie-contact-link"
                >
                    hello@kryolt.com
                </a>
            </section>

        </article>
    );
}

export default CookieContent;