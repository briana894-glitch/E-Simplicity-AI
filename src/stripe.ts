// ============================================================
// Stripe Integration — READY TO WIRE UP
// ============================================================
//
// When a Stripe account is connected, uncomment the function
// below and add your Stripe secret key to environment variables:
//
//   STRIPE_SECRET_KEY=sk_live_...
//   STRIPE_PRICE_ID=price_...       (the $29/month price ID)
//   STRIPE_WEBHOOK_SECRET=whsec_... (for webhook signature verification)
//
// The expected flow:
//   1. User clicks "Subscribe" on /pricing
//   2. Frontend calls createCheckoutSession server function
//   3. Server creates a Stripe Checkout session and returns the URL
//   4. Frontend redirects user to Stripe
//   5. User completes payment on Stripe's hosted checkout
//   6. Stripe sends a webhook event to /api/stripe-webhook
//   7. Webhook handler updates user's subscription_status to 'active'
//   8. User is redirected back to /dashboard with full access
//
// ============================================================

/*
import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    // Validate user session
    const session = // ... validate token and get user

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // $29/month
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/dashboard?subscribed=1`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      client_reference_id: String(session.userId),
      customer_email: session.email,
      metadata: {
        userId: String(session.userId),
      },
    });

    return { url: checkoutSession.url };
  });

// Webhook handler (add as an API route):
//
// export const stripeWebhook = createServerFn()
//   .handler(async ({ request }) => {
//     const sig = request.headers.get("stripe-signature")!;
//     const body = await request.text();
//     let event: Stripe.Event;
//
//     try {
//       event = stripe.webhooks.constructEvent(
//         body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//     } catch (err) {
//       return new Response("Webhook signature verification failed", { status: 400 });
//     }
//
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const session = event.data.object as Stripe.Checkout.Session;
//         const userId = Number(session.metadata?.userId);
//         if (userId) {
//           db.updateSubscriptionStatus(userId, "active");
//         }
//         break;
//       }
//       case "customer.subscription.deleted": {
//         const subscription = event.data.object as Stripe.Subscription;
//         const userId = Number(subscription.metadata?.userId);
//         if (userId) {
//           db.updateSubscriptionStatus(userId, "canceled");
//         }
//         break;
//       }
//     }
//
//     return new Response(JSON.stringify({ received: true }), { status: 200 });
//   });
*/
