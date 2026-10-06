import { useEffect } from "react";

const SITE_URL = "https://kryolt.com";
const DEFAULT_IMAGE = `${SITE_URL}/Kryolt.jpeg`;
const DEFAULT_SITE_NAME = "Kryolt";

const toAbsoluteUrl = (value, fallback = SITE_URL) => {
    if (!value) return fallback;

    try {
        return new URL(value, SITE_URL).href;
    } catch {
        return fallback;
    }
};

function SEO({
    title = "Kryolt | Business Analytics & AI Insights",
    description = "Kryolt helps businesses turn Excel and CSV data into clear dashboards, analytics, reports and AI-assisted insights.",
    canonicalPath = "/",
    image = DEFAULT_IMAGE,
    imageAlt = "Kryolt",
    robots = "index, follow",
    siteName = DEFAULT_SITE_NAME,
    locale = "",
    type = "website",
    twitterCard = "summary_large_image",
    twitterSite = "",
    twitterCreator = "",
    structuredData = null,
}) {
    useEffect(() => {
        /* =====================================================
           URLS
        ===================================================== */

        const canonicalUrl = toAbsoluteUrl(canonicalPath);
        const imageUrl = toAbsoluteUrl(image, DEFAULT_IMAGE);

        /* =====================================================
           DOCUMENT TITLE
        ===================================================== */

        document.title = title;

        /* =====================================================
           META HELPERS
        ===================================================== */

        const setMeta = ({ name, property }, content) => {
            if (!content) return;

            const selector = name
                ? `meta[name="${name}"]`
                : `meta[property="${property}"]`;

            let element = document.head.querySelector(selector);

            if (!element) {
                element = document.createElement("meta");

                if (name) {
                    element.setAttribute("name", name);
                }

                if (property) {
                    element.setAttribute("property", property);
                }

                document.head.appendChild(element);
            }

            element.setAttribute("content", String(content));
        };

        /* =====================================================
           BASIC SEO
        ===================================================== */

        setMeta(
            { name: "description" },
            description
        );

        setMeta(
            { name: "robots" },
            robots
        );

        /* =====================================================
           OPEN GRAPH
        ===================================================== */

        setMeta(
            { property: "og:title" },
            title
        );

        setMeta(
            { property: "og:description" },
            description
        );

        setMeta(
            { property: "og:type" },
            type
        );

        setMeta(
            { property: "og:url" },
            canonicalUrl
        );

        setMeta(
            { property: "og:site_name" },
            siteName
        );

        setMeta(
            { property: "og:image" },
            imageUrl
        );

        setMeta(
            { property: "og:image:alt" },
            imageAlt
        );

        if (locale) {
            setMeta(
                { property: "og:locale" },
                locale
            );
        }

        /* =====================================================
           TWITTER / X
        ===================================================== */

        setMeta(
            { name: "twitter:card" },
            twitterCard
        );

        setMeta(
            { name: "twitter:title" },
            title
        );

        setMeta(
            { name: "twitter:description" },
            description
        );

        setMeta(
            { name: "twitter:image" },
            imageUrl
        );

        setMeta(
            { name: "twitter:image:alt" },
            imageAlt
        );

        if (twitterSite) {
            setMeta(
                { name: "twitter:site" },
                twitterSite
            );
        }

        if (twitterCreator) {
            setMeta(
                { name: "twitter:creator" },
                twitterCreator
            );
        }

        /* =====================================================
           CANONICAL URL
        ===================================================== */

        let canonical =
            document.head.querySelector(
                'link[rel="canonical"]'
            );

        if (!canonical) {
            canonical = document.createElement("link");

            canonical.setAttribute(
                "rel",
                "canonical"
            );

            document.head.appendChild(canonical);
        }

        canonical.setAttribute(
            "href",
            canonicalUrl
        );

        /* =====================================================
           STRUCTURED DATA / JSON-LD
        ===================================================== */

        let structuredDataScript =
            document.head.querySelector(
                'script[data-seo-structured-data="true"]'
            );

        if (structuredData) {
            if (!structuredDataScript) {
                structuredDataScript =
                    document.createElement("script");

                structuredDataScript.setAttribute(
                    "type",
                    "application/ld+json"
                );

                structuredDataScript.setAttribute(
                    "data-seo-structured-data",
                    "true"
                );

                document.head.appendChild(
                    structuredDataScript
                );
            }

            structuredDataScript.textContent =
                JSON.stringify(structuredData);
        } else if (structuredDataScript) {
            structuredDataScript.remove();
        }

        /* =====================================================
           CLEANUP
        ===================================================== */

        return () => {
            // Metadata is intentionally preserved.
            // The next page's SEO component updates it.
        };
    }, [
        title,
        description,
        canonicalPath,
        image,
        imageAlt,
        robots,
        siteName,
        locale,
        type,
        twitterCard,
        twitterSite,
        twitterCreator,
        structuredData,
    ]);

    return null;
}

export default SEO;