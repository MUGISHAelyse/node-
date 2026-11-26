-- Shopwise AI store database
-- Import this file in phpMyAdmin (XAMPP) to create the database and starter products.
CREATE DATABASE IF NOT EXISTS shopwise_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopwise_ai;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  blocked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  emoji VARCHAR(30) NOT NULL DEFAULT '📦',
  image LONGTEXT NULL,
  description VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  user_id INT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  status ENUM('Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Processing',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_email (customer_email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  product_name VARCHAR(120) NOT NULL,
  emoji VARCHAR(30) NOT NULL DEFAULT '📦',
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  topic VARCHAR(80) NOT NULL DEFAULT 'Other',
  order_reference VARCHAR(30) NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NULL,
  user_id INT UNSIGNED NULL,
  author_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(190) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(100) NOT NULL,
  review_text VARCHAR(1000) NOT NULL,
  verified_purchase TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY one_review_per_user_product (product_id, user_email),
  INDEX idx_reviews_product (product_id)
) ENGINE=InnoDB;

-- Default catalogue from the supplied React website. Run only once on a new database.
INSERT IGNORE INTO products (id,name,category,price,stock,emoji,description) VALUES
(1,'Wireless Headphones','Electronics',89.00,25,'🎧','Noise-cancelling over-ear headphones with a 30-hour battery and fast charging.'),
(2,'Smartwatch','Electronics',149.00,18,'⌚','Tracks sleep, steps and heart rate. Water resistant with a bright always-on display.'),
(3,'Laptop','Electronics',899.00,8,'💻','Fast and light 14-inch laptop for work and study, with all-day battery life.'),
(4,'Camera','Electronics',449.00,6,'📷','24MP mirrorless camera with a kit lens, 4K video and Wi-Fi sharing.'),
(5,'Running Sneakers','Fashion',79.00,40,'👟','Cushioned, breathable sneakers made for daily runs and long walks.'),
(6,'Backpack','Fashion',55.00,30,'🎒','Water-resistant backpack with a padded laptop sleeve and many pockets.'),
(7,'Sunglasses','Fashion',35.00,50,'🕶️','Lightweight frame with UV400 protection for sunny days.'),
(8,'Classic Jeans','Clothes',45.00,35,'👖','Straight-fit denim that is comfortable all day and easy to style.'),
(9,'Summer Dress','Clothes',49.00,22,'👗','Light floral dress made from soft, breathable fabric.'),
(10,'Winter Coat','Clothes',99.00,14,'🧥','Warm padded coat with a water-resistant shell and a snug hood.'),
(11,'Paperback Books','Books',12.00,60,'📚','A bundle of three bestselling novels to keep you reading all month.'),
(12,'Football','Sports',25.00,45,'⚽','Size 5 match ball with durable stitching, good for grass and turf.'),
(13,'Acoustic Guitar','Sports',199.00,9,'🎸','Spruce-top acoustic guitar with a warm tone, great for beginners.');

-- Create the first admin from the API setup instructions below, rather than storing a plain-text password here.
