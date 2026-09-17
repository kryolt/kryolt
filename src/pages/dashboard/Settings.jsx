import { useState } from "react";
import "./Settings.css";

import SettingsSidebar from "../../components/settings/SettingsSidebar";
import ProfileSection from "../../components/settings/ProfileSection";
import WorkspaceSection from "../../components/settings/WorkspaceSection";
import AppearanceSection from "../../components/settings/AppearanceSection";
import SecuritySection from "../../components/settings/SecuritySection";
import BillingSection from "../../components/settings/BillingSection";
import DataSection from "../../components/settings/DataSection";
import AboutSection from "../../components/settings/AboutSection";
import SaveBar from "../../components/settings/SaveBar";

function Settings() {
    const [active, setActive] = useState("Profile");
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert("Settings saved successfully.");
        }, 1200);
    };

    const handleReset = () => {
        if (window.confirm("Reset all settings?")) {
            window.location.reload();
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>
                    Manage your account, workspace and application preferences.
                </p>
            </div>

            <div className="settings-layout">
                <aside className="settings-sidebar">
                    <SettingsSidebar
                        active={active}
                        setActive={setActive}
                    />
                </aside>

                <main className="settings-content">
                    {active === "Profile" && <ProfileSection />}
                    {active === "Workspace" && <WorkspaceSection />}
                    {active === "Appearance" && <AppearanceSection />}
                    {active === "Security" && <SecuritySection />}
                    {active === "Billing" && <BillingSection />}
                    {active === "Data" && <DataSection />}
                    {active === "About" && <AboutSection />}

                    <SaveBar
                        saving={saving}
                        onSave={handleSave}
                        onReset={handleReset}
                    />
                </main>
            </div>
        </div>
    );
}

export default Settings;