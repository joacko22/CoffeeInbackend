import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async saveMessage(senderId: string, receiverId: string, content: string) {
        return this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            },
        });
    }

    async getMessagesBetween(user1Id: string, user2Id: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}
