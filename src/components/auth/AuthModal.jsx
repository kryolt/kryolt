import { useState } from "react";

import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgetPasswordModal from "./ForgetPasswordModal";

import "./AuthModal.css";


function AuthModal({
    open,
    onClose,
    selectedPlan = "Free",
}) {

    const [mode, setMode] =
        useState("login");


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    if (!open) {

        return null;

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className="auth-overlay"
            onClick={onClose}
        >

            <div
                className="auth-modal"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* =================================================
                    CLOSE BUTTON
                ================================================= */}

                <button
                    type="button"
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >

                    ✕

                </button>


                {/* =================================================
                    LOGIN
                ================================================= */}

                {mode === "login" && (

                    <LoginForm

                        selectedPlan={
                            selectedPlan
                        }

                        onSignup={() =>
                            setMode("signup")
                        }

                        onForget={() =>
                            setMode("forget")
                        }

                        onClose={onClose}

                    />

                )}


                {/* =================================================
                    SIGNUP
                ================================================= */}

                {mode === "signup" && (

                    <SignupForm

                        selectedPlan={
                            selectedPlan
                        }

                        onLogin={() =>
                            setMode("login")
                        }

                        onClose={onClose}

                    />

                )}


                {/* =================================================
                    FORGOT PASSWORD
                ================================================= */}

                {mode === "forget" && (

                    <ForgetPasswordModal

                        onBack={() =>
                            setMode("login")
                        }

                    />

                )}

            </div>

        </div>

    );

}


export default AuthModal;