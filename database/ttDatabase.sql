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

CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,
    store INT NOT NULL,
    internal_number INT UNIQUE,

    FOREIGN KEY (id) REFERENCES clients(id),
    FOREIGN KEY (store) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS entities (
    id INT PRIMARY KEY,
    nipc INT(9) UNIQUE NOT NULL,
    numSpaces INT,
    organizer INT UNIQUE,

    FOREIGN KEY (id) REFERENCES clients(id),
    FOREIGN KEY (organizer) REFERENCES clients(id) -- organizer
);

CREATE TABLE IF NOT EXISTS entityHours (
    entity INT,
    day VARCHAR(25),
    hours CHAR(11), -- HH:MM-HH:MM

    PRIMARY KEY (entity, day),
    FOREIGN KEY (id) REFERENCES entities(id)
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
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS charityProjects_categories (
    charityProject INT,
    category INT,

    PRIMARY KEY (charityProject, category),

    FOREIGN KEY (charityProject) REFERENCES charityProjects(id),
    FOREIGN KEY (category) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS charityProjects_products (
    charityProject INT,
    product INT,

    PRIMARY KEY (charityProject, product),

    FOREIGN KEY (charityProject) REFERENCES charityProjects(id),
    FOREIGN KEY (product) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    barCode INT(13) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
    category INT,
    brand VARCHAR(255),
    os VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    year YEAR,
    dateInserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category) REFERENCES categories(id)
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
    id INT,
    numExemp INT AUTO_INCREMENT,
    dateAvailable DATE,
    store INT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    sale INT UNIQUE,
    bought INT UNIQUE,
    
    CONSTRAINT pk_products
        PRIMARY KEY (id, numExemp),

    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (store, sale) REFERENCES transactions(store, numSeq),   --sold to a client
    FOREIGN KEY (store, bought) REFERENCES transactions(store, numSeq), --bought by the store
    FOREIGN KEY (store) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS repairProducts (
    id INT PRIMARY KEY,
    problems VARCHAR(255),

    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS donationProducts (
    id INT,
    numExemp INT AUTO_INCREMENT,
    charity INT NOT NULL,
  
    PRIMARY KEY (id, numExemp),
    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (charity) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    store INT,
    numSeq INT AUTO_INCREMENT,
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

    FOREIGN KEY (id) REFERENCES transactions(id),
    FOREIGN KEY (repairProduct) REFERENCES repairProducts(id)
);

CREATE TABLE IF NOT EXISTS parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
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
    product INT NOT NULL,
    donationProduct INT NOT NULL,
    employee INT NOT NULL,
    donator INT NOT NULL,
    charityProject INT NOT NULL,

    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (donator) REFERENCES clients(id),
    FOREIGN KEY (product, donationProduct) REFERENCES donationProducts(id, numExemp),
    FOREIGN KEY (charityProject) REFERENCES charityProjects(id)
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
