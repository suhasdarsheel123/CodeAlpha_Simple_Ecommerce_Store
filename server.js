// server.js
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // Import our database connection

const app = express();

app.use(cors());
app.use(express.json());
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // <-- Add this new line!

// GET route to fetch all products
app.get('/api/products', async (req, res) => {
    try {
        // Query the database
        const [products] = await pool.query('SELECT * FROM products');
        
        // Send the result as JSON
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching products' });
    }
});
// GET route to fetch a SINGLE product by its ID
app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Send the single product back (it's the first item in the array)
        res.json(products[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching product details' });
    }
});
// POST route to handle order checkout
app.post('/api/orders', async (req, res) => {
    // We expect the frontend to send us a user ID and a total price
    const { user_id, total_price } = req.body;

    try {
        // Insert the new order into the MySQL database
        const [result] = await pool.query(
            'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
            [user_id, total_price, 'pending']
        );
        
        // Respond back to the frontend with success
        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error processing order' });
    }
});
const PORT = process.env.PORT || 5000;
// POST route to Register a new user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if the user already exists
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save the new user to the database
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});
// POST route to Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the user by email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // 2. Compare the passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Login successful! Send back the user ID so the frontend can use it for checkout
        res.json({ 
            message: 'Logged in successfully', 
            userId: user.id,
            username: user.username 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});