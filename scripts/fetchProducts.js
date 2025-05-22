"use strict";

// Initial settings for product pagination
let currentPage = 1;
const productsPerPage = 12;
const maxVisiblePages = 3;
let products = []; // Can be filtered
let allProducts = []; // Has all products

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
                <img alt="Product Image" src="../media/images/products/${product.image}" class="card-img-top p-2">
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
    document.getElementById('paginationPrevPage').disabled = currentPage === 1;
    const totalPages = Math.ceil(products.length / productsPerPage);
    document.getElementById('paginationNextPage').disabled = currentPage === totalPages;

    function renderPagination() {
        const paginationPages = document.getElementById('paginationPages');
        paginationPages.innerHTML = ''; // Clear previous buttons

        const totalPages = Math.ceil(products.length / productsPerPage);
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust near the end
        let realStart = startPage;
        if (endPage - startPage < maxVisiblePages - 1 && totalPages >= maxVisiblePages) {
            realStart = Math.max(1, totalPages - maxVisiblePages + 1);
        }

        // Render numbered page buttons
        for (let i = realStart; i <= Math.min(totalPages, realStart + maxVisiblePages - 1); i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                updatePaginationControls();
                renderProducts();
            });
            paginationPages.appendChild(pageButton);
        }

        // Add ellipsis if needed
        if (endPage < totalPages) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '•••';
            ellipsis.className = 'align-self-center text-secondary px-1';
            paginationPages.appendChild(ellipsis);
        }
        if (currentPage >= 3 && totalPages > 3) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '•••';
            ellipsis.className = 'align-self-center text-secondary px-1';
            paginationPages.prepend(ellipsis);
        }
    }
    renderPagination();
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
            // Sort from newest to oldest
            products.sort((a, b) => new Date(b.date_inserted) - new Date(a.date_inserted));

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
    let loggedInUser;

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
            productContainer.innerHTML = ``;

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
                                            class="d-block w-100 img-fluid p-2" />
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
                            <h5 class="fw-bold">€${product.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h5>
                            <p>${product.description}</p>
                            <!-- Product condition -->
                            <p class="mb-0 d-flex align-items-center gap-1">
                                <strong>Condition:</strong> <i class="fa-solid fa-sparkles"></i> <span class="badge ${product.product_condition === 'Like New' ? 'bg-success' :
                    product.product_condition === 'Excellent' ? 'bg-primary' : 'bg-dark'
                } fs-6">${product.product_condition} </span>
                            </p>
                            <div class="d-flex align-items-end pt-3 px-0 pb-0">
                                ${product.availability === 0 ?
                    `<a id="add-to-cart-button" class="btn btn-secondary me-2 shadow disabled">
                                    <i class="fas fa-ban"></i> This product has been sold already
                                </a>` :
                    (localStorage.getItem('cartProducts') &&
                        JSON.parse(localStorage.getItem('cartProducts')).includes(product.id) ?
                        `<a id="add-to-cart-button" class="btn btn-success me-2 shadow disabled">
                                    <i class="fa-solid fa-cart-arrow-down"></i> In your cart
                                </a>` :
                        `<a id="add-to-cart-button" class="btn btn-primary me-2 shadow">
                                    <i class="fas fa-cart-plus"></i> Add to cart
                                </a>`)}
                                ${product.availability === 0 ? "" :
                    `<a id="add-to-wishlist-button" 
                                class="btn btn-light border shadow">
                                    <i class="fas fa-heart fa-lg text-secondary px-1"></i>
                                    <span id="wishlist-count" class="text-secondary">0</span>
                                </a>`}
                            </div>
                            ${technicalSpecsSection}
                            <!-- Store -->
                            <div class="bg-white shadow border-0 rounded w-100 p-2 d-inline-block mb-2">
                                <i class="fas fa-store m-1"></i>
                                <strong>Sold by:</strong> 
                                <a href="/store?is=${product.store_nipc}">${product.store}</a>
                            </div>
                            <!-- Date added -->
                            <p class="mt-2"><strong>Uploaded on:</strong> ${new Date(product.date_inserted).toLocaleDateString()}</p>
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
                this.classList.add("disabled");
                window.location.href = "/cart";
            });

            let wishlistEntryId;

            const fetchWishlistCount = () => {
                fetch(`/ttuser/wishlist/count/${product.id}`)
                    .then(res => res.json())
                    .then(data => {
                        const count = data.count || 0;
                        if (document.getElementById("wishlist-count")) {
                            document.getElementById("wishlist-count").textContent = count;
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching wishlist count:", err);
                    });
            }
            fetchWishlistCount();

            // Check if product is in user's wishlist
            const checkWishlist = () => {
                if (loggedInUser || loggedInUser.id != null) {
                    fetch(`/ttuser/wishlist/${loggedInUser.email}`)
                        .then(res => res.json())
                        .then(wishlistItems => {
                            const isInWishlist = wishlistItems.some(
                                item => item.wishlisted_product === product.id);

                            wishlistItems.forEach(item => {
                                if (item.wishlisted_product === product.id) {
                                    wishlistEntryId = item.id;
                                }
                            });

                            const button = document.getElementById('add-to-wishlist-button');
                            if (button) {
                                const icon = button.querySelector('i');
                                const count = button.querySelector('span');
                                if (isInWishlist) {
                                    button.classList.add('wishlisted');
                                    count.classList.replace('text-secondary', 'text-white')
                                    icon.classList.replace('text-secondary', 'text-white');
                                    button.style.backgroundColor = "navy";
                                } else {
                                    button.classList.remove('wishlisted');
                                    count.classList.replace('text-white', 'text-secondary')
                                    icon.classList.replace('text-white', 'text-secondary');
                                    button.style.backgroundColor = "white";
                                }
                            }
                        })
                        .catch(err => console.error('Failed to fetch wishlist:', err));
                }
            }
            checkWishlist();

            // Add event listener for "❤️" button
            document.getElementById('add-to-wishlist-button')?.addEventListener('click', function () {
                const button = this;
                const isWishlisted = button.classList.contains('wishlisted');

                // Signal alterations to the wishlist
                document.getElementById("wishlist").style.backgroundColor = "rgba(0, 0, 128, 0.7)";
                document.getElementById("wishlist").classList.add("text-white");
                setTimeout(function () {
                    document.getElementById("wishlist").style.backgroundColor = "";
                    document.getElementById("wishlist").classList.remove("text-white");
                }, 500);

                if (!isWishlisted) {
                    fetch('/ttuser/wishlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            wishlisted_product: product.id,
                            interested_user: loggedInUser.email
                        })
                    }).then(response => {
                        if (!response.ok) throw new Error('Failed to add to wishlist');
                        checkWishlist();
                        fetchWishlistCount();
                    }).catch(err => {
                        console.error(err);
                        checkWishlist();
                        fetchWishlistCount();
                    });

                } else {
                    fetch(`/ttuser/wishlist/remove/${wishlistEntryId}`, {
                        method: 'DELETE'
                    }).then(response => {
                        if (!response.ok) throw new Error('Failed to remove from wishlist');
                        checkWishlist();
                        fetchWishlistCount();
                    }).catch(err => {
                        console.error(err);
                        checkWishlist();
                        fetchWishlistCount();
                    });
                }
            });

            // check if item in wishlist and style already if so
        } catch (error) {
            console.log("Product doesn't exist");
            const productContainer = document.getElementById('product-info');
            productContainer.innerHTML = `<div class="container my-4">
                <a href="/homepage" class="btn btn-primary mb-3 btn-sm me-2">Back to Homepage</a>
                <p class="text-center fw-bold display-5 p-5 mt-4 mb-5">Sorry, this page does not exist anymore. ☹️</p>
            </div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        window.addEventListener('userAuthenticated', (event) => {
            loggedInUser = event.detail;
            fetchOneSellingProduct().then(() => {
                this.querySelectorAll(".carousel-item").forEach(item => {
                    item.addEventListener("click", () => {
                        const imageSrc = item.querySelector("img").src;
                        let modalEl = document.getElementById("image-popup");

                        // If modal doesn't exist, create it once
                        if (!modalEl) {
                            modalEl = document.createElement("div");
                            modalEl.className = "modal fade";
                            modalEl.id = "image-popup";
                            modalEl.tabIndex = -1;
                            modalEl.innerHTML = `
                            <div class="modal-dialog modal-dialog-centered" style="zoom: 1.3;">
                            <div class="modal-content border-0 text-center rounded bg-white m-auto">
                                <button type="button" class="btn-close position-absolute top-0 end-0 mt-3 me-3" 
                                data-bs-dismiss="modal" aria-label="Close"></button>
                                <img class="img-fluid p-3 border-top shadow-lg" 
                                style="margin-top: 3.5rem;">
                            </div>
                            </div>`;
                            document.body.appendChild(modalEl);
                        }

                        // Set image src dynamically
                        modalEl.querySelector("img").src = imageSrc;

                        // Show modal via Bootstrap's API
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.show();
                    });
                });
                if (loggedInUser == null || loggedInUser.id == null) {
                    if (document.getElementById('add-to-wishlist-button')) {
                        document.getElementById('add-to-wishlist-button').style.display = 'none';
                    }
                }
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
            let category = urlParam.get('is');

            // Set title of the current page
            document.title += " - " + category;
            document.getElementById("category-indicator").innerHTML = `
            <a onclick="window.history.back()" class="btn btn-link text-decoration-none ps-0">
                <i class="fa fa-angle-left fs-3"></i>
            </a>${category}`;

            if (category.toLowerCase() === "more") {
                category = "Other";
            }

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
            const isFeaturedSearch = urlParam.get('featured');

            // Set title of the current page
            document.title += " - " + search;
            if (!isFeaturedSearch) {
                document.getElementById("search-indicator").innerHTML = `
                <a onclick="window.history.back()" class="btn btn-link text-decoration-none ps-0">
                <i class="fa fa-angle-left fs-3"></i>
                </a>Search results for "${search}"`;
            } else {
                const brandBanner = `
                <div class="main-banner text-white shadow bg-white text-center">
                    <img alt="${search} logo" 
                    src="../media/images/featured/${urlParam.get('featuredImage')}"
                    style="
                        height: 50vw;
                        max-height: 336px;
                        object-fit: cover;
                        margin: auto;
                    ">
                </div>`;

                const nav = document.querySelector("nav");
                nav.insertAdjacentHTML("afterend", brandBanner);
                document.getElementById("search-indicator").innerHTML = `
                <a onclick="window.history.back()" class="btn btn-link text-decoration-none ps-0">
                <i class="fa fa-angle-left fs-3"></i>
                </a>${search} Products`;
            }

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
            if (!isFeaturedSearch) {
                document.getElementById("search-indicator").insertAdjacentHTML('afterend',
                    `<span>${products.length} products found.</span>`);
            }

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
     * Calculates the total price of items in the cart, including shipping costs.
     * Fetches the current shipping cost from the server, sums the prices of all products in the cart,
     * and updates the UI with the shipping and total price.
     *
     * @async
     * @function calculatePrices
     * @returns {Promise<Object>} A promise that resolves to an object containing the formatted prices:
     *    - shipping: A string representing the shipping cost, either 'Free' or a formatted price.
     *    - cart: A string representing the total price of the products in the cart.
     *    - total: A string representing the total price, including both products and shipping cost.
     * 
     */
    async function calculatePrices() {
        // Fetch current shipping costs
        const shippingPriceRequest = await fetch(`/tttransaction/shipping`);
        const shippingPriceData = await shippingPriceRequest.json();
        const shippingPrice = parseFloat(shippingPriceData.current_shipping_cost);
        let cartPrice = 0.0;
        products.forEach(product => {
            cartPrice += parseFloat(product.price);
        });
        const prices = {
            'shipping': shippingPrice == 0 ? 'Free' : shippingPrice.toFixed(2).replace(".", ","),
            'cart': cartPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'total': (cartPrice + shippingPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        document.getElementById('shipping-price').innerHTML = `€${prices.shipping}`;
        document.getElementById('total-price').innerHTML = `€${prices.total}`;
        return prices;
    }

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
                await calculatePrices();
            } else {
                const productContainer = document.getElementById('product-list');
                productContainer.innerHTML = `<div class="container my-4 pt-5">
                <p class="text-center fw-bold display-4">Nothing in your cart yet.</p>
                <p class="text-center">Time to go thrifting!<br><br>
                        <a href="/homepage" class="btn btn-primary">Shop now</a>
                </p>
                </div>`;
                document.getElementById('cart-section').parentElement.classList.add('justify-content-center');
                document.getElementById('payment-section').remove();
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
        const cartProducts = products.slice(start, end);

        let pCount = 1;
        cartProducts.forEach(product => {
            const productCard = `
            <div id="productid-${product.id}" class="w-100 d-flex card border-0 w-100 my-2 shadow flex-column mb-auto">
                <!-- Button to remove product from cart -->
                <div class="d-flex align-items-center flex-row">
                    <p class="px-3 mb-0 text-start text-secondary">${pCount++}</p>
                    <button class="btn-close btn-sm
                    p-3 ms-auto remove-product" 
                    aria-label="Close" data-product-id="${product.id}"></button>
                </div>
                <hr class="my-0 text-secondary">
                <div class="d-flex flex-row">
                    <img onclick='location.href="/product?is=${product.id}"'
                    alt="Product Image" src="../media/images/products/${product.images['1']}" 
                    class="card-img rounded-0 border-end p-2"
                    style="width: 25%; aspect-ratio: 1;
                    object-fit: contain;cursor: pointer;">
                    <div class="card-body overflow-hidden d-flex flex-column">
                        <a class="mb-2 text-truncate text-decoration-none link-opacity-75-hover fs-5"
                        href="/product?is=${product.id}">${product.name} <i class="fa fa-angle-right" 
                        style="vertical-align: text-bottom;"></i></a>
                        <p class="badge mb-2 d-flex ${product.product_condition === 'Like New' ? 'bg-success' :
                    product.product_condition === 'Excellent' ? 'bg-primary' : 'bg-dark'
                }" style="width: fit-content;font-size: small;">
                    ${product.product_condition}</p> 
                        <p class="card-text fw-bold fs-5">€${product.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                    </div>
                </div>
            </div>`;

            productContainer.innerHTML += productCard;
        });

        // Event listeners for button to remove products from the cart
        document.querySelectorAll('.remove-product').forEach(button => {
            button.addEventListener('click', async function () {
                const productId = button.getAttribute('data-product-id');

                // Remove the product ID from the cart in localStorage
                let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
                cartProducts = cartProducts.filter(id => id != productId);
                products = products.filter(p => p.id != productId);
                localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

                // Remove the product card from the interface
                const productCard = document.getElementById(`productid-${productId}`);
                productCard.remove();
                await calculatePrices();
                renderCartProducts();
                if (JSON.parse(localStorage.getItem('cartProducts')).length == 0) {
                    const productContainer = document.getElementById('product-list');
                    productContainer.innerHTML = `<div class="container my-4 pt-5">
            <p class="text-center fw-bold display-4">Nothing in your cart yet.</p>
            <p class="text-center">Time to go thrifting!<br><br>
                    <a href="/homepage" class="btn btn-primary">Shop now</a>
            </p>
            </div>`;
                    document.getElementById('cart-section').parentElement.classList.add('justify-content-center');
                    document.getElementById('payment-section').remove();
                }
            });
        });
    }

    window.fetchCartProducts = fetchCartProducts;
}