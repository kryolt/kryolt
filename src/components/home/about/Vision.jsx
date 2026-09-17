import { Eye } from "lucide-react";

import "./Vision.css";

function Vision() {
    return (
        <section className="about-vision">
            <div className="vision-container">

                <div className="vision-content">
                    <span className="vision-eyebrow">Our Vision</span>

                    <h2>
                        Become the most trusted AI business intelligence
                        platform for small businesses worldwide.
                    </h2>

                    <p>
                        Our vision is to create a future where every business
                        owner can use their data as easily as they use their
                        everyday tools. We want to make intelligent decision
                        making simple, accessible and practical.
                    </p>
                </div>

                <div className="vision-card">
                    <div className="vision-card__accent" aria-hidden="true" />
                    <Eye size={30} />
                    <h3>
                        Data should create clarity,
                        not complexity.
                    </h3>
                </div>

            </div>
        </section>
    );
}

export default Vision;