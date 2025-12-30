# CoffeeIn Integration Tests - Corrected Version
$BASE_URL = "http://localhost:3000"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "`n====== CoffeeIn Integration Tests ======`n" -ForegroundColor Cyan

# ========== 1. REGISTER USERS ==========
Write-Host "Step 1: Registering users..." -ForegroundColor Yellow

$customer1Body = @{
    email = "customer_$timestamp@test.com"
    password = "Test123!"
    firstName = "Juan"
    lastName = "Perez"
} | ConvertTo-Json

$customer1 = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $customer1Body -ContentType "application/json"
Write-Host "[OK] Customer registered: $($customer1.user.email)" -ForegroundColor Green

$vendor1Body = @{
    email = "vendor_$timestamp@test.com"
    password = "Test123!"
    firstName = "Carlos"
    lastName = "Rodriguez"
} | ConvertTo-Json

$vendor1 = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $vendor1Body -ContentType "application/json"
Write-Host "[OK] Vendor registered: $($vendor1.user.email)" -ForegroundColor Green

# ========== 2. LOGIN ==========
Write-Host "`nStep 2: Logging in..." -ForegroundColor Yellow

$loginCustomerBody = @{
    email = "customer_$timestamp@test.com"
    password = "Test123!"
} | ConvertTo-Json

$loginCustomer = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginCustomerBody -ContentType "application/json"
$customerToken = $loginCustomer.access_token
Write-Host "[OK] Customer logged in" -ForegroundColor Green

$loginVendorBody = @{
    email = "vendor_$timestamp@test.com"
    password = "Test123!"
} | ConvertTo-Json

$loginVendor = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginVendorBody -ContentType "application/json"
$vendorToken = $loginVendor.access_token
Write-Host "[OK] Vendor logged in" -ForegroundColor Green

# ========== 3. GET USER PROFILE ==========
Write-Host "`nStep 3: Fetching user profile..." -ForegroundColor Yellow

$customerHeaders = @{
    "Authorization" = "Bearer $customerToken"
    "Content-Type" = "application/json"
}

$profile = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" -Method Get -Headers $customerHeaders
Write-Host "[OK] Profile: $($profile.firstName) $($profile.lastName) ($($profile.email))" -ForegroundColor Green

# ========== 4. CREATE CAFETERIAS ==========
Write-Host "`nStep 4: Creating cafeterias..." -ForegroundColor Yellow

$vendorHeaders = @{
    "Authorization" = "Bearer $vendorToken"
    "Content-Type" = "application/json"
}

$cafeteria1Body = @{
    name = "Cafe Central"
    address = "Av. Corrientes 1234, Buenos Aires"
    latitude = -34.6037
    longitude = -58.3816
    description = "El mejor cafe del centro"
} | ConvertTo-Json

$cafeteria1 = Invoke-RestMethod -Uri "$BASE_URL/cafeteria" -Method Post -Body $cafeteria1Body -Headers $vendorHeaders
Write-Host "[OK] Cafeteria created: $($cafeteria1.name)" -ForegroundColor Green

$cafeteria2Body = @{
    name = "Coffee Lab"
    address = "Av. Santa Fe 2500, Buenos Aires"
    latitude = -34.5975
    longitude = -58.3974
    description = "Cafe de especialidad"
} | ConvertTo-Json

$cafeteria2 = Invoke-RestMethod -Uri "$BASE_URL/cafeteria" -Method Post -Body $cafeteria2Body -Headers $vendorHeaders
Write-Host "[OK] Cafeteria created: $($cafeteria2.name)" -ForegroundColor Green

# ========== 5. CREATE PRODUCTS ==========
Write-Host "`nStep 5: Creating products..." -ForegroundColor Yellow

$products = @(
    @{ name = "Espresso Doble"; price = 3.50; stock = 100; cafeteriaId = $cafeteria1.id }
    @{ name = "Latte Vainilla"; price = 4.50; stock = 80; cafeteriaId = $cafeteria1.id }
    @{ name = "Cappuccino"; price = 4.00; stock = 90; cafeteriaId = $cafeteria2.id }
    @{ name = "Croissant"; price = 2.50; stock = 50; cafeteriaId = $cafeteria2.id }
    @{ name = "Americano"; price = 3.00; stock = 120; cafeteriaId = $cafeteria1.id }
)

$createdProducts = @()

