import "./CTA.css";
import { APP } from "../../config/appConfig";
import { Rocket, ArrowRight, PlayCircle } from "lucide-react";

function CTA({ onStartFree }) {

    return (

        <section
            className="cta-section"
            aria-label="Call to action"
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
                    />

                    Ready to Grow Your Business?

                </span>


                <h2>

                    Transform Your Business Data

                    <br />

                    Into Smart Decisions

                </h2>


                <p>

                    Upload a CSV, and{" "}

                    <strong>
                        {APP.name}
                    </strong>

                    {" "}takes care of the rest — clean dashboards,
                    AI-backed insights, and reports that actually help you
                    decide what to do next. No spreadsheets, no manual work.

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
                        />

                    </button>


                    {/* VIEW DEMO */}

                    <a
                        className="secondary-btn"
                        href={APP.socials.youtube.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <PlayCircle
                            size={18}
                            strokeWidth={2.2}
                        />
                        View Demo
                    </a>
                </div>


                <p className="cta-note">

                    No credit card required · Free forever plan

                </p>

            </div>

        </section>

    );
}

export default CTA;