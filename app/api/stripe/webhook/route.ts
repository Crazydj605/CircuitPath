import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout completed:', session.id)
        // Update user subscription in database
        break

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice paid:', invoice.id)
        // Handle successful payment
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('Payment failed:', failedInvoice.id)
        // Handle failed payment
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', subscription.id)
        // Handle cancellation
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
