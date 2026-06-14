const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    // TEMP TEST DATA (هنربطه بقاعدة البيانات بعدين)
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
