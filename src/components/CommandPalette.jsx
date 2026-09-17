import "./CommandPalette.css";

function CommandPalette({ open, onClose }) {

    if (!open) return null;

    const commands = [

        { icon: "📂", title: "Upload CSV" },

        { icon: "📊", title: "Dashboard" },

        { icon: "📈", title: "Charts" },

        { icon: "🤖", title: "AI Insights" },

        { icon: "📄", title: "Download Report" },

        { icon: "⚙", title: "Settings" },

        { icon: "🌙", title: "Dark Mode" },

    ];

    return (

        <div className="command-overlay" onClick={onClose}>

            <div
                className="command-box"
                onClick={(e) => e.stopPropagation()}
            >

                <input
                    placeholder="Search commands..."
                    className="command-search"
                />

                <div className="command-list">

                    {commands.map((item, index) => (

                        <div
                            className="command-item"
                            key={index}
                        >

                            <span>{item.icon}</span>

                            <p>{item.title}</p>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default CommandPalette;