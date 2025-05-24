"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const filterBrand = document.getElementById("filterBrand");
    const filterCondition = document.getElementById("filterCondition");
    const filterColor = document.getElementById("filterColor");
    const filterYear = document.getElementById("filterYear");
    const maxPrice = document.getElementById("maxPrice");
    const maxPriceValue = document.getElementById("maxPriceValue");
    const sortDropdown = document.getElementById("sortDropdown");
    const filtersContainer = document.getElementById("filtersContainer");

    let filtersOffsetTop = filtersContainer.offsetTop;

    /**
     * Fetches product data and populates the filter dropdowns (brand, condition, color, year)
     * based on the current page context (category page, search page, or general listing).
     * Also sets the maximum price filter based on available products.
     *
     * @async
     * @function populateFilterOptions
     * @returns {Promise<void>}
     */
    async function populateFilterOptions() {
        try {
            let endpoint = '/tt';
            if (document.body.id === "categoryPage") {
                const urlParam = new URLSearchParams(window.location.search);
                let category = urlParam.get('is');
                if (category.toLowerCase() === "more") {
                    category = "Other";
                }
                endpoint = `/tt?category=${encodeURIComponent(category)}`;
                if (category == "Accessories") {
                    // Include categories that fall under Accessories
                    const accessoryCategories = ["Audio", "Smartwatches", "Accessories"];
                    // Fetch all categories separately and merge
                    const fetches = await Promise.all(
                        accessoryCategories.map(cat =>
                            fetch(`/tt?category=${encodeURIComponent(cat)}`).then(res => res.json())
                        )
                    );
                    allProducts = fetches.flat();
                } else {
                    const response = await fetch(endpoint);
                    allProducts = await response.json();
                }
            } else if (document.body.id === "searchPage") {
                const urlParam = new URLSearchParams(window.location.search);
                const search = urlParam.get('is');

                const urls = [
                    `/tt?name=${encodeURIComponent(search)}`,
                    `/tt?category=${encodeURIComponent(search)}`,
                    `/tt?color=${encodeURIComponent(search)}`,
                    `/tt?processor=${encodeURIComponent(search)}`,
                    `/tt?os=${encodeURIComponent(search)}`,
                    `/tt?storage=${encodeURIComponent(search)}`,
                ];

                // Fetch all requests
                const responses = await Promise.all(urls.map(url => fetch(url)));
                const data = await Promise.all(responses.map(response => response.json()));

                // Merge results and remove duplicates
                const uniqueProducts = new Map();

                data.flat().forEach(product => {
                    uniqueProducts.set(product.id, product);
                });

                allProducts = Array.from(uniqueProducts.values()); // Convert Map back to an array
            } else {
                const response = await fetch(endpoint);
                allProducts = await response.json();
            }

            if (!products.length) {
                return;
            }

            const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
            const colors = [...new Set(allProducts.map(p => p.color).filter(Boolean))].sort();
            const years = [...new Set(allProducts.map(p => p.year).filter(Boolean))].sort();
            const conditions = [...new Set(allProducts.map(p => p.product_condition).filter(Boolean))].sort();

            populateDropdown(filterBrand, brands, "All Brands");
            populateDropdown(filterCondition, conditions, "All Conditions");
            populateDropdown(filterColor, colors, "All Colors");
            populateDropdown(filterYear, years, "All Years");

            const maxProductPrice = Math.max(...allProducts.map(p => p.price), 0);
            maxPrice.max = Math.ceil(maxProductPrice * 1.1);
            maxPrice.value = maxPrice.max;
            maxPriceValue.textContent = `€${maxPrice.value}`;
            applySorting("newest");
        } catch (error) {
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
                <p class="text-center">Please try refreshing the page.</p>
                </div>`;
            console.error('Error fetching products:', error);
        }
    }

    /**
     * Populates a given select element with provided options and sets a default label.
     *
     * @function populateDropdown
     * @param {HTMLSelectElement} selectElement - The dropdown to populate.
     * @param {string[]} items - List of unique items to add as options.
     * @param {string} defaultText - Text for the default (empty) option.
     */
    function populateDropdown(selectElement, items, defaultText) {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    /**
     * Applies selected filter values (brand, condition, color, year, max price)
     * to the list of all products and updates the products and products arrays.
     * Triggers sorting and re-renders products. 
     * Shows a friendly message if no matches are found.
     * Also handles pagination visibility.
     *
     * @function applyFilters
     */
    function applyFilters() {
        try {
            const brand = filterBrand.value;
            const condition = filterCondition.value;
            const color = filterColor.value;
            const year = filterYear.value;
            const price = parseFloat(maxPrice.value);
            const maxAllowedPrice = parseFloat(maxPrice.max);

            products = allProducts.filter(product => {
                const matchesBrand = !brand || product.brand === brand;
                const matchesCondition = !condition || product.product_condition === condition;
                const matchesColor = !color || product.color === color;
                const matchesYear = !year || String(product.year) === year;
                const matchesPrice = price >= maxAllowedPrice || product.price <= price;

                return matchesBrand && matchesCondition && matchesColor && matchesYear && matchesPrice;
            });

            applySorting(false);
            products = [...products];
            currentPage = 1;
            renderProducts();

            if (products.length === 0) {
                document.getElementById('product-list').innerHTML = `<div class="container my-4">
                    <p class="text-center fw-bold display-4">No products found.</p>
                    <p class="text-center">Try adjusting your filters.</p>
                    </div>`;
                document.getElementById("paginationControls").classList.replace("d-flex", "d-none");
            } else if (document.getElementById("paginationControls").classList.contains("d-none")) {
                document.getElementById("paginationControls").classList.replace("d-none", "d-flex");
            }
        } catch (error) {
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
                <p class="text-center">Please try refreshing the page.</p>
                </div>`;
            console.error('Error fetching products:', error);
        }
    }

    /**
     * Sorts the products array based on the selected sort criteria:
     * - "newest": newest first
     * - "price-asc": ascending by price
     * - "price-desc": descending by price
     * - "condition": custom condition ranking
     *
     * Optionally re-renders products if `shouldRender` is true.
     *
     * @function applySorting
     * @param {boolean} [shouldRender=true] - Whether to re-render products after sorting.
     */
    function applySorting(shouldRender = true) {
        if (sortDropdown.value === "newest") {
            products.sort((a, b) => b.id - a.id);
        } else if (sortDropdown.value === "price-asc") {
            products.sort((a, b) => a.price - b.price);
        } else if (sortDropdown.value === "price-desc") {
            products.sort((a, b) => b.price - a.price);
        } else if (sortDropdown.value === "condition") {
            const conditionOrder = ["Like New", "Excellent", "Good", "Needs Repair"];
            products.sort((a, b) =>
                conditionOrder.indexOf(a.product_condition) -
                conditionOrder.indexOf(b.product_condition)
            );
        }

        if (shouldRender) {
            products = [...products];
            currentPage = 1;
            renderProducts();
        }
    }

    sortDropdown.addEventListener("change", () => applySorting());

    [filterBrand, filterCondition, filterColor, filterYear].forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });

    maxPrice.addEventListener("input", () => {
        maxPriceValue.textContent = `€${maxPrice.value}`;
    });

    maxPrice.addEventListener("change", () => applyFilters());

    window.addEventListener("scroll", () => {
        if (window.innerWidth > 768) {
            if (window.scrollY > filtersOffsetTop) {
                filtersContainer.classList.add("fixed-top", "bg-white", "shadow-sm", "p-2");
                document.body.classList.add("pt-5");
            } else {
                filtersContainer.classList.remove("fixed-top", "bg-white", "shadow-sm", "p-2");
                document.body.classList.remove("pt-5");
            }
        }
    });

    populateFilterOptions().then( () => {
        populateFilterOptions();
    });
});