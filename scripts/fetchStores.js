"use strict";

let stores = [];

/**
 * Renders a list of stores grouped by country and city.
 * If the store address is in coordinate format, it uses reverse geocoding to 
 * convert to a human-readable address.
 * The rendered list is injected into the DOM under the element with ID `store-list`.
 *
 * @async
 * @function renderStores
 * @returns {Promise<void>}
 * @throws {Error} Throws error if reverse geocoding fails or coordinate parsing fails.
 */
async function renderStores() {
    const storesContainer = document.getElementById('store-list');
    storesContainer.innerHTML = ''; // Clear previous content

    // Show loading message while data is being fetched
    storesContainer.innerHTML = `<p class="text-center fw-bold display-6 loading-dots"></p>`;

    // Group stores by country and city
    const groupedStores = {};

    stores.forEach(store => {
        const { country, city } = store;

        if (!groupedStores[country]) {
            groupedStores[country] = {};
        }

        if (!groupedStores[country][city]) {
            groupedStores[country][city] = [];
        }

        groupedStores[country][city].push(store);
    });

    let html = '';

    for (const country in groupedStores) {
        html += `
            <div class="country-section mb-5">
                <div class="py-3">
                    <h2 class="mb-0">${country}</h2>
                </div>`;

        for (const city in groupedStores[country]) {
            html += `
                <div class="city-section mt-4">
                    <h4 class="mb-3 text-secondary">${city}</h4>
                    <div class="row g-3">`;

            for (const store of groupedStores[country][city]) {
                let displayAddress;
                const coordinatePattern = /^-?\d+(\.\d+)?[°\s]*[NSns]?,?\s*-?\d+(\.\d+)?[°\s]*[EWew]?$/;

                if (coordinatePattern.test(store.address)) {
                    // It's a coordinate
                    const parsed = parseCoordinates(store.address);
                    if (!parsed) throw new Error("Invalid coordinate format");

                    const lat = parsed.lat;
                    const lon = parsed.lon;

                    // Reverse geocode to get human-readable address
                    const response = await fetch(`/geocode?q=${lat},${lon}`);
                    const reverseData = await response.json();
                    displayAddress = reverseData[0]?.display_name || `${lat}, ${lon}`;
                    await fetch('/ttuser/edit/store', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: store.id,
                            address: displayAddress
                        }),
                    });
                } else {
                    // Regular address
                    displayAddress = `${store.address}, ${store.city}, ${store.country}`;
                }
                html += `
                    <div class="col-lg-3 col-md-4 col-sm-6 d-flex flex-wrap">
                        <a href="/store?is=${store.id}" 
                           id="storeid-${store.id}" 
                           class="store-link d-block p-3 border btn btn-light
                           rounded text-decoration-none text-dark shadow-sm text-start h-100">
                            <strong>${store.name} <i class="fa fa-angle-right"></i> </strong>
                            <br><br>
                            <span class="text-muted">${displayAddress}</span>
                        </a>
                    </div>`;
            };

            html += `
                    </div>
                </div>`; // Close city-section and row
        }

        html += `
            </div>`; // Close country-section
    }

    storesContainer.innerHTML = html;
}

/**
 * Parses coordinate string into latitude and longitude.
 *
 * @function parseCoordinates
 * @param {string} coordStr - A string containing latitude and longitude with directional suffixes.
 * @returns {{lat: number, lon: number} | null} Object with `lat` and `lon`, or `null` if parsing fails.
 */
function parseCoordinates(coordStr) {
    try {
        const regex = /([-+]?[0-9]*\.?[0-9]+)[°\s]*([NSns])[, ]+([-+]?[0-9]*\.?[0-9]+)[°\s]*([EWew])/;
        const match = coordStr.match(regex);
        if (!match) return null;

        let lat = parseFloat(match[1]);
        let lon = parseFloat(match[3]);

        if (match[2].toUpperCase() === 'S') lat *= -1;
        if (match[4].toUpperCase() === 'W') lon *= -1;

        return { lat, lon };
    } catch {
        return null;
    }
}

