import fetch from 'node-fetch';
import { BASE_URL } from './config.js';

const employees = [
  { id: 1, store: 112233445, internal_number: 'EMP001' },
  { id: 2, store: 112233445, internal_number: 'EMP002' },
  { id: 3, store: 112233445, internal_number: 'EMP003' }
];
(async () => {
for (const emp of employees) {
    const res = await fetch(`${BASE_URL}/ttuser/add/employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emp)
    });

  if (!res.ok) {
    console.error(`❌ Failed to add employee ${emp.internal_number}:`, await res.text());
  } else {
    console.log(`✅ Employee ${emp.internal_number} added.`);
  }
}
})();
