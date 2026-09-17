import "./NotificationPanel.css";

function NotificationPanel() {

    const notifications = [

        {
            id: 1,
            icon: "📂",
            title: "CSV Uploaded",
            message: "Sales_Data.csv uploaded successfully",
            type: "success"
        },

        {
            id: 2,
            icon: "📈",
            title: "Sales Increased",
            message: "Revenue increased by 18%",
            type: "info"
        },

        {
            id: 3,
            icon: "🤖",
            title: "AI Insight",
            message: "Electronics category is growing",
            type: "ai"
        },

        {
            id: 4,
            icon: "⚠",
            title: "Low Stock",
            message: "Shoes inventory is running low",
            type: "warning"
        }

    ];

    return (

        <div className="notification-panel">

            <div className="notification-header">

                <h3>Notifications</h3>

                <span>4 New</span>

            </div>

            {notifications.map((item) => (

                <div className={`notification-item ${item.type}`} key={item.id}>

                    <div className="notification-icon">

                        {item.icon}

                    </div>

                    <div>

                        <h4>{item.title}</h4>

                        <p>{item.message}</p>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default NotificationPanel;