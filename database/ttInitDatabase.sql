-- Initial data to populate the databases

INSERT INTO clients (id, name, email, phone_number, password, address, city, country) VALUES
(1, 'TechThrift HQ', 'janesmith@example.com', '987654321', 'securepass', 'Rua Augusta 10, 1100-053', "Lisbon", "Portugal"),
(2, "Michael\'s Charity", 'michaelj@example.com', '111222333', 'mikepass', 'Avenida da Liberdade 200, 1250-147', "Lisbon", "Portugal"),
(3, 'Tech Reboot', 'techreboot@example.com', '912345678', 'rebootpass', 'Avenida Gustavo Eiffel 218, 4000-279', "Porto", "Portugal"),
(4, 'Lisbon Gadgets', 'lisbongadgets@example.com', '934567890', 'gadget123', 
'Centro Vasco da Gama, Av. Dom João II 40 loja 2.010, 1990-094', "Lisbon", "Portugal"),
(5, 'RefurbishPoint', 'refurbish@example.com', '965432109', 'refurb321', 'Freeport Outlet, Av. Euro 2004, Loja 0.12, 
2890-154', "Alcochete", "Portugal"),
(6, 'Charity Hands', 'handscharity@example.com', '938271645', 'helpme', 'Rua de Benfica 100, 1500-088', "Lisbon", "Portugal"),
(7, 'EcoDevices', 'eco@example.com', '936598741', 'greenpass', 'Rua Carlos Vieira Ramos 19, 2770-183', 'Paço de Arcos', 'Portugal'),
(8, 'Gadget Goodies', 'gadgetgoodies@example.com', '923456789', 'goodies123', 'Forum Algarve, Loja 0.22, 8009-020', 'Faro', 'Portugal'),
(9, 'TechRelove', 'techrelove@example.com', '965887741', 'reloveit', '38.7343° N, 9.1530° W', 'Lisbon', 'Portugal'),
(10, 'Circuit Stop', 'circuitstop@example.com', '934455667', 'stopcircuit', 'Avenida da Boavista 610, 4149-071', 'Porto', 'Portugal'),
(11, 'Restart Tech', 'restarttech@example.com', '914785236', 'restartme', 'Rua do Carmo 30, 1200-094', 'Lisbon', 'Portugal'),
(12, 'Digital Hope Charity', 'hopecharity@example.com', '936121213', 'hopepass', 'Rua da Madalena 55, 1100-150', 'Lisbon', 'Portugal'),
(13, 'Kindware', 'kindware@example.com', '918273645', 'kindpass', 'Rua do Ouro 78, 1100-063', 'Lisbon', 'Portugal'),
(14, 'DonateTech', 'donatetech@example.com', '913243546', 'donatepass', 'Rua Rodrigues Sampaio 170, 1150-280', 'Lisbon', 'Portugal'),
(15, 'Empower Electronics', 'empower@example.com', '919876543', 'empowerme', 'Rua Conde Redondo 145, 1150-104', 'Lisbon', 'Portugal'),
(16, 'TechRevive', 'techrevive@example.com', '633345678', 'revivepass', 'Carrer de Pau Claris 101, 08010', 'Barcelona', 'Spain'),
(17, 'Gadget Galaxy', 'gadgetgalaxy@example.com', '644556789', 'galaxypass', 'Carrer Gran de Gràcia 100, 08008', 'Barcelona', 'Spain'),
(18, 'RebootZone', 'rebootzone@example.com', '661234567', 'rebootzonepass', 'Calle de Toledo 89, 28005', 'Madrid', 'Spain'),
(19, 'El Mundo del Gadget', 'mundogadget@example.com', '612345678', 'gadget12345', 'Calle de Fuencarral 78, 28004', 'Madrid', 'Spain'),
(20, 'Reciclaje Digital', 'reciclajedigital@example.com', '623456789', 'digitalrecycle', 'Carrer de València 150, 46005', 'Valencia', 'Spain'),
(21, 'Segunda Mano Tech', 'segunda@example.com', '612345789', 'segundatechpass', 'Carrer de la Pau 15, 46003', 'Valencia', 'Spain'),
(22, 'Gizmos España', 'gizmos@example.com', '625678901', 'gizmospass', 'Avenida de la Constitución 10, 41001', 'Sevilla', 'Spain'),
(23, 'E-Tech Spain', 'etechspain@example.com', '635789012', 'etech1234', 'Calle del Carmen 34, 41003', 'Sevilla', 'Spain'),
(24, 'ReparaTech', 'reparatech@example.com', '644321098', 'reparapass', 'Carrer de la Diputació 125, 08015', 'Barcelona', 'Spain'),
(25, 'Tech & Co.', 'techco@example.com', '651234567', 'techcotech', 'Calle de San Bernardo 78, 28015', 'Madrid', 'Spain');

INSERT INTO clients (id, name, email, phone_number, gender, password, dob, address, nif, nic) VALUES
(26, 'John Doe', 'johndoe@example.com', '123456789', 'Male', 'password123', 
'1990-01-01', '123 Main St', 123456789, 123456789),
(27, 'Emily Davis', 'emilyd@example.com', '444555666', 'Female', 'emilysecure', 
'1992-07-07', '321 Pine St', 220349535, 220349535),
(28, 'Robert Brown', 'robertb@example.com', '777888999', 'Male', 'robertpass', 
'1985-03-03', '654 Maple St', 987654321, 987654321);

INSERT INTO entities (id, nipc, entity_type) VALUES 
(1, 112233445, 'store'),
(2, 556677889, 'charity'),
(3, 223344556, 'store'),
(4, 667788990, 'store'),
(5, 778899001, 'store'),
(6, 889900112, 'charity'),
(7, 990011223, 'store'),
(8, 101112131, 'store'),
(9, 121314151, 'store'),
(10, 131415161, 'store'),
(11, 141516171, 'store'),
(12, 151617181, 'charity'),
(13, 161718191, 'charity'),
(14, 171819202, 'charity'),
(15, 181920212, 'charity'),
(16, 192021223, 'store'),
(17, 202122233, 'store'),
(18, 212223244, 'store'),
(19, 222324255, 'store'),
(20, 232425266, 'store'),
(21, 242526277, 'store'),
(22, 252627288, 'store'),
(23, 262728299, 'store'),
(24, 272829300, 'store'),
(25, 282930311, 'store');

INSERT INTO entityHours VALUES
-- TechThrift HQ
(1, 'Monday', '08:00-22:00'),
(1, 'Tuesday', '08:00-22:00'),
(1, 'Wednesday', '08:00-22:00'),
(1, 'Thursday', '08:00-22:00'),
(1, 'Friday', '08:00-22:00'),
(1, 'Saturday', '10:00-20:00'),
(1, 'Sunday', '10:00-18:00'),
(1, 'Christmas Day', 'Closed'),
-- Michael's Charity
(2, 'Monday', '09:00-17:00'),
(2, 'Tuesday', '09:00-17:00'),
(2, 'Wednesday', '09:00-17:00'),
(2, 'Thursday', '09:00-17:00'),
(2, 'Friday', '09:00-17:00'),
(2, 'Saturday', '10:00-14:00'),
(2, 'Sunday', 'Closed'),
(2, 'Christmas Day', 'Closed'),
-- Tech Reboot
(3, 'Monday', '08:00-20:00'),
(3, 'Tuesday', '08:00-20:00'),
(3, 'Wednesday', '08:00-20:00'),
(3, 'Thursday', '08:00-20:00'),
(3, 'Friday', '08:00-20:00'),
(3, 'Saturday', '09:00-18:00'),
(3, 'Sunday', 'Closed'),
(3, 'Christmas Day', 'Closed'),
-- Lisbon Gadgets
(4, 'Monday', '10:00-22:00'),
(4, 'Tuesday', '10:00-22:00'),
(4, 'Wednesday', '10:00-22:00'),
(4, 'Thursday', '10:00-22:00'),
(4, 'Friday', '10:00-22:00'),
(4, 'Saturday', '11:00-21:00'),
(4, 'Sunday', '11:00-19:00'),
(4, 'Christmas Day', 'Closed'),
-- RefurbishPoint
(5, 'Monday', '09:00-19:00'),
(5, 'Tuesday', '09:00-19:00'),
(5, 'Wednesday', '09:00-19:00'),
(5, 'Thursday', '09:00-19:00'),
(5, 'Friday', '09:00-19:00'),
(5, 'Saturday', '10:00-16:00'),
(5, 'Sunday', 'Closed'),
(5, 'Christmas Day', 'Closed'),
-- Charity Hands
(6, 'Monday', '09:30-16:30'),
(6, 'Tuesday', '09:30-16:30'),
(6, 'Wednesday', '09:30-16:30'),
(6, 'Thursday', '09:30-16:30'),
(6, 'Friday', '09:30-16:30'),
(6, 'Saturday', '10:00-14:00'),
(6, 'Sunday', 'Closed'),
(6, 'Christmas Day', 'Closed'),
-- EcoDevices
(7, 'Monday', '10:00-21:00'),
(7, 'Tuesday', '10:00-21:00'),
(7, 'Wednesday', '10:00-21:00'),
(7, 'Thursday', '10:00-21:00'),
(7, 'Friday', '10:00-21:00'),
(7, 'Saturday', '11:00-20:00'),
(7, 'Sunday', '11:00-18:00'),
(7, 'Christmas Day', 'Closed'),
-- Gadget Goodies
(8, 'Monday', '08:30-19:30'),
(8, 'Tuesday', '08:30-19:30'),
(8, 'Wednesday', '08:30-19:30'),
(8, 'Thursday', '08:30-19:30'),
(8, 'Friday', '08:30-19:30'),
(8, 'Saturday', '09:00-17:00'),
(8, 'Sunday', 'Closed'),
(8, 'Christmas Day', 'Closed'),
-- TechRelove
(9, 'Monday', '10:00-20:00'),
(9, 'Tuesday', '10:00-20:00'),
(9, 'Wednesday', '10:00-20:00'),
(9, 'Thursday', '10:00-20:00'),
(9, 'Friday', '10:00-20:00'),
(9, 'Saturday', '10:00-16:00'),
(9, 'Sunday', 'Closed'),
(9, 'Christmas Day', 'Closed'),
-- Circuit Stop
(10, 'Monday', '09:00-18:00'),
(10, 'Tuesday', '09:00-18:00'),
(10, 'Wednesday', '09:00-18:00'),
(10, 'Thursday', '09:00-18:00'),
(10, 'Friday', '09:00-18:00'),
(10, 'Saturday', '10:00-14:00'),
(10, 'Sunday', 'Closed'),
(10, 'Christmas Day', 'Closed'),
-- Restart Tech
(11, 'Monday', '08:00-22:00'),
(11, 'Tuesday', '08:00-22:00'),
(11, 'Wednesday', '08:00-22:00'),
(11, 'Thursday', '08:00-22:00'),
(11, 'Friday', '08:00-22:00'),
(11, 'Saturday', '10:00-20:00'),
(11, 'Sunday', '10:00-18:00'),
(11, 'Christmas Day', 'Closed'),
-- TechRevive
(16, 'Monday', '09:00-20:00'),
(16, 'Tuesday', '09:00-20:00'),
(16, 'Wednesday', '09:00-20:00'),
(16, 'Thursday', '09:00-20:00'),
(16, 'Friday', '09:00-20:00'),
(16, 'Saturday', '10:00-18:00'),
(16, 'Sunday', 'Closed'),
(16, 'Christmas Day', 'Closed'),
-- Gadget Galaxy
(17, 'Monday', '10:00-22:00'),
(17, 'Tuesday', '10:00-22:00'),
(17, 'Wednesday', '10:00-22:00'),
(17, 'Thursday', '10:00-22:00'),
(17, 'Friday', '10:00-22:00'),
(17, 'Saturday', '11:00-21:00'),
(17, 'Sunday', '11:00-19:00'),
(17, 'Christmas Day', 'Closed'),
-- RebootZone
(18, 'Monday', '09:00-18:00'),
(18, 'Tuesday', '09:00-18:00'),
(18, 'Wednesday', '09:00-18:00'),
(18, 'Thursday', '09:00-18:00'),
(18, 'Friday', '09:00-18:00'),
(18, 'Saturday', '10:00-14:00'),
(18, 'Sunday', 'Closed'),
(18, 'Christmas Day', 'Closed'),
-- El Mundo del Gadget
(19, 'Monday', '08:00-20:00'),
(19, 'Tuesday', '08:00-20:00'),
(19, 'Wednesday', '08:00-20:00'),
(19, 'Thursday', '08:00-20:00'),
(19, 'Friday', '08:00-20:00'),
(19, 'Saturday', '09:00-18:00'),
(19, 'Sunday', 'Closed'),
(19, 'Christmas Day', 'Closed'),
-- Reciclaje Digital
(20, 'Monday', '09:00-20:00'),
(20, 'Tuesday', '09:00-20:00'),
(20, 'Wednesday', '09:00-20:00'),
(20, 'Thursday', '09:00-20:00'),
(20, 'Friday', '09:00-20:00'),
(20, 'Saturday', '10:00-18:00'),
(20, 'Sunday', 'Closed'),
(20, 'Christmas Day', 'Closed'),
-- Segunda Mano Tech
(21, 'Monday', '10:00-19:00'),
(21, 'Tuesday', '10:00-19:00'),
(21, 'Wednesday', '10:00-19:00'),
(21, 'Thursday', '10:00-19:00'),
(21, 'Friday', '10:00-19:00'),
(21, 'Saturday', '11:00-17:00'),
(21, 'Sunday', 'Closed'),
(21, 'Christmas Day', 'Closed'),
-- Gizmos España
(22, 'Monday', '09:00-20:00'),
(22, 'Tuesday', '09:00-20:00'),
(22, 'Wednesday', '09:00-20:00'),
(22, 'Thursday', '09:00-20:00'),
(22, 'Friday', '09:00-20:00'),
(22, 'Saturday', '10:00-18:00'),
(22, 'Sunday', 'Closed'),
(22, 'Christmas Day', 'Closed'),
-- E-Tech Spain
(23, 'Monday', '10:00-20:00'),
(23, 'Tuesday', '10:00-20:00'),
(23, 'Wednesday', '10:00-20:00'),
(23, 'Thursday', '10:00-20:00'),
(23, 'Friday', '10:00-20:00'),
(23, 'Saturday', '11:00-19:00'),
(23, 'Sunday', '11:00-18:00'),
(23, 'Christmas Day', 'Closed'),
-- ReparaTech
(24, 'Monday', '09:00-20:00'),
(24, 'Tuesday', '09:00-20:00'),
(24, 'Wednesday', '09:00-20:00'),
(24, 'Thursday', '09:00-20:00'),
(24, 'Friday', '09:00-20:00'),
(24, 'Saturday', '10:00-18:00'),
(24, 'Sunday', 'Closed'),
(24, 'Christmas Day', 'Closed'),
-- Tech & Co.
(25, 'Monday', '08:00-22:00'),
(25, 'Tuesday', '08:00-22:00'),
(25, 'Wednesday', '08:00-22:00'),
(25, 'Thursday', '08:00-22:00'),
(25, 'Friday', '08:00-22:00'),
(25, 'Saturday', '10:00-20:00'),
(25, 'Sunday', '10:00-18:00'),
(25, 'Christmas Day', 'Closed');

INSERT INTO employees (id, store) VALUES (26, 112233445);

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

(6, 'HP Envy Laptop', 223344556, 'Excellent', 1, 'High-performance laptop with Intel i7 processor', 
"Laptops & PCs", 'HP', 'Envy 15', 'Silver', 2.3, '357 x 241 x 18 mm', 
'Intel Core i7', '15.6-inch Full HD (1920x1080)', '16GB', 'Intel Iris Xe', 
'1TB SSD', 'Backlit (UK Layout)', 'Windows 11', 2022),

(7, 'LG OLED 65-inch Smart TV', 223344556, 'Like New', 1, '65-inch OLED 4K smart TV with HDR', 
'TVs & Monitors', 'LG', 'OLED65C1', 'Black', 24.0, '1449 x 830 x 46 mm', NULL, 
'65-inch OLED 4K (3840x2160)', NULL, NULL, null, NULL, 'webOS', 2021),

(8, 'Nintendo Switch', 112233445, 'Excellent', 1, 'Hybrid gaming console from Nintendo', 
'Gaming', 'Nintendo', 'HAC-001(-01)', 'Neon Red/Blue', 0.398, '102 x 239 x 14 mm', 
NULL, '6.2-inch LCD (1280x720)', '4GB', 'NVIDIA Tegra X1', '32GB', NULL, NULL, 2019),

(9, 'Apple MacBook Pro M1 Pro', 192021223, 'Like New', 1, 
'MacBook Pro with M1 chip for professionals', 
"Laptops & PCs", 'Apple', 'MacBook Pro 14"', 
'Space Gray', 1.6, '312 x 221 x 15.5 mm', 
'Apple M1 Pro', '14-inch Liquid Retina XDR (3024x1964)', 
'16GB', 'Apple GPU 16-core', '512GB SSD', 'Backlit (US Layout)', 'macOS', 2023),

(10, 'Bose Noise Cancelling Headphones', 778899001, 'Like New', 1, 
'Premium noise-canceling headphones', 'Audio', 'Bose', 'QC45', 
'Black', 0.24, '170 x 180 x 81 mm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2021),

(11, 'GoPro Hero 11', 667788990, 'Good', 1, 'Action camera for extreme sports', 
'Cameras', 'GoPro', 'Hero 11', 'Black', 0.154, '71 x 55 x 34 mm', NULL, 
'2.27-inch LCD (320x240)', NULL, NULL, '32GB microSD', NULL, NULL, 2022),

(12, 'iPad Pro 12.9-inch', 112233445, 'Like New', 1, 
'High-performance tablet with Apple Pencil support', 
'Tablets', 'Apple', 'iPad Pro 6th Gen', 'Silver', 0.682, 
'280.6 x 214.9 x 6.4 mm', 'Apple M2', 
'12.9-inch Liquid Retina XDR (2732x2048)', '16GB', NULL, '1TB', NULL, 'iPadOS', 2023),

(13, 'Microsoft Surface Laptop', 282930311, 'Good', 1, 
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

(15, 'Canon EOS R5 Camera', 101112131, 'Excellent', 1, 
'Mirrorless camera with 8K video recording', 'Cameras', 
'Canon', 'EOS R5', 'Black', 0.738, '138 x 98 x 88 mm', 
NULL, '3.2-inch LCD (1024x768)', NULL, NULL, 'Dual CFexpress & SD', NULL, NULL, 2021),

(16, 'Fitbit Charge 5', 112233445, 'Like New', 1, 
'Fitness tracker with health monitoring features', 
"Smartwatches", 'Fitbit', 'Charge 5', 'Steel Blue', 
0.029, '36.7 x 22.7 x 11.2 mm', NULL, 
'1.04-inch AMOLED (208x208)', NULL, NULL, NULL, NULL, 'Fitbit OS', 2021),

(17, 'Xiaomi Mi 11', 990011223, 'Good', 1, 
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