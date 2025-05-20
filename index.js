const { LocalAuth, Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const sharp = require("sharp"); // Tambahkan sharp untuk memproses gambar

const app = express();
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "mphstar-ai", // Use a unique ID for each client instance
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
const port = 3000;

const generateAI = async (message) => {
  try {
    const response = await fetch("https://api.side.my.id/v1/ai/gpt-4o-mini", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "Nama Anda adalah Mphstar, bukan sapat sapa, cuman programmer santai.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });
    const data = await response.json();

    return data.data.content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, lagi malas mikir.";
  }
};

app.get("/", (req, res) => {
  res.send("WhatsApp Bot is running!");
});

client.on("qr", (qr) => {
  // Generate and display QR code in the terminal
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Client is authenticated!");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  const messageBody = message.body.toLowerCase();
  if (messageBody.startsWith("!star")) {
    const userMessage = messageBody.slice(6).trim();
    const result = await generateAI(userMessage);

    message.reply(result);
  } else if (messageBody.startsWith("!star")) {
    message.reply("Available commands: !ai <your message>");
  } else if (messageBody.startsWith("!sticker")) {
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      if (media.mimetype.startsWith("image/")) {
        try {
          // Convert image to sticker
          const buffer = Buffer.from(media.data, "base64");
          const stickerBuffer = await sharp(buffer)
            .resize(512, 512, { fit: "cover" })
            .toFormat("webp")
            .toBuffer();

          const sticker = new MessageMedia(
            "image/webp",
            stickerBuffer.toString("base64")
          );
          await message.reply(sticker, null, { sendMediaAsSticker: true });
        } catch (error) {
          console.error("Error creating sticker:", error);
          message.reply("Gagal membuat stiker. Pastikan gambar valid.");
        }
      } else {
        message.reply("Mohon kirimkan gambar untuk dijadikan stiker.");
      }
    }
  }
});

client.initialize();

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
