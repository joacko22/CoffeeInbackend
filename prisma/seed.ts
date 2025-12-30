import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // ========== CREATE USERS ==========
    console.log('👥 Creating users...');

    const password = await bcrypt.hash('Test123!', 10);

    // Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@coffeein.com' },
        update: {},
        create: {
            email: 'admin@coffeein.com',
            password,
            firstName: 'Admin',
            lastName: 'CoffeeIn',
            role: RoleType.ADMIN,
        },
    });
    console.log('✅ Admin created:', admin.email);

    // Vendor Users
    const vendor1 = await prisma.user.upsert({
        where: { email: 'vendor1@coffeein.com' },
        update: {},
        create: {
            email: 'vendor1@coffeein.com',
            password,
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            role: RoleType.VENDOR,
        },
    });
    console.log('✅ Vendor 1 created:', vendor1.email);

    const vendor2 = await prisma.user.upsert({
        where: { email: 'vendor2@coffeein.com' },
        update: {},
        create: {
            email: 'vendor2@coffeein.com',
            password,
            firstName: 'Maria',
            lastName: 'Gonzalez',
            role: RoleType.VENDOR,
        },
    });
    console.log('✅ Vendor 2 created:', vendor2.email);

    // Customer Users
    const customer1 = await prisma.user.upsert({
        where: { email: 'customer1@coffeein.com' },
        update: {},
        create: {
            email: 'customer1@coffeein.com',
            password,
            firstName: 'Juan',
            lastName: 'Perez',
            role: RoleType.CUSTOMER,
        },
    });
    console.log('✅ Customer 1 created:', customer1.email);

    const customer2 = await prisma.user.upsert({
        where: { email: 'customer2@coffeein.com' },
        update: {},
        create: {
            email: 'customer2@coffeein.com',
            password,
            firstName: 'Ana',
            lastName: 'Martinez',
            role: RoleType.CUSTOMER,
        },
    });
    console.log('✅ Customer 2 created:', customer2.email);

    // ========== CREATE CAFETERIAS ==========
    console.log('\n☕ Creating cafeterias...');

    const cafeteria1 = await prisma.cafeteria.upsert({
        where: { id: 'cafe-central' },
        update: {},
        create: {
            id: 'cafe-central',
            name: 'Café Central',
            latitude: -34.6037,
            longitude: -58.3816,
            description: 'El mejor café del centro de Buenos Aires. Ambiente acogedor y café de especialidad.',
            ownerId: vendor1.id,
        },
    });
    console.log('✅ Cafeteria created:', cafeteria1.name);

    const cafeteria2 = await prisma.cafeteria.upsert({
        where: { id: 'coffee-lab' },
        update: {},
        create: {
            id: 'coffee-lab',
            name: 'Coffee Lab',
            latitude: -34.5975,
            longitude: -58.3974,
            description: 'Laboratorio de café de especialidad. Granos selectos de origen único.',
            ownerId: vendor2.id,
        },
    });
    console.log('✅ Cafeteria created:', cafeteria2.name);

    // ========== CREATE PRODUCTS ==========
    console.log('\n🛍️ Creating products...');

    const products = [
        // Café Central
        { name: 'Espresso Doble', price: 3.50, stock: 100, cafeteriaId: cafeteria1.id, description: 'Espresso intenso de origen colombiano' },
        { name: 'Latte Vainilla', price: 4.50, stock: 80, cafeteriaId: cafeteria1.id, description: 'Café con leche y esencia de vainilla natural' },
        { name: 'Cappuccino', price: 4.00, stock: 90, cafeteriaId: cafeteria1.id, description: 'Clásico cappuccino italiano con espuma cremosa' },
        { name: 'Croissant', price: 2.50, stock: 50, cafeteriaId: cafeteria1.id, description: 'Croissant de mantequilla recién horneado' },
        { name: 'Americano', price: 3.00, stock: 120, cafeteriaId: cafeteria1.id, description: 'Café americano suave y aromático' },

        // Coffee Lab
        { name: 'Cold Brew', price: 5.00, stock: 60, cafeteriaId: cafeteria2.id, description: 'Café filtrado en frío, 12 horas de extracción' },
        { name: 'Flat White', price: 4.80, stock: 70, cafeteriaId: cafeteria2.id, description: 'Espresso con microespuma de leche' },
        { name: 'Affogato', price: 5.50, stock: 40, cafeteriaId: cafeteria2.id, description: 'Helado de vainilla con espresso caliente' },
        { name: 'Brownie', price: 3.50, stock: 45, cafeteriaId: cafeteria2.id, description: 'Brownie de chocolate belga' },
        { name: 'Macchiato', price: 3.80, stock: 85, cafeteriaId: cafeteria2.id, description: 'Espresso manchado con leche espumada' },
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
        console.log(`✅ Product created: ${product.name} - $${product.price}`);
    }

    // ========== CREATE SAMPLE ORDER ==========
    console.log('\n📦 Creating sample order...');

    const sampleProducts = await prisma.product.findMany({ take: 3 });

    const order = await prisma.order.create({
        data: {
            customerId: customer1.id,
            total: sampleProducts.reduce((sum, p) => sum + p.price * 2, 0),
            status: 'PENDING',
            products: {
                create: sampleProducts.map(p => ({
                    productId: p.id,
                    quantity: 2,
                })),
            },
        },
    });
    console.log(`✅ Sample order created: #${order.id.substring(0, 8)}`);

    // ========== CREATE SAMPLE REVIEW ==========
    console.log('\n⭐ Creating sample review...');

    const review = await prisma.review.create({
        data: {
            userId: customer1.id,
            cafeteriaId: cafeteria1.id,
            rating: 5,
            comment: '¡Excelente café! El espresso es increíble y el ambiente muy acogedor. Totalmente recomendado.',
        },
    });
    console.log(`✅ Review created: ${review.rating} stars`);

    console.log('\n✨ Seeding completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
