import { useState } from "react";

import {
    signupWithEmail,
    loginWithGoogle,
} from "../../services/auth/authService";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

import {
    Eye,
    EyeOff,
    LoaderCircle,
} from "lucide-react";

// =====================================================
// SIGNUP FORM
// =====================================================

function SignupForm({
    onLogin,
    onClose,
    selectedPlan = "Free",
}) {

    const navigate = useNavigate();


    // =====================================================
    // FORM STATE
    // =====================================================

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const { refreshUser } = useAuth();

    // =====================================================
    // UI STATE
    // =====================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // =====================================================
    // NORMALIZE SELECTED PLAN
    // =====================================================

    const normalizedPlan =
        String(selectedPlan || "Free")
            .trim()
            .toLowerCase();


    // =====================================================
    // SAVE SELECTED PLAN
    // =====================================================

    const saveSelectedPlan = () => {

        try {

            localStorage.setItem(
                "kryolt_selected_plan",
                normalizedPlan
            );

        } catch (storageError) {

            console.error(
                "Error saving selected plan:",
                storageError
            );

        }

    };


    // =====================================================
    // EMAIL SIGNUP
    // =====================================================

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");


        // Prevent duplicate submission
        if (
            loading ||
            googleLoading
        ) {

            return;

        }


        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        if (
            password.length < 6
        ) {

            setError(
                "Password must be at least 6 characters."
            );

            return;

        }


        try {

            setLoading(true);

            // =================================================
            // CREATE FIREBASE ACCOUNT
            // =================================================

            const result = await signupWithEmail(
                name,
                email,
                password,
                selectedPlan
            );

            console.log("✅ Signup Success:", result.user.email);
            console.log("✅ Profile:", result.profile);

            // =================================================
            // SAVE SELECTED PRICING PLAN
            // =================================================

            saveSelectedPlan();


            console.log(
                "🟢 Signup successful"
            );

            console.log(
                "Selected plan:",
                normalizedPlan
            );


            // =================================================
            // CLOSE AUTH MODAL
            // =================================================

            // =================================================
            // EMAIL VERIFICATION MESSAGE
            // =================================================

            await refreshUser();

            onClose?.();

            navigate("/dashboard");

        } catch (err) {

            console.error(
                "❌ Email signup error:",
                err
            );


            // =================================================
            // FIREBASE ERROR HANDLING
            // =================================================

            if (
                err.code ===
                "auth/email-already-in-use"
            ) {

                setError(
                    "An account with this email already exists. Please login."
                );

            } else if (
                err.code ===
                "auth/invalid-email"
            ) {

                setError(
                    "Please enter a valid email address."
                );

            } else if (
                err.code ===
                "auth/weak-password"
            ) {

                setError(
                    "Password is too weak. Please use a stronger password."
                );

            } else if (
                err.code ===
                "auth/network-request-failed"
            ) {

                setError(
                    "Network error. Please check your internet connection."
                );

            } else {

                setError(
                    err.message ||
                    "Unable to create your account. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // GOOGLE SIGNUP / LOGIN
    // =====================================================

    const handleGoogleSignup = async () => {

        setError("");


        // Prevent duplicate popup
        if (
            loading ||
            googleLoading
        ) {

            return;

        }


        try {

            setGoogleLoading(true);


            console.log(
                "🔵 Google signup started"
            );


            // =================================================
            // GOOGLE AUTHENTICATION
            // =================================================

            const result =
                await loginWithGoogle();


            console.log(
                "🟢 Google signup successful:",
                result?.user?.email
            );

            // Refresh latest Firebase user/profile state.
            await refreshUser();


            // =================================================
            // SAVE SELECTED PLAN
            // =================================================

            saveSelectedPlan();


            console.log(
                "Selected plan:",
                normalizedPlan
            );


            // =================================================
            // CLOSE AUTH MODAL
            // =================================================

            onClose?.();


            // =================================================
            // GO TO DASHBOARD
            // =================================================

            navigate(
                "/dashboard"
            );


        } catch (err) {

            console.error(
                "❌ Google signup error:",
                err
            );


            // =================================================
            // USER CLOSED POPUP
            // =================================================

            if (
                err.code ===
                "auth/popup-closed-by-user"
            ) {

                return;

            }


            // =================================================
            // POPUP BLOCKED
            // =================================================

            if (
                err.code ===
                "auth/popup-blocked"
            ) {

                setError(
                    "Google popup was blocked. Please allow popups and try again."
                );

                return;

            }


            // =================================================
            // MULTIPLE POPUP REQUEST
            // =================================================

            if (
                err.code ===
                "auth/cancelled-popup-request"
            ) {

                return;

            }


            // =================================================
            // ACCOUNT EXISTS WITH DIFFERENT CREDENTIAL
            // =================================================

            if (
                err.code ===
                "auth/account-exists-with-different-credential"
            ) {

                setError(
                    "An account already exists with this email. Please login using your existing sign-in method."
                );

                return;

            }


            // =================================================
            // DEFAULT ERROR
            // =================================================

            setError(
                err.message ||
                "Google signup failed. Please try again."
            );

        } finally {

            setGoogleLoading(false);

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="auth-header">

                <h2>
                    Create Account ✨
                </h2>

                <p>
                    Create your Kryolt account.
                </p>

            </div>


            {/* =================================================
                GOOGLE SIGNUP
            ================================================= */}

            <button
                type="button"
                className="google-auth-btn"
                onClick={
                    handleGoogleSignup
                }
                disabled={
                    loading ||
                    googleLoading
                }
            >

                {googleLoading ? (

                    <>

                        <LoaderCircle
                            className="google-loading-icon"
                            size={20}
                        />

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
                                d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.21 2.91-7.22Z"
                            />

                            <path
                                fill="#34A853"
                                d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
                            />

                            <path
                                fill="#FBBC05"
                                d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.36l3.24-2.53Z"
                            />

                            <path
                                fill="#EA4335"
                                d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
                            />

                        </svg>

                        <span>
                            Continue with Google
                        </span>

                    </>

                )}

            </button>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="auth-divider">

                <span>
                    OR
                </span>

            </div>


            {/* =================================================
                EMAIL SIGNUP FORM
            ================================================= */}

            <form
                className="auth-form"
                onSubmit={
                    handleSignup
                }
            >


                {/* NAME */}

                <div className="form-group">

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                        required
                        disabled={
                            loading ||
                            googleLoading
                        }
                    />

                </div>


                {/* EMAIL */}

                <div className="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                        disabled={
                            loading ||
                            googleLoading
                        }
                    />

                </div>


                {/* PASSWORD */}

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
                            placeholder="Create password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                            minLength={6}
                            disabled={
                                loading ||
                                googleLoading
                            }
                        />


                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(
                                    (prev) =>
                                        !prev
                                )
                            }
                            disabled={
                                loading ||
                                googleLoading
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >

                            {showPassword

                                ? (
                                    <EyeOff
                                        size={20}
                                    />
                                )

                                : (
                                    <Eye
                                        size={20}
                                    />
                                )

                            }

                        </button>

                    </div>

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="form-group">

                    <label>
                        Confirm Password
                    </label>

                    <div className="password-field">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Confirm password"
                            value={
                                confirmPassword
                            }
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            required
                            minLength={6}
                            disabled={
                                loading ||
                                googleLoading
                            }
                        />


                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(
                                    (prev) =>
                                        !prev
                                )
                            }
                            disabled={
                                loading ||
                                googleLoading
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >

                            {showPassword

                                ? (
                                    <EyeOff
                                        size={20}
                                    />
                                )

                                : (
                                    <Eye
                                        size={20}
                                    />
                                )

                            }

                        </button>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <p className="auth-error">

                        {error}

                    </p>

                )}


                {/* =================================================
                    CREATE ACCOUNT BUTTON
                ================================================= */}

                <button
                    type="submit"
                    className="primary-auth-btn"
                    disabled={
                        loading ||
                        googleLoading
                    }
                >

                    {loading

                        ? "Creating..."

                        : "Create Account"

                    }

                </button>

            </form>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="auth-footer">

                <p>

                    Already have an account?

                    <button
                        type="button"
                        className="text-btn"
                        onClick={onLogin}
                        disabled={
                            loading ||
                            googleLoading
                        }
                    >

                        Login

                    </button>

                </p>

            </div>

        </>

    );

}


export default SignupForm;