import { useState } from "react";

import { useAuth } from "../../context/useAuth";

import {
    loginWithEmail,
    loginWithGoogle,
} from "../../services/auth/authService";

import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/firebase";

import { useNavigate } from "react-router-dom";

import {
    Eye,
    EyeOff,
} from "lucide-react";

function LoginForm({
    onSignup,
    onForget,
    onClose,
    selectedPlan = "Free",
}) {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const { refreshUser } = useAuth();


    // =====================================================
    // SAVE SELECTED PLAN
    // =====================================================

    const saveSelectedPlan = () => {

        if (!selectedPlan) return;

        localStorage.setItem(
            "kryolt_selected_plan",
            selectedPlan
        );

    };


    // =====================================================
    // EMAIL LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        try {

            setLoading(true);

            const result = await loginWithEmail(
                email,
                password
            );

            console.log(
                "✅ Login Success:",
                result.user.email
            );

            saveSelectedPlan();

            // Refresh latest Firebase user
            await refreshUser();

            onClose?.();

            navigate("/dashboard");

        } catch (err) {

            console.error(err);

            if (
                err.message ===
                "EMAIL_NOT_VERIFIED"
            ) {

                setError(
                    "Please verify your email before login."
                );

            } else if (
                err.code ===
                "auth/invalid-credential"
            ) {

                setError("Invalid email or password.");

            } else if (
                err.code ===
                "auth/user-not-found"
            ) {

                setError("No account found with this email.");

            } else if (
                err.code ===
                "auth/wrong-password"
            ) {

                setError("Incorrect password.");

            } else {

                setError(
                    err.message ||
                    "Login failed. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    const handleResendVerification = async () => {
        try {

            if (!auth.currentUser) {
                setError("Please login again.");
                return;
            }

            await sendEmailVerification(auth.currentUser);

            alert("Verification email sent successfully. Please check your inbox.");

        } catch (err) {

            console.error(err);

            setError("Unable to send verification email.");

        }
    };

    // =====================================================
    // GOOGLE LOGIN
    // =====================================================

    const handleGoogleLogin = async () => {

        setError("");

        try {

            setGoogleLoading(true);

            console.log(
                "🔵 Google login button clicked"
            );


            const result =
                await loginWithGoogle();


            console.log(
                "🟢 Login successful:",
                result.user.email
            );

            // Refresh latest Firebase user/profile state.
            await refreshUser();


            // Save selected plan
            saveSelectedPlan();


            onClose();

            navigate("/dashboard");


        } catch (err) {

            console.error(err);

            if (
                err.message ===
                "EMAIL_NOT_VERIFIED"
            ) {

                setError(
                    "Please verify your email before login."
                );

            } else if (
                err.code ===
                "auth/invalid-credential"
            ) {

                setError("Invalid email or password.");

            } else if (
                err.code ===
                "auth/user-not-found"
            ) {

                setError("No account found with this email.");

            } else if (
                err.code ===
                "auth/wrong-password"
            ) {

                setError("Incorrect password.");

            } else {

                setError(
                    err.message ||
                    "Login failed. Please try again."
                );

            }

        }

        setGoogleLoading(false);

    };


    return (

        <>

            <div className="auth-header">

                <h2>
                    Welcome Back ✨
                </h2>

                <p>
                    Login to continue using your dashboard.
                </p>

            </div>


            {/* SELECTED PLAN INFO */}

            {selectedPlan &&
                selectedPlan !== "Free" && (

                    <div className="selected-plan-info">

                        <span>
                            Selected Plan
                        </span>

                        <strong>
                            {selectedPlan === "professional"
                                ? "Professional"
                                : selectedPlan === "business"
                                    ? "Business"
                                    : selectedPlan}
                        </strong>

                    </div>

                )}


            {/* GOOGLE LOGIN */}

            <button
                type="button"
                className="google-auth-btn"
                onClick={handleGoogleLogin}
                disabled={
                    loading ||
                    googleLoading
                }
            >

                <span className="google-btn-content">

                    {googleLoading ? (

                        <>

                            <span className="google-spinner"></span>

                            <span>
                                Connecting...
                            </span>

                        </>

                    ) : (

                        <>

                            <svg
                                className="google-icon"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >

                                <path
                                    fill="#4285F4"
                                    d="M21.35 12.27c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.4z"
                                />

                                <path
                                    fill="#34A853"
                                    d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.75z"
                                />

                                <path
                                    fill="#FBBC05"
                                    d="M6.54 13.83A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.65H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.35l3.24-2.52z"
                                />

                                <path
                                    fill="#EA4335"
                                    d="M12 6.14c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.1 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.4l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03z"
                                />

                            </svg>

                            <span>
                                Continue with Google
                            </span>

                        </>

                    )}

                </span>

            </button>


            {/* EMAIL LOGIN */}

            <form
                className="auth-form"
                onSubmit={handleLogin}
            >

                <div className="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                    />

                </div>


                <div className="form-group">

                    <label>
                        Password
                    </label>

                    <div className="password-field">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                        >

                            {showPassword
                                ? <EyeOff size={20} />
                                : <Eye size={20} />
                            }

                        </button>

                    </div>


                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginBottom: "18px",
                        }}
                    >

                        <button
                            type="button"
                            className="text-btn"
                            onClick={onForget}
                        >

                            Forgot Password?

                        </button>

                    </div>

                </div>


                {error && (

                    <p className="auth-error">
                        {error}
                    </p>

                )}

                {error === "Please verify your email before login." && (
                    <button
                        type="button"
                        className="text-btn"
                        onClick={handleResendVerification}
                    >
                        Resend Verification Email
                    </button>
                )}

                <button
                    type="submit"
                    className="primary-auth-btn"
                    disabled={
                        loading ||
                        googleLoading
                    }
                >

                    {loading
                        ? "Logging in..."
                        : "Login"
                    }

                </button>

            </form>


            <div className="auth-footer">

                <p>

                    Don't have an account?

                    <button
                        type="button"
                        className="text-btn"
                        onClick={onSignup}
                    >

                        Create Account

                    </button>

                </p>

            </div>

        </>

    );

}


export default LoginForm;