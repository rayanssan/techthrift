"use strict";

/**
 * Dynamically loads category navigation items into the navbar.
 * This function creates list items and links for predefined categories,
 * appending them to the element with ID "categories-nav".
 * If a category is present in the URL parameters, its text color is changed to navy blue.
 */
function loadCategories() {
    const categories = [
        "Home", "Smartphones", "Laptops & PCs", "Gaming", "TVs", 
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
        if (category == "Home") {
            link.href = `/homepage`;
            link.innerHTML = `<i class="fa-solid fa-house"></i>`;
        } else {
            link.href = `/category?is=${encodeURIComponent(category)}`;
            link.textContent = category;
        }
        
        // Change text color if category is selected
        if (category === selectedCategory ||
            (document.body.id === "homepage" && category == "Home")
        ) {
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
        if (category == "Home") {
            sidebarLink.href = `/homepage`;
            sidebarLink.innerHTML = `<i class="fa-solid fa-house"></i> Home`;
        } else {
            sidebarLink.href = `/category?is=${encodeURIComponent(category)}`;
            sidebarLink.textContent = category;
        }

        if (category === selectedCategory ||
            (document.body.id === "homepage" && category == "Home")
        ) {
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