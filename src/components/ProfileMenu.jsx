import { useEffect, useRef } from "react";
import "./ProfileMenu.css";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

import {
    User,
    Settings,
    LayoutDashboard,
    LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function ProfileMenu({ open, onClose }) {

    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {

        if (!open) return;

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };

    }, [open, onClose]);

    if (!open) return null;

    const handleLogout = async () => {

        try {
            await signOut(auth);
            onClose();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout Error:", error);
        }

    };

    return (

        <div className="profile-menu" ref={menuRef} role="menu">

            <button
                role="menuitem"
                onClick={() => {
                    navigate("/dashboard/profile", { replace: true });
                    onClose();
                }}
            >
                <User size={18} />
                <span>My Profile</span>
            </button>

            <button
                role="menuitem"
                onClick={() => {
                    navigate("/dashboard/settings", { replace: true });
                    onClose();
                }}
            >
                <Settings size={18} />
                <span>Settings</span>
            </button>

            <button
                role="menuitem"
                onClick={() => {
                    navigate("/dashboard", { replace: true });
                    onClose();
                }}
            >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
            </button>

            <hr />

            <button
                role="menuitem"
                className="logout-btn"
                onClick={handleLogout}
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>

        </div>

    );
}

export default ProfileMenu;