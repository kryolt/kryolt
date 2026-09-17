import { Target } from "lucide-react";

import "./Mission.css";

function Mission() {
    return (
        <section className="about-mission">
            <div className="mission-container">

                <span className="mission-eyebrow">
                    <Target size={14} />
                    Our Mission
                </span>

                <div className="mission-statement">
                    <h2>
                        Make powerful business intelligence
                        accessible to everyone.
                    </h2>
                </div>

                <p className="mission-body">
                    We believe every business should be able to understand
                    its data without needing a team of data scientists.
                    Kryolt turns complex business data into simple,
                    actionable insights that help business owners make
                    confident decisions.
                </p>

                <div className="mission-proof">
                    <span>No SQL</span>
                    <span>No dashboards to build</span>
                    <span>No waiting on an analyst</span>
                </div>

            </div>
        </section>
    );
}

export default Mission;