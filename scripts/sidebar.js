"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".sidebar .nav-link");

    // Get current page path without parameters (e.g., "/adminUsers")
    const currentPath = window.location.pathname.split('/').pop();

    // Restore active link from local storage
    const savedActive = localStorage.getItem("activeNavLink");

    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href").split('/').pop();

        if (linkPath === currentPath || linkPath === savedActive) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

        link.addEventListener("click", function () {
            // Remove active class from all links
            navLinks.forEach(item => item.classList.remove("active"));

            // Add active class to clicked link
            this.classList.add("active");

            // Save the active link
            localStorage.setItem("activeNavLink", this.getAttribute("href").split('/').pop());
        });
    });
});
