import { Controller, Post, Body, UseGuards, Request, Headers, RawBodyRequest, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('create-intent')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a Stripe PaymentIntent for an order' })
    createIntent(@Body('orderId') orderId: string, @Request() req: any) {
        return this.paymentService.createPaymentIntent(orderId, req.user.userId);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe webhook handler' })
    webhook(@Headers('stripe-signature') sig: string, @Request() req: any) {
        if (!req.rawBody) throw new BadRequestException('Raw body is missing');
        return this.paymentService.handleWebhook(sig, req.rawBody);
    }
}
