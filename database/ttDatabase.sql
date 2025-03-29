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

    FOREIGN KEY (id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,
    store INT NOT NULL,
    internal_number INT UNIQUE,

    FOREIGN KEY (id) REFERENCES clients(id),
    FOREIGN KEY (store) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    store_nipc INT NOT NULL,
    product_condition VARCHAR(255) NOT NULL,
    availability BOOLEAN NOT NULL,
    category VARCHAR(255) NOT NULL,
    dateInserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    brand VARCHAR(255),
    year INT(4),

    FOREIGN KEY (store_nipc) REFERENCES entities(nipc)
);

CREATE TABLE IF NOT EXISTS productImages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_order INT NOT NULL,

    FOREIGN KEY (product_id) REFERENCES products(id),
    CHECK (image_order >= 1 AND image_order <= 5)
);

CREATE TABLE IF NOT EXISTS saleProducts (
    id INTEGER PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS repairProducts (
    id INTEGER PRIMARY KEY,
    problems VARCHAR(255),
    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS donationProducts (
    id INTEGER PRIMARY KEY,
    charity INTEGER NOT NULL,
    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (charity) REFERENCES entities(nipc)
);


CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE,
    client INT NOT NULL,
    employee INT NOT NULL,
    product INT NOT NULL UNIQUE,

    FOREIGN KEY (client) REFERENCES clients(id),
    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (product) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS repairs (
    id INT PRIMARY KEY,
    description VARCHAR(255),
    part INT NOT NULL,

    FOREIGN KEY (id) REFERENCES transactions(id),
    FOREIGN KEY (part) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    client INT NOT NULL,
    employee INT NOT NULL,
    product INT NOT NULL UNIQUE,

    FOREIGN KEY (client) REFERENCES clients(id),
    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (product) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS repairs_parts (
    repair INT,
    part INT,

    PRIMARY KEY (repair, part),

    FOREIGN KEY (repair) REFERENCES repairs(id),
    FOREIGN KEY (part) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS repairCosts (
    part INT,
    product INT,
    value FLOAT NOT NULL,

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

CREATE TABLE IF NOT EXISTS purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interestedUser INT,
    watchedProduct INT,

    FOREIGN KEY (interestedUser) REFERENCES clients(id),
    FOREIGN KEY (watchedProduct) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interestedUser INT,
    watchedProduct INT,

    FOREIGN KEY (interestedUser) REFERENCES clients(id),
    FOREIGN KEY (watchedProduct) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interestedUser INT,
    watchedProduct INT,

    FOREIGN KEY (interestedUser) REFERENCES clients(id),
    FOREIGN KEY (watchedProduct) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report VARCHAR(255) NOT NULL
);
