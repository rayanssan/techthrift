CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    nif CHAR(9) UNIQUE,
    nic CHAR(9) UNIQUE,
    gender ENUM('Male', 'Female', 'Other'),
    dob DATE,
    address VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255)
); 

CREATE TABLE IF NOT EXISTS entities ( -- Stores and Charities
    id INT PRIMARY KEY,
    nipc CHAR(9) UNIQUE NOT NULL,
    entity_type ENUM('store', 'charity') NOT NULL,

    FOREIGN KEY (id) REFERENCES clients(id)
);

CREATE TRIGGER check_entity_client_fields
BEFORE INSERT ON entities
FOR EACH ROW
BEGIN
    DECLARE address_ VARCHAR(255);
    DECLARE city_ VARCHAR(255);
    DECLARE country_ VARCHAR(255);
    DECLARE nic_ CHAR(9);
    DECLARE nif_ CHAR(9);
    DECLARE dob_ DATE;
    DECLARE gender_ ENUM('Male', 'Female', 'Other');

    -- Get relevant fields from clients
    SELECT address, city, country, nic, nif, dob, gender
    INTO address_, city_, country_, nic_, nif_, dob_, gender_
    FROM clients
    WHERE id = NEW.id;

    -- Check required fields are NOT NULL
    IF address_ IS NULL OR city_ IS NULL OR country_ IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Entities must have address, city, and country NOT NULL';
    END IF;

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

    FOREIGN KEY (id) REFERENCES clients(id),
    FOREIGN KEY (store) REFERENCES entities(nipc)
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
    FOREIGN KEY (entity) REFERENCES entities(id)
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
    amountNeeded INT,
    endDate DATE,
    store INT NOT NULL,
    organizer INT NOT NULL,
    category VARCHAR(255),

    FOREIGN KEY (store) REFERENCES entities(id),
    FOREIGN KEY (category) REFERENCES categories(category),
    FOREIGN KEY (organizer) REFERENCES clients(id)
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
    weight DECIMAL(5,2), -- must in kg
    dimensions VARCHAR(255),
    processor VARCHAR(255),
    screen VARCHAR(255),
    ram_memory VARCHAR(255),
    graphics_card VARCHAR(255),
    storage VARCHAR(255),
    keyboard VARCHAR(255),
    os VARCHAR(255),
    year YEAR,

    FOREIGN KEY (store_nipc) REFERENCES entities(nipc),
    FOREIGN KEY (category) REFERENCES categories(category)
);

CREATE TABLE IF NOT EXISTS productImages (
    product INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_order INT NOT NULL,

    PRIMARY KEY (product, image_order),
    FOREIGN KEY (product) REFERENCES products(id),
    CHECK (image_order >= 1 AND image_order <= 5)
);

