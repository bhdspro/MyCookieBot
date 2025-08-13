import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("⚠️ Variáveis de ambiente TELEGRAM_TOKEN ou TELEGRAM_CHAT_ID não definidas!");
  process.exit(1);
}

app.post("/send", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Campo 'text' é obrigatório." });
  }

  const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const textWithIP = `${text}\nIP DO USUÁRIO: ${userIP}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: textWithIP,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return res.status(500).json({ error: data.description });
    }

    return res.json({ success: true, result: data.result });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
