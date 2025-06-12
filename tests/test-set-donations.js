import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const donations = [
  { id:1, donor: '123123123', charity: '987987987' },
  {  id:2,donor: '456456456', charity: '111222333' },
  {  id:3,donor: '789789789', charity: '333444555' }
];
(async () => {
for (const donation of donations) {
    const res = await fetch(`${BASE_URL}/tt/donation/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation)
    });

  if (!res.ok) {
    console.error(`❌ Failed donation for product ${donation.id}:`, await res.text());
  } else {
    console.log(`✅ Product ${donation.id} set for donation.`);
  }
}
})();