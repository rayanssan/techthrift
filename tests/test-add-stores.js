import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const stores = [
  {
     nipc: '508111111', store_name: 'FixIT Lisboa',
    address: 'Rua A, 10', city: 'Lisboa', country: 'Portugal',
    opening_hours: { Monday: '09:00-18:00', Friday: '09:00-16:00' }
  },
  {
     nipc: '508222222', store_name: 'FixIT Porto',
    address: 'Av B, 20', city: 'Porto', country: 'Portugal',
    opening_hours: { Tuesday: '10:00-18:00', Thursday: '10:00-17:00' }
  },
  {
     nipc: '508333333', store_name: 'FixIT Faro',
    address: 'Rua C, 30', city: 'Faro', country: 'Portugal',
    opening_hours: { Wednesday: '09:30-18:30' }
  }
];

(async () => {
for (const store of stores) {
    const res = await fetch(`${BASE_URL}/ttuser/add/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store)
    });

  if (!res.ok) {
    console.error(`❌ Failed to add store ${store.store_name}:`, await res.text());
  } else {
    console.log(`✅ Store "${store.store_name}" added.`);
  }
}
})();
