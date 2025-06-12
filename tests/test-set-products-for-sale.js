import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const productsForSale = [
  { id: 40, price: 149.99 },
  { id: 41, price: 299.49 },
  { id: 42 , price: 75.0 }
];
(async () => {
for (const product of productsForSale) {
    const res = await fetch(`${BASE_URL}/tt/sale/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

  if (!res.ok) {
    console.error(`❌ Failed to set product ${product.id} for sale:`, await res.text());
  } else {
    console.log(`✅ Product ${product.id} set for sale.`);
  }
}
})();
