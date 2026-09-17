import { ArrowRight, FileText } from "lucide-react";

function PopularArticles() {
    const resources = [
        {
            title: "How to upload your first business dataset",
            description:
                "Learn how to upload CSV or Excel data and start using your Kryolt dashboard.",
        },
        {
            title: "Understanding your Kryolt dashboard",
            description:
                "Get familiar with KPIs, charts and the main business analytics available in your dashboard.",
        },
        {
            title: "Understanding AI-powered insights",
            description:
                "Learn how Kryolt turns your business data into summaries, recommendations and insights.",
        },
        {
            title: "Managing your account settings",
            description:
                "Learn where to manage your profile, preferences and account-related settings.",
        },
    ];

    return (
        <section className="popular-articles">
            <div className="help-section-heading">
                <span>Popular Resources</span>

                <h2>
                    Helpful Resources
                </h2>

                <p>
                    Explore useful guides and information to help you
                    get more from Kryolt.
                </p>
            </div>

            <div className="help-articles-list">
                {resources.map((resource, index) => (
                    <div
                        className="help-article"
                        key={resource.title}
                    >
                        <div className="help-article-left">
                            <div className="help-article-icon">
                                <FileText size={18} />
                            </div>

                            <div>
                                <span className="help-article-number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <h3>
                                    {resource.title}
                                </h3>

                                <p className="help-article-description">
                                    {resource.description}
                                </p>
                            </div>
                        </div>

                        <ArrowRight size={19} aria-hidden="true" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default PopularArticles;