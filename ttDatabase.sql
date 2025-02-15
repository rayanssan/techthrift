CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number INTEGER NOT NULL,
    gender TEXT NOT NULL,
    password TEXT NOT NULL,
    nif INTEGER UNIQUE,
    nic INTEGER UNIQUE,
    dob DATE,
    address TEXT
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES client(id)
);

CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY,
    nipc INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES client(id)
);

CREATE TABLE IF NOT EXISTS charities (
    id INTEGER PRIMARY KEY,
    nipc INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES client(id)
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    store_nipc INTEGER NOT NULL,
    condition TEXT NOT NULL,
    availability BOOLEAN NOT NULL,
    description TEXT,
    category TEXT,
    FOREIGN KEY (store_nipc) REFERENCES stores(nipc)
);

CREATE TABLE IF NOT EXISTS saleProducts (
    id INTEGER PRIMARY KEY,
    price INTEGER NOT NULL,
    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS repairProducts (
    id INTEGER PRIMARY KEY,
    problems TEXT,
    FOREIGN KEY (id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS donationProducts (
    id INTEGER PRIMARY KEY,
    charity INTEGER NOT NULL,
    FOREIGN KEY (id) REFERENCES products(id),
    FOREIGN KEY (charity) REFERENCES charities(id)
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

