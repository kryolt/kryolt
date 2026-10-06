import "./Trusted.css";
import { APP } from "../../config/appConfig";

/* =========================================================
   INDUSTRY ICONS
   (shared <svg> wrapper so every icon uses the same stroke style)
========================================================= */

const IconSvg = ({ children }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const IconRetail = () => (
    <IconSvg>
        <path d="M4 9.5 5 4h14l1 5.5" />
        <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
        <path d="M5.5 10.5V20h13v-9.5" />
    </IconSvg>
);

const IconEcommerce = () => (
    <IconSvg>
        <path d="M4 5h2l1.4 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.5L20 8H7" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
    </IconSvg>
);

const IconWholesale = () => (
    <IconSvg>
        <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
        <path d="M4 8l8 4.5L20 8" />
        <path d="M12 12.5V21" />
    </IconSvg>
);

const IconDistributor = () => (
    <IconSvg>
        <rect x="3" y="5" width="7" height="7" rx="1.2" />
        <rect x="14" y="5" width="7" height="7" rx="1.2" />
        <rect x="8.5" y="15" width="7" height="5" rx="1.2" />
        <path d="M6.5 12v2h11v-2M12 14v1" />
    </IconSvg>
);

const IconSupermarket = () => (
    <IconSvg>
        <path d="M3.5 6h2l1.4 9.3a1.8 1.8 0 0 0 1.8 1.5h8.1a1.8 1.8 0 0 0 1.8-1.5L20 8H7" />
        <circle cx="9.5" cy="20" r="1.2" />
        <circle cx="16.5" cy="20" r="1.2" />
    </IconSvg>
);

const IconD2C = () => (
    <IconSvg>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h6M7 16h3" />
    </IconSvg>
);

/* =========================================================
   DEFAULT INDUSTRIES
========================================================= */

const DEFAULT_INDUSTRIES = [
    { label: "Retail Stores", Icon: IconRetail },
    { label: "E-commerce Businesses", Icon: IconEcommerce },
    { label: "Wholesalers", Icon: IconWholesale },
    { label: "Distributors", Icon: IconDistributor },
    { label: "Supermarkets", Icon: IconSupermarket },
    { label: "D2C Brands", Icon: IconD2C },
];

/* =========================================================
   TRUSTED SECTION
========================================================= */

function Trusted({
    industries = DEFAULT_INDUSTRIES,
    speed = 26,
}) {
    const appName = APP?.name || "Kryolt";

    // Two identical sets = seamless infinite loop (track moves -50%).
    // The second set is decorative only (class "is-copy").
    const renderSet = (isCopy) =>
        industries.map((item) => {
            const IndustryIcon = item.Icon;

            return (
                <span
                    className={`trusted-pill${isCopy ? " is-copy" : ""}`}
                    key={`${item.label}${isCopy ? "-copy" : ""}`}
                >
                    <span className="trusted-pill-icon">
                        <IndustryIcon />
                    </span>

                    {item.label}
                </span>
            );
        });

    return (
        <section
            className="trusted"
            aria-labelledby="trusted-title"
        >
            <p className="trusted-eyebrow">
                Trusted across businesses
            </p>

            <h2
                id="trusted-title"
                className="trusted-title"
            >
                Growing businesses run on {appName}
            </h2>

            {/* Accessible list for screen readers */}
            <ul className="sr-only">
                {industries.map((item) => (
                    <li key={item.label}>
                        {item.label}
                    </li>
                ))}
            </ul>

            {/* Visual infinite slider */}
            <div
                className="trusted-slider"
                aria-hidden="true"
            >
                <div
                    className="trusted-track"
                    style={{
                        animationDuration: `${speed}s`,
                    }}
                >
                    {renderSet(false)}
                    {renderSet(true)}
                </div>
            </div>
        </section>
    );
}

export default Trusted;