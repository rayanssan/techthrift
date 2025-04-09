"use strict";

// Initial settings for product pagination
let currentPage = 1;
const productsPerPage = 12;
let products = [];


/**
 * Renders the products dynamically, showing a maximum of 12 per page.
 * Uses pagination to display products correctly across multiple pages.
 *
 * This function slices the `products` array based on the `currentPage` and `productsPerPage`
 * values, then updates the product container with the corresponding product cards.
 *
 * @function renderProducts
 */
function renderProducts() {
    const productContainer = document.getElementById('product-list');
    productContainer.innerHTML = ''; // Clear previous content

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);

    paginatedProducts.forEach(product => {
        const productCard = `
        <div onclick="window.location.href = 'product?is=${product.id}';"
        id="productid-${product.id}" class="col-lg-3 col-md-6 col-sm-6 d-flex mb-auto product-link">
            <div class="card w-100 my-2 shadow h-100">
                <img alt="Product Image" src="../media/images/products/${product.image}" class="card-img-top">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title text-truncate">${product.name} <i class="fa fa-angle-right"></i></h6>
                    <p class="badge mb-2 d-flex ${product.product_condition === 'Like New' ? 'bg-success' :
                product.product_condition === 'Excellent' ? 'bg-primary' : 'bg-dark'
            }">${product.product_condition} </p>
                    <p class="card-text fw-bold">€${product.price.
                replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                </div>
            </div>
        </div>`;
        productContainer.innerHTML += productCard;
    });

    updatePaginationControls();
}

/**
 * Updates the pagination controls (Previous & Next buttons) based on the current page.
 * 
 * This function enables/disables the buttons dynamically to prevent navigating beyond
 * the available pages.
 *
 * @function updatePaginationControls
 */
function updatePaginationControls() {
    document.getElementById('paginationPageIndicator').textContent = `Page ${currentPage}`;

    // Disable "Previous" button if on first page
    document.getElementById('paginationPrevPage').disabled = currentPage === 1;

    // Disable "Next" button if on last page
    document.getElementById('paginationNextPage').disabled = currentPage * productsPerPage >= products.length;
}