CREATE TABLE IF NOT EXISTS saleProducts (
    id INT PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT ck_saleProducts_price check (price >= 0),
    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS repairProducts (
    id INT PRIMARY KEY,
    problems VARCHAR(255),
    client_nif CHAR(9),
    client_nic CHAR(9),

    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (client_nif) REFERENCES clients(nif),
    FOREIGN KEY (client_nic) REFERENCES clients(nic)
);

CREATE TABLE IF NOT EXISTS donationProducts (
    id INT PRIMARY KEY,
    charity_nipc CHAR(9) NOT NULL,
    donor_nif CHAR(9),
    donor_nic CHAR(9),
    donor_nipc CHAR(9),
  
    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (charity_nipc) REFERENCES entities(nipc),
    FOREIGN KEY (donor_nif) REFERENCES clients(nif),
    FOREIGN KEY (donor_nic) REFERENCES clients(nic),
    FOREIGN KEY (donor_nipc) REFERENCES entities(nipc)
);

CREATE TABLE IF NOT EXISTS charityProjects_products (
    charityProject INT,
    product INT,

    PRIMARY KEY (charityProject, product),

    FOREIGN KEY (charityProject) REFERENCES charityProjects(id),
    FOREIGN KEY (product) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    store INT,
    numSeq INT,
    date DATE,
    client INT NOT NULL,
    employee INT NOT NULL,

    PRIMARY KEY (store, numSeq),
    FOREIGN KEY (store) REFERENCES entities(id),
    FOREIGN KEY (client) REFERENCES clients(id),
    FOREIGN KEY (employee) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS sales (
    store INT,
    numSeq INT,
    value DECIMAL(10,2) NOT NULL,
    deliveryCost DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (store, numSeq),
    CONSTRAINT ck_sales_value check (value >= 0),
    FOREIGN KEY (store, numSeq) REFERENCES transactions(store, numSeq)
);

-- um cliente pode comprar vários dispositivos de uma vez
CREATE TABLE IF NOT EXISTS sales_products (
    store INT,
    sale INT,
    product INT,

    PRIMARY KEY (sale, product),

    FOREIGN KEY (store, sale) REFERENCES sales(store, numSeq),
    FOREIGN KEY (product) REFERENCES saleProducts(id)
);

CREATE TABLE IF NOT EXISTS repairs (
    store INT,
    numSeq INT,
    description VARCHAR(255),
    repairProduct INT NOT NULL,

    PRIMARY KEY (store, numSeq),
    FOREIGN KEY (store, numSeq) REFERENCES transactions(store, numSeq),
    FOREIGN KEY (repairProduct) REFERENCES repairProducts(id)
);

CREATE TABLE IF NOT EXISTS parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS repairs_parts (
    store INT,
    repair INT,
    part INT,
    value DECIMAL(10,2), -- já existe no repairCosts, está aqui também por conveniencia

    PRIMARY KEY (repair, part),

    CONSTRAINT ck_repairs_parts_value check (value >= 0),
    FOREIGN KEY (store, repair) REFERENCES repairs(store, numSeq),
    FOREIGN KEY (part) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS repairCosts (
    part INT,
    product INT,
    value DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (part, product),

    CONSTRAINT ck_repairCosts_value check (value >= 0),
    FOREIGN KEY (part) REFERENCES parts(id),
    FOREIGN KEY (product) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS diagnosed (
    employee INT,
    store INT,
    repair INT,

    PRIMARY KEY (employee, repair),

    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (store, repair) REFERENCES repairs(store, numSeq)
);


CREATE TABLE IF NOT EXISTS donations (
    store INT,
    numSeq INT,
    date DATE NOT NULL,
    donationProduct INT NOT NULL,
    charityProject INT NOT NULL,

    PRIMARY KEY (store, numSeq),
    FOREIGN KEY (store, numSeq) REFERENCES transactions(store, numSeq),
    FOREIGN KEY (donationProduct) REFERENCES donationProducts(id),
    FOREIGN KEY (charityProject) REFERENCES charityProjects(id)
);

CREATE TABLE IF NOT EXISTS interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interested_user VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(255),
    color VARCHAR(255),
    graphics_card VARCHAR(255),
    os VARCHAR(255),
    processor VARCHAR(255),
    product_condition ENUM('Like New', 'Excellent', 'Good'),
    ram_memory VARCHAR(255),
    screen VARCHAR(255),
    storage VARCHAR(255),
    year YEAR,
    maxPrice DECIMAL(10,2),
    date_inserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (interested_user) REFERENCES clients(email),
    FOREIGN KEY (category) REFERENCES categories(category)
);

CREATE TABLE IF NOT EXISTS wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wishlisted_product INT NOT NULL,
    interested_user VARCHAR(255) NOT NULL,
    date_inserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (interested_user) REFERENCES clients(email),
    FOREIGN KEY (wishlisted_product) REFERENCES saleProducts(id)
);

CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS shipping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    current_shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00

    CONSTRAINT ck_shipping_cost check (current_shipping_cost >= 0)
);