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
                <div class="card w-100 my-2 shadow h-100">
                    <a href="product?id=${product.id}" class="product-link">
                        <img alt="Product Image" src="../media/images/products/${product.image}" class="card-img-top">
                    </a>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title text-truncate">${product.name}</h6>
                        <p class="card-text fw-bold">€${product.price.
                            replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
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

            const response = await fetch(`/tt/product/${id}`);
            const product = await response.json();
            console.log(product);

            const productContainer = document.getElementById('product-info');

            // Technical Specifications: Only include non-null values
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
                    <a href="/homepage" class="btn btn-primary mb-3 btn-sm me-2">Back to Homepage</a>
                    <div class="row">
                        <!-- Left side: Image Carousel -->
                        <div class="col-lg-4 col-md-5 col-12">
                            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                                <div class="carousel-inner shadow border rounded">
                                    ${Object.entries(product.images)
                                    .sort(([a], [b]) => a - b) // Sort images by order
                                    .map(([order, image], index) => `
                                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                            <img src="../media/images/products/${image}" alt="Product Image ${order}" 
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
                                        style="cursor:pointer;" 
                                        onclick="document.querySelector(
                                        '#productCarousel .carousel-item.active').classList.remove('active'); 
                                                document.querySelector(
                                                '#productCarousel .carousel-item:nth-child(${index + 1})').
                                                classList.add('active');">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Right side: Product Info -->
                        <div class="col-lg-8 col-md-7 col-12">
                            <h2>${product.name}</h2>
                            <p class="fw-bold">€${product.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                            <p>${product.description}</p>
                            <!-- Product condition -->
                            <p class="mb-0 d-flex align-items-center gap-1">
                                <strong>Condition:</strong> <span class="badge ${
                                product.product_condition === 'Like New' ? 'bg-success' : 
                                product.product_condition === 'Excellent' ? 'bg-primary' : 'bg-dark'
                                } fs-6">${product.product_condition} </span>
                            </p>
                            <div class="d-flex align-items-end pt-3 px-0 pb-0">
                                <a href="#!" class="btn btn-primary me-2 shadow">Add to cart</a>
                                <a href="#!" class="btn btn-light border icon-hover shadow">
                                    <i class="fas fa-heart fa-lg text-secondary px-1"></i>
                                </a>
                            </div>
                            ${technicalSpecsSection}
                            <!-- Date added -->
                            <p><strong>Uploaded on:</strong> ${
                                new Date(product.date_inserted).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            `;
            productContainer.innerHTML += productInfo;
        } catch (error) {
            console.log("Error fetching product:", error);
            const productContainer = document.getElementById('product-info');
            productContainer.innerHTML = `<div class="container my-4">
                <a href="/homepage" class="btn btn-primary mb-3 btn-sm me-2">Back to Homepage</a>
                <p class="text-center fw-bold display-4">Sorry, this page does not exist anymore. ☹️</p>
            </div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', fetchOneSellingProduct);
}