// Load many products if in the homepage
if (document.body.id === "homepage") {
    /**
     * Fetches products that are being sold from the TechThrift Dabatase, using the API, 
     * and dynamically renders them in the product list.
     * 
     * This function makes an asynchronous request to the `/tt` endpoint to retrieve products
     * that are available for sale.
     * It then populates the product container with product cards.
     *
     * @async
     * @function fetchSellingProducts
     * @returns {Promise<void>} Resolves when the products are successfully fetched and rendered.
     * @throws {Error} Logs an error to the console if the API request fails.
     */
    async function fetchSellingProducts() {
        try {
            const response = await fetch('/tt');
            products = await response.json();
            if (products.length > 0) {
                renderProducts();
            } else {
                const productContainer = document.getElementById('product-list');
                productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Come back later!</p>
                <p class="text-center">There are no products for sale right now.</p>
                </div>`;
                document.getElementById("paginationControls").remove();
                document.getElementById("filtersContainer").remove();
            }
        } catch (error) {
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = `<div class="container my-4">
            <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
            <p class="text-center">Please try refreshing the page.</p>
            </div>`;
            document.getElementById("paginationControls").remove();
            document.getElementById("filtersContainer").remove();
            console.error('Error fetching products:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchSellingProducts();

        document.getElementById('paginationPrevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
        document.getElementById('paginationNextPage').addEventListener('click', () => {
            if (currentPage * productsPerPage < products.length) {
                currentPage++;
                renderProducts();
            }
        });

    });
    // Load one single product's information if in a product's page
} else if (document.body.id === "productPage") {

    /**
     * Fetches a single product from the TechThrift database using the product ID from the URL.
     * 
     * This function retrieves product details from the `/tt/product/:id` API endpoint, including 
     * pricing and description. It then dynamically renders the product information on the page, 
     * displaying images in a responsive grid and product details alongside buttons for 
     * cart and wishlist actions.
     * 
     * If an error occurs (e.g., product not found), an error message is displayed.
     * 
     * @async
     * @function fetchOneSellingProduct
     * @returns {Promise<void>} Resolves when the product is successfully fetched and rendered.
     * @throws {Error} Logs an error to the console if the API request fails.
     */
    async function fetchOneSellingProduct() {
        try {
            // Get product ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('is');

            const response = await fetch(`/tt/product/${id}`);
            const product = await response.json();
            const productContainer = document.getElementById('product-info');

            // Technical Specifications
            const specs = {
                "Brand": product.brand,
                "Year": product.year,
                "Color": product.color,
                "Operating System": product.os,
                "Screen": product.screen,
                "Storage": product.storage,
                "Processor": product.processor,
                "Graphics Card": product.graphics_card,
                "RAM Memory": product.ram_memory,
                "Keyboard": product.keyboard,
                "Dimensions": product.dimensions,
                "Weight": product.weight ?
                    `${product.weight} kg / ${(product.weight * 35.274).toFixed(2)} oz` : null,
                "Model Code": product.model_code
            };

            // Set title of the current page
            document.title += " - " + product.name;

            const filteredSpecs = Object.entries(specs)
                .filter(([key, value]) => value !== null && value !== "") // Remove null/empty values
                .map(([key, value]) => `
                <tr>
                    <th scope="row">${key}</th>
                    <td>${value}</td>
                </tr>
            `).join('');

            const technicalSpecsSection = filteredSpecs.length > 0 ? `
                <div class="mt-4">
                    <h4>Technical Specifications</h4>
                    <table class="table table-responsive table-hover border rounded-3 overflow-hidden shadow">
                        <tbody>${filteredSpecs}</tbody>
                    </table>
                </div>
            ` : '';

            const productInfo = `
                <div class="container my-4">
                    <div class="row">
                        <!-- Left side: Image Carousel -->
                        <div class="col-lg-4 col-md-5 col-12">
                            <div id="productCarousel" class="carousel slide" 
                            style="background: white;"
                            data-bs-ride="carousel">
                                <div class="carousel-inner shadow border rounded">
                                    ${Object.entries(product.images)
                    .sort(([a], [b]) => a - b) // Sort images by order
                    .map(([order, image], index) => `
                                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                            <img src="../media/images/products/${image}" 
                                            alt="Product Image ${order}" 
                                            class="d-block w-100 img-fluid" />
                                        </div>
                                    `).join('')}
                                </div>          
                            </div>
                            
                            <!-- Thumbnails (Carousel Indicators) -->
                            <div class="row justify-content-center mb-3 mt-2 gap-1">
                                ${Object.entries(product.images)
                    .sort(([a], [b]) => a - b)
                    .map(([order, image], index) => `
                                    <div class="col-2 p-0">
                                        <img src="../media/images/products/${image}" 
                                        class="img-thumbnail shadow" 
                                        style="cursor:pointer;${order == 1 ? "border: 2px solid navy;" : ""}" 
                                        onclick="document.querySelectorAll('#product-info .img-thumbnail').
                                        forEach(img => img.style.border = ''); 
                                        this.style.border = '2px solid navy'; 
                                        document.querySelector('#product-info #productCarousel .carousel-item.active').
                                        classList.remove('active'); 
                                        document.querySelector('#product-info #productCarousel .carousel-item:nth-child(${index + 1})').classList.add('active');">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Right side: Product Info -->
                        <div class="col-lg-8 col-md-7 col-12">
                            <h2><a onclick="window.history.back()" class="btn btn-link text-decoration-none ps-0">
                                <i class="fa fa-angle-left fs-3"></i>
                            </a>${product.name}</h2>
                            <p class="fw-bold">€${product.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                            <p>${product.description}</p>
                            <!-- Product condition -->
                            <p class="mb-0 d-flex align-items-center gap-1">
                                <strong>Condition:</strong> <span class="badge ${product.product_condition === 'Like New' ? 'bg-success' :
                    product.product_condition === 'Excellent' ? 'bg-primary' : 'bg-dark'
                } fs-6">${product.product_condition} </span>
                            </p>
                            <div class="d-flex align-items-end pt-3 px-0 pb-0">
                                ${localStorage.getItem('cartProducts') && localStorage.getItem('cartProducts').includes(product.id) ?
                    `<a id="add-to-cart-button" class="btn btn-success me-2 shadow disabled">In your cart</a>` : `<a id="add-to-cart-button" class="btn btn-primary me-2 shadow">Add to cart</a>`}
                                <a id="add-to-wishlist-button" class="btn btn-light border icon-hover shadow">
                                    <i class="fas fa-heart fa-lg text-secondary px-1"></i>
                                </a>
                            </div>
                            ${technicalSpecsSection}
                            <!-- Store -->
                            <p class="mb-2"><strong>Sold by:</strong> <a href="/store?is=${product.store_nipc}">${product.store}</a></p>
                            <!-- Date added -->
                            <p><strong>Uploaded on:</strong> ${new Date(product.date_inserted).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            `;
            productContainer.innerHTML += productInfo;
            // Add event listener for "Add to cart" button
            document.getElementById('add-to-cart-button').addEventListener('click', function () {
                // Get the current cart products from localStorage (initialize as an empty array if not set)
                let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];

                // Add the current product's id to the cart array if not already in the cart
                if (!cartProducts.includes(product.id)) {
                    cartProducts.push(product.id);
                    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
                }

                this.textContent = "In your cart";
                this.classList.replace("btn-primary", "btn-success");
                window.location.href = "/cart";
            });
        } catch (error) {
            console.log("Error fetching product:", error);
            const productContainer = document.getElementById('product-info');
            productContainer.innerHTML = `<div class="container my-4">
                <a href="/homepage" class="btn btn-primary mb-3 btn-sm me-2">Back to Homepage</a>
                <p class="text-center fw-bold display-4">Sorry, this page does not exist anymore. ☹️</p>
            </div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        fetchOneSellingProduct().then(() => {
            this.querySelectorAll(".carousel-item").forEach(item => {
                item.addEventListener("click", () => {
                    let modal = document.getElementById("image-popup");
                    const imageSrc = item.querySelector("img").src;

                    // Create modal if it doesn’t exist
                    if (!modal) {
                        modal = document.createElement("div");
                        modal.id = "image-popup";
                        modal.style.position = "fixed";
                        modal.style.top = "0";
                        modal.style.left = "0";
                        modal.style.width = "100vw";
                        modal.style.height = "100vh";
                        modal.style.background = "rgba(0, 0, 0, 0.8)";
                        modal.style.display = "flex";
                        modal.style.justifyContent = "center";
                        modal.style.alignItems = "center";
                        modal.style.zIndex = "9999";
                        modal.innerHTML = `
                            <div class="modal-dialog modal-dialog-centered">
                                <div class="modal-content border-0 text-center rounded" style="background: white;">
                                    <button type="button" class="btn-close 
                                    position-absolute top-0 end-0 pt-4 pb-2" style="padding-right: 25px;"
                                    aria-label="Close"></button>
                                    <img src="${imageSrc}" class="img-fluid 
                                    p-3 mt-5 border-top shadow-lg" style="max-width: 80vw; max-height: 80vh;" />
                                </div>
                            </div>
                        `;

                        document.body.appendChild(modal);

                        modal.querySelector(".btn-close").addEventListener("click", () => {
                            modal.remove();
                        });
                        // Close modal when clicking outside the image
                        modal.addEventListener("click", (event) => {
                            if (event.target === modal) {
                                modal.remove();
                            }
                        });
                    }
                });
            });
        });
    });
} else if (document.body.id === "categoryPage") {
    /**
     * Fetches products of a given category that are being sold from the 
     * TechThrift Dabatase, using the API, 
     * and dynamically renders them in the product list.
     * 
     * This function makes an asynchronous request to the `/tt` endpoint, with a filter 
     * for the current requested category, to retrieve products
     * that are available for sale.
     * It then populates the product container with product cards.
     *
     * @async
     * @function fetchCategorySellingProducts
     * @returns {Promise<void>} Resolves when the products are successfully fetched and rendered.
     * @throws {Error} Logs an error to the console if the API request fails.
     */
    async function fetchCategorySellingProducts() {
        try {
            // Get category from URL
            const urlParam = new URLSearchParams(window.location.search);
            const category = urlParam.get('is');

            // Set title of the current page
            document.title += " - " + category;
            document.getElementById("category-indicator").textContent = category;

            // Fetch products for the given category
            const urls = [`/tt?category=${encodeURIComponent(category)}`];

            // If category is "Accessories", include Audio and Smartwatches
            if (category.toLowerCase() === "accessories") {
                urls.push("/tt?category=audio", "/tt?category=smartwatches");
            }

            // Fetch all requests
            const responses = await Promise.all(urls.map(url => fetch(url)));
            const data = await Promise.all(responses.map(response => response.json()));

            // Merge all results and remove potential duplicates
            const uniqueProducts = new Map();
            data.flat().forEach(product => {
                uniqueProducts.set(product.id, product);
            });

            products = Array.from(uniqueProducts.values());

            if (products.length > 0) {
                renderProducts();
            } else {
                const productContainer = document.getElementById('product-list');
                productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Come back later!</p>
                <p class="text-center">There are no products for sale in this category right now.</p>
                </div>`;
                document.getElementById("paginationControls").remove();
                document.getElementById("filtersContainer").remove();
            }
        } catch (error) {
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = `<div class="container my-4">
            <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
            <p class="text-center">Please try refreshing the page.</p>
            </div>`;
            document.getElementById("paginationControls").remove();
            document.getElementById("filtersContainer").remove();
            console.error('Error fetching products:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchCategorySellingProducts();

        document.getElementById('paginationPrevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
        document.getElementById('paginationNextPage').addEventListener('click', () => {
            if (currentPage * productsPerPage < products.length) {
                currentPage++;
                renderProducts();
            }
        });

    });
} else if (document.body.id === "searchPage") {
    /**
     * Fetches products for search results that are being sold from the 
     * TechThrift Dabatase, using the API, 
     * and dynamically renders them in the product list.
     * 
     * This function makes an asynchronous request to the `/tt` endpoint, with a filter 
     * for the current requested name, to retrieve products
     * that are available for sale.
     * It then populates the product container with product cards.
     *
     * @async
     * @function fetchSearchSellingProducts
     * @returns {Promise<void>} Resolves when the products are successfully fetched and rendered.
     * @throws {Error} Logs an error to the console if the API request fails.
     */
    async function fetchSearchSellingProducts() {
        try {
            // Get search query from URL
            const urlParam = new URLSearchParams(window.location.search);
            const search = urlParam.get('is');

            // Set title of the current page
            document.title += " - " + search;
            document.getElementById("search-indicator").textContent = `Search results for "${search}"`;

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

            products = Array.from(uniqueProducts.values()); // Convert Map back to an array
            document.getElementById("search-indicator").insertAdjacentHTML('afterend', `
                <span>${products.length} products found.</span>
            `);

            if (products.length > 0) {
                renderProducts();
            } else {
                const productContainer = document.getElementById('product-list');
                productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">No results found.</p>
                <p class="text-center">Try searching something else or come back later.</p>
                </div>`;
                document.getElementById("paginationControls").remove();
                document.getElementById("filtersContainer").remove();
            }
        } catch (error) {
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = `<div class="container my-4">
            <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
            <p class="text-center">Please try refreshing the page.</p>
            </div>`;
            document.getElementById("paginationControls").remove();
            document.getElementById("filtersContainer").remove();
            console.error('Error fetching products:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchSearchSellingProducts();

        document.getElementById('paginationPrevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
        document.getElementById('paginationNextPage').addEventListener('click', () => {
            if (currentPage * productsPerPage < products.length) {
                currentPage++;
                renderProducts();
            }
        });

    });
} else if (document.body.id === "cartPage") {
    /**
     * Fetches the products added to the cart from the localStorage and 
     * displays them on the page.
     * 
     * This function retrieves the product IDs stored in `localStorage` under the key "cartProducts",
     * fetches the details of each product from the server using those IDs, and then renders the products
     * in the cart. If there are no products in the cart, it displays a message indicating the cart is empty.
     * In case of an error, an error message is shown.
     * 
     * @async
     * @function fetchCartProducts
     * @throws {Error} If there is an issue with fetching product data.
     */
    async function fetchCartProducts() {
        try {
            // Get product IDs from local storage cart items
            let cartProductIds = JSON.parse(localStorage.getItem('cartProducts')) || [];

            // Fetch details for each product
            const productRequests = cartProductIds.map(id =>
                fetch(`/tt/product/${id}`)
            );

            const responses = await Promise.all(productRequests);
            const data = await Promise.all(responses.map(response => response.json()));
            products = data;

            if (products.length > 0) {
                renderCartProducts();
            } else {
                const productContainer = document.getElementById('product-list');
                productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Nothing in the cart yet.</p>
                <p class="text-center">Time to go thrifting!</p>
                </div>`;
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
     * Renders the products in the shopping cart on the webpage. 
     * This function also handles the removal of a product
     * from the cart and from `localStorage`.
     * 
     * @function renderCartProducts
     */
    function renderCartProducts() {
        const productContainer = document.getElementById('product-list');
        productContainer.innerHTML = ''; // Clear previous content

        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = products.slice(start, end);

        paginatedProducts.forEach(product => {
            const productCard = `
            <div id="productid-${product.id}" class="col-lg-3 col-md-6 col-sm-6 d-flex mb-auto product-link">
                <div class="card w-100 my-2 shadow h-100">
                    <img alt="Product Image" src="../media/images/products/${product.images['1']}" class="card-img-top">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title text-truncate">${product.name}</h6>
                        <p class="badge mb-2 d-flex ${product.product_condition === 'Like New' ? 'bg-success' :
                    product.product_condition === 'Excellent' ? 'bg-primary' : 'bg-dark'
                }">${product.product_condition} </p>
                        <p class="card-text fw-bold">€${product.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                        <!-- Button to remove product from cart -->
                        <button class="btn btn-danger btn-sm remove-product" data-product-id="${product.id}">X</button>
                    </div>
                </div>
            </div>`;

            productContainer.innerHTML += productCard;
            // Event listeners for button to remove products from the cart
            document.querySelectorAll('.remove-product').forEach(button => {
                button.addEventListener('click', function (event) {
                    const productId = button.getAttribute('data-product-id');

                    // Remove the product ID from the cart in localStorage
                    let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
                    cartProducts = cartProducts.filter(id => id != productId);
                    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

                    // Remove the product card from the interface
                    const productCard = document.getElementById(`productid-${productId}`);
                    productCard.remove();
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchCartProducts();
    });

}

if (["homepage", "categoryPage", "searchPage"].includes(document.body.id) &&
document.getElementById("filtersContainer")) {
    document.addEventListener("DOMContentLoaded", () => {
        const filterBrand = document.getElementById("filterBrand");
        const filterCondition = document.getElementById("filterCondition");
        const filterColor = document.getElementById("filterColor");
        const filterYear = document.getElementById("filterYear");
        const maxPrice = document.getElementById("maxPrice");
        const maxPriceValue = document.getElementById("maxPriceValue");
        const applyFiltersButton = document.getElementById("applyFilters");
        const sortDropdown = document.getElementById("sortDropdown");
        const filtersContainer = document.getElementById("filtersContainer");

        let allProducts = [];
        let filteredProducts = [];
        let filtersOffsetTop = filtersContainer.offsetTop;

        async function populateFilterOptions() {
            try {
                let endpoint = '/tt';
                if (document.body.id === "categoryPage") {
                    const urlParam = new URLSearchParams(window.location.search);
                    const category = urlParam.get('is');
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
                    endpoint = `/tt?name=${encodeURIComponent(search)}`;
                    const response = await fetch(endpoint);
                    allProducts = await response.json();
                } else {
                    const response = await fetch(endpoint);
                    allProducts = await response.json();
                }

                filteredProducts = [...allProducts];
                products = [...filteredProducts];

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
            } catch (error) {
                const productContainer = document.getElementById('product-list');
                productContainer.innerHTML = `<div class="container my-4">
                <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
                <p class="text-center">Please try refreshing the page.</p>
                </div>`;
                console.error('Error fetching products:', error);
            }
        }

        function populateDropdown(selectElement, items, defaultText) {
            selectElement.innerHTML = `<option value="">${defaultText}</option>`;
            items.forEach(item => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                selectElement.appendChild(option);
            });
        }

        function applyFilters() {
            try {
                const brand = filterBrand.value;
                const condition = filterCondition.value;
                const color = filterColor.value;
                const year = filterYear.value;
                const price = parseFloat(maxPrice.value);
                const maxAllowedPrice = parseFloat(maxPrice.max);
        
                filteredProducts = allProducts.filter(product => {
                    const matchesBrand = !brand || product.brand === brand;
                    const matchesCondition = !condition || product.product_condition === condition;
                    const matchesColor = !color || product.color === color;
                    const matchesYear = !year || String(product.year) === year;
                    const matchesPrice = price >= maxAllowedPrice || product.price <= price;
        
                    return matchesBrand && matchesCondition && matchesColor && matchesYear && matchesPrice;
                });
        
                applySorting(false);
                products = [...filteredProducts];
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
        
        function applySorting(shouldRender = true) {
            if (sortDropdown.value === "price-asc") {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortDropdown.value === "price-desc") {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sortDropdown.value === "condition") {
                const conditionOrder = ["Like New", "Excellent", "Good", "Needs Repair"];
                filteredProducts.sort((a, b) => 
                    conditionOrder.indexOf(a.product_condition) - 
                    conditionOrder.indexOf(b.product_condition)
                );
            }

            if (shouldRender) {
                products = [...filteredProducts];
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

        maxPrice.addEventListener("change", () => {
            applyFilters();
        });

        window.addEventListener("scroll", () => {
            if (window.scrollY > filtersOffsetTop) {
                filtersContainer.classList.add("fixed-top", "bg-white", "shadow-sm", "p-3");
                document.body.classList.add("pt-5");
            } else {
                filtersContainer.classList.remove("fixed-top", "bg-white", "shadow-sm", "p-3");
                document.body.classList.remove("pt-5");
            }
        });

        populateFilterOptions();
    });
}
