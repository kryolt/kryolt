import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase";

function ForgetPasswordModal({ onBack }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            setLoading(true);

            await sendPasswordResetEmail(auth, email);

            setSuccess(
                "Password reset link has been sent to your email."
            );
        } catch (err) {
            switch (err.code) {
                case "auth/user-not-found":
                    setError("No account found with this email.");
                    break;

                case "auth/invalid-email":
                    setError("Please enter a valid email.");
                    break;

                default:
                    setError(
                        "Unable to send the reset link. Please try again."
                    );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-header">
                <h2>Forget Password 🔑</h2>
                <p>
                    Enter your registered email address.
                    We'll send you a password reset link.
                </p>
            </div>

            <form
                className="auth-form"
                onSubmit={handleReset}
            >
                <div className="form-group">
                    <label>Email Address</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <p className="auth-error">
                        {error}
                    </p>
                )}

                {success && (
                    <p
                        style={{
                            color: "#16a34a",
                            fontWeight: "600",
                            marginBottom: "14px"
                        }}
                    >
                        {success}
                    </p>
                )}

                <button
                    className="primary-auth-btn"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <div className="auth-footer">
                <button
                    type="button"
                    className="text-btn"
                    onClick={onBack}
                >
                    ← Back to Login
                </button>
            </div>
        </>
    );
}

export default ForgetPasswordModal;
