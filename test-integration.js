const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Helper function to log results
function log(title, data) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`${title}`);
    console.log('='.repeat(50));
    console.log(JSON.stringify(data, null, 2));
}

async function runTests() {
    try {
        console.log('🚀 Starting CoffeeIn Integration Tests...\n');

        // ========== 1. REGISTER USERS ==========
        console.log('📝 Step 1: Registering test users...');

        const customer1 = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'customer1@test.com',
            password: 'Test123!',
            name: 'Juan Pérez',
            role: 'CUSTOMER'
        });
        log('✅ Customer 1 registered', customer1.data);

        const customer2 = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'customer2@test.com',
            password: 'Test123!',
            name: 'María García',
            role: 'CUSTOMER'
        });
        log('✅ Customer 2 registered', customer2.data);

        const vendor1 = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'vendor1@test.com',
            password: 'Test123!',
            name: 'Carlos Rodríguez',
            role: 'VENDOR'
        });
        log('✅ Vendor 1 registered', vendor1.data);

        const admin = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'admin@test.com',
            password: 'Admin123!',
            name: 'Admin User',
            role: 'ADMIN'
        });
        log('✅ Admin registered', admin.data);

        // ========== 2. LOGIN TESTS ==========
        console.log('\n🔐 Step 2: Testing login...');

        const loginCustomer = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'customer1@test.com',
            password: 'Test123!'
        });
        log('✅ Customer login successful', loginCustomer.data);
        const customerToken = loginCustomer.data.access_token;

        const loginVendor = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'vendor1@test.com',
            password: 'Test123!'
        });
        log('✅ Vendor login successful', loginVendor.data);
        const vendorToken = loginVendor.data.access_token;

        const loginAdmin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'Admin123!'
        });
        log('✅ Admin login successful', loginAdmin.data);
        const adminToken = loginAdmin.data.access_token;

        // ========== 3. CREATE CAFETERIAS ==========
        console.log('\n☕ Step 3: Creating cafeterias...');

        const cafeteria1 = await axios.post(`${BASE_URL}/cafeteria`, {
            name: 'Café Central',
            address: 'Av. Corrientes 1234, Buenos Aires',
            latitude: -34.6037,
            longitude: -58.3816,
            description: 'El mejor café del centro de Buenos Aires'
        }, {
            headers: { Authorization: `Bearer ${vendorToken}` }
        });
        log('✅ Cafeteria 1 created', cafeteria1.data);

        const cafeteria2 = await axios.post(`${BASE_URL}/cafeteria`, {
            name: 'Coffee Lab',
            address: 'Av. Santa Fe 2500, Buenos Aires',
            latitude: -34.5975,
            longitude: -58.3974,
            description: 'Café de especialidad con granos selectos'
        }, {
            headers: { Authorization: `Bearer ${vendorToken}` }
        });
        log('✅ Cafeteria 2 created', cafeteria2.data);

        // ========== 4. CREATE PRODUCTS ==========
        console.log('\n🛍️ Step 4: Creating products...');

        const product1 = await axios.post(`${BASE_URL}/product`, {
            name: 'Espresso Doble',
            description: 'Espresso intenso de origen colombiano',
            price: 3.50,
            stock: 100,
            cafeteriaId: cafeteria1.data.id
        }, {
            headers: { Authorization: `Bearer ${vendorToken}` }
        });
        log('✅ Product 1 created', product1.data);

        const product2 = await axios.post(`${BASE_URL}/product`, {
            name: 'Latte Vainilla',
            description: 'Café con leche y esencia de vainilla',
            price: 4.50,
            stock: 80,
            cafeteriaId: cafeteria1.data.id
        }, {
            headers: { Authorization: `Bearer ${vendorToken}` }
        });
        log('✅ Product 2 created', product2.data);

        const product3 = await axios.post(`${BASE_URL}/product`, {
            name: 'Cappuccino',
            description: 'Clásico cappuccino italiano',
            price: 4.00,
            stock: 90,
            cafeteriaId: cafeteria2.data.id
        }, {
            headers: { Authorization: `Bearer ${vendorToken}` }
        });
        log('✅ Product 3 created', product3.data);

        const product4 = await axios.post(`${BASE_URL}/product`, {
            name: 'Croissant',
            description: 'Croissant de mantequilla recién horneado',
            price: 2.50,
            stock: 50,
            cafeteriaId: cafeteria2.data.id
        }, {
            headers: { Authorization: `Bearer ${vendorToken}` }
        });
        log('✅ Product 4 created', product4.data);

        // ========== 5. GET ALL PRODUCTS ==========
        console.log('\n📋 Step 5: Fetching all products...');

        const allProducts = await axios.get(`${BASE_URL}/product`);
        log('✅ All products retrieved', { count: allProducts.data.length, products: allProducts.data });

        // ========== 6. CREATE ORDER ==========
        console.log('\n🛒 Step 6: Creating order...');

        const order = await axios.post(`${BASE_URL}/order`, {
            products: [
                { productId: product1.data.id, quantity: 2 },
                { productId: product2.data.id, quantity: 1 }
            ]
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        log('✅ Order created', order.data);

        // ========== 7. GET CUSTOMER ORDERS ==========
        console.log('\n📦 Step 7: Fetching customer orders...');

        const customerOrders = await axios.get(`${BASE_URL}/order`, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        log('✅ Customer orders retrieved', customerOrders.data);

        // ========== 8. UPDATE ORDER STATUS ==========
        console.log('\n🔄 Step 8: Updating order status...');

        const updatedOrder = await axios.patch(`${BASE_URL}/order/${order.data.id}/status`, {
            status: 'COMPLETED'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        log('✅ Order status updated', updatedOrder.data);

        // ========== 9. CREATE REVIEW ==========
        console.log('\n⭐ Step 9: Creating review...');

        const review = await axios.post(`${BASE_URL}/review`, {
            cafeteriaId: cafeteria1.data.id,
            rating: 5,
            comment: '¡Excelente café! El espresso es increíble.'
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        log('✅ Review created', review.data);

        // ========== 10. GET CAFETERIA REVIEWS ==========
        console.log('\n💬 Step 10: Fetching cafeteria reviews...');

        const reviews = await axios.get(`${BASE_URL}/review/cafeteria/${cafeteria1.data.id}`);
        log('✅ Cafeteria reviews retrieved', reviews.data);

        // ========== 11. GET CAFETERIAS WITH LOCATION ==========
        console.log('\n🗺️ Step 11: Fetching cafeterias near location...');

        const nearbyCafeterias = await axios.get(`${BASE_URL}/cafeteria?lat=-34.6037&lng=-58.3816&radius=5000`);
        log('✅ Nearby cafeterias retrieved', nearbyCafeterias.data);

        // ========== 12. GET USER PROFILE ==========
        console.log('\n👤 Step 12: Fetching user profile...');

        const profile = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        log('✅ User profile retrieved', profile.data);

        // ========== 13. ADMIN DASHBOARD ==========
        console.log('\n📊 Step 13: Fetching admin dashboard...');

        const dashboard = await axios.get(`${BASE_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        log('✅ Admin dashboard retrieved', dashboard.data);

        console.log('\n\n✨ ALL TESTS COMPLETED SUCCESSFULLY! ✨\n');
        console.log('Summary:');
        console.log('- 4 users created (2 customers, 1 vendor, 1 admin)');
        console.log('- 2 cafeterias created');
        console.log('- 4 products created');
        console.log('- 1 order placed and completed');
        console.log('- 1 review posted');
        console.log('- All endpoints working correctly ✅');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

runTests();
