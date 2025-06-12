import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const clients = [
  { first_name: 'Luis', last_name: 'Costa', nif: '123456789', email: 'luis@example.com' },
  { first_name: 'Marta', last_name: 'Rocha', nif: '234567890', email: 'marta@example.com' },
  { first_name: 'Tiago', last_name: 'Reis', nif: '345678901', email: 'tiago@example.com' }
];

(async () => {
  for (const client of clients) {
    const res = await fetch(`${BASE_URL}/ttuser/add/client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });

    if (!res.ok) {
      console.error(`❌ Failed to add client ${client.first_name}:`, await res.text());
    } else {
      console.log(`✅ Client ${client.first_name} added.`);
    }
  }
})();
