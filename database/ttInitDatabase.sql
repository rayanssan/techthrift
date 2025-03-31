-- Initial data to populate the databases

INSERT INTO clients (name, email, phone_number, gender, password, dob, address) VALUES
('Janes Store', 'janesmith@example.com', '987654321', 'Female', 'securepass', '1995-05-05', '456 Elm St'),
('Michaels Charity', 'michaelj@example.com', '111222333', 'Male', 'mikepass', '1988-12-12', '789 Oak St');

INSERT INTO clients (name, email, phone_number, gender, password, dob, address, nif, nic) VALUES
('John Doe', 'johndoe@example.com', '123456789', 'Male', 'password123', 
'1990-01-01', '123 Main St', 123456789, 123456789),
('Emily Davis', 'emilyd@example.com', '444555666', 'Female', 'emilysecure', 
'1992-07-07', '321 Pine St', 220349535, 220349535),
('Robert Brown', 'robertb@example.com', '777888999', 'Male', 'robertpass', 
'1985-03-03', '654 Maple St', 987654321, 987654321);

INSERT INTO entities (id, nipc,  entity_type) VALUES 
(1, 112233445, "store"), 
(2, 556677889, "charity");

INSERT INTO employees (id, store) VALUES (3, 2);

INSERT INTO categories (category) VALUES 
("Smartphones"),
("Laptops & PCs"),
("Smartwatches"),
('Gaming'),
('TVs & Monitors'),
('Audio'),
('Tablets'),
('Cameras'),
('Accessories'),
('Home Appliances'),
('Other');

INSERT INTO products (id, name, store_nipc, product_condition, 
availability, description, category, brand, model_code, color, weight, 
dimensions, processor, screen, ram_memory, graphics_card, storage, keyboard, os, year) VALUES
(1, 'Dell G15 5520 Laptop', 112233445, 'Like New', 1, 
'High-end gaming laptop', "Laptops & PCs", 'Dell', 'G15 5520', 
'Black', 2.5, '357 x 272 x 23 mm', 'Intel Core i7', 
'15.6-inch Full HD (1920x1080) 144Hz', '16GB', 'NVIDIA RTX 3060', 
'512GB SSD', 'RGB Backlit (US Layout)', 'Windows 11', 2023),

(2, 'iPhone 16 Pro', 112233445, 'Needs Repair', 0, 'Latest model smartphone', 
"Smartphones", 'Apple', 'A3101', 'Graphite', 0.2, '146.7 x 71.5 x 7.8 mm', NULL, 
'6.1-inch OLED (2532x1170) 120Hz', '8GB', NULL, '512GB', NULL, 'iOS 17', 2024),

(3, 'Apple Watch Series 10', 112233445, 'Excellent', 1, 'Latest model Apple Watch', 
"Smartwatches", 'Apple', 'S10', 'Silver', 0.032, '45 x 38 x 10.7 mm', NULL, 
'1.9-inch Retina (324x394)', '2GB', NULL, '32GB', NULL, 'watchOS 11', 2024),

(4, 'Samsung Galaxy S24', 112233445, 'Like New', 1, 'Latest flagship smartphone from Samsung', 
'Smartphones', 'Samsung', 'SM-S921B', 'Phantom Black', 0.196, '147 x 70.6 x 7.6 mm', NULL, 
'6.2-inch AMOLED (2340x1080) 120Hz', '12GB', NULL, '256GB', NULL, 'Android 14', 2024),

(5, 'Sony PlayStation 5', 112233445, 'Like New', 1, 'Next-gen gaming console with 4K capabilities', 
'Gaming', 'Sony', 'CFI-1215A', 'White', 4.5, '390 x 260 x 104 mm', NULL, NULL, '16GB', 
'AMD RDNA 2', '825GB SSD', NULL, NULL, 2020),

