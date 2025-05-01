"use strict";

document.addEventListener('DOMContentLoaded', () => {
    fetchCartProducts().then(() => {

        let totalPrice;
        // Parse price
        if (document.querySelector("#total-price")) {
            totalPrice = document.querySelector("#total-price").
                innerText.split(" ")[1].replace("€", "").replace(",", "").trim();
        }

        /* PayPal */

        paypal.Buttons({
            style: {
                layout: 'vertical',
                borderRadius: 10,
                label: 'paypal'
            },
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: totalPrice
                        }
                    }]
                });
            },
            onApprove: function (data, actions) {
                const cartProductIds = JSON.parse(localStorage.getItem('cartProducts')) || [];

                // Check availability before payment capture
                return fetch('/tttransaction/products/check-availability', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productIds: cartProductIds })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.allAvailable) {
                            // Highlight unavailable products
                            data.unavailable.forEach(id => {
                                const productCard = document.querySelector(`[data-product-id="${id}"]`).parentElement;
                                if (productCard) {
                                    productCard.classList.add('bg-light');
                                    productCard.classList.replace('border-0', 'border-danger');
                                    const soldNotice = document.createElement('div');
                                    soldNotice.className = 'text-danger position-absolute px-3 fw-bold';
                                    soldNotice.style.paddingTop = "13px";
                                    soldNotice.innerHTML = '<i class="fas fa-ban me-1"></i> This product has already been sold';
                                    productCard.prepend(soldNotice);
                                }
                            });

                            throw new Error("Some items in your cart are no longer available.");
                        }

                        // Capture payment
                        return actions.order.capture().then(function (details) {
                            // Show success
                            document.getElementById("paymentInterface").innerHTML = `
                            <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 60vh;">
                                <div class="text-success mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 10.03a.75.75 0 0 0 1.08-.02l3.992-4.99a.75.75 0 1 0-1.16-.96L7.477 8.417 5.383 6.323a.75.75 0 0 0-1.06 1.06l2.647 2.647z"/>
                                    </svg>
                                </div>
                                <h2 class="text-center mb-3">Your order is on its way!</h2>
                                <p class="text-muted mb-4">Order Code: <code>${details.id}</code></p>
                                <p class="text-center mb-4">Thank you for your purchase!</p>
                                <a href="/" class="btn btn-success btn-lg">Thrift More</a>
                            </div>
                        `;

                            // Store transaction in the database
                            return fetch('/tttransaction/transactions/sales/add', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    client: localStorage.getItem('userEmail') || 'rayan133serafimsantana@outlook.com',
                                    transaction_value: parseFloat(totalPrice),
                                    is_online: true,
                                    paypal_order_number: details.id,
                                    products: cartProductIds
                                })
                            })
                                .then(response => {
                                    if (!response.ok) throw new Error("Failed to store transaction.");
                                    return response.json();
                                })
                                .then(data => {
                                    console.log("Transaction stored:", data);
                                })
                                .catch(err => {
                                    console.error("Error storing transaction:", err);
                                    alert("Payment was successful but we couldn't save your transaction. Please contact support.");
                                });
                        });
                    })
                    .catch(err => {
                        alert(err.message || "Purchase could not be completed. Some items may have sold out.");
                    });
            }
        }).render('#paypal'); // Render inside the PayPal div
    });
});