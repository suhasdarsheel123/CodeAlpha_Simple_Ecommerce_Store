
// app.js

// The URL of our Express backend
let cart = [];
let cartTotal = 0;
const loggedInUserId = localStorage.getItem('user_id');
const loggedInUsername = localStorage.getItem('username');

// Optional: Change the "Login" text in the navbar if they are logged in
if (loggedInUsername) {
    const loginLink = document.querySelector('.nav-links a:last-child');
    if (loginLink) {
        loginLink.innerText = `Hi, ${loggedInUsername}`;
        loginLink.href = "#"; // Remove the link to the login page
    }
}
const API_URL = 'http://localhost:5000/api/products';

async function fetchProducts() {
    try {
        // 1. Ask the backend for the products
        const response = await fetch(API_URL);
        const products = await response.json();
        
        // 2. Find the grid container in our HTML
        const productGrid = document.getElementById('product-grid');
        
        // 3. Clear any existing content just in case
        productGrid.innerHTML = '';
        
        // 4. Loop through each product and create an HTML card
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}">
                    <img src="${product.image_url}" alt="${product.name}">
                </a>
                <div class="product-info">
                    <a href="product.html?id=${product.id}" style="text-decoration: none;">
                        <h3>${product.name}</h3>
                    </a>
                    <p>${product.description}</p>
                    <h4>$${product.price}</h4>
                    <button onclick="addToCart(${product.id}, ${product.price}, '${product.name}')">Add to Cart</button>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('product-grid').innerHTML = '<p>Failed to load products. Make sure your backend is running!</p>';
    }
}

// A simple placeholder function for our cart button
// Add an item to the cart array and update the UI
function addToCart(productId, price, productName) {
    // Push an object with the name included!
    cart.push({ id: productId, price: parseFloat(price), name: productName || 'Product' });
    cartTotal += parseFloat(price);
    
    document.getElementById('cart-count').innerText = cart.length;
    showToast(`${productName || 'Item'} added to your cart!`, 'success');
}
// Run the function as soon as the page loads
fetchProducts();
// Remove an item from the cart
function removeFromCart(index) {
    // 1. Subtract the price of the item from the total
    cartTotal -= cart[index].price;
    
    // Ensure total doesn't drop below 0 due to JavaScript floating-point math
    if (cartTotal < 0) cartTotal = 0; 

    // 2. Remove the specific item from the array using its index
    cart.splice(index, 1);

    // 3. Update the cart counter in the navigation bar
    document.getElementById('cart-count').innerText = cart.length;

    // 4. Show a quick notification
    showToast('Item removed from cart.', 'error'); // 'error' gives it a red styling!

    // 5. Refresh the checkout modal so the item disappears from the screen
    openCheckout();
}
// Send the order to the backend

// --- CHECKOUT MODAL LOGIC ---

// 1. Open the Modal and list the items
function openCheckout() {
    const modal = document.getElementById('checkout-modal');
    const list = document.getElementById('cart-items-list');
    const totalSpan = document.getElementById('checkout-total');
    
    if (!modal) return;

    list.innerHTML = ''; // Clear the list

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Your cart is empty.</p>';
    } else {
        // Loop through the cart and generate HTML for each item
        // Loop through the cart and generate HTML for each item
        // Notice we added 'index' inside the forEach parameter
        cart.forEach((item, index) => {
            list.innerHTML += `
                <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>${item.name}</strong>
                    
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span>$${item.price.toFixed(2)}</span>
                        <button onclick="removeFromCart(${index})" style="background-color: var(--danger); padding: 5px 10px; font-size: 0.8rem; width: auto;">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // Update the total price
    totalSpan.innerText = cartTotal.toFixed(2);
    
    // Show the modal
    modal.style.display = 'flex';
}

// 2. Close the Modal
function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

// 3. Process the Final Order (Sends to MySQL Backend)
async function processOrder() {
    if (cart.length === 0) {
        showToast('Add some items to your cart first!', 'error');
        return;
    }

    if (!loggedInUserId) {
        showToast('Please log in to place an order.', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: loggedInUserId,
                total_price: cartTotal 
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            showToast(`Order #${data.orderId} placed successfully!`, 'success');
            
            // Empty the cart
            cart = [];
            cartTotal = 0;
            document.getElementById('cart-count').innerText = 0;
            
            // Close the modal
            closeCheckout();
        } else {
            showToast('Checkout failed. Try again.', 'error');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        showToast('Server error during checkout.', 'error');
    }
}
// --- PRODUCT DETAILS PAGE LOGIC ---

// Helper function to get URL parameters (e.g., ?id=2)
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Check if we are on the product details page by looking for the container
const singleProductContainer = document.getElementById('single-product-container');

if (singleProductContainer) {
    const productId = getQueryParam('id');
    
    if (productId) {
        fetchSingleProduct(productId);
    } else {
        singleProductContainer.innerHTML = '<p>No product selected. <a href="index.html">Go back</a></p>';
    }
}

async function fetchSingleProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const product = await response.json();
        
        if (response.ok) {
            singleProductContainer.innerHTML = `
                <div style="flex: 1;">
                    <img src="${product.image_url}" alt="${product.name}" style="width: 100%; border-radius: 8px;">
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <h2>${product.name}</h2>
                    <h3 style="color: #28a745; margin: 15px 0;">$${product.price}</h3>
                    <p style="line-height: 1.6; margin-bottom: 20px;">${product.description}</p>
                    <button onclick="addToCart(${product.id}, ${product.price})" style="padding: 15px; font-size: 1.1rem; background-color: #28a745; color: white; border: none; cursor: pointer; border-radius: 4px;">
                        Add to Cart
                    </button>
                </div>
            `;
        } else {
            singleProductContainer.innerHTML = `<p>${product.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        singleProductContainer.innerHTML = '<p>Error loading product details.</p>';
    }
}
// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${type === 'success' ? '✓' : '⚠'}</strong> ${message}`;
    
    container.appendChild(toast);

    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300); // Wait for animation to finish
    }, 3000);
}