import { useEffect, useRef, useState } from "react";
import "./PrivacyContent.css";

const SECTIONS = [
    {
        id: "information-we-collect",
        title: "Information we collect",
        body: (
            <p>
                We may collect information you provide when creating an
                account, using Kryolt services, uploading business data,
                contacting us, or interacting with our website.
            </p>
        ),
    },
    {
        id: "how-we-use",
        title: "How we use your information",
        body: (
            <p>
                We may use collected information to provide, maintain,
                improve, personalize, and secure our services. We may also
                use it to communicate with you about your account, services,
                updates, and support requests.
            </p>
        ),
    },
    {
        id: "business-data",
        title: "Business data",
        body: (
            <p>
                Kryolt is designed to help businesses analyze their data.
                Users are responsible for ensuring that they have the
                necessary rights and permissions to upload and process
                business data through the platform.
            </p>
        ),
    },
    {
        id: "data-security",
        title: "Data security",
        body: (
            <p>
                We take reasonable technical and organizational measures to
                protect information from unauthorized access, misuse,
                alteration, or disclosure.
            </p>
        ),
    },
    {
        id: "third-party",
        title: "Third-party services",
        body: (
            <p>
                Kryolt may use third-party services for hosting,
                authentication, analytics, payments, or other operational
                purposes. These services may process information according to
                their own privacy policies.
            </p>
        ),
    },
    {
        id: "your-rights",
        title: "Your rights",
        body: (
            <p>
                Depending on applicable laws, you may have rights regarding
                access, correction, deletion, or management of your personal
                information.
            </p>
        ),
    },
    {
        id: "contact",
        title: "Contact us",
        body: (
            <>
                <p>
                    If you have questions about this Privacy Policy or how
                    Kryolt handles your information, please contact us at:
                </p>
                <a href="mailto:hello@kryolt.com" className="legal-email">
                    hello@kryolt.com
                </a>
            </>
        ),
    },
];

function PrivacyContent() {
    const [activeId, setActiveId] = useState(SECTIONS[0].id);
    const sectionRefs = useRef({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
        );

        Object.values(sectionRefs.current).forEach(function (el) {
            if (el) observer.observe(el);
        });

        return function () {
            observer.disconnect();
        };
    }, []);

    function handleNavClick(e, id) {
        e.preventDefault();
        const target = sectionRefs.current[id];
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function renderTocItem(section, i) {
        const isActive = activeId === section.id;
        const linkClassName = isActive
            ? "legal-toc-link is-active"
            : "legal-toc-link";
        const linkHref = "#" + section.id;
        const indexLabel = String(i + 1).padStart(2, "0");

        function onLinkClick(e) {
            handleNavClick(e, section.id);
        }

        return (
            <li key={section.id}>
                <a href={linkHref} className={linkClassName} onClick={onLinkClick}>
                    <span className="legal-toc-index">{indexLabel}</span>
                    {section.title}
                </a>
            </li>
        );
    }

    function renderSection(section, i) {
        const sectionIndexLabel = String(i + 1).padStart(2, "0");

        function setRef(el) {
            sectionRefs.current[section.id] = el;
        }

        return (
            <section
                key={section.id}
                id={section.id}
                ref={setRef}
                className="legal-section"
            >
                <span className="legal-section-index">{sectionIndexLabel}</span>
                <h2>{section.title}</h2>
                {section.body}
            </section>
        );
    }

    return (
        <div className="legal-layout">
            <aside className="legal-toc" aria-label="Table of contents">
                <span className="legal-toc-label">On this page</span>
                <nav>
                    <ul>{SECTIONS.map(renderTocItem)}</ul>
                </nav>
            </aside>

            <article className="legal-content">
                <p className="legal-intro">
                    At Kryolt, we respect your privacy and are committed to
                    protecting the personal information you share with us.
                </p>

                {SECTIONS.map(renderSection)}
            </article>
        </div>
    );
}

export default PrivacyContent;