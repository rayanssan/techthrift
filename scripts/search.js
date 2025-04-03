"use strict";

// Retrieve the recent searches from localStorage
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || ['Apple', 'Android', 'Windows'];

// Get the search form elements
const searchForm = document.getElementById("search-form");
const recentSearchesContainer = document.getElementById("recent-searches");
const recentSearchesList = document.getElementById("recent-searches-list");
const searchInput = document.getElementById("search-input");
const searchButton = document.querySelector("#search-form button[type=submit]");
const searchInputDefaultStyle = searchInput.style;
const searchButtonDefaultStyle = searchButton.style;

// Initially disable the search button
searchButton.disabled = true;

/**
 * Populates the recent searches list and updates the UI.
 * 
 * This function clears the existing list of recent searches, 
 * dynamically generates list items based on the stored search history, 
 * and appends them to the recent searches container.
 * 
 * When a search term is clicked, it moves to the top of the list, 
 * ensuring that the most recent searches are prioritized.
 * The list is then trimmed to retain only the last five searches.
 * 
 * @function populateRecentSearches
 * @returns {void} This function does not return anything.
 */
function populateRecentSearches() {
    // Clear previous list
    recentSearchesList.innerHTML = '';

    // Add recent searches to the list
    recentSearches.forEach(search => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = search;

        // Move clicked search term to the top
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default navigation

            // Move selected search to the top
            recentSearches = recentSearches.filter(item => item !== search); 
            
            // Remove it from array
            recentSearches.unshift(search); // Add it to the beginning
            
            // Keep only the last 5 searches
            recentSearches = recentSearches.slice(0, 5);

            // Save back to localStorage
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

            // Redirect to search results page
            window.location.href = `/search?is=${encodeURIComponent(search)}`;
        });

        listItem.appendChild(link);
        recentSearchesList.appendChild(listItem);
    });
}

// Show recent searches when the search input is focused
searchInput.addEventListener("focus", function() {
    recentSearchesContainer.style.display = 'block'; // Show the recent searches
    searchInput.style.borderBottomLeftRadius = 'unset';
    searchButton.style.borderBottomRightRadius = 'unset';
    populateRecentSearches(); // Populate the list when focused
});

// Hide the recent searches when the input loses focus
searchInput.addEventListener("blur", function() {
    setTimeout(() => {
        recentSearchesContainer.style.display = 'none'; // Hide the recent searches
        searchInput.style = searchInputDefaultStyle;
        searchButton.style = searchButtonDefaultStyle;
    }, 200); // Slight delay to allow clicks on the list items
});

// Search form submissal event
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchInputValue = searchInput.value.trim();
    if (searchInputValue) {
        // Save the search term to localStorage for recent searches
        let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        
        // Add the new search to the beginning of the array
        recentSearches.unshift(searchInputValue);

        // Keep only the last 5 searches
        recentSearches = recentSearches.slice(0, 5);

        // Save the updated list back to localStorage
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

        // Redirect to the search page
        window.location.href = `/search?is=${encodeURIComponent(searchInputValue)}`;
    }
});

// Switch availability of the search button based on whether an input is given or not
searchForm.addEventListener("input", function() {
    const searchInputValue = searchInput.value.trim();
    if (!searchInputValue) {
        this.querySelector('button').disabled = true;
    } else {
        this.querySelector('button').disabled = false;
    }
});