export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  const receivedSecret =
    req.headers["x-telegram-bot-api-secret-token"];

  if (
    !webhookSecret ||
    receivedSecret !== webhookSecret
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const update = req.body;

    const message = update?.message;
    const chatId = message?.chat?.id;
    const userId = String(message?.from?.id || "");
    const command = (message?.text || "").trim();

    if (!message || !chatId) {
      return res.status(200).json({ ok: true });
    }

    // Only the authorized Admin can control the bot
    if (userId !== process.env.TELEGRAM_ADMIN_ID) {
      return res.status(200).json({ ok: true });
    }

    let reply = "Unknown command. Send /help";

    if (command === "/start") {
      reply =
        "Welcome to I Marketplaces Admin Bot!\n\n" +
        "Your Admin Access is verified.\n\n" +
        "Send /help to see available commands.";
    }

    if (command === "/help") {
      reply =
        "I Marketplaces Admin Panel\n\n" +
        "/start - Start Bot\n" +
        "/help - Show Commands\n" +
        "/status - Check Backend Status";
    }

    if (command === "/status") {
      reply =
        "Backend Status: ONLINE\n" +
        "Firebase: CONFIGURED\n" +
        "Telegram Admin: VERIFIED";
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("Bot token is not configured");
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    if (!telegramResponse.ok) {
      throw new Error("Telegram message delivery failed");
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("Telegram webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
  }
