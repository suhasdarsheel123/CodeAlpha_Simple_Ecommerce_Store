CREATE DATABASE codealpha_ecommerce;
USE codealpha_ecommerce;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    stock_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO products (name, description, price, image_url, stock_count) 
VALUES 
('Wireless Headphones', 'High-quality noise-canceling headphones.', 99.99, 'https://via.placeholder.com/150', 50),
('Mechanical Keyboard', 'RGB mechanical keyboard with cherry blue switches.', 75.50, 'https://via.placeholder.com/150', 30),
('Gaming Mouse', 'Ergonomic mouse with customizable buttons.', 45.00, 'https://via.placeholder.com/150', 100);

INSERT INTO users (username, email, password) 
VALUES ('TestUser', 'test@codealpha.com', 'password123');
UPDATE products 
SET image_url = 'http://localhost:5000/images/headphones.jpg' 
WHERE id = 1;

UPDATE products 
SET image_url = 'http://localhost:5000/images/keyboard.jpg' 
WHERE id = 2;

UPDATE products 
SET image_url = 'http://localhost:5000/images/mouse.jpg' 
WHERE id = 3;
