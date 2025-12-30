import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RoleType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService
    ) { }

    async create(createOrderDto: CreateOrderDto, customerId: string) {
        return this.prisma.$transaction(async (tx) => {
            let total = 0;
            const orderProducts = [];

            for (const item of createOrderDto.products) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for product ${product.name}`);
                }

                // Deduct stock
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: product.stock - item.quantity },
                });

                total += product.price * item.quantity;
                orderProducts.push({
                    productId: product.id,
                    quantity: item.quantity,
                });
            }

            const order = await tx.order.create({
                data: {
                    customerId,
                    total,
                    status: 'PENDING',
                    products: {
                        create: orderProducts,
                    },
                },
                include: {
                    products: {
                        include: { product: true },
                    },
                },
            });

            // Notify user about new order
            await this.notificationService.notifyOrderStatusChange(customerId, order.id, 'PENDING');

            return order;
        });
    }

    async findAll(userId: string, role: string) {
        if (role === RoleType.ADMIN) {
            return this.prisma.order.findMany({
                include: { customer: true, products: { include: { product: true } } },
            });
        }

        if (role === RoleType.VENDOR) {
            // Find orders that contain products from this vendor's cafeteria
            return this.prisma.order.findMany({
                where: {
                    products: {
                        some: {
                            product: {
                                cafeteria: {
                                    ownerId: userId,
                                },
                            },
                        },
                    },
                },
                include: { customer: true, products: { include: { product: true } } },
            });
        }

        // Default: Customer sees their own orders
        return this.prisma.order.findMany({
            where: { customerId: userId },
            include: { products: { include: { product: true } } },
        });
    }

    async findOne(id: string, userId: string, role: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { customer: true, products: { include: { product: true } } },
        });

        if (!order) throw new NotFoundException('Order not found');

        // Security check: only admin, the customer who placed it, or the vendor of the product can see it
        // For simplicity, checking if user is customer or admin.
        // In a multi-vendor scenario, vendor logic should be more specific per order item.
        if (role !== RoleType.ADMIN && order.customerId !== userId) {
            // Check if vendor owns at least one product in this order
            const isVendorOfOrder = await this.prisma.product.findFirst({
                where: {
                    OrderProduct: { some: { orderId: id } },
                    cafeteria: { ownerId: userId }
                }
            });
            if (!isVendorOfOrder) {
                throw new ForbiddenException('Not authorized to view this order');
            }
        }

        return order;
    }

    async updateStatus(id: string, status: string, userId: string, role: string) {
        const order = await this.findOne(id, userId, role);

        // Status update logic (only admins or relevant vendors)
        // For now, allowing both if authorized to find the order
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: { status },
        });

        // Notify customer about status change
        await this.notificationService.notifyOrderStatusChange(updatedOrder.customerId, updatedOrder.id, status);

        return updatedOrder;
    }
}

