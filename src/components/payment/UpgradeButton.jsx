import { useAuth } from "../../context/useAuth";

import {
    openRazorpayCheckout,
} from "../../services/payment/razorpayService";


function UpgradeButton({

    plan = "Professional",

    amount = 499,

    couponCode = null,

    disabled = false,

    children,

}) {

    const {
        currentUser,
        loading,
    } = useAuth();


    const handleUpgrade = async () => {

        if (loading) {

            alert(
                "Please wait..."
            );

            return;

        }


        if (!currentUser) {

            alert(
                "Please login before upgrading."
            );

            return;

        }


        if (disabled) {
            return;
        }


        try {

            await openRazorpayCheckout({

                plan,

                amount,

                userId:
                    currentUser.uid,

                name:
                    currentUser.displayName ||
                    "Kryolt User",

                email:
                    currentUser.email ||
                    "",

                couponCode:
                    couponCode || null,

            });

        } catch (error) {

            console.error(
                "Payment Error:",
                error
            );

            alert(
                error?.message ||
                "Unable to start payment."
            );

        }

    };


    return (

        <button

            type="button"

            onClick={
                handleUpgrade
            }

            disabled={
                loading ||
                disabled
            }

        >

            {children || (

                loading

                    ? "Checking account..."

                    : `Upgrade to ${plan} — ₹${amount}`

            )}

        </button>

    );

}


export default UpgradeButton;