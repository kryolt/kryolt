import { useState } from "react";
import {
    User,
    Mail,
    Phone,
    Building2,
    Globe,
    Clock,
    Camera,
    Pencil,
    Save,
    X,
} from "lucide-react";

import { useUser } from "../../context/UserContext";
import "./ProfileSection.css";

function ProfileSection() {
    const { user, updateUser } = useUser();
    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState(user || {});

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleEdit = () => {
        setForm(user || {});
        setEditing(true);
    };

    const handleSave = async () => {
        if (updateUser) {
            await updateUser(form);
        }
        setEditing(false);
    };

    const handleCancel = () => {
        setForm(user || {});
        setEditing(false);
    };

    // While viewing, always show the latest user data from context.
    // While editing, show the local form state.
    const displayForm = editing ? form : user || {};

    return (
        <div className="profile-card">
            <div className="profile-top">
                <div className="profile-avatar">
                    <User size={32} />

                    <button
                        type="button"
                        aria-label="Upload photo"
                    >
                        <Camera size={14} />
                    </button>
                </div>

                <div className="profile-info">
                    <h2>{displayForm?.name || "User Name"}</h2>
                    <p>{displayForm?.email || "email@example.com"}</p>
                </div>
            </div>

            <div className="profile-grid">
                <Field
                    icon={<User size={18} />}
                    label="Full Name"
                    name="name"
                    value={displayForm?.name}
                    editing={editing}
                    onChange={handleChange}
                />

                <Field
                    icon={<Mail size={18} />}
                    label="Email"
                    name="email"
                    value={displayForm?.email}
                    disabled
                />

                <Field
                    icon={<Phone size={18} />}
                    label="Phone"
                    name="phone"
                    value={displayForm?.phone}
                    editing={editing}
                    onChange={handleChange}
                />

                <Field
                    icon={<Building2 size={18} />}
                    label="Company"
                    name="company"
                    value={displayForm?.company}
                    editing={editing}
                    onChange={handleChange}
                />

                <Field
                    icon={<Globe size={18} />}
                    label="Country"
                    name="country"
                    value={displayForm?.country}
                    editing={editing}
                    onChange={handleChange}
                />

                <Field
                    icon={<Clock size={18} />}
                    label="Timezone"
                    name="timezone"
                    value={displayForm?.timezone}
                    editing={editing}
                    onChange={handleChange}
                />
            </div>

            <div className="profile-actions">
                {!editing ? (
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleEdit}
                    >
                        <Pencil size={18} />
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            className="btn-success"
                            onClick={handleSave}
                        >
                            <Save size={18} />
                            Save
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancel}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function Field({
    icon,
    label,
    name,
    value,
    editing,
    disabled,
    onChange,
}) {
    return (
        <div className="profile-field">
            <label htmlFor={name}>
                {icon}
                <span>{label}</span>
            </label>

            <input
                id={name}
                type="text"
                name={name}
                value={value || ""}
                disabled={!editing || disabled}
                onChange={onChange}
            />
        </div>
    );
}

export default ProfileSection;