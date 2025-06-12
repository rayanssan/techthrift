import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const parts = [
  { name: 'Screen Replacement', price: 89.99, store: 112233445 },
  { name: 'Motherboard Repair', price: 120.5, store: 112233445 },
  { name: 'Keyboard Fix', price: 45.0, store: 112233445 }
];
(async () => {
for (const part of parts) {
    const res = await fetch(`${BASE_URL}/tt/repairPart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part)
    });

  if (!res.ok) {
    console.error(`❌ Failed to add part ${part.name}:`, await res.text());
  } else {
    console.log(`✅ Repair part "${part.name}" added.`);
  }
}
})();
