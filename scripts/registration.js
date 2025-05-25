"use strict";

if (!localStorage.getItem("loggedInUser")) {
  location.href = "/";
} else if (JSON.parse(localStorage.getItem("loggedInUser")).id) {
  location.href = "/";
}

let customHourIndex = 1;

/**
 * Dynamically adds a new row of custom store hours to the form.
 *
 * The inputs use `customHourIndex` to uniquely name each group.
 * The new row is appended to the `#custom-hours-container` element.
 *
 * @function addCustomHour
 * @returns {void}
 */
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
      <input type="text" name="custom_hours[${customHourIndex}][label]" placeholder="Custom Day" class="form-control" required>
    </div>
    <div class="col">
      <input type="time" name="custom_hours[${customHourIndex}][open]" class="form-control" required>
    </div>
    <div class="col">
      <input type="time" name="custom_hours[${customHourIndex}][close]" class="form-control" required>
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

  /**
   * Updates the visibility and enabled/required state of form fields
   * based on the selected user type and entity subtype (store or charity).
   *
   * @function updateFormVisibility
   * @returns {void}
   */
  function updateFormVisibility() {
    const selectedOption = userTypeSelect.options[userTypeSelect.selectedIndex];
    const selectedValue = userTypeSelect.value;
    const selectedEntityType = selectedOption.getAttribute('data-entity-type'); // "store", "charity", or null

    fieldGroups.forEach(group => {
      if (group.dataset.type === selectedValue) {
        group.hidden = false;
        Array.from(group.querySelectorAll('input, select')).forEach(el => {
          el.disabled = false;
        });
      } else {
        group.hidden = true;
        Array.from(group.querySelectorAll('input, select')).forEach(el => {
          el.disabled = true;
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
      });
    } else if (selectedValue === 'entity' && selectedEntityType === 'store') {
      storeHoursSection.hidden = false;
      Array.from(storeHoursSection.querySelectorAll('input, select')).forEach(el => {
        el.disabled = false;
      });
    } else {
      // Hide or disable store hours if not store entity
      storeHoursSection.hidden = true;
      Array.from(storeHoursSection.querySelectorAll('input, select')).forEach(el => {
        el.disabled = true;
      });
    }
  }

  userTypeSelect.addEventListener('change', updateFormVisibility);
  updateFormVisibility();

  form.addEventListener('submit', async function (e) {
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

    const clientData = {};

    // Filter fields based on user type
    const clientFields = ['email', 'first_name', 'last_name', 'name', 'phone_number',
      'gender', 'nif', 'nic', 'dob'];
    const employeeFields = ['employee_dob', 'employee_gender', 'store', 'internal_number'];
    const entityFields = ['nipc', 'store_name', 'charity_name', 'street_address',
      'postal_code', 'city', 'country', 'userType'];

    // Check if attributes phone number, nic, or nif already exists
    // if any of the attributes match existing ones abort
    const existingUsersRes = await fetch('/ttuser');
    const existingUsers = await existingUsersRes.json();

    const conflicts = [];

    existingUsers.forEach(user => {
      if (user.phone_number === data.phone_number) conflicts.push('Phone Number');
      if (user.nic === data.nic) conflicts.push('NIC');
      if (user.nif === data.nif) conflicts.push('NIF');
    });

    if (conflicts.length) {
      const uniqueConflicts = [...new Set(conflicts)]; // remove duplicates
      showMessage(
        "Registration error",
        `An account already exists with the given information: ${uniqueConflicts.join(', ')}.`,
        "danger"
      );
      return; // abort
    }

    // Copy allowed fields
    clientFields.forEach(field => {
      if (data[field] !== undefined) {
        clientData[field] = data[field];
      }
    });

    if (userType === 'employee') {
      // Check store existence before deleting fields
      const storeRes = await fetch(`/ttuser/store/${data.store}`);
      if (storeRes.status === 204) {
        showMessage("Registration error", `The store with the NIPC "${data.store}" is not registered in the system.`, "danger");
        form.reset();
        return;
      }
      clientData.gender = data.employee_gender;
      delete clientData.employee_gender;
      clientData.dob = data.employee_dob;
      delete clientData.employee_dob;
    } else if (userType === 'entity') {
      entityFields.forEach(field => {
        if (data[field] !== undefined) {
          clientData[field] = data[field];
        }
      });
      clientData.entity_type = document.getElementById('userType').selectedOptions[0].dataset.entityType;
        const resCharities = await fetch(`/ttuser/charity/${clientData.nipc}`);
        if (resCharities.status !== 204) {  // if not 204, entity exists
          showMessage("Registration error", `An account with the given NIPC "${clientData.nipc}" has already been registered.`, "danger");
          return; // abort
        }
        const resStores = await fetch(`/ttuser/store/${clientData.nipc}`);
        if (resStores.status !== 204) {  // if not 204, entity exists
          showMessage("Registration error", `An account with the given NIPC "${clientData.nipc}" has already been registered.`, "danger");
          return; // abort
        }
    } else {
      employeeFields.forEach(f => delete clientData[f]);
      entityFields.forEach(f => delete clientData[f]);
    }
    console.log(clientData);

    // Upload Client
    fetch('/ttuser/add/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify((({
        nipc, entity_type, street_address, postal_code, city, country, ...rest }) => rest)(clientData))
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

          let storeHours = {};
          if (clientData.entity_type == "store") {
            // Gather store hours
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days.forEach(day => {
              const open = document.querySelector(`input[name="hours[${day}][open]"]`)?.value;
              const close = document.querySelector(`input[name="hours[${day}][close]"]`)?.value;
              if (open && close) {
                storeHours[day] = `${open}-${close}`;
              }
            });

            // Custom holiday hours
            const customHoursEntries = document.querySelectorAll('.custom-hour-entry');
            customHoursEntries.forEach(entry => {
              const labelInput = entry.querySelector('input[name$="[label]"]');
              const openInput = entry.querySelector('input[name$="[open]"]');
              const closeInput = entry.querySelector('input[name$="[close]"]');

              if (labelInput && openInput && closeInput) {
                const label = labelInput.value.trim();
                const open = openInput.value;
                const close = closeInput.value;
                if (label && open && close) {
                  storeHours[label] = `${open}-${close}`;
                }
              }
            });
          } else {
            storeHours = {};
          }

          const entityData = {
            id: insertedClient.id,
            nipc: data.nipc,
            entity_type: clientData.entity_type,
            address: `${clientData.street_address}, ${clientData.postal_code}`,
            city: data.city,
            country: data.country,
            opening_hours: storeHours
          };
          const endpoint = clientData.entity_type === 'charity' ?
            '/ttuser/add/charity' : '/ttuser/add/store';

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
        try {
          showMessage("Registration error", JSON.parse(err.message).error, "danger");
        } catch (error) {
          showMessage("Registration error", "An unknown error occurred while trying to register.", "danger");
        }
      });
  });

  // Fetch countries list
  const countrySelect = document.getElementById('country');

  fetch("https://restcountries.com/v3.1/all")
    .then(response => response.json())
    .then(data => {
      const countries = data
        .map(country => ({
          name: country.name.common,
          code: country.cca2
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Clear existing options except placeholder
      countrySelect.innerHTML = '<option value="" disabled>Select a country</option>';

      /**
       * Converts a 2-letter country code into a flag emoji.
       * The flag emoji is created using the regional indicator symbols corresponding to the country code.
       *
       * @param {string} countryCode - A 2-letter ISO country code.
       * @returns {string} - The flag emoji for the given country code.
       */
      function getFlagEmoji(countryCode) {
        return countryCode
          .toUpperCase()
          .split('')
          .map(char => String.fromCodePoint(0x1F1E6 - 65 + char.charCodeAt(0)))
          .join('');
      }

      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.name;
        option.textContent = `${getFlagEmoji(country.code)} ${country.name}`;
        countrySelect.appendChild(option);
      });

      // Default to Portugal
      countrySelect.value = "Portugal";
    })
    .catch(error => {
      console.error("Error fetching countries:", error);
      countrySelect.innerHTML = '<option value="">Unable to load countries</option>';
    });

});
