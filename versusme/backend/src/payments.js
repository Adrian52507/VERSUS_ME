import express from "express";
import Stripe from "stripe";
import { pool } from "./db.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ============================================================
   💳 1) CREAR CHECKOUT SESSION
============================================================ */
router.get("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener email + stripe_customer_id
    const [[user]] = await pool.query(
      "SELECT email, stripe_customer_id FROM users WHERE id = ?",
      [userId]
    );

    let customerId = user.stripe_customer_id;

    // Crear customer si no existe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });

      await pool.query(
        "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
        [customer.id, userId]
      );

      customerId = customer.id;
    }

    // Crear sesión de pago
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PRO,
          quantity: 1,
        },
      ],
      success_url: `${process.env.ORIGIN_FRONTEND}/pro/success`,
      cancel_url: `${process.env.ORIGIN_FRONTEND}/pro/cancel`,
    });

    return res.json({ url: session.url });

  } catch (error) {
    console.error("Error creando checkout:", error);
    res.status(500).json({ error: "Error creando sesión de pago" });
  }
});

/* ============================================================
   ❌ 2) CANCELAR SUSCRIPCIÓN
============================================================ */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      "SELECT stripe_subscription_id FROM users WHERE id = ?",
      [userId]
    );

    if (!user.stripe_subscription_id)
      return res.status(400).json({ error: "No tienes suscripción activa" });

    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("Error cancelando suscripción:", err);
    res.status(500).json({ error: "Error en cancelación" });
  }
});

/* ============================================================
   🔐 3) PORTAL DE FACTURACIÓN (Opcional)
   El usuario puede ver sus pagos, actualizar tarjeta, etc.
============================================================ */
router.get("/portal", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [userId]
    );

    if (!user.stripe_customer_id)
      return res
        .status(400)
        .json({ error: "No tienes un cliente de Stripe registrado." });

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.ORIGIN_FRONTEND}/pro`,
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.error("Error creando portal:", err);
    res.status(500).json({ error: "Error creando portal de facturación" });
  }
});

export default router;
