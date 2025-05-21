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
  updateFormVisibility(); // aplicar no carregamento inicial

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      alert('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      alert('Utilizador não autenticado.');
      return;
    }

    const data = {};
    Array.from(form.elements).forEach(el => {
      if (!el.disabled && el.name) {
        data[el.name] = el.value || null;
      }
    });

    // Dados fixos do utilizador autenticado
    data.id = user.id;
    data.name = user.name;
    data.email = user.email;

    const userType = data.userType;
    delete data.userType;

    console.log("Dados a enviar:", data);

    // Remover campos que não pertencem à tabela clients
    const employeeFields = ['store', 'internal_number'];
    const entityFields = ['nipc', 'entity_type', 'address', 'city', 'country'];

    const clientData = { ...data };
    if (userType === 'employee') {
      entityFields.forEach(f => delete clientData[f]);
    } else if (userType === 'entity') {
      employeeFields.forEach(f => delete clientData[f]);
    } else {
      employeeFields.forEach(f => delete clientData[f]);
      entityFields.forEach(f => delete clientData[f]);
    }

    // 1. Atualizar CLIENTE
    fetch('/ttuser/client/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    })
      .then(async res => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Erro ao atualizar dados do cliente.');
        }

        // 2. Registo específico
        if (userType === 'employee') {
          return fetch('/ttuser/employee/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.id,
              store: data.store,
              internal_number: data.internal_number || null
            })
          });
        }

        if (userType === 'entity') {
          const entityData = {
            id: data.id,
            nipc: data.nipc,
            entity_type: data.entity_type
          };

          const endpoint = data.entity_type === 'store'
            ? '/ttuser/store/add'
            : '/ttuser/charity/add';

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
          throw new Error(msg || 'Erro ao completar registo.');
        }

        alert('Registo efetuado com sucesso!');
        localStorage.removeItem('user');
        window.location.href = '/homepage';
      })
      .catch(err => {
        console.error(err);
        alert('Erro: ' + err.message);
      });
  });
});
