const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
host: process.env.MYSQLHOST || "mysql.railway.internal",
user: process.env.MYSQLUSER || "root",
password: process.env.MYSQLPASSWORD,
database: process.env.MYSQLDATABASE || "railway",
port: process.env.MYSQLPORT || 3306,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});

db.getConnection((err, connection) => {
if (err) {
console.error("DB Connection Error:", err);
} else {
console.log("MySQL Connected ✔");
connection.release();
}
});

app.post("/api/check_license", (req, res) => {

```
const email = (req.body.email || "").trim();
const phone = (req.body.phone || "").trim();
const licenseKey = (req.body.license_key || "").trim();

if (!email || !phone || !licenseKey) {
    return res.json({
        status: "UNKNOWN"
    });
}

const sql = `
    SELECT
        c.id,
        c.email,
        c.phone,
        c.is_active,
        p.name AS plan_name,
        s.start_date,
        s.end_date,
        s.status AS subscription_status,
        l.license_key
    FROM customers c
    INNER JOIN licenses l
        ON l.customer_id = c.id
    INNER JOIN subscriptions s
        ON s.customer_id = c.id
    INNER JOIN plans p
        ON p.id = s.plan_id
    WHERE c.email = ?
      AND c.phone = ?
      AND l.license_key = ?
    LIMIT 1
`;

db.query(sql, [email, phone, licenseKey], (err, results) => {

    if (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({
            status: "UNKNOWN"
        });
    }

    if (results.length === 0) {
        return res.json({
            status: "UNKNOWN"
        });
    }

    const row = results[0];

    if (row.is_active !== 1) {
        return res.json({
            status: "INACTIVE"
        });
    }

    if (
        row.subscription_status &&
        row.subscription_status.toLowerCase() === "suspended"
    ) {
        return res.json({
            status: "INACTIVE"
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(row.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
        return res.json({
            status: "EXPIRED",
            plan: row.plan_name,
            expire: row.end_date
        });
    }

    return res.json({
        status: "VALID",
        plan: row.plan_name,
        expire: row.end_date
    });

});
```

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
