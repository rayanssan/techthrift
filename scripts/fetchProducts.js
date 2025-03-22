"use strict";

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
        const products = await response.json();

        const productContainer = document.getElementById('product-list');
        productContainer.innerHTML = ''; // Clear previous content

        products.forEach(product => {
            const productCard = `
                    <div class="col-lg-3 col-md-6 col-sm-6 d-flex mb-auto">
                        <div class="card w-100 my-2 shadow-sm h-100">
                            <img src="${product.image_url}" class="card-img-top" style="aspect-ratio: 1 / 1" />
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
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Load products when the page is loaded
document.addEventListener('DOMContentLoaded', fetchSellingProducts);