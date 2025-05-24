CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    nif CHAR(9) UNIQUE,
    nic CHAR(9) UNIQUE,
    gender ENUM('Male', 'Female', 'Other'),
    dob DATE,
    unread_notifications INT
); 

CREATE TABLE IF NOT EXISTS entities ( -- Stores and Charities
    id INT PRIMARY KEY,
    nipc CHAR(9) UNIQUE NOT NULL,
    entity_type ENUM('store', 'charity') NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),

    FOREIGN KEY (id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TRIGGER check_entity_client_fields
BEFORE INSERT ON entities
FOR EACH ROW
BEGIN
    DECLARE nic_ CHAR(9);
    DECLARE nif_ CHAR(9);
    DECLARE dob_ DATE;
    DECLARE gender_ ENUM('Male', 'Female', 'Other');

    -- Get relevant fields from clients
    SELECT nic, nif, dob, gender
    INTO  nic_, nif_, dob_, gender_
    FROM clients
    WHERE id = NEW.id;

    -- Check forbidden fields are NULL
    IF nic_ IS NOT NULL OR nif_ IS NOT NULL OR dob_ IS NOT NULL OR gender_ IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Entities must NOT have NIC, NIF, DOB, or gender set';
    END IF;
END;

CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,
    store CHAR(9) NOT NULL,
    internal_number INT UNIQUE,

    FOREIGN KEY (id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (store) REFERENCES entities(nipc) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TRIGGER ensure_store_entity_type
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    DECLARE etype VARCHAR(10);

    -- Get the entity_type as a string
    SELECT CAST(entity_type AS CHAR) INTO etype
    FROM entities
    WHERE nipc = NEW.store;

    -- If the entity_type is not 'store', raise an error
    IF etype IS NULL OR etype != 'store' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Employees can only be linked to entities of type "store"';
    END IF;
END;

CREATE TABLE IF NOT EXISTS entityHours (
    entity INT,
    day VARCHAR(25),
    hours CHAR(11), -- HH:MM-HH:MM

    PRIMARY KEY (entity, day),
    FOREIGN KEY (entity) REFERENCES entities(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    category VARCHAR(255) PRIMARY KEY NOT NULL
);
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

CREATE TABLE IF NOT EXISTS charityProjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    charity INT NOT NULL,
    description VARCHAR(255),
    endDate DATE,

    FOREIGN KEY (charity) REFERENCES entities(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_nipc CHAR(9) NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_condition ENUM('Like New', 'Excellent', 'Good', 'Needs Repair') NOT NULL,
    availability BOOLEAN NOT NULL,
    category VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date_inserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Optional product specs
    brand VARCHAR(255),
    model_code VARCHAR(255),
    color VARCHAR(255),
    weight DECIMAL(5,2), -- Must be in kg
    dimensions VARCHAR(255),
    processor VARCHAR(255),
    screen VARCHAR(255),
    ram_memory VARCHAR(255),
    graphics_card VARCHAR(255),
    storage VARCHAR(255),
    keyboard VARCHAR(255),
    os VARCHAR(255),
    year YEAR,

    FOREIGN KEY (store_nipc) REFERENCES entities(nipc) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES categories(category) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productImages (
    product INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_order INT NOT NULL,

    PRIMARY KEY (product, image_order),
    FOREIGN KEY (product) REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CHECK (image_order >= 1 AND image_order <= 5)
);

CREATE TABLE IF NOT EXISTS saleProducts (
    id INT PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT ck_saleProducts_price check (price >= 0),
    FOREIGN KEY (id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repairProducts (
    id INT PRIMARY KEY,
    problems VARCHAR(255),
    client_nif CHAR(9),
    client_nic CHAR(9),

    FOREIGN KEY (id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (client_nif) REFERENCES clients(nif) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (client_nic) REFERENCES clients(nic) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repairParts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS donationProducts (
    id INT PRIMARY KEY,
    charity_nipc CHAR(9) NOT NULL,
    donor_nif CHAR(9),
    donor_nic CHAR(9),
    donor_nipc CHAR(9),
  
    FOREIGN KEY (id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (charity_nipc) REFERENCES entities(nipc) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (donor_nif) REFERENCES clients(nif) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (donor_nic) REFERENCES clients(nic) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (donor_nipc) REFERENCES entities(nipc) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client VARCHAR(255) NOT NULL,
    transaction_value DECIMAL(10,2) NOT NULL,
    date_inserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client) REFERENCES clients(email) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales (
    transaction_id INT PRIMARY KEY,
    is_online BOOLEAN NOT NULL,
    order_number VARCHAR(255),
    store INT,
    employee INT,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_postal_code VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(255) NOT NULL,
    shipping_country CHAR(2) NOT NULL,
    sale_status ENUM('To be shipped', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'To be shipped',
    network VARCHAR(255) NOT NULL,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (store) REFERENCES entities(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (employee) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE,

    -- If online transaction the order number must not be null
    CONSTRAINT chk_online_order_number CHECK (
        (is_online = TRUE AND order_number IS NOT NULL) 
        OR (is_online = FALSE)
    )
);

CREATE TABLE IF NOT EXISTS soldProducts (
    product_id INT NOT NULL,
    sale_id INT NOT NULL,

    PRIMARY KEY(product_id, sale_id),
    FOREIGN KEY (sale_id) REFERENCES sales(transaction_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES saleProducts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repairs (
    transaction_id INT PRIMARY KEY,
    product_id INT NOT NULL,
    store INT NOT NULL,
    employee INT NOT NULL,
    repair_status ENUM('In repairs', 'Repaired; Awaiting Collection', 'Repaired; Collected') NOT NULL DEFAULT 'In repairs',
    network VARCHAR(255) NOT NULL,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES repairProducts(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (store) REFERENCES entities(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (employee) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donations (
    transaction_id INT PRIMARY KEY,
    product_id INT NOT NULL,
    store INT NOT NULL,
    employee INT NOT NULL,
    charity INT NOT NULL,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES donationProducts(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (store) REFERENCES entities(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (employee) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (charity) REFERENCES entities(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interested_user VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    product_model VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    max_price DECIMAL(10,2),
    color VARCHAR(255),
    graphics_card VARCHAR(255),
    os VARCHAR(255),
    processor VARCHAR(255),
    product_condition ENUM('Like New', 'Excellent', 'Good'),
    ram_memory VARCHAR(255),
    screen VARCHAR(255),
    storage VARCHAR(255),
    year YEAR,
    date_inserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (interested_user) REFERENCES clients(email) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES categories(category) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wishlisted_product INT NOT NULL,
    interested_user VARCHAR(255) NOT NULL,
    date_inserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_wishlisted_product_interested_user 
    UNIQUE (wishlisted_product, interested_user),
    FOREIGN KEY (interested_user) REFERENCES clients(email) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (wishlisted_product) REFERENCES saleProducts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    current_shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00

    CONSTRAINT ck_shipping_cost check (current_shipping_cost >= 0)
);