import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(private prisma: PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-12-15.clover' as any,
        });
    }

    async createPaymentIntent(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true },
        });

        if (!order) throw new BadRequestException('Order not found');
        if (order.customerId !== userId) throw new BadRequestException('Not your order');
        if (order.status !== 'PENDING') throw new BadRequestException('Order is already processed');

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(order.total * 100), // Stripe uses cents
            currency: 'usd',
            metadata: { orderId: order.id },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        };
    }

    async handleWebhook(sig: string, payload: Buffer) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
            );
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = paymentIntent.metadata.orderId;

            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' },
            });
        }

        return { received: true };
    }
}
