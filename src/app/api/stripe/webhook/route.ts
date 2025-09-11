import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { stripePaymentIntent: paymentIntent.id },
      include: { user: { include: { wallet: true } } },
    });

    if (!purchase) {
      console.error('Purchase not found for payment intent:', paymentIntent.id);
      return;
    }

    if (purchase.status === 'COMPLETED') {
      console.log('Payment already processed:', paymentIntent.id);
      return;
    }

    await prisma.$transaction(async (tx) => {
    // Update purchase status
    await tx.purchase.update({
      where: { id: purchase.id },
      data: { status: 'COMPLETED' },
    });

    // Ensure user has a wallet
    let wallet = purchase.user.wallet;
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: purchase.userId,
          tokens: 0,
        },
      });
    }

    // Add tokens to wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { tokens: { increment: purchase.tokensAwarded } },
    });

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PURCHASE',
          amount: purchase.tokensAwarded,
          description: `Token purchase - ${purchase.tokensAwarded} tokens`,
          reference: paymentIntent.id,
        },
      });
    });

    console.log(`Payment completed: ${paymentIntent.id}, ${purchase.tokensAwarded} tokens awarded`);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error; // Re-throw to be caught by the main webhook handler
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.purchase.update({
      where: { stripePaymentIntent: paymentIntent.id },
      data: { status: 'FAILED' },
    });

    console.log(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error; // Re-throw to be caught by the main webhook handler
  }
}
