const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rate limiting para segurança
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use(limiter);

// 🔒 Chave da API via variável de ambiente
const API_KEY = process.env.NHONGA_API_KEY;

// Validação básica do request
const validateRequest = (req) => {
  const requiredFields = ['amount', 'phone', 'reference'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return `Campos obrigatórios faltando: ${missingFields.join(', ')}`;
  }
  
  return null;
};

app.post("/processPayment", async (req, res) => {
  try {
    // Validar request
    const validationError = validateRequest(req);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key não configurada" });
    }

    const response = await fetch("https://nhonga.net/api/payment/mobile", {
      method: "POST",
      headers: {
        "apiKey": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body),
      timeout: 10000 // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erro no processamento:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message
    });
  }
});

// Health check endpoint para Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({ 
    message: "API Proxy para Nhonga Payments",
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
