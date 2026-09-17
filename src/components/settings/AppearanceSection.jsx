import { Monitor } from "lucide-react";
import { useUser } from "../../context/UserContext";

import "./AppearanceSection.css";

function AppearanceSection() {

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

                    <h2>Appearance</h2>

                    <p>
                        Customize the look and feel of your Kryolt workspace.
                    </p>

                </div>

                <span className="status-badge appearance">

                    Version 1

                </span>

            </div>

            <div className="settings-grid">

                <div className="field">

                    <label>

                        <Monitor size={16} />

                        Theme

                    </label>

                    <select
                        name="theme"
                        value={user.theme || "Light"}
                        onChange={handleChange}
                    >

                        <option value="Light">
                            Light
                        </option>

                        <option disabled>
                            Dark (Coming Soon)
                        </option>

                        <option disabled>
                            System (Coming Soon)
                        </option>

                    </select>

                </div>

            </div>

            <div className="coming-soon-box">

                <h4>
                    More personalization is Coming soon.
                </h4>

                <p>

                    Dark Mode, Accent Colors, Compact Layout,
                    Sidebar Customization and additional UI themes
                    will be available in future updates.

                </p>

            </div>

        </div>

    );

}

export default AppearanceSection;