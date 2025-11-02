// Service for Stripe webhook processing

import { prisma } from "../../../prisma";

/**
 * Handle payment success event
 */
export async function handlePaymentSuccess(paymentIntent: any) {
  console.log("Processing payment success for:", paymentIntent.id);

  const purchase = await prisma.purchase.findUnique({
    where: { stripePaymentIntent: paymentIntent.id },
    include: { user: { include: { wallet: true } } },
  });

  if (!purchase) {
    console.error("Purchase not found for payment intent:", paymentIntent.id);
    return;
  }

  console.log("Found purchase:", {
    id: purchase.id,
    userId: purchase.userId,
    tokensAwarded: purchase.tokensAwarded,
  });

  if (purchase.status === "COMPLETED") {
    console.log("Payment already processed:", paymentIntent.id);
    return;
  }

  await prisma.$transaction(async tx => {
    // Update purchase status
    await tx.purchase.update({
      where: { id: purchase.id },
      data: { status: "COMPLETED" },
    });

    // Ensure user has a wallet
    let wallet = purchase.user.wallet;
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: purchase.userId,
          balance: 0,
        },
      });
    }

    // Add tokens to wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: purchase.tokensAwarded } },
    });

    // Create transaction record
    await tx.tokenTransaction.create({
      data: {
        walletId: wallet.id,
        userId: purchase.userId,
        type: "PURCHASE",
        amount: purchase.tokensAwarded,
        description: `Token purchase - ${purchase.tokensAwarded} tokens`,
        reference: paymentIntent.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          tokensAwarded: purchase.tokensAwarded,
        },
      },
    });
  });

  console.log(
    `Payment completed: ${paymentIntent.id}, ${purchase.tokensAwarded} tokens awarded`
  );
}

/**
 * Handle payment failure event
 */
export async function handlePaymentFailure(paymentIntent: any) {
  await prisma.purchase.update({
    where: { stripePaymentIntent: paymentIntent.id },
    data: { status: "FAILED" },
  });

  console.log(`Payment failed: ${paymentIntent.id}`);
}

/**
 * Process Stripe webhook event
 */
export async function processStripeWebhook(event: any) {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await handlePaymentFailure(paymentIntent);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
}
