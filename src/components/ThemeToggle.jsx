import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle() {

    const { darkMode, setDarkMode } = useTheme();

    return (

        <button
            className={`theme-toggle ${darkMode ? "dark" : ""}`}
            onClick={() => setDarkMode(!darkMode)}
        >

            <span className="theme-icon">
                {darkMode ? "☀️" : "🌙"}
            </span>

            <span className="theme-text">
                {darkMode ? "Light" : "Dark"}
            </span>

        </button>

    );

}

export default ThemeToggle;