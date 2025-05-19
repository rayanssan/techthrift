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
            if (document.querySelector("apple-pay-button")) {
                document.querySelector("apple-pay-button").remove();
            }
            return;
        }

        if (document.querySelector("#paypal")) {

            // Parse price
            let shippingPrice = document.querySelector("#shipping-price").innerText
                .replace("€", "").replace(",", ".").trim();
            let totalPrice = document.querySelector("#total-price").innerText
                .replace("€", "").replace(",", "").trim();

            const observer = new MutationObserver(() => {
                shippingPrice = parseFloat(document.querySelector("#shipping-price").innerText
                    .replace("€", "").replace(",", ".").trim());
                totalPrice = parseFloat(document.querySelector("#total-price").innerText
                    .replace("€", "").replace(",", "").trim());
                document.getElementById("paypal").innerHTML = "";
                renderPayPal();
            });

            // Observe changes to the price text content
            observer.observe(document.querySelector("#total-price"), { childList: true, subtree: true, characterData: true });
            observer.observe(document.querySelector("#shipping-price"), { childList: true, subtree: true, characterData: true });

            /* PayPal */

            /**
             * Renders the PayPal button and handles the PayPal payment flow.
             * 
             * This function sets up the PayPal buttons with the specified style and logic for:
             * - Creating the PayPal order
             * - Handling errors during the payment process
             * - Handling approval of the payment
             * - Verifying product availability before capturing payment
             * - Storing transaction details and displaying the success message
             * 
             * @function renderPayPal
             * 
             * @returns {void}
             */
            const renderPayPal = () => paypal.Buttons({
                style: {
                    layout: 'vertical',
                    borderRadius: 10,
                    label: 'paypal',
                    disableMaxWidth: true,
                    align: 'center',
                },
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: totalPrice
                            }
                        }],
                        application_context: {
                            brand_name: "TechThrift",
                        }
                    })
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
                                    address: [
                                    shipping.address.address_line_1,
                                    shipping.address.address_line_2
                                    ].filter(Boolean).join(', ').trim(),
                                    postal_code: shipping.address.postal_code?.trim() || '',
                                    city: [
                                        shipping.address.admin_area_2,
                                        shipping.address.admin_area_1
                                        ].filter(Boolean).join(', ').trim(),
                                    country: shipping.address.country_code?.trim() || '',
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
                                        order_number: details.id,
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

            renderPayPal();

            /* Apple Pay */

            /**
             * Handles the Apple Pay button click event and initiates the payment process.
             * 
             * This function performs the following:
             * - Creates an ApplePaySession with the defined payment request
             * - Validates the merchant and processes payment
             * - Updates the shipping method and address
             * - Verifies product availability in the cart
             * - Stores the transaction details in the database upon successful payment
             * - Displays a success message and order information
             * 
             * @async
             * @function onApplePayButtonClicked
             * @param {Object} formData - The form data containing the user's shipping information.
             * @param {string} formData.streetAddress - The user's street address.
             * @param {string} formData.town - The user's town, village, or post office.
             * @param {string} formData.postalCode - The user's postal code.
             * @param {string} formData.city - The user's city.
             * @param {string} formData.country - The user's country.
             * 
             * @throws {Error} Throws an error if transaction 
             * storage fails or if products in the cart are unavailable.
             */
            async function onApplePayButtonClicked(formData) {
                // Triggered when purchase is approved
                const cartProductIds = JSON.parse(localStorage.getItem('cartProducts')) || [];

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

                // Create ApplePaySession
                const session = new ApplePaySession(3, request);

                session.onvalidatemerchant = async (event) => {
                    setTimeout(() => {
                        session.completeMerchantValidation(event);
                        session.onpaymentauthorized();
                    }, 5000);
                };

                session.onpaymentmethodselected = event => {
                    const update = {};
                    session.completePaymentMethodSelection(update);
                };

                session.onshippingmethodselected = event => {
                    const update = {};
                    session.completeShippingMethodSelection(update);
                };

                session.onshippingcontactselected = event => {
                    const update = {};
                    session.completeShippingContactSelection(update);
                };

                session.onpaymentauthorized = event => {
                    fetch('/tttransaction/product-availability', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productIds: cartProductIds })
                    }).then(response => response.json())
                        .then(async data => {
                            if (!data.allAvailable) {
                                // Highlight unavailable products
                                data.unavailable.forEach(id => {
                                    const productCardHeader = document.querySelector(`[data-product-id="${id}"]`).parentElement;
                                    if (productCardHeader) {
                                        productCardHeader.parentElement.classList.replace('border-0', 'border-danger');
                                        const soldNotice = document.createElement('div');
                                        soldNotice.className = 'text-danger p-0 fw-bold';
                                        soldNotice.style.paddingTop = "13px";
                                        soldNotice.innerHTML = '<i class="fas fa-ban me-1"></i> This product has already been sold';
                                        productCardHeader.insertBefore(soldNotice, productCardHeader.querySelector(".remove-product"));
                                    }
                                });

                                console.warn("Some items in the cart are no longer available.");
                                return;
                            }

                            const shippingAddress = {
                                address: (formData.streetAddress + ", " + formData.town).trim(),
                                postal_code: formData.postalCode.trim(),
                                city: formData.city.trim(),
                                country: formData.country.trim()
                            };
                            // Store transaction in the database
                            try {
                                const response = await fetch('/tttransaction/sales/add', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        client: loggedInUser.email,
                                        transaction_value: parseFloat(totalPrice),
                                        is_online: true,
                                        shipping_address: shippingAddress.address,
                                        shipping_postal_code: shippingAddress.postal_code,
                                        shipping_city: shippingAddress.city,
                                        shipping_country: shippingAddress.country,
                                        products: cartProductIds,
                                        order_number: "APPLE-PAY-",
                                        employee: null,
                                        store: null,
                                    })
                                });
                                if (!response.ok) throw new Error("Failed to store transaction.");
                                const resJson = await response.json();

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
                                        <p class="text-muted mb-4">Order Code: <code>APPLE-PAY-${resJson.transactionId}</code></p>
                                        <p class="text-center mb-4">Thank you for your purchase!</p>
                                        <a href="/" class="btn btn-success btn-lg">Thrift More</a>
                                    </div>`;
                                return resJson;
                            } catch (err) {
                                console.error("Error storing transaction:", err);
                                showMessage("Purchase Error",
                                    "Your payment was successful but we could not process your purchase. Please contact support.",
                                    "alert");
                            }
                        });
                };

                session.oncancel = event => {
                    // Payment canceled by WebKit
                };

                session.begin();
            }

            document.querySelector("apple-pay-button").addEventListener("click", () => {
                // If modal doesn't already exist, create and append it
                if (!document.getElementById("shippingInfoModal")) {
                    const modalHtml = `
                    <div class="modal fade" id="shippingInfoModal" tabindex="-1" 
                    aria-labelledby="shippingInfoModalLabel" aria-hidden="true">
                      <div class="modal-dialog modal-dialog-centered" style="max-width: 700px;">
                        <form id="shippingForm" class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="shippingInfoModalLabel">Shipping Info</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="firstName" class="form-label">First name</label>
                                        <input type="text" class="form-control" id="firstName" 
                                        name="firstName" placeholder="Enter First name" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="lastName" class="form-label">Last name</label>
                                        <input type="text" class="form-control" id="lastName" 
                                        name="lastName" placeholder="Enter Last name" required>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="w-100">
                                        <label for="streetAddress" class="form-label">Street address</label>
                                        <input type="text" class="form-control" id="streetAddress" 
                                        name="streetAddress" placeholder="Enter Street address" required>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="town" class="form-label">Town / Village / Post office</label>
                                        <input type="text" class="form-control" id="town" name="town" 
                                        placeholder="Enter Town / Village / Post office">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="postalCode" class="form-label">Postal Code</label>
                                        <input type="text" class="form-control" id="postalCode" 
                                        name="postalCode" placeholder="Enter Postal code" required>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="city" class="form-label">City</label>
                                        <input type="text" class="form-control" id="city" 
                                        name="city" placeholder="Enter City" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="country" class="form-label">Country</label>
                                        <select id="country" name="country" class="form-select" required>
                                            <option value="">Loading countries...</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="mobile" class="form-label">Mobile</label>
                                        <input type="tel" autocomplete="tel" 
                                        class="form-control" id="mobile" 
                                        name="mobile" placeholder="Enter Mobile" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" autocomplete="email" 
                                        class="form-control" id="email" 
                                        name="email" placeholder="Enter Email" required>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-success">Continue to Apple Pay</button>
                            </div>
                        </form>
                      </div>
                    </div>`;
                    document.body.insertAdjacentHTML("beforeend", modalHtml);
                    const countrySelect = document.getElementById("country");

                    fetch("https://restcountries.com/v3.1/all")
                        .then(response => response.json())
                        .then(data => {
                            // Sort countries alphabetically by their common name
                            const countries = data
                                .map(country => ({
                                    name: country.name.common,
                                    code: country.cca2
                                }))
                                .sort((a, b) => a.name.localeCompare(b.name));

                            // Clear existing options
                            countrySelect.innerHTML = '<option value="" disabled>Select a country</option>';
                            /**
                             * Converts a 2-letter country code into a flag emoji.
                             * The flag emoji is created using the regional indicator symbols corresponding to the country code.
                             *
                             * @param {string} countryCode - A 2-letter ISO country code.
                             * @returns {string} - The flag emoji for the given country code.
                             */
                            function getFlagEmoji(countryCode) {
                                // Convert the country code into regional indicator symbols
                                return countryCode
                                    .toUpperCase()
                                    .split('')
                                    .map(char => String.fromCodePoint(0x1F1E6 - 65 + char.charCodeAt(0)))
                                    .join('');
                            }

                            // Clear existing options
                            countrySelect.innerHTML = '<option value="" disabled>Select a country</option>';

                            // Populate the select element with country options and flags
                            countries.forEach(country => {
                                const option = document.createElement("option");
                                option.value = country.code;

                                // Get the flag emoji
                                const flagEmoji = getFlagEmoji(country.code);

                                // Set the option text with the flag emoji and country name
                                option.textContent = `${flagEmoji} ${country.name}`;

                                countrySelect.appendChild(option);
                            });
                            countrySelect.value = "PT";
                        })
                        .catch(error => {
                            console.error("Error fetching countries:", error);
                            countrySelect.innerHTML = '<option value="">Unable to load countries</option>';
                        });
                }

                // Add submit listener if not already attached
                const form = document.getElementById("shippingForm");
                if (!form.dataset.listenerAttached) {
                    form.addEventListener("submit", e => {
                        e.preventDefault();

                        // Close modal and call Apple Pay
                        bootstrap.Modal.getInstance(document.getElementById('shippingInfoModal')).hide();

                        const formDataRaw = new FormData(e.target);
                        // Convert FormData to a plain object
                        const formData = Object.fromEntries(formDataRaw.entries());
                        onApplePayButtonClicked(formData);
                    });
                    form.dataset.listenerAttached = "true"; // prevent multiple bindings
                }

                // Show the modal
                new bootstrap.Modal(document.getElementById('shippingInfoModal')).show();
            });
        }
    });
});