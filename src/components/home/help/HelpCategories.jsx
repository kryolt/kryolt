import {
    Rocket,
    Upload,
    BarChart3,
    CreditCard,
} from "lucide-react";

function HelpCategories() {
    const categories = [
        {
            icon: Rocket,
            title: "Getting Started",
            description:
                "Learn how to create your account and get started with Kryolt.",
        },
        {
            icon: Upload,
            title: "Data & Uploads",
            description:
                "Learn how to upload CSV or Excel files and work with your business data.",
        },
        {
            icon: BarChart3,
            title: "Analytics & Insights",
            description:
                "Understand your dashboard, analytics, reports and business insights.",
        },
        {
            icon: CreditCard,
            title: "Account & Billing",
            description:
                "Manage your profile, subscription and account settings.",
        },
    ];

    return (
        <section className="help-categories-section">
            <div className="help-section-heading">
                <span>Explore Help</span>

                <h2>
                    Find the help you need
                </h2>

                <p>
                    Browse our support topics to find useful information
                    about using Kryolt.
                </p>
            </div>

            <div className="help-categories">
                {categories.map((category) => {
                    const Icon = category.icon;

                    return (
                        <div
                            className="help-category"
                            key={category.title}
                        >
                            <div className="help-category-icon">
                                <Icon size={22} />
                            </div>

                            <div className="help-category-content">
                                <h3>
                                    {category.title}
                                </h3>

                                <p>
                                    {category.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default HelpCategories;