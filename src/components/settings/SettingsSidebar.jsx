import {
    User,
    Building2,
    Palette,
    ShieldCheck,
    Database,
    CreditCard,
    Info,
    Settings2,
    ChevronRight,
} from "lucide-react";

import "./SettingsSidebar.css";

const menu = [
    { title: "Profile", icon: User },
    { title: "Workspace", icon: Building2 },
    { title: "Appearance", icon: Palette },
    { title: "Security", icon: ShieldCheck },
    { title: "Data", icon: Database },
    { title: "Billing", icon: CreditCard },
    { title: "About", icon: Info },
];

function SettingsSidebar({ active, setActive }) {
    return (
        <div className="settings-sidebar-menu">
            <div className="sidebar-title">
                <div className="sidebar-icon">
                    <Settings2 size={28} strokeWidth={2.3} />
                </div>

                <div>
                    <h3>Settings</h3>
                    <p>Manage your Kryolt Workspace</p>
                </div>
            </div>

            {menu.map((item) => {
                const Icon = item.icon;

                return (
                    <button
                        key={item.title}
                        className={`settings-item ${active === item.title ? "active" : ""
                            }`}
                        onClick={() => setActive(item.title)}
                    >
                        <div className="settings-left">
                            <Icon size={19} />
                            <span>{item.title}</span>
                        </div>

                        <ChevronRight size={16} />
                    </button>
                );
            })}
        </div>
    );
}

export default SettingsSidebar;