"use strict";

let map = L.map('stores-map').setView([51.5045, -0.0865], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: `&copy; 
    <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 
    contributors`
}).addTo(map);


L.marker([51.5045,  -0.0865]).addTo(map)
    .bindPopup('TechThrift HQ')
    .openPopup();