const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔴 MySQL Connection
const db = mysql.createConnection({
    host: "mysql.railway.internal",
    user: "root",
    password: "NDQctwbJNjhhdsOIGixDeauAfghVTYAI",
    database: "railway",
    port: 3306
});

db.connect(err => {
    if (err) {
        console.log("DB Connection Error:", err);
    } else {
        console.log("MySQL Connected ✔");
    }
});

// API
app.post("/api/check_license", (req, res) => {

    const email = req.body.email;
    const phone = req.body.phone;
    const license = req.body.license_key;

    if (!email || !phone || !license) {
        return res.json({
            status: "fail",
            msg: "missing data"
        });
    }

    // TEST (مؤقت لحد ما نربط الداتا)
    if (email === "test@gmail.com" && phone === "0100000000" && license === "TEST-1234-KEY") {
        return res.json({
            status: "VALID",
            plan: "Basic",
            expire: "2026-07-14"
        });
    }

    return res.json({
        status: "fail",
        msg: "invalid license"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
