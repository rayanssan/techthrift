CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nif INT UNIQUE,
    nic INT UNIQUE,
    gender ENUM('Male', 'Female', 'Other'),
    dob DATE,
    address VARCHAR(255)

); 

CREATE TABLE IF NOT EXISTS entities (
    id INT PRIMARY KEY,
    nipc INT(9) UNIQUE NOT NULL,
    entity_type ENUM('store', 'charity') NOT NULL,

    FOREIGN KEY (id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,
    store INT NOT NULL,
    internal_number INT UNIQUE,

    FOREIGN KEY (id) REFERENCES clients(id),
    FOREIGN KEY (store) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS entityHours (
    entity INT,
    day VARCHAR(25),
    hours CHAR(11), -- HH:MM-HH:MM

    PRIMARY KEY (entity, day),
    FOREIGN KEY (entity) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS charityProjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amountNeeded INT,
    endDate DATE,
    store INT NOT NULL,
    organizer INT NOT NULL,

    FOREIGN KEY (store) REFERENCES entities(id),
    FOREIGN KEY (organizer) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS space (
    id INT PRIMARY KEY AUTO_INCREMENT,
    area INT,
    store INT NOT NULL,
    charityProject INT NOT NULL,
    
    FOREIGN KEY (store) REFERENCES entities(id),
    FOREIGN KEY (charityProject) REFERENCES charityProjects(id)
);

CREATE TABLE IF NOT EXISTS categories (
    category VARCHAR(255) PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_nipc INT NOT NULL,
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
    id INT PRIMARY KEY AUTO_INCREMENT,
    product INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_order INT NOT NULL,

    FOREIGN KEY (product) REFERENCES products(id),
    CHECK (image_order >= 1 AND image_order <= 5)
);

CREATE TABLE IF NOT EXISTS saleProducts (
    id INT PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS repairProducts (
    id INT PRIMARY KEY,
    problems VARCHAR(255),
    client_nif INT(9),
    client_nic INT(9),

    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (client_nif) REFERENCES clients(nif),
    FOREIGN KEY (client_nic) REFERENCES clients(nic)
);

CREATE TABLE IF NOT EXISTS donationProducts (
    id INT PRIMARY KEY,
    charity_nipc INT(9) NOT NULL,
    donor_nif INT(9),
    donor_nic INT(9),
    donor_nipc INT(9),
  
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
    numSeq INT UNIQUE AUTO_INCREMENT,
    date DATE,
    client INT NOT NULL,
    employee INT NOT NULL,
    value DECIMAL(10,2),
    deliveryCost DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (store, numSeq),
    FOREIGN KEY (client) REFERENCES clients(id),
    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (store) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS repairs (
    id INT PRIMARY KEY,
    description VARCHAR(255),
    repairProduct INT NOT NULL,

    FOREIGN KEY (repairProduct) REFERENCES repairProducts(id)
);

CREATE TABLE IF NOT EXISTS parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS repairs_parts (
    repair INT,
    part INT,
    value DECIMAL(10,2),

    PRIMARY KEY (repair, part),

    FOREIGN KEY (repair) REFERENCES repairs(id),
    FOREIGN KEY (part) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS repairCosts (
    part INT,
    product INT,
    value DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (part, product),


    FOREIGN KEY (part) REFERENCES parts(id),
    FOREIGN KEY (product) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS diagnosed (
    employee INT NOT NULL,
    repair INT NOT NULL,

    PRIMARY KEY (employee, repair),

    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (repair) REFERENCES repairs(id)
);


CREATE TABLE IF NOT EXISTS donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    donationProduct INT NOT NULL,
    employee INT NOT NULL,
    donator INT NOT NULL,
    charityProject INT NOT NULL,

    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (donator) REFERENCES clients(id),
    FOREIGN KEY (donationProduct) REFERENCES donationProducts(id),
    FOREIGN KEY (charityProject) REFERENCES charityProjects(id)
);

CREATE TABLE IF NOT EXISTS interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interested_user INT,
    watched_product INT,

    FOREIGN KEY (interested_user) REFERENCES clients(id),
    FOREIGN KEY (watched_product) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report VARCHAR(255) NOT NULL
);
