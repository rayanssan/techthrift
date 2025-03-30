-- Initial data to populate the databases

INSERT INTO clients (name, email, phone_number, gender, password, dob, address) VALUES
('Janes Store', 'janesmith@example.com', '987654321', 'Female', 'securepass', '1995-05-05', '456 Elm St'),
('Michaels Charity', 'michaelj@example.com', '111222333', 'Male', 'mikepass', '1988-12-12', '789 Oak St');

INSERT INTO clients (name, email, phone_number, gender, password, dob, address, nif, nic) VALUES
('John Doe', 'johndoe@example.com', '123456789', 'Male', 'password123', '1990-01-01', '123 Main St', 123456789, 123456789),
('Emily Davis', 'emilyd@example.com', '444555666', 'Female', 'emilysecure', '1992-07-07', '321 Pine St', 220349535, 220349535),
('Robert Brown', 'robertb@example.com', '777888999', 'Male', 'robertpass', '1985-03-03', '654 Maple St', 987654321, 987654321);

INSERT INTO entities (id, nipc) VALUES (1, 112233445), (2, 556677889);
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


INSERT INTO products (id, name, store_nipc, product_condition, availability, description, category) VALUES
(1, 'Dell Laptop', 112233445, 'New', 1, 'High-end gaming laptop', "Laptops & PCs"),
(2, 'iPhone 16 Pro', 112233445, 'Used', 1, 'Latest model smartphone', "Smartphones"),
(3, 'Apple Watch Series 10', 112233445, 'Used', 1, 'Latest model Apple Watch', "Smartwatches"),
(4, 'Samsung Galaxy S24', 112233445, 'New', 1, 'Latest flagship smartphone from Samsung', 'Smartphones'),
(5, 'Sony PlayStation 5', 112233445, 'New', 1, 'Next-gen gaming console with 4K capabilities', 'Gaming'),
(6, 'HP Envy Laptop', 112233445, 'Used', 1, 'High-performance laptop with Intel i7 processor', "Laptops & PCs"),
(7, 'LG OLED 65-inch TV', 112233445, 'New', 1, '55-inch OLED 4K smart TV with HDR', 'TVs & Monitors'),
(8, 'Nintendo Switch', 112233445, 'Used', 1, 'Hybrid gaming console from Nintendo', 'Gaming'),
(9, 'Apple MacBook Pro', 112233445, 'New', 1, 'MacBook Pro with M1 chip for professionals', "Laptops & PCs"),
(10, 'Bose Noise Cancelling Headphones', 112233445, 'New', 1, 'Premium noise-canceling headphones', 'Audio'),
(11, 'GoPro Hero 11', 112233445, 'Used', 1, 'Action camera for extreme sports', 'Cameras'),
(12, 'iPad Pro 12.9-inch', 112233445, 'New', 1, 'High-performance tablet with Apple Pencil support', 'Tablets'),
(13, 'Microsoft Surface Laptop', 112233445, 'Used', 1, 'Versatile laptop with touchscreen functionality', "Laptops & PCs"),
(14, 'Razer Blade 15 Laptop', 112233445, 'New', 1, 'High-end gaming laptop with Nvidia RTX graphics', "Laptops & PCs"),
(15, 'Canon EOS R5 Camera', 112233445, 'Used', 1, 'Mirrorless camera with 8K video recording', 'Cameras'),
(16, 'Fitbit Charge 5', 112233445, 'New', 1, 'Fitness tracker with health monitoring features', "Smartwatches"),
(17, 'Xiaomi Mi 11', 112233445, 'Used', 1, 'Flagship smartphone from Xiaomi with high-end specs', 'Smartphones'),
(18, 'Apple AirPods Pro', 112233445, 'New', 1, 'True wireless noise-canceling earphones', 'Audio');

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

INSERT INTO repairProducts (id, problems) VALUES (2, 'Broken screen');
INSERT INTO donationProducts (id, charity) VALUES (2, 556677889);
INSERT INTO interests (interestedUser, watchedProduct) VALUES (3, 1);
INSERT INTO reports (report) VALUES ('15/02/2025 - 3 new users; 3 new products; 1 new interest');