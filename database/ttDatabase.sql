CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number INTEGER NOT NULL,
    gender TEXT NOT NULL,
    password TEXT NOT NULL,
    nif INTEGER UNIQUE,
    nic INTEGER UNIQUE,
    dob DATE,
    address TEXT,
       
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    internal_number INTEGER UNIQUE,
    store INTEGER NOT NULL,
    
    FOREIGN KEY (id) REFERENCES people(id)
    FOREIGN KEY (store) REFERENCES store(id)
);

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY,
    
    FOREIGN KEY (id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS organizers (
    id INTEGER PRIMARY KEY,
    
    FOREIGN KEY (id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS donators (
    id INTEGER PRIMARY KEY,
    
    FOREIGN KEY (id) REFERENCES people(id)
);



CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY,
    nipc INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone_number INTEGER NOT NULL,
    email TEXT NOT NULL,
    address TEXT
);

CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY,
    horario TEXT,
    numEspacos INTEGER,
    
    FOREIGN KEY (id) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS charities (
    id INTEGER PRIMARY KEY,
    organizer INTEGER PRIMARY KEY,

    FOREIGN KEY (id) REFERENCES entities(id)
    FOREIGN KEY (id) REFERENCES people(organizer) -- organizer
);

CREATE TABLE IF NOT EXISTS productRecords (
    id INTEGER PRIMARY KEY,
    barCode TEXT UNIQUE NOT NULL,
    brand TEXT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price FLOAT,
    year YEAR,
    

    CONSTRAINT pk_products
        PRIMARY KEY (id, numExemp),

    FOREIGN KEY (id) REFERENCES productRecords(id),

    FOREIGN KEY (store_nipc) REFERENCES stores(nipc)
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER,
    numExemp INTEGER AUTOINCREMENT,
    condition TEXT NOT NULL,
    availability BOOLEAN NOT NULL,
    dateAvailable DATE,
    store_nipc INTEGER NOT NULL,
    value FLOAT,
    

    CONSTRAINT pk_products
        PRIMARY KEY (id, numExemp),

    FOREIGN KEY (id) REFERENCES productRecords(id),

    FOREIGN KEY (store_nipc) REFERENCES stores(nipc)
);

CREATE TABLE IF NOT EXISTS productImages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    image_order INTEGER NOT NULL,

    FOREIGN KEY (product_id) REFERENCES products(id),
    CHECK (image_order >= 1 AND image_order <= 10) -- Ensures there are no more than 10 images per product
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    date DATE,
    client INTEGER NOT NULL,
    employee INTEGER NOT NULL,
    product INTEGER NOT NULL,
    

    CONSTRAINT pk_products
        PRIMARY KEY (id, numExemp),

    FOREIGN KEY (client) REFERENCES clients(id),
    FOREIGN KEY (employee) REFERENCES employees(id),
    FOREIGN KEY (product) REFERENCES products(id),
);



CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interestedUser INTEGER,
    watchedProduct INTEGER,
    FOREIGN KEY (id) REFERENCES client(id)
    FOREIGN KEY (watchedProduct) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report TEXT NOT NULL
);

