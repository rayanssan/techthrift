"use strict";

let customHourIndex = 1;

function addCustomHour() {
  const container = document.getElementById('custom-hours-container');

  const newRow = document.createElement('div');
  newRow.className = 'row mb-2 align-items-center custom-hour-entry';
  newRow.innerHTML = `
    <div class="col d-flex align-items-center gap-2">
      <button type="button" class="btn btn-sm btn-outline-danger 
      rounded-circle d-flex align-items-center justify-content-center" 
      style="width: 28px; height: 28px;" 
      onclick="this.closest('.custom-hour-entry').remove()">
        <i class="fas fa-times"></i>
      </button>
      <input type="text" name="custom_hours[${customHourIndex}][label]" placeholder="Custom Day" class="form-control">
    </div>
    <div class="col">
      <input type="time" name="custom_hours[${customHourIndex}][open]" class="form-control">
    </div>
    <div class="col">
      <input type="time" name="custom_hours[${customHourIndex}][close]" class="form-control">
    </div>
  `;

  container.appendChild(newRow);
  customHourIndex++;
}

document.addEventListener('DOMContentLoaded', function () {
  const userTypeSelect = document.getElementById('userType');
  const buttons = document.querySelectorAll('.user-type-btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove "btn-primary" from all buttons
      buttons.forEach(btn => btn.classList.replace('btn-primary', 'btn-outline-secondary'));

      // Add "btn-primary" to clicked button
      button.classList.replace('btn-outline-secondary', 'btn-primary');

      // Update select value
      const value = button.getAttribute('data-value');
      const entityType = button.getAttribute('data-entity-type')

      // Find matching option in select
      for (let i = 0; i < userTypeSelect.options.length; i++) {
        const option = userTypeSelect.options[i];

        if (entityType) {
          // Match both value and entity-type
          if (option.value === value && option.getAttribute('data-entity-type') === entityType) {
            userTypeSelect.selectedIndex = i;
            break;
          }
        } else {
          // Match by value only
          if (option.value === value && !option.hasAttribute('data-entity-type')) {
            userTypeSelect.selectedIndex = i;
            break;
          }
        }
      }

      // Dispatch the change event
      const event = new Event('change', { bubbles: true });
      userTypeSelect.dispatchEvent(event);
    });
  });
  buttons[0].click();

  const form = document.getElementById('registerForm');
  const fieldGroups = document.querySelectorAll('.user-fields');

  function updateFormVisibility() {
    const selectedOption = userTypeSelect.options[userTypeSelect.selectedIndex];
    const selectedValue = userTypeSelect.value;
    const selectedEntityType = selectedOption.getAttribute('data-entity-type'); // "store", "charity", or null

    fieldGroups.forEach(group => {
      if (group.dataset.type === selectedValue) {
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

    // Hide or show first_name and last_name fields if value is "entity"
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');

    if (selectedValue === 'entity') {
      firstNameInput.closest('.mb-3').hidden = true;
      lastNameInput.closest('.mb-3').hidden = true;
      firstNameInput.disabled = true;
      lastNameInput.disabled = true;
      firstNameInput.required = false;
      lastNameInput.required = false;
    } else {
      firstNameInput.closest('.mb-3').hidden = false;
      lastNameInput.closest('.mb-3').hidden = false;
      firstNameInput.disabled = false;
      lastNameInput.disabled = false;
      firstNameInput.required = true;
      lastNameInput.required = true;
    }

    // Show store name field only if entity type is store
    const storeNameField = document.getElementById('store_name').parentElement;

    // Show charity name field only if entity type is charity
    const charityNameField = document.getElementById('charity_name').parentElement;

    if (selectedValue === 'entity' && selectedEntityType === 'store') {
      storeNameField.hidden = false;
      charityNameField.hidden = true;

      storeNameField.querySelector('input, select').disabled = false;
      storeNameField.querySelector('input, select').required = true;

      charityNameField.querySelector('input, select').disabled = true;
      charityNameField.querySelector('input, select').required = false;
    } else if (selectedValue === 'entity' && selectedEntityType === 'charity') {
      charityNameField.hidden = false;
      storeNameField.hidden = true;

      charityNameField.querySelector('input, select').disabled = false;
      charityNameField.querySelector('input, select').required = true;

      storeNameField.querySelector('input, select').disabled = true;
      storeNameField.querySelector('input, select').required = false;
    } else {
      // Hide both if not entity or neither store nor charity
      storeNameField.hidden = true;
      charityNameField.hidden = true;

      storeNameField.querySelector('input, select').disabled = true;
      storeNameField.querySelector('input, select').required = false;

      charityNameField.querySelector('input, select').disabled = true;
      charityNameField.querySelector('input, select').required = false;
    }

    // Hide store hours if charity
    const storeHoursSection = document.getElementById('store_hours');

    if (selectedValue === 'entity' && selectedEntityType === 'charity') {
      storeHoursSection.hidden = true;
      // Disable inputs inside store hours
      Array.from(storeHoursSection.querySelectorAll('input, select')).forEach(el => {
        el.disabled = true;
        el.required = false;
      });
    } else if (selectedValue === 'entity' && selectedEntityType === 'store') {
      storeHoursSection.hidden = false;
      Array.from(storeHoursSection.querySelectorAll('input, select')).forEach(el => {
        el.disabled = false;
        el.required = true;
      });
    } else {
      // Hide or disable store hours if not store entity
      storeHoursSection.hidden = true;
      Array.from(storeHoursSection.querySelectorAll('input, select')).forEach(el => {
        el.disabled = true;
        el.required = false;
      });
    }
  }

  userTypeSelect.addEventListener('change', updateFormVisibility);
  updateFormVisibility();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      showMessage("Registration", "Please fill all the required camps", "warning");
      return;
    }

    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
      showMessage("Registration Error", "An error happened, please try registering again.", "warning");
      document.querySelector("\.btn-outline-secondary").click();
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
      body: JSON.stringify((( { street_address, postal_code, city, country, ...rest }) => rest)(clientData))
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

        showMessage("Welcome to TechThrift!", "Registration Successful.", "success").then(() => {
          window.location.href = '/homepage';
        });
      })
      .catch(err => {
        console.error(err);
        showMessage("Registration error", err.message, "danger");
      });
  });

});
