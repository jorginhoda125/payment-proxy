const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

// 🔒 Tua apiKey pode ficar aqui ou no Environment Variable do Railway
const API_KEY = process.env.API_KEY || "minhaChave";

app.post("/processPayment", async(req, res) => {
    try {
        const response = await fetch("https://nhonga.net/api/payment/mobile", {
            method: "POST",
            headers: {
                "apiKey": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500)
            .json({
            error: error.toString()
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));