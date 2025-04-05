"use strict";

// Initialize the map
let map = L.map('stores-map').setView([38.7169, -9.1395], 6);  // Set default center to cover Portugal

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: `&copy; 
    <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 
    contributors`
}).addTo(map);

// Fetch stores from the backend
fetch('/ttuser/store')
    .then(response => response.json())
    .then(stores => {
        // Load stores sequentially
        loadAllStoreLocations(stores);
    })
    .catch(error => {
        console.error('Error fetching stores:', error);
    });

// Global variables
let retryQueue = [];
let isProcessing = false;
let currentIndex = 0;

/**
 * Attempts to geocode an address and add a marker to the map.
 * Retries to request the address if the request fails.
 *
 * @param {string} storeName - The store's name.
 * @param {string} address - The store's address (can be coordinates).
 * @param {string} email - The store's contact email.
 * @param {string} phoneNumber - The store's phone number.
 * @param {Array<{day: string, hours: string}>} openingHours - The store's opening hours.
 * @param {number} [attempt=1] - Current attempt count for retry logic.
 * 
 * @function
 * @name geocodeAddress
 */
async function geocodeAddress(storeName, address, email, phoneNumber, openingHours, attempt = 1) {

    // Helper functions

    /**
     * Simplifies an address string by removing its middle parts if it contains at least two commas.
     * @param {string} address - The full address string.
     * @returns {string} A simplified address string.
     * 
     * @function
     * @name simplifyAddress
     * @memberof geocodeAddress
     * @private
     */
    function simplifyAddress(address) {
        const firstCommaIndex = address.indexOf(',');
        const lastCommaIndex = address.lastIndexOf(',');

        if (firstCommaIndex !== -1 && lastCommaIndex !== -1 && firstCommaIndex !== lastCommaIndex) {
            return address.substring(0, firstCommaIndex) + ',' + address.substring(lastCommaIndex + 1).trim();
        }

        return address; // Fallback if unable to simplify
    }

    /**
     * Checks whether a given address string is in coordinate format.
     * @param {string} str - The address string to evaluate.
     * @returns {boolean} True if the string contains coordinates, false otherwise.
     * 
     * @function
     * @name isCoordinate
     * @memberof geocodeAddress
     * @private
     */
    function isCoordinate(str) {
        const regex = /-?\d+(\.\d+)?°?\s*[NS],?\s*-?\d+(\.\d+)?°?\s*[EW]/i;
        return regex.test(str);
    }

    /**
     * Extracts latitude and longitude from a coordinate string.
     * @param {string} coordStr - The coordinate string (e.g., "38.7343° N, 9.1530° W").
     * @returns {{lat: number, lon: number} | null} Object with lat/lon or null if invalid format.
     * 
     * @function
     * @name extractLatLon
     * @memberof geocodeAddress
     * @private
     */
    function extractLatLon(coordStr) {
        const parts = coordStr.match(/(-?\d+(\.\d+)?)[°]?\s*([NS]),?\s*(-?\d+(\.\d+)?)[°]?\s*([EW])/i);
        if (!parts) return null;

        let lat = parseFloat(parts[1]);
        let lon = parseFloat(parts[4]);

        if (parts[3].toUpperCase() === 'S') lat = -lat;
        if (parts[6].toUpperCase() === 'W') lon = -lon;

        return { lat, lon };
    }

    /**
     * Performs reverse geocoding to convert coordinates into a human-readable address.
     * @param {number} lat - Latitude value.
     * @param {number} lon - Longitude value.
     * @param {function(string):void} callback - Function to call with the result address.
     * 
     * @function
     * @name reverseGeocode
     * @memberof geocodeAddress
     * @private
     */
    function reverseGeocode(lat, lon, callback) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
            .then(res => res.json())
            .then(data => {
                const realAddress = data.display_name || `${lat}, ${lon}`;
                callback(realAddress);
            })
            .catch(err => {
                console.error('Reverse geocoding failed:', err);
                callback(`${lat}, ${lon}`);
            });
    }

    const queryAddress = attempt === 1 ? address : simplifyAddress(address);

    try {
        const response = await fetch(`http://localhost:3000/geocode?q=${encodeURIComponent(queryAddress)}`);
        const text = await response.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (err) {
            throw new Error("Invalid JSON response from geocoder");
        }

        if (Array.isArray(data) && data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;

            const daysOrder = [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
            ];

            /* Address could have been given as a coordinate, identify and if so
            extract the coordinates to then convert to readable form */
            const coord = isCoordinate(address) ? extractLatLon(address) : null;

            if (coord) {
                reverseGeocode(coord.lat, coord.lon, (realAddress) => {
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(`
                            <p><strong>${storeName}</strong></p>
                            <p>Address: ${realAddress}</p>
                            <p>Phone Number: ${phoneNumber}</p>
                            <p>Email: ${email}</p>
                            <ul>
                                ${openingHours
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
                        `);
                });
            } else {
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`
                        <p><strong>${storeName}</strong></p>
                        <p>Address: ${address}</p>
                        <p>Phone Number: ${phoneNumber}</p>
                        <p>Email: ${email}</p>
                        <ul>
                            ${openingHours
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
                    `);
            }
        } else {
            // Retry logic if no results
            if (attempt <= 5) {
                retryQueue.push({ storeName, address, email, phoneNumber, openingHours, attempt: attempt + 1 });
            }
        }
    } catch (error) {
        // Retry on error
        if (attempt <= 5) {
            retryQueue.push({ storeName, address, email, phoneNumber, openingHours, attempt: attempt + 1 });
        }
    }
}

/**
 * Processes a queue of geocoding requests with delay and retry logic.
 * @param {Array<Object>} queue - Queue of store data objects to geocode.
 * 
 * @function
 * @name processQueue
 */
function processQueue(queue) {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    // Show loading message while processing
    document.getElementById("loading-message").style.display = "block";

    /**
     * Processes the next item in the geocoding queue with a 1-second delay between each request.
     * 
     * This function is called recursively to handle geocoding one store at a time from the queue.
     * If an item is found, it triggers `geocodeAddress` and continues with the next item after a delay.
     * When the queue is empty, it hides the loading message and stops the processing loop.
     *
     * @function
     * @name processNext
     * @memberof processQueue
     * @private
     */
    function processNext() {
        let item;
        // Process normal queue with 1 second delay between each
        item = queue.shift();
        if (item != undefined) {
            geocodeAddress(item.storeName, item.address, item.email,
                item.phoneNumber, item.openingHours,
                item.attempt).finally(() => {
                    setTimeout(processNext, 1000); // 1 second between requests
                });
        } else {
            document.getElementById("loading-message").style.display = "none";
            isProcessing = false;
            return;
        }
    }

    processNext();
}

/**
 * Loads all store locations by preparing a geocoding queue and processing it.
 * @param {Array<Object>} stores - Array of store objects with location and metadata.
 * 
 * @function
 * @name loadAllStoreLocations
 */
function loadAllStoreLocations(stores) {
    const queue = stores.map(store => ({
        storeName: store.name,
        address: store.address,
        email: store.email,
        phoneNumber: store.phone_number,
        openingHours: store.opening_hours,
        attempt: 1
    }));

    processQueue(queue);
}
