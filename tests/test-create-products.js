"use strict";
import { BASE_URL } from './config.js';

// test-create-products.js

import fetch from 'node-fetch';

const categoryFieldMap = {
  'Smartphones': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'processor', 'screen', 'ram_memory', 'storage', 'os', 'year', 'description'
  ],
  'Laptops & PCs': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'processor', 'screen', 'ram_memory', 'graphics_card',
    'storage', 'keyboard', 'os', 'year', 'description'
  ],
  'Smartwatches': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'year', 'description'
  ],
  'Gaming': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'storage', 'year', 'description'
  ],
  'TVs & Monitors': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'screen', 'year', 'description'
  ],
  'Audio': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'year', 'description'
  ],
  'Tablets': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'processor', 'screen', 'ram_memory', 'storage', 'os', 'year', 'description'
  ],
  'Cameras': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'processor', 'screen', 'storage', 'os', 'year', 'description'
  ],
  'Accessories': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'year', 'description'
  ],
  'Home Appliances': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'year', 'description'
  ],
  'Other': [
    'name', 'product_condition', 'availability', 'brand', 'model_code', 'color',
    'weight', 'dimensions', 'year' , 'description'
  ]
};

const brands = [
  'Apple', 'Samsung', 'Dell', 'HP', 'Microsoft',
  'Xiaomi', 'LG', 'Sony', 'Fitbit', 'Nintendo',
  'Razer', 'Bose', 'GoPro', 'Canon', 'Other'
];

const colors = ['Black', 'White', 'Silver', 'Red'];
const osOptions = ['Android', 'iOS', 'Windows', 'Linux'];
const validConditions = ['Like New', 'Excellent', 'Good', 'Needs Repair'];
const availabilityOptions = [0, 1];

function getDummyValue(field) {
  switch (field) {
    case 'name': return `Test Product ${Math.random().toString(36).substring(2, 8)}`;
    case 'product_condition': return validConditions[Math.floor(Math.random() * validConditions.length)];
    case 'availability': return availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
    case 'brand': return brands[Math.floor(Math.random() * brands.length)];
    case 'model_code': return 'MOD-' + Math.floor(Math.random() * 10000);
    case 'color': return colors[Math.floor(Math.random() * colors.length)];
    case 'weight': return parseFloat((Math.random() * 2 + 0.5).toFixed(2));
    case 'dimensions': return '10x10x1 cm';
    case 'processor': return 'Quad-Core 2.4GHz';
    case 'screen': return '6.1" OLED';
    case 'ram_memory': return '8 GB';
    case 'graphics_card': return 'Integrated GPU';
    case 'storage': return '128 GB';
    case 'keyboard': return 'QWERTY';
    case 'os': return osOptions[Math.floor(Math.random() * osOptions.length)];
    case 'year': return 2022 + Math.floor(Math.random() * 3);
    case 'description': return 'This is a dummy description for testing purposes.';

    default: return 'N/A';
  }
}

function generateProduct(category) {
  const fields = categoryFieldMap[category];
  const product = { category, store_nipc: 112233445 };  // 👈 adiciona store_nipc
  for (const field of fields) {
    product[field] = getDummyValue(field);
  }
  return product;
}
async function submitProduct(product) {
    const res = await fetch(`${BASE_URL}/tt/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
  
    if (!res.ok) {
      const error = await res.text();
      console.error(`❌ Failed: ${product.name} (${product.category})`, error);
    } else {
      console.log(`✅ Created: ${product.name} (${product.category})`);
    }
  }
async function createDummyProducts(countPerCategory = 2) {
  const categories = Object.keys(categoryFieldMap);
  for (const category of categories) {
    for (let i = 0; i < countPerCategory; i++) {
      const product = generateProduct(category);
      await submitProduct(product);
    }
  }
}

createDummyProducts();

