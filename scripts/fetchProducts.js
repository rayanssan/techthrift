"use strict";

// Load many products if in the homepage
if (document.body.id === "homepage") {
    // Initial settings for product pagination
    let currentPage = 1;
    const productsPerPage = 12;
    let products = [];

    /**
     * Fetches products that are being sold from the TechThrift Dabatase, using the API, 
     * and dynamically renders them in the product list.
     * 
     * This function makes an asynchronous request to the `/tt` endpoint to retrieve product 
     * that are available for sale.
     * It then populates the product container with product cards, including images, names, prices,
     * and buttons for adding to cart or adding to favorites.
     *
     * @async
     * @function fetchProducts
     * @returns {Promise<void>} Resolves when the products are successfully fetched and rendered.
     * @throws {Error} Logs an error to the console if the API request fails.
     */
    async function fetchSellingProducts() {
        try {
            const response = await fetch('/tt');
            products = await response.json();
            renderProducts();
        } catch (error) {
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = `<div class="container my-4">
            <p class="text-center fw-bold display-4">Sorry, an error happened. ☹️</p>
            <p class="text-center">Please try refreshing the page.</p>
            </div>`;
            document.getElementById("paginationControls").remove();
            console.error('Error fetching products:', error);
        }
    }

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
            <div id="productid-${product.id}" class="col-lg-3 col-md-6 col-sm-6 d-flex mb-auto">
                <div class="card w-100 my-2 shadow-sm h-100">
                    <a href="product?id=${product.id}" class="product-link">
                        <img alt="Product Image" src="${product.image_url}" class="card-img-top">
                    </a>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title text-truncate">${product.name}</h6>
                        <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
                        <div class="d-flex align-items-end pt-3 px-0 pb-0">
                            <a href="#!" class="btn btn-primary btn-sm me-2">Add to cart</a>
                            <a href="#!" class="btn btn-light border btn-sm icon-hover">
                                <i class="fas fa-heart fa-lg text-secondary px-1"></i>
                            </a>
                        </div>
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
            const id = urlParams.get('id');

            const response = await fetch(`/tt/product/${id}?saleProducts=true`);
            const product = await response.json();
            product.images = ["ex1", "ex2", "ex3", "ex4", "ex5"];

            const productContainer = document.getElementById('product-info');

            const productInfo = `
                <div class="container my-4">
                    <a href="/homepage" class="btn btn-primary mb-3 btn-sm me-2">Back to Homepage</a>
                    <div class="row">
                        <!-- Left side: Images Grid -->
                        <div class="col-lg-4 col-md-5 col-12">
                            <div class="row">
                                ${product.images.map((image, index) => `
                                    <div class="col-4 mb-2">
                                        <img src="${image}" alt="Product Image ${index + 1}" class="img-fluid w-100" />
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Right side: Product Info -->
                        <div class="col-lg-8 col-md-7 col-12">
                            <h2>${product.name}</h2>
                            <p class="fw-bold">$${product.price.toFixed(2)}</p>
                            <p>${product.description}</p>
                            <div class="d-flex align-items-end pt-3 px-0 pb-0">
                                <a href="#!" class="btn btn-primary me-2">Add to cart</a>
                                <a href="#!" class="btn btn-light border icon-hover">
                                    <i class="fas fa-heart fa-lg text-secondary px-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productContainer.innerHTML += productInfo;
        } catch (error) {
            const productContainer = document.getElementById('product-info');
            productContainer.innerHTML = `<div class="container my-4">
                <a href="/homepage" class="btn btn-primary mb-3 btn-sm me-2">Back to Homepage</a>
                <p class="text-center fw-bold display-4">Sorry, this page does not exist anymore. ☹️</p>
            </div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', fetchOneSellingProduct);
}