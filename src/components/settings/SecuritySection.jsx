import {
    ShieldCheck,
    BadgeCheck,
    Mail,
    Lock,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";

import "./SecuritySection.css";

function SecuritySection() {

    const { currentUser } = useAuth();

    const isVerified = currentUser?.emailVerified;

    return (

        <div className="settings-card">

            <div className="settings-header">

                <div>

                    <h2>Security</h2>

                    <p>
                        Basic security information for your Kryolt account.
                    </p>

                </div>

                <span className="status-badge security">

                    <ShieldCheck size={14} />

                    Secure

                </span>

            </div>

            <div className="security-grid">

                <div className="security-card">

                    <div className="security-icon">

                        <Mail size={18} />

                    </div>

                    <div className="security-info">

                        <h4>Email Verification</h4>

                        <p>

                            {isVerified
                                ? "Your email is verified."
                                : "Your email is not verified."}

                        </p>

                    </div>

                    <span
                        className={
                            isVerified
                                ? "security-status verified"
                                : "security-status pending"
                        }
                    >

                        {isVerified ? (
                            <>
                                <BadgeCheck size={14} />
                                Verified
                            </>
                        ) : (
                            "Pending"
                        )}

                    </span>

                </div>

                <div className="security-card">

                    <div className="security-icon">

                        <Lock size={18} />

                    </div>

                    <div className="security-info">

                        <h4>Password</h4>

                        <p>
                            Password is managed securely by Firebase Authentication.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default SecuritySection;