import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const charities = [
  {
     nipc: '509111111', charity_name: 'SolidarTech',
    address: 'Rua Esperança 1', city: 'Lisboa', country: 'Portugal'
  },
  {
     nipc: '509222222', charity_name: 'TechAid',
    address: 'Av Caridade 22', city: 'Porto', country: 'Portugal'
  },
  {
     nipc: '509333333', charity_name: 'DonateIT',
    address: 'Rua Amor 7', city: 'Faro', country: 'Portugal'
  }
];

(async () => {
  for (const charity of charities) {
    try {
      const res = await fetch(`${BASE_URL}/ttuser/add/charity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charity)
      });

      if (!res.ok) {
        console.error(`❌ Failed to add charity ${charity.charity_name}:`, await res.text());
      } else {
        console.log(`✅ Charity "${charity.charity_name}" added.`);
      }
    } catch (err) {
      console.error(`💥 Error adding charity ${charity.charity_name}:`, err.message);
    }
  }
})();
