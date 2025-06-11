"use strict";

window.addEventListener('userAuthenticated', async (event) => {
    const loggedInUser = event.detail;
    if (!loggedInUser || loggedInUser.id == null) {
        location.href = "/authentication";
    }
    const profileInfo = document.getElementById('profile-info');
    document.getElementById('username').classList.add("text-white");
    document.getElementById('username').style.backgroundColor = "navy";

    let storeName = '';
    if (loggedInUser.user_type === 'employee' && loggedInUser.store) {
        try {
            const res = await fetch(`/ttuser/store?nipc=${loggedInUser.store}`);
            const result = await res.json();
            storeName = result.name;
        } catch (err) {
            console.error('Failed to fetch store name:', err);
            storeName = "Store"
        }
    }

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

    let storeMap = null; 

    async function renderStoreMap() {
        // Build full display address
        const displayAddress = `${JSON.parse(localStorage.getItem("loggedInUser")).address}, ${
            JSON.parse(localStorage.getItem("loggedInUser")).city}, ${
            JSON.parse(localStorage.getItem("loggedInUser")).country}`;

        let geoRes;
        let geoData;

        // Attempt full address geocoding
        geoRes = await fetch(`/geocode?q=${encodeURIComponent(displayAddress)}`);
        geoData = await geoRes.json();

        // Fallback to simplified address if not found
        if (!geoData.length) {
            function simplifyAddress(address) {
                const parts = address.split(',');
                if (parts.length > 1) {
                    return `${parts[0].trim()}, ${parts[parts.length - 2].trim()} ${parts[parts.length - 1].trim()}`;
                }
                return address;
            }

            const simplifiedAddress = simplifyAddress(displayAddress);
            geoRes = await fetch(`/geocode?q=${encodeURIComponent(simplifiedAddress)}`);
            geoData = await geoRes.json();
        }

        // Set coordinates (fallback to 0,0 if nothing found)
        if (geoData.length) {
            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);

            // If a map instance exists, remove it first
            if (storeMap) {
                storeMap.remove();
            }

            // Initialize the map with the known coordinates
            storeMap = L.map('store-map').setView([lat, lon], 13);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(storeMap);

            // Create and add Leaflet marker with custom icon
            const markerIcon = new L.divIcon({
                html: '<i class="text-primary fa fa-map-marker fa-3x"></i>',
                className: 'marker-icon',
                iconSize: [30, 30],
                iconAnchor: [14, 35],
                popupAnchor: [0, -35]
            });

            L.marker([lat, lon], { icon: markerIcon })
                .addTo(storeMap)
                .bindPopup(`<b style="font-size: 14px;">${JSON.parse(localStorage.getItem("loggedInUser")).nickname}</b><br><br>${displayAddress}`)
                .openPopup();
        } else {
            // Display location not found message if geodata is empty
            document.getElementById('store-map').innerHTML = `
            <p class="text-secondary text-center" style="display: flex; justify-content: center; align-items: center; height: 100%;">
                The location of the store could not be found on the map.
            </p>
        `;
        }
    }

    if (document.body.id == "adminProfilePage" && loggedInUser.user_type === 'store') {
        const headerBrand = document.querySelector('#header-brand');
        if (headerBrand && headerBrand.previousElementSibling?.tagName === 'A') {
            headerBrand.previousElementSibling.remove();
        }
    }

    const getCountryDisplay = async (loggedInUserCountry) => {
        let countryDisplay = document.querySelector(`span[data-field="country"]`);
        let countryNameToCode = {};
        await fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
            .then(response => response.json())
            .then(data => {
                const countries = data
                    .map(country => {
                        const name = country.name.common;
                        const code = country.cca2;
                        countryNameToCode[name] = code;
                        return { name, code };
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));
            });


        const userCountry = loggedInUserCountry;
        const countryCode = countryNameToCode[userCountry];
        const flag = getFlagEmoji(countryCode);
        countryDisplay.innerText = userCountry ? `${flag} ${userCountry}` : 'Not given';

    }

    // Build profile
    profileInfo.innerHTML = `
    <div class="container">
        <div class="my-4 text-center">
            ${loggedInUser.user_type == "store" ? `
            <p>Welcome to TechThrift Partners!<br>
            This is a store account. On this page, you can visualize and edit information about this store.</p>
            <hr class="mb-4">
            ` : ''}
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

            ${loggedInUser.user_type === "employee" ? `
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Store:</span>
                <span class="field-value">${`${storeName} <small class="text-muted text-">- <i>NIPC: ${loggedInUser.store}</i></small>` || 'Not assigned'}</span>
            </p>
            <p class="d-flex justify-content-center align-items-center gap-2">
                <span class="field-label">Internal Number:</span>
                <span class="field-value" data-field="internal_number">${loggedInUser.internal_number || 'Not given'}</span>
                <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit Internal Number" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                    <i class="fa fa-pen fs-6"></i>
                </button>
            </p>
            ` : ''}

            ${loggedInUser.user_type === "store" || loggedInUser.user_type === "charity" ? `
                <p class="d-flex justify-content-center align-items-center gap-2">
                    <span class="field-label">NIPC:</span>
                    <span class="field-value" data-field="nipc">${loggedInUser.nipc || 'Not given'}</span>
                    <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                            title="Edit NIPC" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                        <i class="fa fa-pen fs-6"></i>
                    </button>
                </p>

                <p class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                    <span class="field-label">Address:</span>
                    <span class="field-value" data-field="address">${loggedInUser.address || 'Not given'}</span>
                    <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                            title="Edit address" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                        <i class="fa fa-pen fs-6"></i>
                    </button>
                </p>

                <p class="d-flex justify-content-center align-items-center gap-2">
                    <span class="field-label">City:</span>
                    <span class="field-value" data-field="city">${loggedInUser.city || 'Not given'}</span>
                    <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                            title="Edit city" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                        <i class="fa fa-pen fs-6"></i>
                    </button>
                </p>

                <p class="d-flex justify-content-center align-items-center gap-2">
                    <span class="field-label">Country:</span>
                    <span class="field-value" data-field="country">Not given</span>
                    <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                            title="Edit country" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                        <i class="fa fa-pen fs-6"></i>
                    </button>
                </p>
            ` : ''}

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

            ${loggedInUser.user_type === "store" && Array.isArray(loggedInUser.opening_hours) ? (() => {
            const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            const sortedHours = [...loggedInUser.opening_hours].sort((a, b) => {
                const aIndex = dayOrder.indexOf(a.day);
                const bIndex = dayOrder.indexOf(b.day);

                // If not found in dayOrder, treat as "holiday"/custom date and push to bottom
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;

                return aIndex - bIndex;
            });

            return `
                <div class="d-flex flex-column align-items-center gap-2">
                    <span class="field-label">Opening Hours: </span>
                    <span class="field-value" data-field="opening_hours">
                        ${sortedHours.map(oh => `${oh.day}: ${oh.hours}`).join('<br>')}
                    </span>
                    <div id="edit-opening-buttons-wrapper">
                        <button type="button" class="btn btn-outline-secondary rounded-circle p-1" 
                        title="Edit opening hours" style="width: 35px; height: 35px; min-width: 35px; cursor: pointer;">
                            <i class="fa fa-pen fs-6"></i>
                        </button>
                    </div>
                </div>
                `;
        })() : ''}
        </div>

        <hr>

        ${loggedInUser.user_type == "store" ?
            `<div id="store-map" class="rounded" style="height: 300px; width: 100%;">
            <p class="text-center fw-bold display-6 loading-dots"
            style="display: flex; justify-content: center; align-items: center; height: 100%;"></p></div><hr>` : ""
        }

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

    if (document.body.id === "adminProfilePage") {
        const allHeadings = profileInfo.querySelectorAll('h3');

        allHeadings.forEach(h3 => {
            const text = h3.textContent.trim();

            if (text === "My Orders" || text === "My Repair Orders") {
                const nextDiv = h3.nextElementSibling;
                const hr = nextDiv?.nextElementSibling;

                h3.remove();
                if (nextDiv && nextDiv.classList.contains('list-group')) nextDiv.remove();
                if (hr && hr.tagName === "HR") hr.remove();
            }
        });

        ['nif', 'nic'].forEach(field => {
            const span = document.querySelector(`.field-value[data-field="${field}"]`);
            if (span) {
                const p = span.closest('p');
                if (p) p.remove();
            }
        });

        if (loggedInUser.user_type === "store" || loggedInUser.user_type === "charity") {
            // Remove gender field
            const genderElement = document.querySelector('[data-field="gender"]')?.closest('p');
            if (genderElement) genderElement.remove();

            // Remove dob field
            const dobElement = document.querySelector('[data-field="dob"]')?.closest('p');
            if (dobElement) dobElement.remove();

            getCountryDisplay(loggedInUser.country);
        }

        if (loggedInUser.user_type === "store") {
            renderStoreMap();
        }

    }

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

    let customHourIndex = 1;

    /**
     * Dynamically adds a new row of custom store hours to the form.
     *
     * Appends the new row to the provided container element.
     * If an entry object is passed, it populates the inputs accordingly.
     *
     * @param {HTMLElement} container Optional, The DOM element to which the new custom hour row will be appended.
     * @param {Object} [entry] Optional entry with properties:
     *                         - day (string)
     *                         - hours (string, e.g. "09:00-17:00" or "Closed")
     * @returns {void}
     */
    function addCustomHour(container = document.getElementById("custom-hours-container"), entry = {}) {

        const isClosed = entry.hours === "Closed";

        let open = '', close = '';
        if (entry.hours && !isClosed) {
            [open, close] = entry.hours.split('-');
        }

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
            <input type="text" name="custom_hours[${customHourIndex}][label]" placeholder="Day" class="form-control" required>
        </div>
        <div class="col">
            <input type="time" name="custom_hours[${customHourIndex}][open]" class="form-control" required>
        </div>
        <div class="col">
            <input type="time" name="custom_hours[${customHourIndex}][close]" class="form-control" required>
        </div>
        <div class="col text-center">
            <button type="button" class="btn btn-outline-danger not-open-toggle-custom" aria-pressed="false" style="min-width: 80px;">
                Not Open
            </button>
        </div>
    `;

        container.appendChild(newRow);

        const toggleButton = newRow.querySelector('.not-open-toggle-custom');
        const dayInput = newRow.querySelector(`input[name="custom_hours[${customHourIndex}][label]"]`);
        const openInput = newRow.querySelector(`input[name="custom_hours[${customHourIndex}][open]"]`);
        const closeInput = newRow.querySelector(`input[name="custom_hours[${customHourIndex}][close]"]`);

        // Populate inputs if entry provided
        dayInput.value = entry.day || '';
        openInput.value = open;
        closeInput.value = close;

        // If closed, toggle button active and disable inputs
        if (isClosed) {
            toggleButton.classList.add('active');
            toggleButton.setAttribute('aria-pressed', 'true');
            openInput.disabled = true;
            closeInput.disabled = true;
            openInput.required = false;
            closeInput.required = false;
        } else {
            openInput.disabled = false;
            closeInput.disabled = false;
            openInput.required = true;
            closeInput.required = true;
        }

        toggleButton.addEventListener('click', () => {
            const isActive = toggleButton.classList.toggle('active');
            toggleButton.setAttribute('aria-pressed', isActive);

            if (isActive) {
                openInput.disabled = true;
                closeInput.disabled = true;
                openInput.required = false;
                closeInput.required = false;
                openInput.value = '';
                closeInput.value = '';
            } else {
                openInput.disabled = false;
                closeInput.disabled = false;
                openInput.required = true;
                closeInput.required = true;
            }
        });

        customHourIndex++;
    }

    profileInfo.querySelector("#resendVerificationBtn")?.addEventListener("click", resendVerificationEmail);

    profileInfo.querySelectorAll('button.btn-outline-secondary.rounded-circle').forEach(button => {
        button.addEventListener('click', function onEditClick() {
            const p = button.closest('p') || button.closest('h2') || button.closest('div').parentElement;
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
            } else if (field == 'country') {
                input = document.createElement('select');
                input.className = 'form-select form-select-sm d-inline-block me-2';
                input.style.width = 'auto';
                input.style.maxWidth = '200px';

                // Add a placeholder option
                input.innerHTML = '<option value="" disabled selected>Select a country</option>';

                // Fetch countries and populate
                fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
                    .then(response => response.json())
                    .then(data => {
                        const countries = data
                            .map(country => ({
                                name: country.name.common,
                                code: country.cca2
                            }))
                            .sort((a, b) => a.name.localeCompare(b.name));

                        countries.forEach(({ name, code }) => {
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = `${getFlagEmoji(code)} ${name}`;
                            if (currentValue.split(" ").slice(1).join(" ") === name) {
                                option.selected = true;
                            }
                            input.appendChild(option);
                        });
                    })
                    .catch(err => {
                        console.error('Failed to load countries:', err);
                        const errorOption = document.createElement('option');
                        errorOption.value = '';
                        errorOption.textContent = 'Unable to load countries';
                        input.appendChild(errorOption);
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

                } else if (field === 'nif' || field === 'nic' || field == 'nipc') {
                    input.type = 'text';
                    input.maxLength = 9;
                    input.pattern = '\\d{9}'
                    input.title = 'Exactly 9 numeric characters';
                    input.value = currentValue;
                    if (field == "nipc") {
                        input.required = "true";
                    }
                } else if (field === 'name') {
                    input.type = 'text';
                    input.required = true;
                    input.maxLength = 255;
                    input.pattern = '\\S.*';
                    input.title = 'Name cannot be empty';
                    input.value = currentValue;
                } else if (field === "opening_hours") {
                    currentValue = "";
                    // Create a container div to hold the store hours inputs
                    input = document.createElement('div');
                    input.className = 'store-hours-edit-container border p-3 w-50 rounded bg-light';

                    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

                    let openingHoursArray = JSON.parse(localStorage.getItem("loggedInUser")).opening_hours;

                    dayOrder.forEach(day => {
                        // Find entry for this day
                        const entry = openingHoursArray.find(e => e.day === day) || {};
                        const isClosed = entry.hours === "Closed";

                        // Default open/close to empty strings if Closed
                        let open = '', close = '';

                        if (!isClosed) {
                            [open, close] = (entry.hours || '').split('-');
                        }

                        const row = document.createElement('div');
                        row.className = 'row mb-2 align-items-center';

                        // Day label
                        const dayCol = document.createElement('div');
                        dayCol.className = 'col';
                        dayCol.textContent = day;

                        // Open time input
                        const openCol = document.createElement('div');
                        openCol.className = 'col';
                        const openInput = document.createElement('input');
                        openInput.type = 'time';
                        openInput.name = `hours[${day}][open]`;
                        openInput.className = 'form-control';
                        openInput.required = !isClosed;  // required only if not closed
                        openInput.value = open;
                        openInput.disabled = isClosed;   // disabled if closed
                        openCol.appendChild(openInput);

                        // Close time input
                        const closeCol = document.createElement('div');
                        closeCol.className = 'col';
                        const closeInput = document.createElement('input');
                        closeInput.type = 'time';
                        closeInput.name = `hours[${day}][close]`;
                        closeInput.className = 'form-control';
                        closeInput.required = !isClosed;
                        closeInput.value = close;
                        closeInput.disabled = isClosed;
                        closeCol.appendChild(closeInput);

                        // Not Open toggle button column
                        const notOpenCol = document.createElement('div');
                        notOpenCol.className = 'col text-center';

                        const notOpenBtn = document.createElement('button');
                        notOpenBtn.type = 'button';
                        notOpenBtn.className = 'btn btn-outline-danger not-open-toggle';
                        notOpenBtn.style.minWidth = '80px';
                        notOpenBtn.setAttribute('aria-pressed', isClosed ? 'true' : 'false');
                        notOpenBtn.textContent = 'Not Open';

                        // Set button active if Closed
                        if (isClosed) {
                            notOpenBtn.classList.add('active');
                        }

                        // Toggle click event
                        notOpenBtn.addEventListener('click', () => {
                            const isActive = notOpenBtn.classList.toggle('active');
                            notOpenBtn.setAttribute('aria-pressed', isActive);

                            if (isActive) {
                                openInput.disabled = true;
                                closeInput.disabled = true;
                                openInput.required = false;
                                closeInput.required = false;
                                openInput.value = '';
                                closeInput.value = '';
                            } else {
                                openInput.disabled = false;
                                closeInput.disabled = false;
                                openInput.required = true;
                                closeInput.required = true;
                            }
                        });

                        notOpenCol.appendChild(notOpenBtn);

                        row.appendChild(dayCol);
                        row.appendChild(openCol);
                        row.appendChild(closeCol);
                        row.appendChild(notOpenCol);

                        input.appendChild(row);
                    });

                    // Add horizontal rule
                    const hr = document.createElement('hr');
                    input.appendChild(hr);

                    // Label for Holiday Hours
                    const holidayLabel = document.createElement('label');
                    holidayLabel.className = 'form-label';
                    holidayLabel.textContent = 'Holiday Hours';
                    input.appendChild(holidayLabel);

                    // Container for custom holiday hours
                    const customHoursContainer = document.createElement('div');
                    customHoursContainer.id = 'custom-hours-container';
                    input.appendChild(customHoursContainer);

                    // Render holiday/custom hours entries (not in dayOrder)
                    openingHoursArray.forEach(entry => {
                        if (!dayOrder.includes(entry.day)) {
                            if (typeof addCustomHour === 'function') {
                                // Pass existing data so addCustomHour can populate fields
                                addCustomHour(customHoursContainer, entry);
                            } else {
                                console.warn('addCustomHour function is not defined');
                            }
                        }
                    });

                    // Add Holiday Hours button
                    const addHolidayBtn = document.createElement('button');
                    addHolidayBtn.type = 'button';
                    addHolidayBtn.className = 'w-100 my-2 btn btn-sm btn-outline-primary';
                    addHolidayBtn.textContent = '+ Add Holiday Hours';
                    addHolidayBtn.onclick = () => {
                        if (typeof addCustomHour === 'function') {
                            addCustomHour();
                        } else {
                            console.warn('addCustomHour function is not defined');
                        }
                    };
                    input.appendChild(addHolidayBtn);

                } else {
                    input.type = 'text';
                    input.maxLength = 255;
                    input.value = currentValue;
                }

                if (field === 'address') {
                    input.style.minWidth = "40vw";
                }

                input.className += 'form-control form-control-sm d-inline-block me-2';

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

            if (field == "opening_hours") {
                p.insertBefore(input, p.querySelector('button').parentElement);
            } else {
                p.insertBefore(input, p.querySelector('button'));
            }

            button.innerHTML = '<i class="fa fa-check fs-6"></i>';
            button.title = 'Save ' + field.replace(/_/g, ' ');

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-outline-secondary btn-sm rounded-circle ms-1 p-1';
            cancelBtn.title = 'Cancel edit';
            cancelBtn.style.width = '35px';
            cancelBtn.style.height = '35px';
            cancelBtn.style.minWidth = '35px';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.innerHTML = '<i class="fa fa-times fs-6"></i>';

            if (field == "opening_hours") {
                p.querySelector('#edit-opening-buttons-wrapper').appendChild(cancelBtn)
            } else {
                p.appendChild(cancelBtn);
            }

            button.onclick = () => {
                fetch(`/ttuser?${field}=${input.value || " "}`)
                    .then(res => {
                        if (res.status === 204) return {};
                        return res.json();
                    })
                    .then(async userResult => {
                        if (field !== "opening_hours") {
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
                        }

                        if (field === "nipc") {
                            // Check store
                            let response = await fetch(`/ttuser/store?${field}=${encodeURIComponent(input.value || " ")}`);
                            if (!response.ok) throw new Error('Network response not ok');
                            else if (response.status !== 204) {
                                let data = await response.json();
                                if (data && data[field] === input.value) {
                                    showMessage("Editing error",
                                        `Another account already exists with the given ${field.toUpperCase()}.`, "danger");

                                    newSpan.textContent = currentValue;
                                    input.focus();
                                    return false;
                                }
                            }

                            // Check charity
                            response = await fetch(`/ttuser/charity?${field}=${encodeURIComponent(input.value || " ")}`);
                            if (!response.ok) throw new Error('Network response not ok');
                            else if (response.status !== 204) {
                                let data = await response.json();
                                if (data && data[field] === input.value) {
                                    showMessage("Editing error",
                                        `Another account already exists with the given ${field.toUpperCase()}.`, "danger");

                                    newSpan.textContent = currentValue;
                                    input.focus();
                                    return false;
                                }
                            }

                        } else if (field === 'email' || field === 'nif' || field === 'nic' || field === 'phone_number') {
                            if (userResult[field] === input.value) {
                                showMessage("Editing error",
                                    `Another account already exists with the given ${(field === "nic" || field === "nif") ? field.toUpperCase() : field.replace("_", " ")}.`, "danger");

                                // Revert UI state
                                newSpan.textContent = currentValue;
                                input.focus();
                                return;
                            }
                        }

                        let newValue;
                        if (field != "opening_hours") {
                            newValue = input.value.trim();
                            if (!newValue) newValue = 'Not given';
                        }

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

                        if (field == "internal_number" ||
                            field == "nipc" ||
                            field == "address" ||
                            field == "city" ||
                            field == "country" ||
                            field == "opening_hours") {
                            // Send update request for employees, stores, and charities
                            if (loggedInUser.user_type == "employee") {
                                fetch('/ttuser/edit/employee', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedClient)
                                })
                                    .then(res => {
                                        if (!res.ok) throw new Error('Failed to update employee');
                                        return res.text();
                                    })
                                    .then(() => {
                                        // Update UI on success
                                        const newSpan = document.createElement('span');
                                        newSpan.className = 'field-value';
                                        newSpan.dataset.field = field;
                                        newSpan.textContent = newValue;

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
                                            `Your ${(field === "nipc") ? field.toUpperCase() :
                                                field.replace("_", " ")} ${field === "opening_hours" ? "were" : "was"} successfully edited.`,
                                            "success");
                                    }).catch(err => {
                                        showMessage("Editing error", `An unknown error happened while editing your ${(field === "nipc") ? field.toUpperCase()
                                            : field.replace("_", " ")}.`, "danger");
                                        newSpan.textContent = currentValue;
                                        input.focus();
                                    });
                            } else if (loggedInUser.user_type == "store") {

                                if (field == "opening_hours") {
                                    let storeHours = [];

                                    // Gather store hours for standard days
                                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                    days.forEach(day => {
                                        const open = input.querySelector(`input[name="hours[${day}][open]"]`)?.value;
                                        const close = input.querySelector(`input[name="hours[${day}][close]"]`)?.value;
                                        let hours = 'Closed';
                                        if (open && close) {
                                            hours = `${open}-${close}`;
                                        }
                                        storeHours.push({ day, hours });
                                    });

                                    // Custom holiday hours
                                    const customHoursEntries = input.querySelectorAll('.custom-hour-entry');
                                    customHoursEntries.forEach(entry => {
                                        const labelInput = entry.querySelector('input[name$="[label]"]');
                                        const openInput = entry.querySelector('input[name$="[open]"]');
                                        const closeInput = entry.querySelector('input[name$="[close]"]');

                                        if (labelInput && openInput && closeInput) {
                                            const label = labelInput.value.trim();
                                            const open = openInput.value;
                                            const close = closeInput.value;
                                            let hours = 'Closed';
                                            if (label) {
                                                if (open && close) {
                                                    hours = `${open}-${close}`;
                                                }
                                                storeHours.push({ day: label, hours });
                                            }
                                        }
                                    });

                                    updatedClient.opening_hours = storeHours;

                                    newValue = storeHours;
                                    newSpan.innerHTML = newValue
                                        .map(entry => `${entry.day}: ${entry.hours}`)
                                        .join('<br>');
                                }


                                fetch('/ttuser/edit/store', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedClient)
                                })
                                    .then(res => {
                                        if (!res.ok) throw new Error('Failed to update store');
                                        return res.text();
                                    })
                                    .then(() => {
                                        // Update UI on success
                                        const newSpan = document.createElement('span');
                                        newSpan.className = 'field-value';
                                        newSpan.dataset.field = field;
                                        newSpan.textContent = newValue;

                                        button.innerHTML = '<i class="fa fa-pen fs-6"></i>';
                                        button.title = 'Edit ' + field.replace(/_/g, ' ');
                                        cancelBtn.remove();

                                        button.onclick = null;
                                        button.addEventListener('click', onEditClick);
                                        currentValue = newValue;
                                        // Update localStorage
                                        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
                                        if (typeof newValue === 'string') {
                                            if (newValue.toLowerCase() === "not given") {
                                                newValue = null;
                                            }
                                        }

                                        loggedInUser[field] = newValue;
                                        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

                                        showMessage("Editing successful",
                                            `Your ${(field === "nipc") ? field.toUpperCase() :
                                                field.replace("_", " ")} was successfully edited.`,
                                            "success");

                                        getCountryDisplay(loggedInUser.country);
                                        renderStoreMap();
                                    }).catch(err => {
                                        showMessage("Editing error", `An unknown error happened while editing your ${(field === "nipc") ? field.toUpperCase()
                                            : field.replace("_", " ")}.`, "danger");
                                        newSpan.textContent = currentValue;
                                        input.focus();
                                    });
                            } else if (loggedInUser.user_type == "charity") {
                                fetch('/ttuser/edit/charity', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedClient)
                                }).then(res => {
                                    if (!res.ok) throw new Error('Failed to update charity');
                                    return res.text();
                                })
                                    .then(() => {
                                        // Update UI on success
                                        const newSpan = document.createElement('span');
                                        newSpan.className = 'field-value';
                                        newSpan.dataset.field = field;
                                        newSpan.textContent = newValue;

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
                                            `Your ${(field === "nipc") ? field.toUpperCase() :
                                                field.replace("_", " ")} was successfully edited.`,
                                            "success");

                                        getCountryDisplay(loggedInUser.country);

                                    }).catch(err => {
                                        showMessage("Editing error", `An unknown error happened while editing your ${(field === "nipc") ? field.toUpperCase()
                                            : field.replace("_", " ")}.`, "danger");
                                        newSpan.textContent = currentValue;
                                        input.focus();
                                    });
                            }
                        } else {
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
                                        if (document.body.id == "adminProfilePage") {
                                            document.querySelector('#username p').innerText = newValue;
                                        } else {
                                            document.querySelector('#username p').innerText = newValue.split(" ")[0];
                                        }
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
                                        "success");
                                })
                                .catch(err => {
                                    showMessage("Editing error", `An unknown error happened while editing your ${(field === "nic" || field === "nif") ? field.toUpperCase() :
                                        field === "dob" ? "date of birth" : field.replace("_", " ")}.`, "danger");
                                    newSpan.textContent = currentValue;
                                    input.focus();
                                });
                        }
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

    if (document.body.id != "adminProfilePage") {
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

                repairOrders.forEach(async repair => {

                    const res = await fetch(`/tt/product/${repair.product_id}`);
                    if (!res.ok) throw new Error('Product fetch failed');
                    const product = await res.json();
                    const repairItem = document.createElement('div');
                    repairItem.className = 'list-group-item p-3';

                    const repairDate = new Date(repair.date_inserted).toLocaleString();

                    repairItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1"><i class="fa fa-wrench me-1"></i> Repair Order Code: <code>${repair.transaction_id}</code></h6>
                <small>${repairDate}</small>
                </div>
                <h4 class="mb-1 mt-1">Status: <strong>${repair.repair_status || 'Unknown'}</strong></h4>
                <h6 class="mb-1">Device: ${product.name || 'N/A'}</h6>
                <h6 class="mb-1">Description: ${product.description || 'No description provided.'}</h6>
            `;

                    repairOrdersList.prepend(repairItem);
                });
            })
            .catch(err => {
                console.error('Failed to load repair orders:', err);
            });
    }

});
