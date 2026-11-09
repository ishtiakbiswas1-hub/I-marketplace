export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!token || !secret) {
      throw new Error("Missing Telegram environment variables");
    }

    if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
      throw new Error("Invalid webhook secret format");
    }

    const webhookUrl =
      "https://i-marketplace.vercel.app/api/telegram-webhook";

    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secret,
          allowed_updates: ["message"]
        })
      }
    );

    const result = await response.json();

    return res.status(response.ok ? 200 : 500).json({
      success: response.ok && result.ok,
      telegram: result
    });

  } catch (error) {
    console.error("Webhook setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook setup failed. Check server configuration."
    });
  }
}
