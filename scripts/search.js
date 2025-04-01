"use strict";

// Initially disable the search button
document.querySelector('#search-form button').disabled = true;

document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const searchInput = document.getElementById("search-input").value.trim();
    if (searchInput) {
        window.location.href = `/search?is=${encodeURIComponent(searchInput)}`;
    }
});

// Switch availability of the search button based on whether an input is given or not
document.getElementById("search-form").addEventListener("input", function() {
    const searchInput = document.getElementById("search-input").value.trim();
    if (!searchInput) {
        this.querySelector('button').disabled = true;
    } else {
        this.querySelector('button').disabled = false;
    }
});