(6, 'HP Envy Laptop', 112233445, 'Excellent', 1, 'High-performance laptop with Intel i7 processor', 
"Laptops & PCs", 'HP', 'Envy 15', 'Silver', 2.3, '357 x 241 x 18 mm', 
'Intel Core i7', '15.6-inch Full HD (1920x1080)', '16GB', 'Intel Iris Xe', 
'1TB SSD', 'Backlit (UK Layout)', 'Windows 11', 2022),

(7, 'LG OLED 65-inch TV', 112233445, 'Like New', 1, '65-inch OLED 4K smart TV with HDR', 
'TVs & Monitors', 'LG', 'OLED65C1', 'Black', 24.0, '1449 x 830 x 46 mm', NULL, 
'65-inch OLED 4K (3840x2160)', NULL, NULL, 'N/A', NULL, 'webOS', 2021),

(8, 'Nintendo Switch', 112233445, 'Excellent', 1, 'Hybrid gaming console from Nintendo', 
'Gaming', 'Nintendo', 'HAC-001(-01)', 'Neon Red/Blue', 0.398, '102 x 239 x 14 mm', 
NULL, '6.2-inch LCD (1280x720)', '4GB', 'NVIDIA Tegra X1', '32GB', NULL, NULL, 2019),

(9, 'Apple MacBook Pro M1 Pro', 112233445, 'Like New', 1, 
'MacBook Pro with M1 chip for professionals', 
"Laptops & PCs", 'Apple', 'MacBook Pro 14"', 
'Space Gray', 1.6, '312 x 221 x 15.5 mm', 
'Apple M1 Pro', '14-inch Liquid Retina XDR (3024x1964)', 
'16GB', 'Apple GPU 16-core', '512GB SSD', 'Backlit (US Layout)', 'macOS', 2023),

