document.addEventListener('DOMContentLoaded', function () {
  const userTypeSelect = document.getElementById('userType');
  const form = document.getElementById('registerForm');
  const fieldGroups = document.querySelectorAll('.user-fields');

  function updateFormVisibility() {
    const selectedType = userTypeSelect.value;

    fieldGroups.forEach(group => {
      if (group.dataset.type === selectedType) {
        group.hidden = false;
        Array.from(group.querySelectorAll('input, select')).forEach(el => {
          el.disabled = false;
          el.required = true;
        });
      } else {
        group.hidden = true;
        Array.from(group.querySelectorAll('input, select')).forEach(el => {
          el.disabled = true;
          el.required = false;
        });
      }
    });
  }

  userTypeSelect.addEventListener('change', updateFormVisibility);
  updateFormVisibility();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
  
    if (!form.checkValidity()) {
      alert('Por favor preencha todos os campos obrigatórios.');
      return;
    }
  
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
      alert('Utilizador não autenticado.');
      return;
    }
  
    const data = {};
    Array.from(form.elements).forEach(el => {
      if (!el.disabled && el.name) {
        data[el.name] = el.value || null;
      }
    });
  
    // Fixed data from an user
    data.name = user.name;
    data.email = user.email;
  
    const userType = data.userType;
    delete data.userType;
  
  
    // Filter fields based on user type
    const employeeFields = ['store', 'internal_number'];
    const entityFields = ['nipc', 'entity_type', 'address', 'city', 'country'];
  
    const clientData = { ...data };
    if (userType === 'employee') {
      employeeFields.forEach(f => delete clientData[f]);
      entityFields.forEach(f => delete clientData[f]); 
    } else if (userType === 'entity') {
      employeeFields.forEach(f => delete clientData[f]);
      entityFields.forEach(f => delete clientData[f]); 
    } else {
      employeeFields.forEach(f => delete clientData[f]);
      entityFields.forEach(f => delete clientData[f]);
    }
    console.log(clientData);
    // Upload Client
    fetch('/ttuser/add/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    })
      .then(async res => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Error uploading client data.');
        }
      
        const insertedClient = await res.json();

        // Handle employees and entities
        if (userType === 'employee') {
          const employeeData = {
            id: insertedClient.id,
            store: data.store,
            internal_number: data.internal_number
          }
          return fetch('/ttuser/add/employee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
          });
        }
        if (userType === 'entity') {
          const entityData = {
            id: insertedClient.id,
            nipc: data.nipc,
            entity_type: data.entity_type,
            address: data.address,
            city: data.city,
            country: data.country
          };
          const endpoint = data.entity_type === 'store'
            ? '/ttuser/add/store'
            : '/ttuser/add/charity';
  
          return fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entityData)
          });
        }
  
        return Promise.resolve();
      })
      .then(async res => {
        if (res && !res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Registration error.');
        }
  
        showMessage("Welcome to TechThrift!", "Registration Successful.", "success").then( () => {
          window.location.href = '/homepage';
        });
      })
      .catch(err => {
        console.error(err);
        alert('Registration error: ' + err.message);
      });
  });
  
});
