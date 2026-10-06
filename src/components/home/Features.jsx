import "./Features.css";

import SEO from "../../components/seo/SEO";

import { APP } from "../../config/appConfig";

import {
    UploadCloud,
    Sparkles,
    LayoutDashboard,
    TrendingUp,
    FileText,
    BrainCircuit,
} from "lucide-react";

const features = [
    {
        icon: UploadCloud,
        title: "CSV & Excel Upload",
        desc: "Upload your CSV and Excel business data easily with drag-and-drop support.",
    },
    {
        icon: Sparkles,
        title: "AI Data Cleaning",
        desc: "Clean your data automatically by finding duplicates and missing values.",
    },
    {
        icon: LayoutDashboard,
        title: "Interactive Dashboard",
        desc: "Turn your business data into clear dashboards with charts, KPIs, and trends.",
    },
    {
        icon: TrendingUp,
        title: "Business Analytics",
        desc: "Track sales, revenue, products, customers, payments, and key business metrics.",
    },
    {
        icon: FileText,
        title: "Business Reports",
        desc: "Generate detailed sales, customer, product, payment, and business reports.",
    },
    {
        icon: BrainCircuit,
        title: "AI-Powered Insights",
        desc: "Get simple AI insights and recommendations to better understand your business data.",
    },
];

const FEATURES_STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://kryolt.com/features#webpage",
            url: "https://kryolt.com/features",
            name: "AI Business Intelligence Features | Kryolt",
            description:
                "Explore Kryolt features for business analytics, interactive dashboards, CSV data analysis, AI-powered insights and automated reporting.",
        },
        {
            "@type": "ItemList",
            "@id": "https://kryolt.com/features#features",
            name: "Kryolt Features",
            itemListElement: features.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.title,
                description: item.desc,
            })),
        },
    ],
};

function Features() {
    return (
        <>
            <SEO
                title="AI Business Intelligence Features | Kryolt"
                description="Explore Kryolt features for business analytics, interactive dashboards, CSV data analysis, AI-powered insights and automated reporting."
                canonicalPath="/features"
                image="/Kryolt.jpeg"
                imageAlt="Kryolt AI Business Intelligence Platform"
                structuredData={FEATURES_STRUCTURED_DATA}
            />

            <section
                id="features"
                className="features"
                aria-labelledby="features-title"
            >
                {/* Heading hierarchy: h1 (page) -> h2 (each feature) */}
                <header className="features-heading">
                    <p className="features-eyebrow">FEATURES</p>

                    <h1 id="features-title" className="features-title">
                        Everything You Need To Grow Your Business
                    </h1>

                    <p className="features-subtitle">
                        {APP.name} provides powerful AI tools for retailers,
                        shop owners, and growing small businesses.
                    </p>
                </header>

                <ul className="features-grid">
                    {features.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li className="feature-card" key={item.title}>
                                <div className="feature-icon">
                                    <Icon
                                        size={22}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="feature-body">
                                    <h2 className="feature-title">
                                        {item.title}
                                    </h2>

                                    <p className="feature-desc">{item.desc}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}

export default Features;