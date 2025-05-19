"use strict";

window.addEventListener('userAuthenticated', (event) => {
    const loggedInUser = event.detail;
    if (!loggedInUser) {
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
            <h2>
            ${loggedInUser.nickname || ''}
            <button type="button" class="btn btn-outline-secondary 
            rounded-circle ms-2 p-1" title="Edit name" style="width: 35px; height: 35px; cursor: pointer;">
                <i class="fa fa-pen fs-6"></i>
            </button>
            </h2>
            ${loggedInUser.email ? `
            <p class="text-muted mb-1">
                ${loggedInUser.email}
                <button type="button" class="btn btn-outline-secondary 
                rounded-circle ms-2 p-1" title="Edit email" style="width: 35px; height: 35px; cursor: pointer;">
                <i class="fa fa-pen fs-6"></i>
            </button>
            </p>
            ` : ''}
            <p>
            ${loggedInUser.email_verified
                ? '<span class="text-success">Email Verified &#10003;</span>'
                : '<span class="text-danger">Email Not Verified</span>'
            }
            </p>
            <p>
                Phone: ${loggedInUser.phone_number || 'Not given'}
                <button type="button" class="btn btn-outline-secondary 
                rounded-circle ms-2 p-1" title="Edit phone" style="width: 35px; height: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            <p>
            NIF: ${loggedInUser.nif || 'Not given'}
            <button type="button" class="btn btn-outline-secondary 
            rounded-circle ms-2 p-1" title="Edit NIF" style="width: 35px; height: 35px; cursor: pointer;">
                <i class="fa fa-pen fs-6"></i>
            </button>
            </p>
            <p>
            NIC: ${loggedInUser.nic || 'Not given'}
            <button type="button" class="btn btn-outline-secondary 
            rounded-circle ms-2 p-1" title="Edit NIC" style="width: 35px; height: 35px; cursor: pointer;">
                <i class="fa fa-pen fs-6"></i>
            </button>
            </p>
            <p>
            Gender: ${loggedInUser.gender || 'Not given'}
            <button type="button" class="btn btn-outline-secondary 
            rounded-circle ms-2 p-1" title="Edit gender" style="width: 35px; height: 35px; cursor: pointer;">
                <i class="fa fa-pen fs-6"></i>
            </button>
            </p>
            <p>
            Date of Birth: ${loggedInUser.dob ? new Date(loggedInUser.dob).toLocaleDateString() : 'Not given'}
            <button type="button" class="btn btn-outline-secondary 
            rounded-circle ms-2 p-1" title="Edit date of birth" style="width: 35px; height: 35px; cursor: pointer;">
                <i class="fa fa-pen fs-6"></i>
            </button>
            </p>
        </div>

        <hr>

        <h3 class="text-start my-4">My Orders</h3>
        <div id="orders-list" class="list-group"></div>

        <hr>

        <h3 class="text-start my-4">Logout from Account</h3>
        <button type="button" class="btn btn-danger" onclick="logout()">
            <i class="fa fa-sign-out-alt me-2"></i> Logout
        </button>
    </div>
    `;

    // Fetch and render orders
    fetch(`/tttransaction/sales/${encodeURIComponent(loggedInUser.email)}`)
    .then(res => res.json())
    .then(orders => {
        const ordersList = document.getElementById('orders-list');

        if (!orders.length) {
            ordersList.innerHTML = '<p class="text-center text-muted">No orders found.</p>';
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
            ${!order.is_online ? `
            <h6 class="mb-1">Store: ${order.store_of_sale || 'N/A'}</h6>
            <h6 class="mb-1">Employee: ${order.overseeing_employee || 'N/A'}</h6>
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


});