(10, 'Bose Noise Cancelling Headphones', 112233445, 'Like New', 1, 
'Premium noise-canceling headphones', 'Audio', 'Bose', 'QC45', 
'Black', 0.24, '170 x 180 x 81 mm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2021),

(11, 'GoPro Hero 11', 112233445, 'Good', 1, 'Action camera for extreme sports', 
'Cameras', 'GoPro', 'Hero 11', 'Black', 0.154, '71 x 55 x 34 mm', NULL, 
'2.27-inch LCD (320x240)', NULL, NULL, '32GB microSD', NULL, NULL, 2022),

(12, 'iPad Pro 12.9-inch', 112233445, 'Like New', 1, 
'High-performance tablet with Apple Pencil support', 
'Tablets', 'Apple', 'iPad Pro 6th Gen', 'Silver', 0.682, 
'280.6 x 214.9 x 6.4 mm', 'Apple M2', 
'12.9-inch Liquid Retina XDR (2732x2048)', '16GB', NULL, '1TB', NULL, 'iPadOS', 2023),

(13, 'Microsoft Surface Laptop', 112233445, 'Good', 1, 
'Versatile laptop with touchscreen functionality', 
"Laptops & PCs", 'Microsoft', 'Surface Laptop 5', 
'Platinum', 1.3, '308 x 223 x 14.5 mm', 'Intel Core i5', 
'13.5-inch PixelSense (2256x1504)', '8GB', 'Intel Iris Xe', 
'256GB SSD', 'Alcantara (UK Layout)', 'Windows 11', 2022),

(14, 'Razer Blade 15 Laptop', 112233445, 'Like New', 1, 
'High-end gaming laptop with Nvidia RTX graphics', 
"Laptops & PCs", 'Razer', 'Blade 15 Advanced', 'Black', 
2.1, '355 x 235 x 16.99 mm', 'Intel Core i9', 
'15.6-inch QHD (2560x1440) 240Hz', '32GB', 
'NVIDIA RTX 3080 Ti', '1TB SSD', 'Per-key RGB (US Layout)', 'Windows 11', 2023),

(15, 'Canon EOS R5 Camera', 112233445, 'Excellent', 1, 
'Mirrorless camera with 8K video recording', 'Cameras', 
'Canon', 'EOS R5', 'Black', 0.738, '138 x 98 x 88 mm', 
NULL, '3.2-inch LCD (1024x768)', NULL, NULL, 'Dual CFexpress & SD', NULL, NULL, 2021),

(16, 'Fitbit Charge 5', 112233445, 'Like New', 1, 
'Fitness tracker with health monitoring features', 
"Smartwatches", 'Fitbit', 'Charge 5', 'Steel Blue', 
0.029, '36.7 x 22.7 x 11.2 mm', NULL, 
'1.04-inch AMOLED (208x208)', NULL, NULL, NULL, NULL, 'Fitbit OS', 2021),

(17, 'Xiaomi Mi 11', 112233445, 'Good', 1, 
'Flagship smartphone from Xiaomi with high-end specs', 
'Smartphones', 'Xiaomi', 'Mi 11', 'Horizon Blue', 0.196, 
'164.3 x 74.6 x 8.1 mm', NULL, '6.81-inch AMOLED (3200x1440) 120Hz', 
'8GB', NULL, '256GB', NULL, 'Android 11', 2021),

(18, 'Apple AirPods Pro', 112233445, 'Like New', 1, 
'True wireless noise-canceling earphones', 'Audio', 
'Apple', 'AirPods Pro 2nd Gen', 'White', 0.0054, '30.9 x 21.8 x 24 mm', 
NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2022);

INSERT INTO productImages (product, image_path, image_order) VALUES
-- Dell Laptop example
(1, "ex_dell_1.avif", 1),
(1, "ex_dell_2.avif", 2),
(1, "ex_dell_3.avif", 3),
(1, "ex_dell_4.avif", 4),
(1, "ex_dell_5.avif", 5),
-- iPhone 16 example
(2, "ex_iphone16_1.webp", 1),
-- Apple Watch Series 10 example
(3, "ex_applewatch10_1.png", 1),
-- Samsung Galaxy S24 example
(4, "ex_galaxys24_1.jpg", 1),
-- Sony PlayStation 5 example
(5, "ex_playstation5_1.jpeg", 1),
-- HP Envy Laptop example
(6, "ex_hpenvy_1.jpg", 1),
-- LG OLED 65-inch TV example
(7, "ex_lgtv_1.webp", 1),
-- Nintendo Switch example
(8, "ex_nintendoswitch_1.jpg", 1),
-- Apple MacBook Pro example
(9, "ex_macbookpro_1.jpg", 1),
-- Bose Noise Cancelling Headphones example
(10, "ex_boseheadphones_1.jpeg", 1),
-- GoPro Hero 11 example
(11, "ex_gopro11_1.jpg", 1),
-- iPad Pro 12.9-inch example
(12, "ex_ipadpro_1.jpg", 1),
-- Microsoft Surface Laptop example
(13, "ex_microsoftsurface_1.jpg", 1),
-- Razer Blade 15 Laptop example
(14, "ex_razorlaptop_1.JPG", 1),
-- Canon EOS R5 Camera example
(15, "ex_canoncamera_1.png", 1),
-- Fitbit Charge 5 example
(16, "ex_fitbit_1.webp", 1),
-- Xiaomi Mi 11 example
(17, "ex_xiaomiphone_1.jpg", 1),
-- Apple AirPods Pro example
(18, "ex_airpodspro_1.png", 1);

INSERT INTO saleProducts (id, price) VALUES
(1, 1500),
(3, 350),
(4, 1299),
(5, 699),
(6, 599),
(7, 899),
(8, 350),
(9, 399),
(10, 999),
(11, 199),
(12, 249),
(13, 799),
(14, 599),
(15, 1399),
(16, 599),
(17, 119),
(18, 149);

INSERT INTO repairProducts (id, problems, client_nif) VALUES (2, 'Broken screen', 220349535);
INSERT INTO donationProducts (id, charity_nipc, donor_nif) VALUES (2, 556677889, 220349535);
INSERT INTO interests (interested_user, watched_product) VALUES (3, 1);
INSERT INTO reports (report) VALUES ('15/02/2025 - 3 new users; 3 new products; 1 new interest');