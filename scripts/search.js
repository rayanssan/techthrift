"use strict";

// Retrieve the recent searches from localStorage or set default
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || 
['Apple', 'Android', 'Windows'];

// Reusable function to populate recent searches
function populateRecentSearches(listElement, container) {
    listElement.innerHTML = '';

    recentSearches.forEach(search => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = search;

        link.addEventListener("click", function (event) {
            event.preventDefault();

            recentSearches = recentSearches.filter(item => item !== search);
            recentSearches.unshift(search);
            recentSearches = recentSearches.slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

            window.location.href = `/search?is=${encodeURIComponent(search)}`;
        });

        listItem.appendChild(link);
        listElement.appendChild(listItem);
    });

    container.style.display = 'block';
}

// Handles both desktop and mobile search form logic
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
    const inputDefaultStyle = input.style;
    const buttonDefaultStyle = button.style;

    if (!form || !input || !container || !list || !button) return;

    // Disable search button by default
    button.disabled = true;

    // Show recent searches on focus
    input.addEventListener("focus", function () {
        populateRecentSearches(list, container);
        input.style.borderBottomLeftRadius = 'unset';
        button.style.borderBottomRightRadius = 'unset';
    });

    // Hide on blur (with delay for click events)
    input.addEventListener("blur", function () {
        setTimeout(() => {
            container.style.display = 'none';
            input.style = inputDefaultStyle;
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