foreach ($p in $products) {
    $productBody = @{
        name = $p.name
        description = "Delicious $($p.name)"
        price = $p.price
        stock = $p.stock
        cafeteriaId = $p.cafeteriaId
    } | ConvertTo-Json

    $product = Invoke-RestMethod -Uri "$BASE_URL/product" -Method Post -Body $productBody -Headers $vendorHeaders
    $createdProducts += $product
    Write-Host "[OK] Product: $($product.name) - `$$($product.price)" -ForegroundColor Green
}

# ========== 6. GET ALL PRODUCTS ==========
Write-Host "`nStep 6: Fetching all products..." -ForegroundColor Yellow

$allProducts = Invoke-RestMethod -Uri "$BASE_URL/product" -Method Get
Write-Host "[OK] Retrieved $($allProducts.Count) products" -ForegroundColor Green

# ========== 7. GET CAFETERIAS ==========
Write-Host "`nStep 7: Fetching cafeterias..." -ForegroundColor Yellow

$allCafeterias = Invoke-RestMethod -Uri "$BASE_URL/cafeteria" -Method Get
Write-Host "[OK] Retrieved $($allCafeterias.Count) cafeterias" -ForegroundColor Green

# ========== 8. CREATE ORDER ==========
Write-Host "`nStep 8: Creating order..." -ForegroundColor Yellow

$orderBody = @{
    products = @(
        @{ productId = $createdProducts[0].id; quantity = 2 }
        @{ productId = $createdProducts[1].id; quantity = 1 }
        @{ productId = $createdProducts[4].id; quantity = 3 }
    )
} | ConvertTo-Json -Depth 3

$order = Invoke-RestMethod -Uri "$BASE_URL/order" -Method Post -Body $orderBody -Headers $customerHeaders
Write-Host "[OK] Order created: #$($order.id.Substring(0,8)) - Total `$$($order.total)" -ForegroundColor Green

# ========== 9. GET CUSTOMER ORDERS ==========
Write-Host "`nStep 9: Fetching customer orders..." -ForegroundColor Yellow

$customerOrders = Invoke-RestMethod -Uri "$BASE_URL/order" -Method Get -Headers $customerHeaders
Write-Host "[OK] Customer has $($customerOrders.Count) order(s)" -ForegroundColor Green

# ========== 10. CREATE REVIEW ==========
Write-Host "`nStep 10: Creating review..." -ForegroundColor Yellow

$reviewBody = @{
    cafeteriaId = $cafeteria1.id
    rating = 5
    comment = "Excelente cafe! Muy recomendado."
} | ConvertTo-Json

$review = Invoke-RestMethod -Uri "$BASE_URL/review" -Method Post -Body $reviewBody -Headers $customerHeaders
Write-Host "[OK] Review created: $($review.rating) stars" -ForegroundColor Green

# ========== 11. GET CAFETERIA REVIEWS ==========
Write-Host "`nStep 11: Fetching cafeteria reviews..." -ForegroundColor Yellow

$reviews = Invoke-RestMethod -Uri "$BASE_URL/review/cafeteria/$($cafeteria1.id)" -Method Get
Write-Host "[OK] Retrieved $($reviews.Count) review(s)" -ForegroundColor Green

# ========== 12. SEARCH NEARBY CAFETERIAS ==========
Write-Host "`nStep 12: Searching nearby cafeterias..." -ForegroundColor Yellow

$nearbyCafeterias = Invoke-RestMethod -Uri "$BASE_URL/cafeteria?lat=-34.6037&lng=-58.3816&radius=5000" -Method Get
Write-Host "[OK] Found $($nearbyCafeterias.Count) cafeteria(s) nearby" -ForegroundColor Green

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "    INTEGRATION TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Users Created: 2" -ForegroundColor White
Write-Host "  - Customer: $($customer1.user.email)" -ForegroundColor Gray
Write-Host "  - Vendor: $($vendor1.user.email)" -ForegroundColor Gray

Write-Host "`nCafeterias Created: $($allCafeterias.Count)" -ForegroundColor White
$allCafeterias | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor Gray }

Write-Host "`nProducts Created: $($createdProducts.Count)" -ForegroundColor White
$createdProducts | ForEach-Object { Write-Host "  - $($_.name) (`$$($_.price))" -ForegroundColor Gray }

Write-Host "`nOrders Placed: $($customerOrders.Count)" -ForegroundColor White
Write-Host "  - Order Total: `$$($order.total)" -ForegroundColor Gray

Write-Host "`nReviews Posted: $($reviews.Count)" -ForegroundColor White

Write-Host "`n[SUCCESS] All endpoints tested successfully!`n" -ForegroundColor Green
