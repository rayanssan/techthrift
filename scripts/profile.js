"use strict";

window.addEventListener('userAuthenticated', (event) => {
    const loggedInUser = event.detail;
    if (!loggedInUser || loggedInUser.id == null) {
        location.href = "/authentication";
    }
    const profileInfo = document.getElementById('profile-info');
    document.getElementById('username').classList.add("text-white");
    document.getElementById('username').style.backgroundColor = "navy";

    // Build profile
    profileInfo.innerHTML = `
    <div class="container">
        <div class="my-4 text-center">
            ${loggedInUser.picture ? `
            <img 
                src="${loggedInUser.picture}" 
                alt="${loggedInUser.name || 'User Picture'}" 
                class="rounded-circle mb-3" 
                style="width: 120px; height: 120px;"
            />
            ` : ''}
            <h2 class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-value" data-field="name">${loggedInUser.nickname || ''}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit name" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
             </h2>
            ${loggedInUser.email ? `
            <p class="text-muted mb-1">
            <span class="field-label">Email:</span>
            <span class="field-value" data-field="email">${loggedInUser.email}</span>
            </p>
            ` : ''}
            <p class="d-flex justify-content-center align-items-center gap-2">
                ${loggedInUser.email_verified
            ? '<span class="text-success">Email Verified &#10003;</span>'
            : '<span class="text-danger">Email Not Verified</span>'
        }
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Phone:</span>
                <span class="field-value" data-field="phone_number">${loggedInUser.phone_number || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit phone" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">NIF:</span>
                <span class="field-value" data-field="nif">${loggedInUser.nif || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit NIF" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">NIC:</span>
                <span class="field-value" data-field="nic">${loggedInUser.nic || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit NIC" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Gender:</span>
                <span class="field-value" data-field="gender">${loggedInUser.gender || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit gender" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Date of Birth:</span>
                <span class="field-value" data-field="dob">${loggedInUser.dob ? new Date(loggedInUser.dob).toLocaleDateString() : 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit date of birth" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
        </div>

        <hr>

        <h3 class="text-start my-4">My Orders</h3>
        <div id="orders-list" class="list-group"></div>

        <hr>

        <h3 class="text-start my-4">My Repair Orders</h3>
        <div id="repair-orders-list" class="list-group"></div>

        <hr>

        <h3 class="text-start my-4">Logout from Account</h3>
        <button type="button" class="btn btn-danger" onclick="logout()">
            <i class="fa fa-sign-out-alt me-2"></i> Logout
        </button>
    </div>
    `;

    profileInfo.querySelectorAll('button.btn-outline-secondary').forEach(button => {
        button.addEventListener('click', function onEditClick() {
            const p = button.closest('p') || button.closest('h2');
            const valueSpan = p.querySelector('.field-value');
            if (!valueSpan) return;

            // Prevent multiple inputs
            if (p.querySelector('input') || p.querySelector('select')) return;

            let currentValue = valueSpan.textContent.trim();
            if (currentValue === 'Not given') currentValue = '';

            const field = valueSpan.dataset.field;

            let input;

            if (field === 'gender') {
                input = document.createElement('select');
                input.className = 'form-select form-select-sm d-inline-block me-2';
                input.style.width = 'auto';
                input.style.maxWidth = '200px';

                ['Male', 'Female', 'Other'].forEach(optionText => {
                    const option = document.createElement('option');
                    option.value = optionText;
                    option.textContent = optionText;
                    if (optionText === currentValue) option.selected = true;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');

                if (field === 'email') {
                    input.type = 'email';
                } else if (field === 'dob') {
                    input.type = 'date';
                    if (currentValue) {
                        const date = new Date(currentValue);
                        if (!isNaN(date)) {
                            input.value = date.toISOString().split('T')[0];
                        }
                    }
                } else if (field === 'nif' || field === 'nic') {
                    input.type = 'text';
                    input.maxLength = 9;
                    input.pattern = '[A-Za-z0-9]{9}';
                    input.title = 'Exactly 9 alphanumeric characters';
                    input.value = currentValue;
                } else {
                    input.type = 'text';
                    input.value = currentValue;
                }

                input.className = 'form-control form-control-sm d-inline-block me-2';

                // Special handling for name input size and label
                if (field === 'name') {
                    input.style = `min-width: 150px;
        width: 20vw;
        font-size: 20px;`
                } else {
                    input.style.width = 'auto';
                }
            }

            // Remove old value span
            p.removeChild(valueSpan);

            // If editing name, add label before input
            if (field === 'name') {
                const label = document.createElement('label');
                label.textContent = 'Name:';
                label.style = `font-size: 25px;
        margin-bottom: 5px;
        display: flex;`
                p.insertBefore(label, p.firstChild);
            }

            p.insertBefore(input, p.querySelector('button'));

            button.innerHTML = '<i class="fa fa-check fs-6"></i>';
            button.title = 'Save ' + field.replace(/_/g, ' ');

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-outline-secondary btn-sm rounded-circle ms-1 p-1';
            cancelBtn.title = 'Cancel edit';
            cancelBtn.style.width = '35px';
            cancelBtn.style.height = '35px';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.innerHTML = '<i class="fa fa-times fs-6"></i>';

            p.appendChild(cancelBtn);

            button.onclick = () => {
                let newValue = input.value.trim();
                if (!newValue) newValue = 'Not given';

                if (field === 'dob' && newValue !== 'Not given') {
                    const d = new Date(newValue);
                    newValue = isNaN(d) ? 'Not given' : d.toLocaleDateString();
                }

                const newSpan = document.createElement('span');
                newSpan.className = 'field-value';
                newSpan.dataset.field = field;
                newSpan.textContent = newValue;

                p.replaceChild(newSpan, input);
                if (field === 'name') {
                    // Remove the label too
                    const label = p.querySelector('label');
                    if (label) label.remove();
                }

                button.innerHTML = '<i class="fa fa-pen fs-6"></i>';
                button.title = 'Edit ' + field.replace(/_/g, ' ');
                cancelBtn.remove();

                button.onclick = null;
                button.addEventListener('click', onEditClick);

                // TODO: Call Backend to Update Client
                console.log(`Saved ${field}:`, newValue);
            };

            cancelBtn.onclick = () => {
                p.replaceChild(valueSpan, input);
                if (field === 'name') {
                    const label = p.querySelector('label');
                    if (label) label.remove();
                }
                button.innerHTML = '<i class="fa fa-pen fs-6"></i>';
                button.title = 'Edit ' + field.replace(/_/g, ' ');
                cancelBtn.remove();

                button.onclick = null;
                button.addEventListener('click', onEditClick);
            };

            input.focus();
        });
    });

    // Fetch and render orders
    fetch(`/tttransaction/sales/${encodeURIComponent(loggedInUser.email)}`)
        .then(res => res.json())
        .then(orders => {
            const ordersList = document.getElementById('orders-list');

            if (!orders.length) {
                ordersList.innerHTML = '<p class="text-center text-muted">You have no orders yet.</p>';
                return;
            }

            const grouped = {};

            for (const o of orders) {
                if (!grouped[o.order_number]) {
                    grouped[o.order_number] = { ...o, products: [] };
                }
                grouped[o.order_number].products.push(o.product_name);
            }

            Object.values(grouped).forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.className = 'list-group-item p-3';

                const orderDate = new Date(order.date_inserted).toLocaleString();
                const shipping = `${order.shipping_address || 'N/A'}, 
            ${order.shipping_postal_code || ''} ${order.shipping_city || ''} ${order.shipping_country || ''}`.trim();

                orderItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1"><i class="fa fa-receipt me-1"></i> Order code: <code>${order.order_number}</code></h6>
                <small>${orderDate}</small>
            </div>
            <h4 class="mb-1">Status: <strong>${order.sale_status || 'Unknown'}</strong></h4>
            <h6 class="mb-1">Total Order Price: <span class="fw-bold">
            ${(Number(order.transaction_value)).toLocaleString('en-PT', { style: 'currency', currency: 'EUR' })}</span></h6>
            <h6 class="mb-1">Paid with <span class="fw-bold">${order.network}</span></h6>
            ${!order.is_online ? `
            <h6 class="mb-1">Store: ${order.store_of_sale || 'N/A'}</h6>
            ` : ''}
            <h6 class="mb-1">Shipping Address: ${shipping}</h6>
            <br>
            <div class="d-flex flex-wrap gap-3">
                ${order.sold_products.map(p => `
                    <div class="card" onclick = "location.href='/product?is=${p.id}'" style="max-width: 210px;cursor:pointer;">
                    <img src="../media/images/products/${p.product_image}" 
                        class="card-img-top mt-2 px-3" 
                        alt="${p.name}" 
                        style="object-fit: contain;">
                    <div class="card-body p-2">
                        <p class="card-text text-center small mb-0">${p.name}</p>
                    </div>
                    </div>
                `).join('')}
            </div>
            `;
                ordersList.prepend(orderItem);
            });
        })
        .catch(err => {
            console.error('Failed to load orders:', err);
        });

    // Fetch and render repair orders
    fetch(`/tttransaction/repairs/${encodeURIComponent(loggedInUser.email)}`)
        .then(res => res.json())
        .then(repairOrders => {
            const repairOrdersList = document.getElementById('repair-orders-list');

            if (!repairOrders.length) {
                repairOrdersList.innerHTML = '<p class="text-center text-muted">You have no repair orders yet.</p>';
                return;
            }

            repairOrders.forEach(repair => {
                const repairItem = document.createElement('div');
                repairItem.className = 'list-group-item p-3';

                const repairDate = new Date(repair.date_inserted).toLocaleString();

                repairItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1"><i class="fa fa-wrench me-1"></i> Repair Order Code: <code>${repair.repair_order_number}</code></h6>
                <small>${repairDate}</small>
                </div>
                <h4 class="mb-1">Status: <strong>${repair.status || 'Unknown'}</strong></h4>
                <h6 class="mb-1">Device: ${repair.device_name || 'N/A'}</h6>
                <h6 class="mb-1">Description: ${repair.description || 'No description provided.'}</h6>
                <br>
                <div class="d-flex flex-wrap gap-3">
                ${repair.repair_items?.map(item => `
                    <div class="card" style="max-width: 210px;">
                    <div class="card-body p-2">
                        <p class="card-text small mb-0">${item.name}</p>
                        <p class="card-text text-muted small mb-0">${item.status || ''}</p>
                    </div>
                    </div>
                `).join('') || ''}
                </div>
            `;

                repairOrdersList.prepend(repairItem);
            });
        })
        .catch(err => {
            console.error('Failed to load repair orders:', err);
        });

});
