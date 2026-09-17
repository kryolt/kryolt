import {
    Lightbulb,
    ShieldCheck,
    Users,
    Zap,
} from "lucide-react";

import "./Values.css";

const VALUES = [
    {
        icon: Lightbulb,
        title: "Simplicity",
        text: "We make complex data easy to understand and act upon.",
    },
    {
        icon: Zap,
        title: "Innovation",
        text: "We use AI and technology to continuously improve business intelligence.",
    },
    {
        icon: ShieldCheck,
        title: "Trust",
        text: "We believe business data should be handled with transparency and care.",
    },
    {
        icon: Users,
        title: "Customer First",
        text: "We build products around the real needs of growing businesses.",
    },
];

function Values() {
    return (
        <section className="about-values">
            <div className="values-header">
                <span>What We Believe</span>

                <h2>
                    Built around values that matter.
                </h2>

                <p>
                    Our principles guide how we build Kryolt and how we serve
                    the businesses that trust us.
                </p>
            </div>

            <div className="values-grid">
                {VALUES.map((value) => {
                    const Icon = value.icon;

                    return (
                        <div className="value-card" key={value.title}>
                            <div className="value-icon">
                                <Icon size={20} />
                            </div>

                            <h3>{value.title}</h3>

                            <p>{value.text}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Values;