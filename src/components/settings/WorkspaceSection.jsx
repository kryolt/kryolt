import { Building2, Globe, Clock3, Wallet, Briefcase } from "lucide-react";
import { useUser } from "../../context/UserContext";

import "./WorkspaceSection.css";

function WorkspaceSection() {

    const { user, updateUser } = useUser();

    const handleChange = (e) => {
        updateUser({
            [e.target.name]: e.target.value,
        });
    };

    return (

        <div className="settings-card">

            <div className="settings-header">

                <div>

                    <h2>Workspace</h2>

                    <p>
                        Configure your business workspace and regional preferences.
                    </p>

                </div>

                <span className="status-badge">
                    Active Workspace
                </span>

            </div>

            <div className="settings-grid">

                <div className="field">

                    <label>
                        <Building2 size={16} />
                        Workspace Name
                    </label>

                    <input
                        name="workspace"
                        value={user.workspace || ""}
                        onChange={handleChange}
                        placeholder="Kryolt"
                    />

                </div>

                <div className="field">

                    <label>
                        <Briefcase size={16} />
                        Company
                    </label>

                    <input
                        name="company"
                        value={user.company}
                        onChange={handleChange}
                        placeholder="Kryolt Technologies"
                    />

                </div>

                <div className="field">

                    <label>
                        <Globe size={16} />
                        Industry
                    </label>

                    <input
                        name="industry"
                        value={user.industry}
                        onChange={handleChange}
                        placeholder="Retail / Finance / Healthcare"
                    />

                </div>

                <div className="field">

                    <label>
                        <Wallet size={16} />
                        Currency
                    </label>

                    <select
                        name="currency"
                        value={user.currency}
                        onChange={handleChange}
                    >
                        <option value="INR">🇮🇳 INR</option>
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪🇺 EUR</option>
                        <option value="AED">🇦🇪 AED</option>
                    </select>

                </div>

                <div className="field">

                    <label>
                        <Clock3 size={16} />
                        Timezone
                    </label>

                    <input
                        name="timezone"
                        value={user.timezone}
                        onChange={handleChange}
                        placeholder="Asia/Kolkata"
                    />

                </div>

                <div className="field">

                    <label>
                        Fiscal Year
                    </label>

                    <select>

                        <option>January - December</option>

                        <option>April - March</option>

                    </select>

                </div>

            </div>

        </div>

    );

}

export default WorkspaceSection;