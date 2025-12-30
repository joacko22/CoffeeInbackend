import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    async sendEmail(to: string, subject: string, body: string) {
        this.logger.log(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
        // Future: Integration with Nodemailer or SendGrid
        return true;
    }

    async sendPushNotification(userId: string, title: string, message: string) {
        this.logger.log(`[PUSH NOTIFICATION] User: ${userId} | Title: ${title} | Message: ${message}`);
        // To implement real push: 
        // 1. Fetch user's push token from DB
        // 2. Use 'expo-server-sdk' or 'firebase-admin' to send message
        return true;
    }

    async notifyOrderStatusChange(userId: string, orderId: string, status: string) {
        const title = 'Order Update';
        const message = `Your order #${orderId.slice(-6)} is now ${status}.`;
        return this.sendPushNotification(userId, title, message);
    }
}
