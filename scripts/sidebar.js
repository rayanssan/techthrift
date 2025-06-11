"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".sidebar .nav-link");

    // Get current page path without parameters (e.g., "/adminUsers")
    const currentPath = window.location.pathname.replace("/", "");

    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href").replace("/", "");
        if (linkPath === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

        link.addEventListener("click", function () {
            // Remove active class from all links
            navLinks.forEach(item => item.classList.remove("active"));

            // Add active class to clicked link
            this.classList.add("active");
        });
    });

    if (JSON.parse(localStorage.getItem("loggedInUser")).user_type === "employee") {
        document.querySelector("a[href='adminCharities'].nav-link")?.parentElement.remove();
    } else if (JSON.parse(localStorage.getItem("loggedInUser")).user_type === "charity") {
        document.querySelector("a[href='adminProducts'].nav-link")?.parentElement.remove();
        document.querySelector("a[href='adminOrders'].nav-link")?.parentElement.remove();
        document.querySelector("a[href='adminDonations'].nav-link")?.parentElement.remove();
    }
});
