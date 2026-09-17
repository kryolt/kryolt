import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { Camera, User, Save, X } from "lucide-react";

import { auth } from "../../firebase/firebase";
import { useAuth } from "../../context/useAuth";
import { useUser } from "../../context/UserContext";

import "./EditProfileModal.css";

function EditProfileModal({ open, onClose }) {

    const {
        currentUser,
    } = useAuth();

    const {
        user,
        updateUser,
    } = useUser();

    const [name, setName] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [loading, setLoading] = useState(false);
    const [prevOpen, setPrevOpen] = useState(open);

    // Adjust state during render instead of in a useEffect (avoids the
    // extra "render stale, then re-render" cascade the effect version
    // triggered). Runs only on the render where `open` actually changes.
    if (open !== prevOpen) {

        setPrevOpen(open);

        if (open) {

            setName(
                user?.name ||
                currentUser?.displayName ||
                currentUser?.email?.split("@")[0] ||
                "User"
            );

            setPhotoURL(
                user?.avatar ||
                currentUser?.photoURL ||
                ""
            );

        }

    }

    if (!open) return null;

    const handleSave = async () => {

        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }

        try {

            setLoading(true);

            // Firebase Auth
            await updateProfile(auth.currentUser, {
                displayName: name.trim(),
                photoURL: photoURL.trim(),
            });

            // Firestore
            await updateUser({
                name: name.trim(),
                avatar: photoURL.trim(),
            });

            await auth.currentUser.reload();

            alert("✅ Profile Updated Successfully");

            onClose();

        } catch (err) {

            console.error(err);
            alert(err.message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="edit-profile-overlay"
            onClick={onClose}
        >

            <div
                className="edit-profile-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="modal-header">

                    <h2>Edit Profile</h2>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>

                <div className="avatar-preview">

                    {
                        photoURL ? (
                            <img
                                src={photoURL}
                                alt="avatar"
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                <User size={40} />
                            </div>
                        )
                    }

                </div>

                <div className="edit-group">

                    <label>

                        <User size={16} />

                        Full Name

                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                </div>

                <div className="edit-group">

                    <label>

                        <Camera size={16} />

                        Profile Photo URL

                    </label>

                    <input
                        type="text"
                        placeholder="https://example.com/avatar.jpg"
                        value={photoURL}
                        onChange={(e) =>
                            setPhotoURL(e.target.value)
                        }
                    />

                </div>

                <div className="edit-group">

                    <label>Email</label>

                    <input
                        type="email"
                        value={currentUser?.email || ""}
                        disabled
                    />

                </div>

                <div className="edit-actions">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Saving..."
                                : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}

export default EditProfileModal;