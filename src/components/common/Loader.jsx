import "./Loader.css";

function Loader({
    message = "Loading...",
    fullScreen = false,
}) {
    return (
        <div
            className={`app-loader ${fullScreen ? "app-loader-fullscreen" : ""
                }`}
            role="status"
            aria-live="polite"
        >
            <div className="app-loader-spinner" />

            {message && (
                <p className="app-loader-message">
                    {message}
                </p>
            )}
        </div>
    );
}

export default Loader;