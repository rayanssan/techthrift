"use strict";

window.addEventListener('userAuthenticated', (event) => {
    const loggedInUser = event.detail;
    fetchCartProducts().then(() => {

        if (loggedInUser == null) {
            if (document.querySelector("#paypal")) {
                document.querySelector("#paypal").innerHTML = `
              <p class="text-center fs-5">Sign in to continue with payment!</p>
              <a href="\authentication" class="btn btn-primary w-100">Sign in</a>`;
            }
            document.querySelector("apple-pay-button").remove();
            return;
        }

        if (document.querySelector("#paypal")) {

            /* PayPal */

            const renderPayPal = () => paypal.Buttons({
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
                onError: function (err) {
                    // Triggered when purchase fails
                    showMessage("Payment Declined", "Your payment was declined or cancelled.", "danger");
                },
                onApprove: async function (data, actions) {
                    // Triggered when purchase is approved
                    const cartProductIds = JSON.parse(localStorage.getItem('cartProducts')) || [];

                    // Check availability before payment capture
                    return fetch('/tttransaction/product-availability', {
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
                                const shipping = details.purchase_units[0].shipping;
                                const shippingAddress = {
                                    address: (shipping.address.address_line_1 + " " + shipping.address.address_line_2).replace(" undefined", "").trim(),
                                    postal_code: shipping.address.postal_code.replace("undefined", "").trim(),
                                    city: (shipping.address.admin_area_2 + " " + shipping.address.admin_area_1).replace(" undefined", "").trim(),
                                    country: shipping.address.country_code.replace("undefined", "").trim()
                                };

                                // Store transaction in the database
                                return fetch('/tttransaction/sales/add', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        client: loggedInUser.email,
                                        transaction_value: parseFloat(totalPrice),
                                        is_online: true,
                                        paypal_order_number: details.id,
                                        shipping_address: shippingAddress.address,
                                        shipping_postal_code: shippingAddress.postal_code,
                                        shipping_city: shippingAddress.city,
                                        shipping_country: shippingAddress.country,
                                        products: cartProductIds,
                                        employee: null,
                                        store: null,
                                    })
                                }).then(response => {
                                    if (!response.ok) throw new Error("Failed to store transaction.");
                                    // Clear cartProducts
                                    localStorage.removeItem("cartProducts");
                                    // Show success
                                    document.getElementById("paymentInterface").innerHTML = `
                                    <div class="d-flex flex-column align-items-center my-5 justify-content-center" style="min-height: 60vh;">
                                        <div class="text-success mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 10.03a.75.75 0 0 0 1.08-.02l3.992-4.99a.75.75 0 1 0-1.16-.96L7.477 8.417 5.383 6.323a.75.75 0 0 0-1.06 1.06l2.647 2.647z"/>
                                            </svg>
                                        </div>
                                        <h2 class="text-center mb-3">Your order is on its way!</h2>
                                        <p class="text-muted mb-4">Order Code: <code>${details.id}</code></p>
                                        <p class="text-center mb-4">Thank you for your purchase!</p>
                                        <a href="/" class="btn btn-success btn-lg">Thrift More</a>
                                    </div>`;
                                    return response.json();
                                }).catch(err => {
                                    console.error("Error storing transaction:", err);
                                    showMessage("Purchase Error",
                                        "Your payment was successful but we could not process your purchase. Please contact support.",
                                        "alert");
                                });
                            });
                        })
                        .catch(err => {
                            showMessage("Purchase Unsuccessful",
                                "Sorry, your purchase could not be completed. One or more items in your cart are not available anymore.",
                                "danger");
                        });
                }
            }).render('#paypal'); // Render inside the PayPal div

            // Parse price
            let totalPriceElem = document.querySelector("#total-price");
            let shippingPriceElem = document.querySelector("#shipping-price");

            let totalPrice = totalPriceElem.
                innerText.split(" ")[1].replace("€", "").replace(",", "").trim();

            let shippingPrice = shippingPriceElem.
                innerText.split(" ")[1].replace("€", "").replace(",", ".").trim();

            const observer = new MutationObserver(() => {
                totalPrice = parseFloat(totalPriceElem.innerText.split(" ")[1].replace("€", "").replace(",", "").trim());
                shippingPrice = parseFloat(shippingPriceElem.innerText.split(" ")[1].replace("€", "").replace(",", ".").trim());
                document.getElementById("paypal").innerHTML = "";
                renderPayPal();
            });

            // Observe changes to the price text content
            observer.observe(totalPriceElem, { childList: true, subtree: true, characterData: true });
            observer.observe(shippingPriceElem, { childList: true, subtree: true, characterData: true });

            renderPayPal();

            /* Apple Pay */

            function onApplePayButtonClicked() {

                if (!ApplePaySession) {
                    return;
                }

                // Define ApplePayPaymentRequest
                const request = {
                    "countryCode": "PT",
                    "currencyCode": "EUR",
                    "merchantCapabilities": [
                        "supports3DS"
                    ],
                    "supportedNetworks": [
                        "visa",
                        "masterCard",
                        "amex",
                        "discover"
                    ],
                    requiredShippingContactFields: ["postalAddress"],
                    shippingMethods: [
                        {
                            label: "Shipping",
                            detail: "Delivers in 5–7 days",
                            amount: shippingPrice,
                            identifier: "standard"
                        },
                    ],
                    "total": {
                        "label": "TechThrift Demo (Card is not charged)",
                        "type": "final",
                        "amount": totalPrice
                    }
                };
                console.log(request);

                // Create ApplePaySession
                const session = new ApplePaySession(3, request);

                session.onvalidatemerchant = async event => {
                    // Call your own server to request a new merchant session.
                    // const merchantSession = await validateMerchant();
                    // session.completeMerchantValidation(merchantSession);
                };

                session.onpaymentmethodselected = event => {
                    // Define ApplePayPaymentMethodUpdate based on the selected payment method.
                    // No updates or errors are needed, pass an empty object.
                    const update = {};
                    session.completePaymentMethodSelection(update);
                };

                session.onshippingmethodselected = event => {
                    // Define ApplePayShippingMethodUpdate based on the selected shipping method.
                    // No updates or errors are needed, pass an empty object. 
                    const update = {};
                    session.completeShippingMethodSelection(update);
                };

                session.onshippingcontactselected = event => {
                    // Define ApplePayShippingContactUpdate based on the selected shipping contact.
                    const update = {};
                    session.completeShippingContactSelection(update);
                };

                session.onpaymentauthorized = event => {
                    // Define ApplePayPaymentAuthorizationResult
                    const result = {
                        "status": ApplePaySession.STATUS_SUCCESS
                    };
                    const paymentReference = event.payment.token.transactionIdentifier;

                    // Clear cartProducts
                    localStorage.removeItem("cartProducts");
                    // Show success
                    document.getElementById("paymentInterface").innerHTML = `
                    <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 60vh;">
                        <div class="text-success mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 10.03a.75.75 0 0 0 1.08-.02l3.992-4.99a.75.75 0 1 0-1.16-.96L7.477 8.417 5.383 6.323a.75.75 0 0 0-1.06 1.06l2.647 2.647z"/>
                            </svg>
                        </div>
                        <h2 class="text-center mb-3">Your order is on its way!</h2>
                        <p class="text-muted mb-4">Order Code: <code>${paymentReference}</code></p>
                        <p class="text-center mb-4">Thank you for your purchase!</p>
                        <a href="/" class="btn btn-success btn-lg">Thrift More</a>
                    </div>`;
                    session.completePayment(result);
                };

                session.oncouponcodechanged = event => {
                    // Define ApplePayCouponCodeUpdate
                    const newTotal = calculateNewTotal(event.couponCode);
                    const newLineItems = calculateNewLineItems(event.couponCode);
                    const newShippingMethods = calculateNewShippingMethods(event.couponCode);
                    const errors = calculateErrors(event.couponCode);

                    session.completeCouponCodeChange({
                        newTotal: newTotal,
                        newLineItems: newLineItems,
                        newShippingMethods: newShippingMethods,
                        errors: errors,
                    });
                };

                session.oncancel = event => {
                    // Payment canceled by WebKit
                };

                session.begin();
            }
            document.querySelector("apple-pay-button").addEventListener("click", () =>
                onApplePayButtonClicked()
            );
        }
    });
});