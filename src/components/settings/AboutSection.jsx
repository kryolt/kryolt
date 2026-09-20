import {
    Info,
    Globe,
    Mail,
    FileText,
    ShieldCheck,
} from "lucide-react";

import "./AboutSection.css";

function AboutSection() {
    const version = "v1.0.0";

    return (
        <div className="settings-card">

            <div className="settings-header">

                <div>
                    <h2>About Kryolt</h2>
                    <p>
                        Product information, support and legal resources.
                    </p>
                </div>

                <span className="status-badge about">
                    <Info size={14} />
                    {version}
                </span>

            </div>

            <div className="about-grid">

                <div className="about-card">

                    <Globe size={20} />

                    <div className="about-content">
                        <h4>Website</h4>
                        <p>https://kryolt.com</p>
                    </div>

                </div>

                <div className="about-card">

                    <Mail size={20} />

                    <div className="about-content">
                        <h4>Support Email</h4>
                        <p>hello@kryolt.com</p>
                    </div>

                </div>

                <div className="about-card">

                    <FileText size={20} />

                    <div className="about-content">
                        <h4>Terms & Conditions</h4>
                        <p>https://kryolt.com/terms</p>
                    </div>

                </div>

                <div className="about-card">

                    <ShieldCheck size={20} />

                    <div className="about-content">
                        <h4>Privacy Policy</h4>
                        <p>https://kryolt.com/privacy</p>
                    </div>

                </div>

            </div>

            <div className="about-footer">

                <div>
                    <strong>Kryolt</strong>
                    <p>AI Business Intelligence Platform</p>
                </div>

                <div className="version-box">
                    Version {version}
                </div>

            </div>

        </div>
    );
}

export default AboutSection;