# TechThrift

<img src="./media/images/logo.png" alt="TechThrift Logo" width="250">

**TechThrift** is a full-featured platform for managing sales, inventory, repairs, and donations. It handles product listings, client transactions, user interactions, and store logistics. The backend is built with **Node.js (Express)** and **MySQL**, and it integrates with services and libraries like **Auth0**, **Nominatim OpenStreetMap**, **Leaflet**, **Sass**, **Bootstrap**, and **FontAwesome**.

TechThrift is composed of two main platforms:

- **TechThrift** – the public-facing website where clients can browse and purchase refurbished electronics.
- **TechThrift Partners** – a management portal for stores, employees, and charities. This side handles internal operations such as inventory control, transaction processing, repair tracking, and donation oversight.

---

## 🔨 Developers
- Bruno Campos: 60472
- Guilherme Bastos: 60471
- Guilherme Ovídio: 58752
- João Martins: 60290
- Pedro Monteiro: 60275
- Rayan S. Santana: 60282

---

## 🚀 Local Setup & Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/rayanssan/techthrift.git
   cd techthrift
   ```

2. **Install MySQL**  
   Make sure MySQL is installed and the service is running.

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Initialize the database**
   ```bash
   node resources/dbCreate.js
   ```

5. **Start the server**
   ```bash
   node techthrift.js
   ```

> To expose all API routes (for development or testing), start the server with:
> ```bash
> node techthrift.js -exposeApi
> ```

---

## 🔐 Authentication Tokens

Certain routes are protected and require access tokens:

| Route                | Purpose                            | Access Token              |
|---------------------|------------------------------------|---------------------------|
| `/report`           | View usage report (PDF)            | `report_password`         |
| `/manageOrder`      | Update status of orders            | `secret_admin_password`   |
| `/manageShipping`   | Change shipping costs              | `secret_admin_password`   |

---

## 📦 Test Data

- **PayPal Test Card**  
  You can use this test card during checkout:

  ```
  Card Number: 4005 5192 0000 0004 (Visa)
  Expiry: 01/42
  CVV: 900
  Name: Tom Thrifty
  ```

- **Employee Registration**  
  To register an employee account, a valid store NIPC is required.  
  Use the pre-registered store NIPC:

  ```
  NIPC: 11223344
  ```

---

## 📁 Documentation

- **API Documentation**  
  OpenAPI specifications can be found in the `docs` folder.

- **Database Diagram**  
  A complete ER diagram of the database is also located in the `docs` folder.