if (document.body.id == "storesListPage") {
    /**
     * Fetches the list of all stores from the backend.
     * Renders them using renderStores or displays appropriate messages if empty/error.
     *
     * @async
     * @function fetchStores
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async function fetchStores() {
        try {
            const response = await fetch('/ttuser/store');
            stores = await response.json();
            if (stores.length > 0) {
                renderStores();
            } else {
                const storeContainer = document.getElementById('store-list');
                storeContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Come back later!</p>
                <p class="text-center">There are no stores listed right now.</p>
                </div>`;
            }
        } catch (error) {
            const storeContainer = document.getElementById('store-list');
            storeContainer.innerHTML = `<div class="container my-4">
            <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
            <p class="text-center">Please try refreshing the page.</p>
            </div>`;
            console.error('Error fetching stores:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchStores();
    });
} else if (document.body.id == "storePage") {
    /**
     * Fetches details of a single store based on the `is` URL parameter.
     * Displays store details, reverse geocodes if needed, and renders a map using Leaflet.
     *
     * @async
     * @function fetchOneStore
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async function fetchOneStore() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('is');

            const response = await fetch(`/ttuser/store?id=${id}`);
            const store = await response.json();

            // Set title of the current page
            document.title += " - " + store.name;

            const storeContainer = document.getElementById('store-info');
            // Show loading message while data is being fetched
            storeContainer.innerHTML = `<p class="text-center fw-bold display-6 loading-dots"></p>`;

            document.getElementById('store-name').innerHTML = `
            <a onclick="window.history.back()" class="btn btn-link text-decoration-none">
                <i class="fa fa-angle-left fs-3"></i> 
            </a>${store.name}`;

            const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            // Determine if address is coordinate format
            const coordinatePattern = /^-?\d+(\.\d+)?[°\s]*[NSns]?,?\s*-?\d+(\.\d+)?[°\s]*[EWew]?$/;
            let lat, lon, displayAddress;

            if (coordinatePattern.test(store.address)) {
                // Convert to numeric lat/lon
                const parsed = parseCoordinates(store.address);
                if (!parsed) throw new Error("Invalid coordinate format");

                lat = parsed.lat;
                lon = parsed.lon;

                // Reverse geocode to get human-readable address
                const reverseRes = await fetch(`/geocode?q=${lat},${lon}`);
                const reverseData = await reverseRes.json();
                displayAddress = reverseData[0]?.display_name || `${lat}, ${lon}`;
            } else {
                // Standard address
                displayAddress = `${store.address}, ${store.city}, ${store.country}`;

                let geoRes;
                let geoData;
                // Forward geocode
                geoRes = await fetch(`/geocode?q=${encodeURIComponent(displayAddress)}`);
                geoData = await geoRes.json();

                if (!geoData.length) {
                    /**
                     * Simplifies a full address by reducing it to the first and last key parts.
                     * This is helpful for improving geocoding accuracy when full detailed addresses
                     * do not return results.
                     * 
                     * @function simplifyAddress
                     * @param {string} address - The full address string, typically comma-separated.
                     * @returns {string} A simplified version of the address.
                     */
                    function simplifyAddress(address) {
                        // Split address into parts (separated by commas)
                        const parts = address.split(',');

                        if (parts.length > 1) {
                            // Keep first and last parts for simplicity
                            return `${parts[0].trim()}, ${parts[parts.length - 2].trim()} ${parts[parts.length - 1].trim()}`;
                        }

                        return address; // If there's no comma, return as is
                    }
                    // If no geodata found, simplify the address
                    const simplifiedAddress = simplifyAddress(displayAddress);
                    geoRes = await fetch(`/geocode?q=${encodeURIComponent(simplifiedAddress)}`);
                    geoData = await geoRes.json();
                }

                if (geoData.length) {
                    lat = geoData[0].lat;
                    lon = geoData[0].lon;
                } else {
                    // Fallback coordinates
                    lat = 0;
                    lon = 0;
                }
            }

            // Render store info and map
            storeContainer.innerHTML = `
                <p><strong>Address:</strong> ${displayAddress}</p>
                <p><strong>Phone Number:</strong> ${store.phone_number}</p>
                <p><strong>Email:</strong> ${store.email}</p>
                <p><strong>Opening Hours:</strong></p>
                <ul>
                    ${store.opening_hours
                    .sort((a, b) => {
                        const dayA = daysOrder.indexOf(a.day);
                        const dayB = daysOrder.indexOf(b.day);
                        if (dayA >= 0 && dayB >= 0) return dayA - dayB;
                        if (dayA < 0 && dayB >= 0) return 1;
                        if (dayB < 0 && dayA >= 0) return -1;
                        return 0;
                    })
                    .map(hour => `<li>${hour.day}: ${hour.hours}</li>`)
                    .join('')}
                </ul>
                <div id="store-map" style="height: 400px;" class="mt-4 shadow rounded border"></div>
            `;

            // Render Leaflet map
            if (lat !== 0 && lon !== 0) {
                const map = L.map('store-map').setView([lat, lon], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                const markerIcon = new L.divIcon({
                    html: '<i class="text-primary fa fa-map-marker fa-3x"></i>',
                    className: 'marker-icon',
                    iconSize: [30, 30],
                    iconAnchor: [14, 35],
                    popupAnchor: [0, -35]
                });

                L.marker([lat, lon], { icon: markerIcon })
                    .addTo(map)
                    .bindPopup(`<b style="font-size: 14px;"
                    >${store.name}</b><br><br>${displayAddress}`)
                    .openPopup();
            } else {
                // Display location not found message if geodata is empty
                document.getElementById('store-map').innerHTML = `
                    <p class="text-secondary text-center" style="display: flex; justify-content: center; align-items: center; height: 100%;">
                    Location on the map not available for this store.
                    </p>
                `;
            }

        } catch (error) {
            const storeContainer = document.getElementById('store-info');
            storeContainer.innerHTML = `<div class="container my-4">
        <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
        <p class="text-center">Please try refreshing the page.</p>
        </div>`;
            console.error('Error fetching store:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchOneStore();
    });
}