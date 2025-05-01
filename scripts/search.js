"use strict";

// Retrieve the recent searches from localStorage or set default
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || 
['Apple', 'Android', 'Windows'];

/**
 * Populates the recent searches list into the provided DOM list 
 * element and displays the container.
 * 
 * Adds clickable links that redirect the user to the search page for that term,
 * while also updating the recent searches list in localStorage.
 * 
 * @function populateRecentSearches
 * @param {HTMLElement} listElement - The <ul> element where the 
 * list of searches will be inserted.
 * @param {HTMLElement} container - The container element that 
 * wraps the list, which will be shown.
 */
function populateRecentSearches(listElement, container) {
    listElement.innerHTML = '';

    if (recentSearches.length < 3) {
        recentSearches.push(['Apple', 'Android', 'Windows'].find(option => !recentSearches.includes(option)));
    }

    recentSearches.forEach(search => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.innerHTML = `
        <span class="d-flex justify-content-between align-items-center">
          <span class="text-truncate">${search}</span>
          ${['Apple', 'Android', 'Windows'].includes(search) ? "" : 
            '<i class="btn-close close-icon" style="scale: 0.8"></i>'}
        </span>`;

        link.addEventListener("click", function (event) {
            event.preventDefault();

            recentSearches = recentSearches.filter(item => item !== search);
            recentSearches.unshift(search);
            recentSearches = recentSearches.slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

            window.location.href = `/search?is=${encodeURIComponent(search)}`;
        });

        // Handle "x" icon click separately
        link.querySelector(".close-icon")?.addEventListener("click", function (event) {
            if (event.target.classList.contains('close-icon')) {
                event.preventDefault();
                event.stopPropagation(); // Prevent the parent link click

                recentSearches = recentSearches.filter(item => item !== search);
                localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

                populateRecentSearches(listElement, container); // Refresh UI
            }
        });

        listItem.appendChild(link);
        listElement.appendChild(listItem);
    });

    container.style.display = 'block';
}

/**
 * Sets up event listeners and logic for a search form including input behavior,
 * recent search dropdown handling, and form submission logic.
 * 
 * This function is designed to be reusable for both desktop and mobile search forms.
 *
 * @function setupSearchForm
 * @param {Object} config - Configuration object with form element IDs.
 * @param {string} config.formId - The ID of the form element.
 * @param {string} config.inputId - The ID of the input element inside the form.
 * @param {string} config.containerId - The ID of the container 
 * that holds the recent searches list.
 * @param {string} config.listId - The ID of the <ul> 
 * element that displays the recent searches.
 */
function setupSearchForm({
    formId,
    inputId,
    containerId,
    listId,
}) {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    const list = document.getElementById(listId);
    const button = form.querySelector("button[type=submit]");
    const searchIcon = form.querySelector("span");
    const inputDefaultStyle = input.style;
    const buttonDefaultStyle = button.style;

    if (!form || !input || !container || !list || !button) return;

    // Disable search button by default
    button.disabled = true;

    // Show recent searches on focus
    input.addEventListener("focus", function () {
        populateRecentSearches(list, container);
        searchIcon.style.borderBottomLeftRadius = 'unset';
        button.style.borderBottomRightRadius = 'unset';
    });

    // Hide on blur (with delay for click events)
    input.addEventListener("blur", function () {
        setTimeout(() => {
            container.style.display = 'none';
            searchIcon.style = inputDefaultStyle;
            button.style = buttonDefaultStyle;
        }, 200);
    });

    // Enable/disable submit button
    form.addEventListener("input", function () {
        const value = input.value.trim();
        button.disabled = !value;
    });

    // Submit handler
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const value = input.value.trim();
        if (!value) return;

        recentSearches = recentSearches.filter(item => item !== value);
        recentSearches.unshift(value);
        recentSearches = recentSearches.slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

        window.location.href = `/search?is=${encodeURIComponent(value)}`;
    });
}

// Set up both desktop and mobile forms
setupSearchForm({
    formId: "search-form",
    inputId: "search-input",
    containerId: "recent-searches",
    listId: "recent-searches-list"
});

setupSearchForm({
    formId: "search-form-mobile",
    inputId: "search-input-mobile",
    containerId: "recent-searches-mobile",
    listId: "recent-searches-list-mobile"
});
