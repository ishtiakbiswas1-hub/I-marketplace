import {
  initializeApp,
  cert,
  getApps
} from "firebase-admin/app";

import {
  getFirestore,
  FieldValue
} from "firebase-admin/firestore";

function getDB() {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  );

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount)
      });

  return getFirestore(app);
}

async function sendMessage(token, chatId, text) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    }
  );

  if (!response.ok) {
    throw new Error("Telegram message delivery failed");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (
    !secret ||
    req.headers["x-telegram-bot-api-secret-token"] !== secret
  ) {
    return res.status(401).json({ ok: false });
  }

  try {
    const update = req.body;
    const message = update?.message;

    if (!message?.text || !message?.chat?.id) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const userId = String(message.from?.id || "");
    const command = message.text.trim();

    if (
      userId !== process.env.TELEGRAM_ADMIN_ID ||
      message.chat.type !== "private"
    ) {
      return res.status(200).json({ ok: true });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("Telegram token missing");
    }

    const db = getDB();
    const sessionRef = db.collection("_admin_sessions").doc(userId);
    const sessionSnap = await sessionRef.get();
    const session = sessionSnap.exists ? sessionSnap.data() : null;

    // Main commands
    if (command === "/start" || command === "/help") {
      await sessionRef.delete().catch(() => {});

      await sendMessage(
        token,
        chatId,
        "I Marketplaces Admin Panel\n\n" +
        "/addproduct - Add a new product\n" +
        "/products - View latest products\n" +
        "/cancel - Cancel current action\n" +
        "/help - Show commands"
      );

      return res.status(200).json({ ok: true });
    }

    if (command === "/cancel") {
      await sessionRef.delete();

      await sendMessage(
        token,
        chatId,
        "Current action cancelled."
      );

      return res.status(200).json({ ok: true });
    }

    if (command === "/addproduct") {
      await sessionRef.set({
        action: "add_product",
        step: "name",
        updatedAt: FieldValue.serverTimestamp()
      });

      await sendMessage(
        token,
        chatId,
        "New Product\n\nStep 1/4\nSend the product name:"
      );

      return res.status(200).json({ ok: true });
    }

    if (command === "/products") {
      const snapshot = await db
        .collection("products")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      if (snapshot.empty) {
        await sendMessage(token, chatId, "No products found yet.");
      } else {
        const lines = snapshot.docs.map((doc, index) => {
          const p = doc.data();

          return (
            `${index + 1}. ${p.name || "Unnamed"}\n` +
            `Price: ${p.price ?? "N/A"}\n` +
            `Category: ${p.category || "N/A"}\n` +
            `Status: ${p.status || "N/A"}\n` +
            `ID: ${doc.id}`
          );
        });

        await sendMessage(
          token,
          chatId,
          "Latest Products:\n\n" + lines.join("\n\n")
        );
      }

      return res.status(200).json({ ok: true });
    }

// Edit product price
if (command.startsWith("/editprice ")) {
  const parts = command.split(/\s+/);

  if (parts.length !== 3) {
    await sendMessage(
      token,
      chatId,
      "Format:\n/editprice PRODUCT_ID NEW_PRICE"
    );
    return res.status(200).json({ ok: true });
  }

  const productId = parts[1];
  const newPrice = Number(parts[2]);

  if (
    !Number.isFinite(newPrice) ||
    newPrice < 0 ||
    newPrice > 1000000000
  ) {
    await sendMessage(token, chatId, "Invalid price.");
    return res.status(200).json({ ok: true });
  }

  const ref = db.collection("products").doc(productId);
  const doc = await ref.get();

  if (!doc.exists) {
    await sendMessage(token, chatId, "Product not found.");
  } else {
    await ref.update({
      price: newPrice,
      updatedAt: FieldValue.serverTimestamp()
    });

    await sendMessage(
      token,
      chatId,
      `Product price updated!\nNew Price: ${newPrice}`
    );
  }

  return res.status(200).json({ ok: true });
}

// Deactivate product
if (command.startsWith("/deactivate ")) {
  const productId = command.split(/\s+/)[1];

  if (!productId) {
    await sendMessage(token, chatId, "Send Product ID.");
    return res.status(200).json({ ok: true });
  }

  const ref = db.collection("products").doc(productId);
  const doc = await ref.get();

  if (!doc.exists) {
    await sendMessage(token, chatId, "Product not found.");
  } else {
    await ref.update({
      status: "inactive",
      updatedAt: FieldValue.serverTimestamp()
    });

    await sendMessage(token, chatId, "Product deactivated.");
  }

  return res.status(200).json({ ok: true });
}

// Activate product
if (command.startsWith("/activate ")) {
  const productId = command.split(/\s+/)[1];

  if (!productId) {
    await sendMessage(token, chatId, "Send Product ID.");
    return res.status(200).json({ ok: true });
  }

  const ref = db.collection("products").doc(productId);
  const doc = await ref.get();

  if (!doc.exists) {
    await sendMessage(token, chatId, "Product not found.");
  } else {
    await ref.update({
      status: "active",
      updatedAt: FieldValue.serverTimestamp()
    });

    await sendMessage(token, chatId, "Product activated.");
  }

  return res.status(200).json({ ok: true });
}

// Request product deletion confirmation
if (command.startsWith("/deleteproduct ")) {
  const productId = command.split(/\s+/)[1];

  if (!productId) {
    await sendMessage(token, chatId, "Send Product ID.");
    return res.status(200).json({ ok: true });
  }

  const ref = db.collection("products").doc(productId);
  const doc = await ref.get();

  if (!doc.exists) {
    await sendMessage(token, chatId, "Product not found.");
  } else {
    await sessionRef.set({
      action: "confirm_delete",
      productId,
      updatedAt: FieldValue.serverTimestamp()
    });

    await sendMessage(
      token,
      chatId,
      "WARNING: Product deletion requested.\n\n" +
      `Product: ${doc.data().name}\n` +
      `ID: ${productId}\n\n` +
      "To confirm, send exactly:\nCONFIRM DELETE\n\n" +
      "Or send /cancel."
    );
  }

  return res.status(200).json({ ok: true });
}

// Confirm product deletion
if (session?.action === "confirm_delete") {
  if (command !== "CONFIRM DELETE") {
    await sendMessage(
      token,
      chatId,
      "Deletion cancelled. Send /cancel to clear this request."
    );

    await sessionRef.delete();

    return res.status(200).json({ ok: true });
  }

  const ref = db.collection("products").doc(session.productId);
  const doc = await ref.get();

  if (doc.exists) {
    await ref.delete();

    await sendMessage(
      token,
      chatId,
      "Product deleted successfully."
    );
  } else {
    await sendMessage(token, chatId, "Product not found.");
  }

  await sessionRef.delete();

  return res.status(200).json({ ok: true });
      }
    
    // Product creation wizard
    if (session?.action === "add_product") {
      const value = command.trim();

      if (!value || value.length > 1000) {
        await sendMessage(
          token,
          chatId,
          "Please send valid text (maximum 1000 characters), or /cancel."
        );

        return res.status(200).json({ ok: true });
      }

      if (session.step === "name") {
        await sessionRef.update({
          name: value,
          step: "description",
          updatedAt: FieldValue.serverTimestamp()
        });

        await sendMessage(
          token,
          chatId,
          "Step 2/4\nSend the product description:"
        );
      } else if (session.step === "description") {
        await sessionRef.update({
          description: value,
          step: "price",
          updatedAt: FieldValue.serverTimestamp()
        });

        await sendMessage(
          token,
          chatId,
          "Step 3/4\nSend the product price (numbers only):"
        );
      } else if (session.step === "price") {
        const price = Number(value);

        if (!Number.isFinite(price) || price < 0 || price > 1000000000) {
          await sendMessage(
            token,
            chatId,
            "Invalid price. Send a valid number, for example: 250"
          );

          return res.status(200).json({ ok: true });
        }

        await sessionRef.update({
          price,
          step: "category",
          updatedAt: FieldValue.serverTimestamp()
        });

        await sendMessage(
          token,
          chatId,
          "Step 4/4\nSend the product category:"
        );
      } else if (session.step === "category") {
        const product = {
          name: session.name,
          description: session.description,
          price: session.price,
          category: value,
          status: "active",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };

        const productRef = await db
          .collection("products")
          .add(product);

        await sessionRef.delete();

        await sendMessage(
          token,
          chatId,
          "Product added successfully!\n\n" +
          `Name: ${product.name}\n` +
          `Price: ${product.price}\n` +
          `Category: ${product.category}\n` +
          `Status: Active\n` +
          `Product ID: ${productRef.id}`
        );
      }

      return res.status(200).json({ ok: true });
    }

    await sendMessage(
      token,
      chatId,
      "Unknown command. Send /help to see available commands."
    );

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("Admin bot error:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
        }
