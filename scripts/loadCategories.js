"use strict";

/**
 * Dynamically loads category navigation items into the navbar.
 * This function creates list items and links for predefined categories,
 * appending them to the element with ID "categories-nav".
 * If a category is present in the URL parameters, its text color is changed to navy blue.
 */
function loadCategories() {
    const categories = [
        "Smartphones", "Laptops & PCs", "Gaming", "TVs", 
        "Audio", "Tablets", "Cameras", "Smartwatches", 
        "Accessories", "Home Appliances", "More"
    ];
    
    // Get category from URL
    const urlParam = new URLSearchParams(window.location.search);
    const selectedCategory = urlParam.get('is');
    
    const navList = document.getElementById("categories-nav");
    const sidebarList = document.getElementById("categories-sidebar");
    
    categories.forEach(category => {
        const listItem = document.createElement("li");
        listItem.className = "nav-item";
        
        const link = document.createElement("a");
        link.className = "nav-link";
        link.href = `/category?is=${encodeURIComponent(category)}`;
        link.textContent = category;
        
        // Change text color if category is selected
        if (category === selectedCategory) {
            link.style.color = "navy";
            link.style.fontWeight = "bolder";
        }
        
        listItem.appendChild(link);
        navList.appendChild(listItem);

        // Create sidebar item
        const sidebarItem = document.createElement("li");
        sidebarItem.className = "nav-item";

        const sidebarLink = document.createElement("a");
        sidebarLink.className = "nav-link border-top border-bottom p-3";
        sidebarLink.href = `/category?is=${encodeURIComponent(category)}`;
        sidebarLink.textContent = category;

        if (category === selectedCategory) {
            sidebarLink.style.color = "navy";
            sidebarLink.style.fontWeight = "bolder";
        }

        sidebarItem.appendChild(sidebarLink);
        sidebarList.appendChild(sidebarItem);
    });
}

document.addEventListener("DOMContentLoaded", loadCategories);

// Event listeners for the sidebar
document.getElementById("sidebar-toggle").addEventListener("click", function () {
    document.getElementById("categories-sidebar").classList.toggle("show");
});
document.querySelector("#categories-sidebar .btn-close").
addEventListener("click", function () {
    document.getElementById("categories-sidebar").classList.remove("show");
});
// Close the sidebar if window width changes
window.addEventListener("resize", function () {
    if (window.innerWidth >= 992) {
        document.getElementById("categories-sidebar").classList.remove("show");
    }
});