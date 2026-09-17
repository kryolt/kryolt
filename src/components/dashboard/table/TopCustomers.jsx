import "./TopCustomers.css";

function TopCustomers({ csvData = [] }) {

    const customerMap = {};

    csvData.forEach((row) => {
        const name =
            row.Customer || row.CustomerName || row.Name || "Unknown";

        const amount = Number(
            row.Amount || row.Sales || row.Total || row.Revenue || 0
        );

        if (!customerMap[name]) {
            customerMap[name] = { name, orders: 0, revenue: 0 };
        }

        customerMap[name].orders += 1;
        customerMap[name].revenue += amount;
    });

    const customers = Object.values(customerMap)
        .map((c) => ({
            ...c,
            avgOrder: c.orders > 0 ? c.revenue / c.orders : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return (
        <div className="top-customers-card">

            <div className="tc-header">
                <h2>Top customers</h2>
                <button className="tc-view-all">View all</button>
            </div>

            {customers.length === 0 ? (
                <div className="tc-empty">No customer data available.</div>
            ) : (
                <div className="tc-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Customer</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Average Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, index) => (
                                <tr key={customer.name}>
                                    <td>
                                        <span className={`tc-rank rank-${index + 1}`}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="tc-name">{customer.name}</td>
                                    <td>{customer.orders}</td>
                                    <td>₹{customer.revenue.toLocaleString("en-IN")}</td>
                                    <td>
                                        ₹{customer.avgOrder.toLocaleString("en-IN", {
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

export default TopCustomers;