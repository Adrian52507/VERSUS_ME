import express from "express";
import Stripe from "stripe";
import { pool } from "./db.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ============================================================
   WEBHOOK STRIPE (RAW BODY - NO JSON)
============================================================ */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️ Webhook error:", err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const data = event.data.object;

    /* ============================================================
       1️⃣ CHECKOUT SESSION COMPLETED (Pago inicial)
    ============================================================= */
    if (event.type === "checkout.session.completed") {
      try {
        const customerId = data.customer;
        const subscriptionId = data.subscription;

        await pool.query(
          `UPDATE users 
           SET is_pro = 1,
               stripe_subscription_id = ?,
               pro_until = DATE_ADD(NOW(), INTERVAL 1 MONTH)
           WHERE stripe_customer_id = ?`,
          [subscriptionId, customerId]
        );

        console.log("✅ Usuario actualizado a PRO");
      } catch (err) {
        console.error("Error actualizando usuario PRO:", err);
      }
    }

    /* ============================================================
       2️⃣ SUSCRIPCIÓN CREADA O REACTIVADA
    ============================================================= */
    if (event.type === "customer.subscription.created") {
      const customer = data.customer;
      const subscriptionId = data.id;

      try {
        await pool.query(
          `UPDATE users 
           SET is_pro = 1,
               stripe_subscription_id = ?,
               pro_until = DATE_ADD(NOW(), INTERVAL 1 MONTH)
           WHERE stripe_customer_id = ?`,
          [subscriptionId, customer]
        );

        console.log("🎉 Suscripción creada → Usuario PRO activado");
      } catch (err) {
        console.error("Error creando suscripción:", err);
      }
    }

    /* ============================================================
       3️⃣ SUSCRIPCIÓN RENOVADA (cobro mensual)
    ============================================================= */
    if (event.type === "invoice.payment_succeeded") {
      const subscriptionId = data.subscription;

      try {
        await pool.query(
          `UPDATE users 
           SET is_pro = 1,
               pro_until = DATE_ADD(NOW(), INTERVAL 1 MONTH)
           WHERE stripe_subscription_id = ?`,
          [subscriptionId]
        );

        console.log("🔄 Suscripción renovada → Pro extendido 1 mes");
      } catch (err) {
        console.error("Error renovando suscripción:", err);
      }
    }

    /* ============================================================
       4️⃣ SUSCRIPCIÓN CANCELADA (usuario cancela)
    ============================================================= */
    if (event.type === "customer.subscription.deleted") {
      const customer = data.customer;

      try {
        await pool.query(
          `UPDATE users 
           SET is_pro = 0,
               stripe_subscription_id = NULL,
               pro_until = NULL
           WHERE stripe_customer_id = ?`,
          [customer]
        );

        console.log("❌ Suscripción cancelada → Usuario PRO desactivado");
      } catch (err) {
        console.error("Error cancelando suscripción:", err);
      }
    }

    /* ============================================================
       🔚 FIN
    ============================================================= */
    res.json({ received: true });
  }
);

export default router;
