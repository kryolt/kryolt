import { useState } from "react";
import { Link } from "react-router-dom";
import "./CookieConsent.css";

const CONSENT_KEY = "kryolt_cookie_consent";

function CookieConsent() {
    const [visible, setVisible] = useState(() => {
        try {
            return !localStorage.getItem(CONSENT_KEY);
        } catch {
            return true;
        }
    });

    const saveConsent = (value) => {
        try {
            localStorage.setItem(CONSENT_KEY, value);
        } catch {
            // Keep the banner usable even if localStorage is unavailable.
        }

        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <aside
            className="cookie-consent"
            role="dialog"
            aria-label="Cookie consent"
        >
            <div className="cookie-consent-content">
                <div className="cookie-consent-text">
                    <h2>We use cookies</h2>

                    <p>
                        We use cookies and similar technologies to improve your
                        experience, understand website usage, and support
                        essential features.
                    </p>

                    <Link
                        to="/cookies"
                        className="cookie-consent-link"
                    >
                        Learn more in our Cookie Policy
                    </Link>
                </div>

                <div className="cookie-consent-actions">
                    <button
                        type="button"
                        className="cookie-btn cookie-btn-secondary"
                        onClick={() => saveConsent("rejected")}
                    >
                        Reject All
                    </button>

                    <button
                        type="button"
                        className="cookie-btn cookie-btn-primary"
                        onClick={() => saveConsent("accepted")}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default CookieConsent;