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
    const selectedCategory = urlParam.get('id');
    
    const navList = document.getElementById("categories-nav");
    
    categories.forEach(category => {
        const listItem = document.createElement("li");
        listItem.className = "nav-item";
        
        const link = document.createElement("a");
        link.className = "nav-link";
        link.href = `/category?id=${encodeURIComponent(category)}`;
        link.textContent = category;
        
        // Change text color if category is selected
        if (category === selectedCategory) {
            link.style.color = "navy";
            link.style.fontWeight = "bolder";
        }
        
        listItem.appendChild(link);
        navList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", loadCategories);