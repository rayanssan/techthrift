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
                        title="Edit name" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
             </h2>
            ${loggedInUser.email ? `
            <p class="text-muted mb-1">
            <span class="field-label">Email:</span>
            <span class="field-value" data-field="email">${loggedInUser.email}</span>
            </p>
            ` : ''}
                ${loggedInUser.email_verified
            ? `<p class="d-flex justify-content-center align-items-center gap-2">
                <span class="text-success">Email Verified &#10003;</span>
            </p>`
            : `<div class="flex-column my-3 d-flex">
                <span class="text-danger">Email Not Verified</span>
                <button id="resendVerificationBtn"
                class="btn btn-link p-0">Resend Verification Email</button>
            </div>`
        }
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Phone:</span>
                <span class="field-value" data-field="phone_number">${loggedInUser.phone_number || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit phone" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">NIF:</span>
                <span class="field-value" data-field="nif">${loggedInUser.nif || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit NIF" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">NIC:</span>
                <span class="field-value" data-field="nic">${loggedInUser.nic || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit NIC" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Gender:</span>
                <span class="field-value" data-field="gender">${loggedInUser.gender || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit gender" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Date of Birth:</span>
                <span class="field-value" data-field="dob">${loggedInUser.dob ? new Date(loggedInUser.dob).toLocaleDateString() : 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit date of birth" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
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

    /**
     * Sends a request to the server to resend the Auth0 verification email
     * for the currently logged-in user, identified by their `sub` field.
     *
     * On success, replaces the button with a confirmation message.
     * On failure, displays an error message using `showMessage()`.
     *
     * @async
     * @function resendVerificationEmail
     * @returns {Promise<void>}
     */
    async function resendVerificationEmail() {
        try {
            const response = await fetch(`/auth-verification?user_id=${encodeURIComponent(loggedInUser.sub)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            await response.json();
            const btn = document.querySelector('#resendVerificationBtn');
            if (btn) {
                const p = document.createElement('p');
                p.className = "mb-0";
                p.textContent = 'Verification email sent! Please check your inbox.';
                btn.replaceWith(p);
            }
        } catch (error) {
            showMessage('Error', 'There was an error sending the verification email. Please try later.', 'danger');
        }
    }

    profileInfo.querySelector("#resendVerificationBtn")?.addEventListener("click", resendVerificationEmail);

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
                    input.maxLength = 255;
                    input.value = currentValue;
                } else if (field === 'phone_number') {
                    input.type = 'tel';
                    input.pattern = '^\\+?\\d{1,19}$';
                    input.title = 'Enter a valid phone number starting with optional + and digits only';
                    input.value = currentValue;
                } else if (field === 'dob') {
                    input.type = 'date';
                    if (currentValue) {
                        const date = new Date(currentValue);
                        if (!isNaN(date)) {
                            // Format date
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            input.value = `${yyyy}-${mm}-${dd}`;
                        }
                    }

                } else if (field === 'nif' || field === 'nic') {
                    input.type = 'text';
                    input.maxLength = 9;
                    input.pattern = '\\d{9}'
                    input.title = 'Exactly 9 numeric characters';
                    input.value = currentValue;
                } else if (field === 'name') {
                    input.type = 'text';
                    input.required = true;
                    input.maxLength = 255;
                    input.pattern = '\\S.*';
                    input.title = 'Name cannot be empty';
                    input.value = currentValue;
                } else {
                    input.type = 'text';
                    input.maxLength = 255;
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
                fetch(`/ttuser/client/${encodeURIComponent(input.value ? input.value : " ")}`)
                    .then(res => {
                        if (res.status === 204) return {};
                        return res.json();
                    })
                    .then(userResult => {
                        if (!input.reportValidity()) {
                            // Invalid input: don't proceed
                            return;
                        }
                        if (
                            (field === 'dob' && new Date(input.value).setHours(0, 0, 0, 0) === new Date(currentValue).setHours(0, 0, 0, 0)
                            ) ||
                            (field !== 'dob' &&
                                input.value.trim() === currentValue.trim())
                        ) {
                            const newSpan = document.createElement('span');
                            newSpan.className = 'field-value';
                            newSpan.dataset.field = field;
                            newSpan.textContent = currentValue;
                            p.replaceChild(newSpan, input);

                            if (field === 'name') {
                                const label = p.querySelector('label');
                                if (label) label.remove();
                            }

                            button.innerHTML = '<i class="fa fa-pen fs-6"></i>';
                            button.title = 'Edit ' + field.replace(/_/g, ' ');
                            cancelBtn.remove();

                            button.onclick = null;
                            button.addEventListener('click', onEditClick);
                            return;
                        }

                        if (field === 'email' || field === 'nif' || field === 'nic' || field === 'phone_number') {
                            if (userResult[field] === input.value) {
                                showMessage("Editing error",
                                    `Another account already exists with the given ${(field === "nic" || field === "nif") ? field.toUpperCase() : field.replace("_", " ")}.`, "danger");

                                // Revert UI state
                                newSpan.textContent = currentValue;
                                input.focus();
                                return;
                            }
                        }
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

                        // Call Backend to Update Client
                        // Prepare data to send
                        const updatedClient = {
                            email: loggedInUser.email,
                        };
                        if (field === 'dob' && newValue && newValue !== 'Not given') {
                            // Parse the date when editing dob
                            const date = new Date(newValue);
                            if (!isNaN(date)) {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, '0');
                                const dd = String(date.getDate()).padStart(2, '0');
                                updatedClient[field] = `${yyyy}-${mm}-${dd}`;
                            } else {
                                updatedClient[field] = '';
                            }
                        } else if (field === 'dob' && newValue == 'Not given') {
                            updatedClient.dob = null;
                        } else {
                            updatedClient[field] = newValue === 'Not given' ? '' : newValue;
                        }

                        // Send update request to backend
                        fetch('/ttuser/edit/client', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedClient)
                        })
                            .then(res => {
                                if (!res.ok) throw new Error('Failed to update client');
                                return res.text();
                            })
                            .then(() => {
                                // Update UI on success
                                const newSpan = document.createElement('span');
                                newSpan.className = 'field-value';
                                newSpan.dataset.field = field;
                                newSpan.textContent = newValue;

                                if (field === 'name') {
                                    const label = p.querySelector('label');
                                    if (label) label.remove();
                                    document.querySelector('#username p').innerText = newValue.split(" ")[0];
                                }

                                button.innerHTML = '<i class="fa fa-pen fs-6"></i>';
                                button.title = 'Edit ' + field.replace(/_/g, ' ');
                                cancelBtn.remove();

                                button.onclick = null;
                                button.addEventListener('click', onEditClick);
                                currentValue = newValue;
                                // Update localStorage
                                const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
                                if (newValue.toLowerCase() == "not given") {
                                    newValue = null;
                                }
                                loggedInUser[field] = newValue;
                                localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

                                showMessage("Editing successful",
                                    `Your ${(field === "nic" || field === "nif") ? field.toUpperCase() :
                                        field === "dob" ? "date of birth" : field.replace("_", " ")} was successfully edited.`,
                                    "success");;
                            })
                            .catch(err => {
                                showMessage("Editing error", `An unknown error happened while editing your ${(field === "nic" || field === "nif") ? field.toUpperCase() :
                                    field === "dob" ? "date of birth" : field.replace("_", " ")}.`, "danger");
                                newSpan.textContent = currentValue;
                                input.focus();
                            });
                    })
                    .catch(err => {
                        return;
                    });
            }

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
            }

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
                const orderDateObj = new Date(order.date_inserted)
                const daysSinceOrder = (Date.now() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24);
                const shipping = `${order.shipping_address || 'N/A'}, 
            ${order.shipping_postal_code || ''} ${order.shipping_city || ''} ${order.shipping_country || ''}`.trim();

                orderItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1"><i class="fa fa-receipt me-1"></i> Order code: <code>${order.order_number}</code></h6>
                    <small>${orderDate}</small>
                </div>
                <h4 class="mb-1 mt-1">Status: <strong>${order.sale_status || 'Unknown'}</strong></h4>
                <h6 class="mb-1">Total Order Price: <span class="fw-bold">
                ${(Number(order.transaction_value)).toLocaleString('en-PT', { style: 'currency', currency: 'EUR' })}</span></h6>
                <h6 class="mb-1">Paid with <span class="fw-bold">${order.network}</span></h6>
                ${!order.is_online ? `
                <h6 class="mb-1">Store: ${order.store_of_sale || 'N/A'}</h6>
                ` : ''}
                <h6 class="mb-3">Shipping Address: ${shipping}</h6>
                <div class="d-flex flex-wrap gap-3">
                    ${order.sold_products.map(p => `
                        <div class="card" onclick = "location.href='/product?is=${p.id}'" style="max-width: 210px;cursor:pointer;">
                        <img src="../media/images/products/${p.product_image}" 
                            class="card-img-top px-3" 
                            alt="${p.name}" 
                            style="object-fit: contain;height:200px">
                        <div class="card-body p-2">
                            <p class="card-text text-center small mb-0">${p.name}</p>
                        </div>
                        </div>
                    `).join('')}
                </div>
                ${order.sale_status.toLowerCase() !== 'cancelled' && daysSinceOrder <= 14 ? `
                <details class="border rounded mt-3 py-2 px-3">
                    <summary class="btn-link text-decoration-none">See more options</summary>
                    ${order.sale_status.toLowerCase() === 'to be shipped' ?
                            `<button class="btn btn-danger mt-2 mb-1">Cancel Order</button>` :
                            (order.sale_status.toLowerCase() === 'shipped'
                                || order.sale_status.toLowerCase() === 'delivered' ?
                                `<button class="btn btn-danger mt-2 mb-1">Return Item</button>` : ``)}
                </details>` : ''}
                `;
                ordersList.prepend(orderItem);
                orderItem.querySelector('.btn-danger')?.addEventListener("click", async (e) => {
                    const btn = e.currentTarget;
                    const isCancel = btn.textContent.includes("Cancel");
                    const title = isCancel ? "Cancel Order" : "Return Item";
                    const confirmText = isCancel ? "Yes, Cancel" : "Yes, Return";

                    const action = isCancel
                        ? `Your order has not been shipped yet, so it will be cancelled immediately and we will process your refund.`
                        : `Your order has already been ${order.sale_status.toLowerCase()}.<br><br>Please contact us at <a href="mailto:support@techthrift.com">support@techthrift.com</a> with your order number and the reason why you would like to return this order.`;

                    if (isCancel) {
                        const confirmed = await showDialog(
                            title,
                            `${action}<br><br>Are you sure you want to ${isCancel ? "cancel this order" : "proceed"}?`,
                            confirmText,
                            "No"
                        );

                        if (!confirmed) return;

                        const response = await fetch(`/tttransaction/sales/updateStatus/${order.id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ newStatus: 'Cancelled' })
                        });

                        if (!response.ok) {
                            showMessage("Order Cancellation Failure", `Your order <code>${order.order_number}</code> could not be cancelled.<br><br>Please contact us at <a href="mailto:support@techthrift.com">support@techthrift.com</a>.`, "danger");
                        } else {
                            await showMessage("Order Cancelled",
                                `Your order <code>${order.order_number}</code> has been cancelled and a refund will be processed.<br><br>Contact us at <a href="mailto:support@techthrift.com">support@techthrift.com</a> if you have any questions or issues.`,
                                "dark").then(() =>
                                    location.reload()
                                );
                        }
                    } else {
                        await showMessage("Return Item", action, "dark");
                    }
                });

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
                <h4 class="mb-1 mt-1">Status: <strong>${repair.status || 'Unknown'}</strong></h4>
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
