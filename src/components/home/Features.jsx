import "./Features.css";
import { APP } from "../../config/appConfig";
import {
    UploadCloud,
    Sparkles,
    LayoutDashboard,
    TrendingUp,
    FileText,
    BrainCircuit
} from "lucide-react";

const features = [
    {
        icon: UploadCloud,
        title: "CSV Upload",
        desc: "Upload your CSV files instantly with drag & drop support. Excel upload is coming soon."
    },
    {
        icon: Sparkles,
        title: "AI Data Cleaning",
        desc: "Automatically remove duplicates and fix missing data."
    },
    {
        icon: LayoutDashboard,
        title: "Interactive Dashboard",
        desc: "Generate modern dashboards with beautiful charts."
    },
    {
        icon: TrendingUp,
        title: "Business Analytics",
        desc: "Track sales, profit, expenses and KPIs in real-time."
    },
    {
        icon: FileText,
        title: "Export Reports",
        desc: "Download reports in PDF, Excel and print-ready format — launching soon.",
    },
    {
        icon: BrainCircuit,
        title: "AI-Powered Insights",
        desc: "Get automated, AI-driven insights and recommendations from your business data."
    }
];

function Features() {
    return (
        <section id="features" className="features">
            <div className="section-heading">
                <span>FEATURES</span>
                <h2>Everything You Need To Grow Your Business</h2>
                <p>
                    {APP.name} provides powerful AI tools for retailers,
                    shop owners, and growing small businesses.
                </p>
            </div>

            <div className="features-grid">
                {features.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div className="feature-card" key={index}>
                            <div className="feature-icon">
                                <Icon size={24} strokeWidth={2} />
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

export default Features;