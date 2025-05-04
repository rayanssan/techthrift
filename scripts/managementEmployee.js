"use strict";

/**
 * This script dynamically creates and manages modal forms for different actions 
 * such as registering products, purchases, repairs, donations, and setting products for sale.
 * 
 * - `actions` is an array containing objects that define different actions. Each action corresponds to
 *   a specific modal form with details such as the action's ID, modal ID, title, the form fields, 
 *   and the submit button text.
 * 
 * - `createFormField `is a helper function that dynamically creates form field elements based on 
 *   the provided field type. It supports the field types text, number, select, checkbox,
 *   textarea, and file input (for images). Each field is wrapped in a div container with appropriate
 *   classes and attributes.
 * 
 * - `createModal` is a function that creates a modal HTML structure for a given action. It generates 
 *   the modal's header (with the title), body (with the form fields), and footer (with the submit button).
 *   The fields are dynamically added to the modal body in rows, with special handling for full-width fields 
 *   (like textareas and image lists) and others that are split into two columns.
 * 
 * - `modal` is an object used to store the modal instances created for each action.
 * 
 * - "click" type event listeners applied to each of the action buttons make it so a modal is created 
 *   when the button is clicked, the relevant modal for that action is then shown.
 */
document.addEventListener("DOMContentLoaded", () => {
    const actions = [
        {
            id: "register-sale",
            modalId: "modal-register-sale",
            title: "Register Product Sale",
            fields: [],
            submitText: "Submit Sale"
        },
        {
            id: "set-product-for-sale",
            modalId: "modal-set-product-for-sale",
            title: "Set Product for Sale",
            fields: [
                {
                    label: "Product ID", id: "sale-product-id", type: "text", required: true,
                    placeholder: "Enter Product ID"
                },
                {
                    label: "Price (€)", id: "sale-price", type: "number", required: true,
                    placeholder: "Enter Price"
                }
            ],
            submitText: "Submit"
        },
        {
            id: "register-product",
            modalId: "modal-register-product",
            title: "Register New Product",
            submitText: "Register Product",
            fields: [
                {
                    label: "Product Name", id: "product-name", type: "text",
                    placeholder: "Enter Product Name", required: true
                },
                {
                    label: "Condition", id: "product-condition", type: "select", required: true,
                    options: ["Like New", "Excellent", "Good", "Needs Repair"]
                },
                {
                    label: "Availability", id: "product-availability", type: "select", required: true,
                    options: ["Available", "Not Available"]
                },
                {
                    label: "Category", id: "product-category", type: "select", required: true,
                    options: [
                        "Smartphones", "Laptops & PCs", "Smartwatches", "Gaming", "TVs & Monitors",
                        "Audio", "Tablets", "Cameras", "Accessories", "Home Appliances", "Other"
                    ]
                },
                {
                    label: "Brand", id: "product-brand", type: "text",
                    placeholder: "Enter Brand", optional: false
                },
                {
                    label: "Model Code", id: "product-model-code", type: "text",
                    placeholder: "Enter Model Code", optional: true
                },
                {
                    label: "Color", id: "product-color", type: "text",
                    placeholder: "Enter Color", optional: true
                },
                {
                    label: "Weight (kg)", id: "product-weight", type: "number",
                    placeholder: "Enter Weight",
                    step: "0.01", optional: true
                },
                {
                    label: "Dimensions", id: "product-dimensions", type: "text",
                    placeholder: "Enter Dimensions",
                    optional: true
                },
                {
                    label: "Processor", id: "product-processor", type: "text",
                    placeholder: "Enter Processor",
                    optional: true
                },
                {
                    label: "Screen", id: "product-screen", type: "text",
                    placeholder: "Enter Screen Specification",
                    optional: true
                },
                {
                    label: "RAM Memory", id: "product-ram", type: "text",
                    placeholder: "Enter RAM Memory",
                    optional: true
                },
                {
                    label: "Graphics Card", id: "product-graphics", type: "text",
                    placeholder: "Enter Graphics Card",
                    optional: true
                },
                {
                    label: "Storage", id: "product-storage", type: "text",
                    placeholder: "Enter Storage",
                    optional: true
                },
                {
                    label: "Keyboard", id: "product-keyboard", type: "text",
                    placeholder: "Enter Keyboard Specification",
                    optional: true
                },
                {
                    label: "Operating System", id: "product-os", type: "text",
                    placeholder: "Enter Operating System",
                    optional: true
                },
                {
                    label: "Manufacture Year", id: "product-year", type: "number",
                    placeholder: "Enter Manufacture Year",
                    optional: true
                },
                {
                    label: "Description", id: "product-description", type: "textarea",
                    placeholder: "Enter Description",
                    required: true
                },
                {
                    label: "Product Images", id: "product-images", type: "image-list", required: true
                }
            ]
        },
        {
            id: "register-purchase",
            modalId: "modal-register-purchase",
            title: "Register New Product Purchase",
            fields: [
                {
                    label: "Seller Email", id: "purchase-product-seller-email", type: "email",
                    placeholder: "Enter Seller Email",
                    required: true
                },
                {
                    label: "Price", id: "purchase-price", type: "number",
                    placeholder: "Enter Price",
                    required: true
                }
            ],
            submitText: "Register Purchase"
        },
        {
            id: "register-repair",
            modalId: "modal-register-repair",
            title: "Register New Repair Order",
            fields: [
                {
                    label: "Product ID", id: "repair-product-id", type: "text",
                    placeholder: "Enter Product ID",
                    required: true
                },
                {
                    label: "Issue Description", id: "repair-description", type: "textarea",
                    placeholder: "Enter Issue Description",
                    required: true
                },
                {
                    label: "Repair Price", id: "repair-price", type: "number",
                    placeholder: "Enter Repair Price",
                    required: true
                }
            ],
            submitText: "Submit Repair"
        },
        {
            id: "register-donation",
            modalId: "modal-register-donation",
            title: "Register New Donation",
            fields: [
                {
                    label: "Donor Email", id: "donation-donor-email", type: "text",
                    placeholder: "Enter Donor Email",
                    required: true
                },
                {
                    label: "Destination Charity Name", id: "donation-charity-name",
                    type: "text",
                    placeholder: "Enter Destination Charity Name",
                    required: true
                },
                {
                    label: "Destination Charity Project", id: "donation-charity-project",
                    type: "text",
                    placeholder: "Enter Destination Charity Project",
                    required: true
                }
            ],
            submitText: "Submit Donation"
        }
    ];

    const createFormField = (field) => {
        const wrapper = document.createElement("div");
        wrapper.className = "mb-3";

        const label = document.createElement("label");
        label.className = "form-label";
        label.setAttribute("for", field.id);
        label.textContent = field.label;

        let input;

        if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.className = "form-control";
            input.placeholder = field.placeholder;
        } else if (field.type === "select") {
            input = document.createElement("select");
            input.className = "form-select";

            if (Array.isArray(field.options)) {
                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
            }
        } else if (field.type === "checkbox") {
            wrapper.className = "form-check form-switch";
            input = document.createElement("input");
            input.type = "checkbox";
            input.className = "form-check-input";
            input.id = field.id;
            label.className = "form-check-label";
            wrapper.appendChild(input);
            wrapper.appendChild(label);
            return wrapper;
        } else if (field.type === "image-list") {
            const container = document.createElement("div");

            const help = document.createElement("small");
            help.className = "form-text text-muted";
            help.textContent = "Add up to 5 images.";

            const imageGroup = document.createElement("div");
            imageGroup.className = "d-flex mt-2 flex-column gap-2";

            for (let i = 1; i <= 5; i++) {
                const row = document.createElement("div");
                row.className = "d-flex align-items-center gap-2";

                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/*";
                fileInput.name = "images[]";
                fileInput.className = "form-control";

                const orderInput = document.createElement("input");
                orderInput.type = "number";
                orderInput.min = "1";
                orderInput.max = "5";
                orderInput.placeholder = "Order";
                orderInput.name = "orders[]";
                orderInput.className = "form-control";
                orderInput.style.maxWidth = "100px";

                row.appendChild(fileInput);
                row.appendChild(orderInput);
                imageGroup.appendChild(row);
            }

            container.appendChild(label);
            container.innerHTML += "<br>";
            container.appendChild(help);
            container.appendChild(imageGroup);
            return container;
        } else {
            input = document.createElement("input");
            input.type = field.type;
            input.className = "form-control";
            input.placeholder = field.placeholder;
            if (field.step) {
                input.step = field.step;
            }
        }

        input.id = field.id;
        input.name = field.id;
        if (field.required) input.required = true;

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        return wrapper;
    };

    const createModal = ({ modalId, title, fields, submitText, id }) => {
        const modalEl = document.createElement("div");
        modalEl.className = "modal fade";
        modalEl.id = modalId;
        modalEl.tabIndex = -1;
        modalEl.setAttribute("aria-hidden", "true");

        const dialog = document.createElement("div");
        dialog.className = "modal-dialog modal-dialog-centered";
        dialog.style = "max-width: 1000px;"

        const form = document.createElement("form");
        form.className = "modal-content";

        // Header
        const header = document.createElement("div");
        header.className = "modal-header";
        const titleEl = document.createElement("h5");
        titleEl.className = "modal-title";
        titleEl.textContent = title;
        const closeBtn = document.createElement("button");
        closeBtn.className = "btn-close";
        closeBtn.setAttribute("type", "button");
        closeBtn.setAttribute("data-bs-dismiss", "modal");
        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        // Body
        const body = document.createElement("div");
        body.className = "modal-body";

        if (id === "register-sale") {
            body.innerHTML = `
                <div class="row">
                    <div class="col-md-7 border-end">
                        <!-- Placeholder for future summary/receipt -->
                        <div class="p-2">
                            <p class="text-muted">Products will appear here.</p>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="mb-3 d-flex">
                            <input type="text" class="form-control me-2" id="sale-product-id" placeholder="Enter Product ID">
                            <button type="button" class="btn btn-outline-primary">Add</button>
                        </div>
    
                        <ul class="list-group mb-3" id="sale-product-list">
                            <!-- Appended product items will appear here -->
                        </ul>
    
                        <hr class="text-secondary">

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <strong>Total:</strong>
                            <p id="sale-total-price" class="mb-0 fw-bold">€0.00</p>
                        </div>
    
                        <div id="paypal" class="mt-3"></div>
                    </div>
                </div>
            `;
            /* PayPal */

            let totalPrice = body.querySelector("#sale-total-price").innerText.replace("€", "").trim();
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
                                value: totalPrice === 0 ? totalPrice : "1.00"
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
        } else {
            let row;
            fields.forEach((field, index) => {
                const isFullWidth = field.type === "textarea" || field.type === "image-list";

                if (isFullWidth) {
                    const fullRow = document.createElement("div");
                    fullRow.className = "mb-3 px-1";
                    fullRow.appendChild(createFormField(field));
                    body.appendChild(fullRow);
                } else {
                    if (!row) {
                        row = document.createElement("div");
                        row.className = "row gx-2";
                    }

                    const col = document.createElement("div");
                    col.className = "col-md-6 px-2";
                    col.appendChild(createFormField(field));
                    row.appendChild(col);

                    // Append the row after two columns or last field
                    const isLast = index === fields.length - 1;
                    const isEven = row.children.length === 2;

                    if (isEven || isLast) {
                        body.appendChild(row);
                        row = null;
                    }
                }
            });
        }

        // Footer
        const footer = document.createElement("div");
        footer.className = "modal-footer";
        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.className = "btn btn-primary";
        submitBtn.textContent = submitText;
        footer.appendChild(submitBtn);

        // Assemble
        form.appendChild(header);
        form.appendChild(body);
        form.appendChild(footer);
        dialog.appendChild(form);
        modalEl.appendChild(dialog);
        document.body.appendChild(modalEl);

        return new bootstrap.Modal(modalEl);
    };

    const modals = {};

    actions.forEach(action => {
        modals[action.id] = createModal(action);

        const button = document.getElementById(action.id);
        if (button) {
            button.addEventListener("click", () => {
                modals[action.id].show();
            });
        }
    });
});
