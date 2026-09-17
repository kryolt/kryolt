import { Save, RotateCcw } from "lucide-react";
import "./SaveBar.css";

function SaveBar({ onSave, onReset, saving = false }) {
    return (
        <div className="savebar">

            <div className="savebar-left">

                <span className="save-dot"></span>

                <div>

                    <h4>Unsaved Changes</h4>

                    <p>Your workspace settings have been modified.</p>

                </div>

            </div>

            <div className="savebar-actions">

                <button
                    className="reset-btn"
                    onClick={onReset}
                >
                    <RotateCcw size={16} />
                    Reset
                </button>

                <button
                    className="save-btn"
                    onClick={onSave}
                >
                    <Save size={16} />

                    {saving ? "Saving..." : "Save Changes"}

                </button>

            </div>

        </div>
    );
}

export default SaveBar;