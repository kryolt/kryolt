import { useState, useEffect } from "react";
import EditProfileModal from "../../components/profile/EditProfileModal";
import { useAuth } from "../../context/useAuth";
import { useUser } from "../../context/UserContext";
import { APP } from "../../config/appConfig";

import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/firebase";

import {
    Pencil,
    Copy,
    Check,
    BadgeCheck,
    Shield,
    HardDrive,
    User as UserIcon,
    FileText,
    Activity
} from "lucide-react";

import "./Profile.css";

function Profile() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const { currentUser, refreshUser } = useAuth();
    const { user, isProfessional, isBusiness } = useUser();

    useEffect(() => {
        const loadUser = async () => {
            await refreshUser();
            if (auth.currentUser) {
                await auth.currentUser.reload();
            }
        };
        loadUser();
    }, [refreshUser]);

    const userName =
        user?.name ||
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "User";

    const userEmail =
        user?.email ||
        currentUser?.email ||
        "Not Available";

    const initial = userName.charAt(0).toUpperCase();
    const isVerified = !!currentUser?.emailVerified;

    const handleVerifyEmail = async () => {
        try {
            const userObj = auth.currentUser;
            if (!userObj) {
                alert("Please login first.");
                return;
            }
            await sendEmailVerification(userObj);
            alert("Verification email sent successfully.");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const memberSince = user?.createdAt?.toDate
        ? user.createdAt.toDate().toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })
        : currentUser?.metadata?.creationTime
            ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })
            : "Unknown";

    const lastLogin = user?.lastLogin?.toDate
        ? user.lastLogin.toDate().toLocaleString("en-IN", { dateStyle: 'short', timeStyle: 'short' })
        : currentUser?.metadata?.lastSignInTime
            ? new Date(currentUser.metadata.lastSignInTime).toLocaleString("en-IN", { dateStyle: 'short', timeStyle: 'short' })
            : "Unknown";

    const rawUid = currentUser?.uid || "";
    const uidDisplay = rawUid ? `${rawUid.substring(0, 10)}...` : "Unknown";

    const handleCopyUid = () => {
        if (!rawUid) return;
        navigator.clipboard.writeText(rawUid);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const formatStorage = (mb) => {
        const value = Number(mb) || 0;

        if (value >= 1024) {
            return `${(value / 1024).toFixed(2)} GB`;
        }

        return `${value.toFixed(2)} MB`;
    };

    const storageDisplay = `${formatStorage(user?.storageUsed)} Used • Local`;

    const currentPlan = isBusiness
        ? "Business"
        : isProfessional
            ? "Professional"
            : "Free";

    return (
        <div className="profile-page">
            <div className="profile-head">
                <div className="profile-head-content">
                    <h1>My Profile</h1>
                    <p>Manage your account details and preferences</p>
                </div>

                <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                    <Pencil size={15} />
                    Edit Profile
                </button>
            </div>

            <div className="profile-body">
                <div className="profile-main">
                    <div className="identity-card">
                        <div className="identity-top">
                            <div className="avatar-ring">
                                {currentUser?.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt={userName}
                                        className="profile-avatar-img"
                                    />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {initial}
                                    </div>
                                )}
                                <span className="status-dot" title="Active Session" />
                            </div>

                            <div className="identity-meta">
                                <div className="identity-name-row">
                                    <h2>{userName}</h2>
                                    <span className="role-badge">
                                        {user?.role || "Owner"}
                                    </span>
                                    {isVerified && (
                                        <span className="verified-badge">
                                            <BadgeCheck size={14} /> Verified
                                        </span>
                                    )}
                                </div>

                                <div className="meta-line">
                                    <span className="email-text">{userEmail}</span>
                                    {!isVerified && (
                                        <button className="verify-email-btn" onClick={handleVerifyEmail}>
                                            Verify Email
                                        </button>
                                    )}
                                </div>

                                <div className="meta-line muted">
                                    Member since {memberSince}
                                </div>
                            </div>
                        </div>

                        <div className="chip-row">
                            <div className="chip">
                                <div className="chip-header">
                                    <Shield size={14} />
                                    <span>Plan</span>
                                </div>
                                <span className="chip-value">{currentPlan}</span>
                            </div>

                            <div className="chip">
                                <div className="chip-header">
                                    <HardDrive size={14} />
                                    <span>Storage</span>
                                </div>
                                <span className="chip-value">{storageDisplay}</span>
                            </div>

                            <div className="chip">
                                <div className="chip-header">
                                    <UserIcon size={14} />
                                    <span>Role</span>
                                </div>
                                <span className="chip-value">{user?.role || "Owner"}</span>
                            </div>

                            <div className="chip">
                                <div className="chip-header">
                                    <FileText size={14} />
                                    <span>Uploads</span>
                                </div>
                                <span className="chip-value">{user?.uploads || 0} Files</span>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3>Account Information</h3>
                        <div className="info-grid">
                            <div className="info-row">
                                <span>Full Name</span>
                                <strong>{userName}</strong>
                            </div>

                            <div className="info-row">
                                <span>Email Address</span>
                                <strong>{userEmail}</strong>
                            </div>

                            <div className="info-row">
                                <span>Role</span>
                                <strong>{user?.role || "Owner"}</strong>
                            </div>

                            <div className="info-row">
                                <span>Account Type</span>
                                <strong>{currentPlan}</strong>
                            </div>

                            <div className="info-row">
                                <span>Email Status</span>
                                <strong className={isVerified ? "text-good" : "text-bad"}>
                                    {isVerified ? "Verified" : "Not Verified"}
                                </strong>
                            </div>

                            <div className="info-row">
                                <span>Phone</span>
                                <strong>{user?.phone || "Not Added"}</strong>
                            </div>

                            <div className="info-row">
                                <span>Company</span>
                                <strong>{user?.company || "Not Added"}</strong>
                            </div>

                            <div className="info-row">
                                <span>Country</span>
                                <strong>{user?.country || "India"}</strong>
                            </div>

                            <div className="info-row">
                                <span>Timezone</span>
                                <strong>{user?.timezone || "Asia/Kolkata"}</strong>
                            </div>

                            <div className="info-row">
                                <span>Last Login</span>
                                <strong>{lastLogin}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3>Security</h3>
                        <div className="info-grid">
                            <div className="info-row">
                                <span>Password</span>
                                <strong className="mono">••••••••••••</strong>
                            </div>

                            <div className="info-row">
                                <span>Email Verification</span>
                                <strong className={isVerified ? "text-good" : "text-bad"}>
                                    {isVerified ? "Verified" : "Not Verified"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-side">
                    <div className="section-card session-panel">
                        <div className="session-panel-head">
                            <div className="session-title">
                                <Activity size={16} />
                                <span>Session Status</span>
                            </div>
                            <span className="session-live-badge">
                                <span className="live-dot" /> Live
                            </span>
                        </div>

                        <div className="session-details">
                            <div className="session-item">
                                <span className="session-label">UID</span>
                                <button className="session-copy-btn" onClick={handleCopyUid} title="Click to copy full UID">
                                    <span className="mono">{uidDisplay}</span>
                                    {copied ? <Check size={13} className="text-good" /> : <Copy size={13} />}
                                </button>
                            </div>

                            <div className="session-item">
                                <span className="session-label">Last Activity</span>
                                <span className="session-val">{lastLogin}</span>
                            </div>

                            <div className="session-item">
                                <span className="session-label">Verified</span>
                                <span className={`session-val ${isVerified ? "text-good" : "text-bad"}`}>
                                    {isVerified ? "True" : "False"}
                                </span>
                            </div>

                            <div className="session-item">
                                <span className="session-label">Current Plan</span>
                                <span className="session-val">{currentPlan}</span>
                            </div>
                        </div>
                    </div>

                    <div className="section-card app-panel">
                        <h3>System Info</h3>
                        <div className="info-grid">
                            <div className="info-row">
                                <span>Application</span>
                                <strong>{APP.name}</strong>
                            </div>

                            <div className="info-row">
                                <span>Version</span>
                                <strong className="mono">{APP.version}</strong>
                            </div>

                            <div className="info-row">
                                <span>Product</span>
                                <strong>{APP.tagline}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal open={showEditModal} onClose={() => setShowEditModal(false)} />
        </div>
    );
}

export default Profile;