import "./CTA.css";
import { APP } from "../../config/appConfig";
import { Rocket, ArrowRight, PlayCircle } from "lucide-react";

function CTA({ onStartFree }) {
    // Demo link is optional: if it is missing in appConfig, the button is simply hidden
    const demoUrl = APP?.socials?.youtube?.demo;

    return (
        <section
            className="cta-section"
            aria-labelledby="cta-title"
        >
            <div className="cta-box">

                <div
                    className="cta-glow"
                    aria-hidden="true"
                ></div>

                <span className="cta-badge">
                    <Rocket
                        size={14}
                        strokeWidth={2.5}
                        aria-hidden="true"
                    />
                    Ready to Grow Your Business?
                </span>

                {/* Two lines on tablet/laptop, flows naturally on phones */}
                <h2 id="cta-title" className="cta-title">
                    <span className="cta-line">Transform Your Business Data</span>{" "}
                    <span className="cta-line">Into Smart Decisions</span>
                </h2>

                <p className="cta-text">
                    Upload a CSV, and <strong>{APP.name}</strong> takes care
                    of the rest — clean dashboards, AI-backed insights, and
                    reports that actually help you decide what to do next.
                    No spreadsheets, no manual work.
                </p>

                <div className="cta-buttons">

                    {/* START FREE */}
                    <button
                        className="primary-btn"
                        type="button"
                        onClick={onStartFree}
                    >
                        Start Free
                        <ArrowRight
                            size={18}
                            strokeWidth={2.5}
                            aria-hidden="true"
                        />
                    </button>

                    {/* VIEW DEMO */}
                    {demoUrl && (
                        <a
                            className="secondary-btn"
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PlayCircle
                                size={18}
                                strokeWidth={2.2}
                                aria-hidden="true"
                            />
                            View Demo
                            <span className="cta-sr">(opens in a new tab)</span>
                        </a>
                    )}
                </div>

                <p className="cta-note">
                    No credit card required · Free forever plan
                </p>

            </div>
        </section>
    );
}

export default CTA;