import "./Trusted.css";
import { APP } from "../../config/appConfig";

// ---- Inline icon set — same stroke weight/style as the footer's social
// icons, so this section reads as part of one system, not a mismatched
// emoji row. ----

const IconHospital = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3.5" width="16" height="17" rx="2" />
        <path d="M12 8v6M9 11h6" />
    </svg>
);

const IconRetail = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5 5 4h14l1 5.5" />
        <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
        <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
);

const IconSchool = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 8 9-4 9 4-9 4-9-4Z" />
        <path d="M7 10.5v4.6c0 1.3 2.2 2.4 5 2.4s5-1.1 5-2.4v-4.6" />
        <path d="M20 8v6" />
    </svg>
);

const IconMedical = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="9.5" width="17" height="9" rx="4.5" />
        <path d="M12 9.5v9" />
    </svg>
);

const IconWholesale = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
        <path d="M4 8l8 4.5L20 8M12 12.5V21" />
    </svg>
);

const IconSupermarket = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 6h2l1.4 9.3a1.8 1.8 0 0 0 1.8 1.5h8.1a1.8 1.8 0 0 0 1.8-1.5L20 8H7" />
        <circle cx="9.5" cy="20" r="1.2" />
        <circle cx="16.5" cy="20" r="1.2" />
    </svg>
);

// Local fallback data — agar appConfig me TRUSTED_INDUSTRIES export nahi hai
// to bhi component crash nahi karega.
const DEFAULT_INDUSTRIES = [
    { label: "Hospitals", Icon: IconHospital },
    { label: "Retail Stores", Icon: IconRetail },
    { label: "Schools", Icon: IconSchool },
    { label: "Medical Stores", Icon: IconMedical },
    { label: "Wholesalers", Icon: IconWholesale },
    { label: "Supermarkets", Icon: IconSupermarket },
];

function Trusted({ industries = DEFAULT_INDUSTRIES, speed = 26 }) {
    const appName = APP?.name || "Kryolt";

    return (
        <section className="trusted">

            <p className="trusted-eyebrow">Trusted across industries</p>
            <p className="trusted-title">
                Growing businesses run on {appName}
            </p>

            {/* Accessible, static list for screen readers only */}
            <ul className="sr-only">
                {industries.map((item) => (
                    <li key={item.label}>{item.label}</li>
                ))}
            </ul>

            <div className="trusted-slider" aria-hidden="true">
                <div
                    className="trusted-track"
                    style={{ animationDuration: `${speed}s` }}
                >

                    {industries.map((item) => (
                        <span className="trusted-pill" key={item.label}>
                            <span className="trusted-pill-icon">
                                <item.Icon />
                            </span>
                            {item.label}
                        </span>
                    ))}

                    {/* duplicate set for seamless infinite scroll */}
                    {industries.map((item) => (
                        <span className="trusted-pill" key={`${item.label}-dup`}>
                            <span className="trusted-pill-icon">
                                <item.Icon />
                            </span>
                            {item.label}
                        </span>
                    ))}

                </div>
            </div>

        </section>
    );
}

export default Trusted;