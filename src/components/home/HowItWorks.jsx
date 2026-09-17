import "./HowItWorks.css";
import { APP } from "../../config/appConfig";
import { UploadCloud, Sparkles, LayoutDashboard, BrainCircuit, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: UploadCloud,
        title: "Upload CSV",
        desc: "Upload your CSV file securely. Excel support is coming soon."
    },
    {
        number: "02",
        icon: Sparkles,
        title: "AI Cleans Data",
        desc: "Automatic cleaning, formatting and validation."
    },
    {
        number: "03",
        icon: LayoutDashboard,
        title: "Generate Dashboard",
        desc: "Interactive charts and KPIs are created instantly."
    },
    {
        number: "04",
        icon: BrainCircuit,
        title: "Get AI Insights",
        desc: "Receive automated, AI-driven insights from your business data."
    }
];

function HowItWorks() {
    return (
        <section className="how">
            <div className="how-heading">
                <span>HOW IT WORKS</span>
                <h2>How {APP.name} Works</h2>
                <p>From raw CSV to professional AI dashboards within seconds.</p>
            </div>

            <div className="steps four-columns">
                {steps.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div className="step-card" key={item.number} style={{ "--delay": `${index * 0.1}s` }}>
                            {index < steps.length - 1 && (
                                <span className="step-connector" aria-hidden="true">
                                    <ArrowRight size={14} strokeWidth={2.5} />
                                </span>
                            )}

                            <div className="step-top">
                                <div className="step-icon">
                                    <Icon size={24} strokeWidth={2} />
                                </div>
                                <div className="step-number">{item.number}</div>
                            </div>

                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default HowItWorks;