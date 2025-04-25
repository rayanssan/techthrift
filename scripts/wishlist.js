"use strict";

window.addEventListener('userAuthenticated', (event) => {
  const loggedInUser = event.detail;
  if (loggedInUser == null) {
    document.getElementById('alerts-section').innerHTML = `
    <p class="text-center text-muted mt-3">No product alerts have been created.</p>`;
    return;
  }

  /**
   * Fetches matching products from the `/tt` endpoint based on the provided product alert criteria.
   *
   * Converts the `watchData` object into query parameters for the backend product search.
   * Fields such as `condition`, `year`, and `maxPrice` are included only if present.
   *
   * @async
   * @function getProductAlertResults
   * @param {Object} watchData - The user-defined alert data containing product preferences.
   * @param {string} [watchData.product_model] - Name or model of the product to watch.
   * @param {string} [watchData.product_condition] - Desired condition (e.g., "Like New", "Excellent").
   * @param {string} [watchData.category] - Product category (e.g., "Smartphones").
   * @param {string} [watchData.brand] - Brand of the product (e.g., "Apple").
   * @param {string} [watchData.processor] - Processor type (e.g., "A13 Bionic").
   * @param {string} [watchData.color] - Preferred product color.
   * @param {string} [watchData.screen] - Screen type or size.
   * @param {string} [watchData.storage] - Storage capacity (e.g., "128GB").
   * @param {string} [watchData.os] - Operating system (e.g., "Android").
   * @param {string|number} [watchData.year] - Manufacturing year of the product.
   * @param {string|number} [watchData.max_price] - Maximum acceptable price.
   * @returns {Promise<Object[]>} - A promise that resolves to an array of matching product objects.
   */
  async function getProductAlertResults(watchData) {
    // Handle product alert creation
    const alertCriteria = {
      name: watchData.product_model,
      condition: watchData.product_condition ? watchData.product_condition : "",
      category: watchData.category,
      brand: watchData.brand,
      processor: watchData.processor,
      color: watchData.color,
      screen: watchData.screen,
      storage: watchData.storage,
      os: watchData.os,
      year: watchData.year ? watchData.year : "",
      maxPrice: watchData.max_price ? watchData.max_price : "",
    };
    console.log(alertCriteria);

    const productsResponse = await fetch(`/tt?${new URLSearchParams(alertCriteria)}`);
    return await productsResponse.json();
  }

  document.getElementById("create-palert-button").addEventListener("click", () => {
    // Remove any existing modal
    const existingModal = document.getElementById("productAlertFormModal");
    if (existingModal) existingModal.remove();

    // Create modal wrapper
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "productAlertFormModal";
    modal.tabIndex = -1;
    modal.setAttribute("aria-hidden", "true");

    // Modal content
    modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create a Product Alert</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h6>Add a Product Alert</h6>
          <p>Enter the details of a product you're looking for. We will notify you if it becomes available.</p>
          <form id="product-alert-form">
            <div class="row g-3">
              <!-- Brand -->
              <div class="col-md-6">
                <label for="watchBrand" class="form-label">Brand</label>
                <input list="brandOptions" class="form-control" id="watchBrand" name="brand" required
                placeholder="e.g. Apple">
                <datalist id="brandOptions">
                  <option value="Apple">
                  <option value="Samsung">
                  <option value="Dell">
                  <option value="HP">
                  <option value="Lenovo">
                  <option value="ASUS">
                  <option value="Sony">
                  <option value="Microsoft">
                  <option value="Google">
                  <option value="LG">
                  <option value="Canon">
                  <option value="Nikon">
                  <option value="Xiaomi">
                  <option value="Huawei">
                  <option value="Acer">
                  <option value="Razer">
                  <option value="Bose">
                  <option value="JBL">
                  <option value="OnePlus">
                  <option value="Garmin">
                  <option value="GoPro">
                </datalist>
              </div>

              <!-- Condition -->
              <div class="col-md-6">
                <label for="watchCondition" class="form-label">Condition</label>
                <select class="form-select" id="watchCondition" name="product_condition">
                  <option value="" selected>Any Condition</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                </select>
              </div>

              <!-- Product Model -->
              <div class="col-md-6">
                <label for="productNameOrModel" class="form-label">Product Model</label>
                <input type="text" class="form-control" id="productModel" 
                name="product_model" placeholder="e.g. Galaxy S21" required>
              </div>

              <!-- Maximum Price -->
              <div class="col-md-6">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="maxPrice" class="form-label mb-0">Maximum Price</label>
                  <div class="form-check mb-0">
                    <input class="form-check-input" type="checkbox" id="noLimitCheckbox" onchange="
                      const priceInput = document.getElementById('maxPrice');
                      if (this.checked) {
                        priceInput.disabled = true;
                        priceInput.removeAttribute('required');
                        priceInput.value = '';
                      } else {
                        priceInput.disabled = false;
                        priceInput.setAttribute('required', 'required');
                      }
                    ">
                    <label class="form-check-label" for="noLimitCheckbox">No limit</label>
                  </div>
                </div>
                <div class="input-group">
                  <span class="input-group-text">€</span>
                  <input type="number" class="form-control" 
                  id="maxPrice" name="max_price" min="1" required placeholder="e.g. 500">
                </div>
              </div>

              <!-- Color -->
              <div class="col-md-6">
                  <label for="watchColor" class="form-label">Color</label>
                  <input type="text" class="form-control" id="watchColor" name="color"
                      placeholder="e.g. Silver">
              </div>

              <!-- Year -->
              <div class="col-md-6">
                  <label for="watchYear" class="form-label">Year</label>
                  <input type="number" class="form-control" id="watchYear" name="year" min="1979"
                      max="${new Date().getFullYear()}" step="1" inputmode="numeric" pattern="[0-9]{4}"
                      oninput="this.value = this.value.slice(0, 4);"
                      onkeydown="return event.keyCode !== 69 && event.keyCode !== 190 && 
                      event.keyCode !== 187 && event.keyCode !== 189;"
                      onpaste="return false;" placeholder="e.g. 2023">
              </div>

              <!-- Category -->
              <div class="col-md-6 w-100">
                <label for="watchCategory" class="form-label">Category</label>
                <select class="form-select" id="watchCategory" name="category" required>
                  <option selected disabled value="">Select a category</option>
                </select>
              </div>
            </div>

            <!-- Category-Specific Fields -->
            <div id="categorySpecificFields" class="row g-3 mt-1">
              <!-- Processor -->
              <div class="col-md-6 conditional-field" data-categories="Smartphones,Laptops & PCs,Tablets">
                <label for="watchProcessor" class="form-label">Processor</label>
                <input type="text" class="form-control" id="watchProcessor" name="processor"
                placeholder="e.g. Apple A15, Intel i5">
              </div>

              <!-- Screen -->
              <div class="col-md-6 conditional-field"
                data-categories="TVs & Monitors,Smartphones,Laptops & PCs,Tablets">
                <label for="watchScreen" class="form-label">Screen Size</label>
                <input type="text" class="form-control" id="watchScreen" name="screen"
                placeholder="e.g. 6.1&quot;, 15.6&quot;">
              </div>

              <!-- RAM -->
              <div class="col-md-6 conditional-field" data-categories="Smartphones,Laptops & PCs,Tablets">
                <label for="watchRAM" class="form-label">RAM (GB)</label>
                <input type="number" class="form-control" id="watchRAM" name="ram_memory" min="1" max="256"
                placeholder="e.g. 16">
              </div>

              <!-- Graphics Card -->
              <div class="col-md-6 conditional-field" data-categories="Laptops & PCs">
                <label for="watchGraphics" class="form-label">Graphics Card</label>
                <input type="text" class="form-control" id="watchGraphics" name="graphics_card"
                placeholder="e.g. NVIDIA RTX 3060">
              </div>

              <!-- Storage -->
              <div class="col-md-6 conditional-field"
                data-categories="Smartphones,Laptops & PCs,Tablets,Gaming">
                <label for="watchStorage" class="form-label">Storage</label>
                <div class="input-group">
                  <input type="number" class="form-control" id="watchStorage" name="storage" min="1"
                  max="999" placeholder="e.g. 256">
                  <select class="form-select" id="storageUnit"
                  onchange="document.getElementById('watchStorage').placeholder = this.value === 'TB' ? 'e.g. 1' : 'e.g. 256'">
                    <option value="GB" selected>GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
              </div>

              <!-- Operating System -->
              <div class="col-md-6 conditional-field" data-categories="Smartphones,Laptops & PCs,Tablets">
                  <label for="watchOS" class="form-label">Operating System</label>
                  <input list="osOptions" class="form-control" id="watchOS" name="os"
                  placeholder="e.g. Android, Windows">
                  <datalist id="osOptions">
                    <option value="Android">
                    <option value="Windows">
                    <option value="Linux">
                  </datalist>
              </div>
            </div>

            <!-- Submit -->
            <div class="mt-3 d-grid">
              <button type="submit" class="btn btn-success" disabled>Create Product Alert</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;

    // Append modal to body
    document.body.appendChild(modal);

    fetch('/tt/categories')
      .then(res => res.json())
      .then(categories => {
        const order = [
          "Home", "Smartphones", "Laptops & PCs", "Gaming", "TVs & Monitors",
          "Audio", "Tablets", "Cameras", "Smartwatches",
          "Accessories", "Home Appliances", "Other"
        ];
        // Sort
        categories.sort((a, b) => {
          const indexA = order.indexOf(a.category);
          const indexB = order.indexOf(b.category);
          return indexA - indexB;
        });
        document.getElementById("watchCategory").innerHTML = `
      <option selected disabled value="">Select a category</option>
      ${categories.map(c => `<option value="${c.category}">${c.category}</option>`).join('')}
    `;
      })
      .catch(err => {
        console.error("Failed to load categories:", err);
      });

    document.getElementById("watchCategory").addEventListener("change", function (e) {
      if (e.target && e.target.id === "watchCategory") {
        const selected = e.target.value;
        document.querySelectorAll(".conditional-field").forEach(field => {
          const categories = field.dataset.categories.split(",");
          field.style.display = categories.includes(selected) ? "block" : "none";
        });
      }
    });

    // Hide OS field if brand is Apple
    document.querySelector("#watchBrand").addEventListener("change", function (e) {
      if (document.querySelector("#watchBrand").value.toLowerCase() == "apple") {
        document.querySelector("#watchOS").parentElement.classList.add("d-none");
        document.querySelector("#watchOS").value = "";
      } else {
        document.querySelector("#watchOS").parentElement.classList.remove("d-none");
      }
    });

    // Trigger once
    const changeCategoryEvent = new Event("change");
    document.getElementById("watchCategory").dispatchEvent(changeCategoryEvent);

    // Initialize and show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Listen for changes in the form to enable/disable submit button when needed
    document.getElementById("product-alert-form").addEventListener("change", () => {
      const form = document.getElementById("product-alert-form");
      const requiredFields = form.querySelectorAll("[required]");
      const submitButton = form.querySelector("button[type='submit']");

      let allFilled = true;
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          allFilled = false;
        }
      });

      submitButton.disabled = !allFilled;
    });

    // Handle new product alert form submission
    document.getElementById("product-alert-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const watchData = Object.fromEntries(formData.entries());

      if (watchData.storage) {
        watchData.storage = `${watchData.storage} ${document.querySelector("#storageUnit").value}`;
      }
      if (watchData.ram_memory) {
        watchData.ram_memory += " GB";
      }
      if (!watchData.product_condition) {
        watchData.product_condition = null;
      }

      // Add interested_user from logged-in user object
      watchData.interested_user = loggedInUser.email;

      try {
        const response = await fetch('/ttuser/interest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(watchData)
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Unknown error');
        }

        // Handle product alert creation
        const products = await getProductAlertResults(watchData);
        
        let modalContent = `
        <div class="modal-header">
          <h5 class="modal-title">Product alert created!</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">`;
        if (products.length > 0) {
          modalContent += `
          <p>We already found ${products.length} product${products.length > 1 ? 's' : ''} matching your alert:</p>
          <div class="mt-3 border rounded overflow-auto">`;
          products.forEach(product => {
            modalContent += `
              <div onclick="window.location.href = 'product?is=${product.id}';" class="card rounded-0 border-0 border-bottom">
                <div class="d-flex align-items-center gap-3 p-0 card-body">
                  <img src="../media/images/products/${product.image}" alt="${product.name}" 
                  class="card-img p-3 border-end rounded-0 product-image"
                  style="
                  max-width: 200px;
                  aspect-ratio: 1;
                  object-fit: contain;
                  cursor: pointer;
                  ">
                  <div class="ml-3">
                    <h5
                    style="cursor: pointer;" class="btn-link text-decoration-none mt-3"
                    >${product.name} <i class="fa fa-angle-right"></i></h5>
                    <p class="mb-2">${product.category}</p>
                    <p><strong>Price:</strong> €${product.price}</p>
                  </div>
                </div>
              </div>`;
          });
          modalContent += `</div>`;
        } else {
          modalContent += `<p class="mt-3">We will alert you when a matching product becomes available.</p>`;
        }
        modalContent += `</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-success" data-bs-dismiss="modal">Close</button>
        </div>`;

        // Show the modal with the content
        document.querySelector('#productAlertFormModal .modal-content').innerHTML = modalContent;
        fetchProductAlerts();
      } catch (err) {
        console.error("Error creating product alert:", err.message);
        showMessage('Error', 'Failed to create product alert. Please try again.', 'danger');
      }
    });
  });

  const fetchWishlist = () => {
    fetch(`/ttuser/wishlist/${loggedInUser.email}`).then(res => res.json())
      .then(wishlist => {
        const wishlistSection = document.getElementById('wishlist-section');
        if (wishlist.length === 0) {
          wishlistSection.innerHTML = `
        <p class="text-center text-muted mt-3">No items have been added to your wishlist.</p>`;
          return;
        }
        // Sort wishlist by date_inserted (most recent first)
        wishlist.sort((a, b) => new Date(b.date_inserted) - new Date(a.date_inserted));

        document.querySelector('.wishlist-text').classList.add("d-none");
        wishlistSection.innerHTML = ``;
        wishlist.forEach(item => {
          fetch(`/ttuser/wishlist/count/${item.product_id}`)
            .then(res => res.json())
            .then(data => {
              const wishlistedProductCount = data.count || 0;

              const productHTML = `
              <div class="wishlist-item card rounded-0 border-0 border-bottom" id="wishlist-item-${item.id}">
                  <div class="d-flex align-items-center gap-3 p-0 card-body">
                      <img src="../media/images/products/${item.product_image}" alt="${item.product_name}" 
                      onclick="window.location.href = 'product?is=${item.product_id}';"
                      class="card-img p-3 border-end rounded-0 product-image"
                      style="
                      max-width: 200px;
                      aspect-ratio: 1;
                      object-fit: contain;
                      cursor: pointer;
                      ">
                      <div class="ml-3">
                          <h5 onclick="window.location.href = 'product?is=${item.product_id}';"
                          style="cursor: pointer;" class="btn-link text-decoration-none mt-3"
                          >${item.product_name} <i class="fa fa-angle-right"></i></h5>
                          <p class="mb-2">${item.category}</p>
                          <p><strong>Price:</strong> €${item.price}</p>
                          ${localStorage.getItem('cartProducts') &&
                  JSON.parse(localStorage.getItem('cartProducts')).includes(item.product_id) ?
                  `<a class="btn btn-success me-2 shadow disabled add-to-cart-button"
                          data-product-id="${item.product_id}">In your cart</a>` :
                  `<a class="btn btn-primary me-2 shadow add-to-cart-button"
                          data-product-id="${item.product_id}">Add to cart</a>`}
                          <button class="btn btn-danger btn-sm remove-from-wishlist" 
                          data-product-id="${item.product_id}" data-wishlist-entry-id="${item.id}">
                            Remove
                          </button>
                          <p class="mt-3"><i>${wishlistedProductCount == 1 ? `${wishlistedProductCount} person has` :
                  `${wishlistedProductCount} people have`} this item in their wishlist.</i></p>
                      </div>
                  </div>
              </div>`;
              wishlistSection.insertAdjacentHTML('beforeend', productHTML);

              // Add event listener for "Add to cart" button
              document.querySelector(`#wishlist-item-${item.id} .add-to-cart-button`)?.addEventListener('click', function () {
                // Get the current cart products from localStorage (initialize as an empty array if not set)
                let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
                const productId = parseInt(this.getAttribute("data-product-id"));
                // Add the current product's id to the cart array if not already in the cart
                if (!cartProducts.includes(productId)) {
                  cartProducts.push(productId);
                  localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
                }

                this.textContent = "In your cart";
                this.classList.replace("btn-primary", "btn-success");
                this.classList.add("disabled");
                window.location.href = "/cart";
              });

              // Add event listeners for removing products from wishlist
              document.querySelector(`#wishlist-item-${item.id} .remove-from-wishlist`)?.addEventListener('click', function () {
                const wishlistEntryId = this.getAttribute('data-wishlist-entry-id');

                fetch(`/ttuser/wishlist/remove/${wishlistEntryId}`, {
                  method: 'DELETE'
                }).then(response => {
                  if (response.ok) {
                    // Remove the product from the UI
                    const wishlistItem = document.getElementById(`wishlist-item-${wishlistEntryId}`);
                    wishlistItem.remove();
                    if (wishlistSection.innerHTML.trim() == "") {
                      wishlistSection.innerHTML = `
                      <p class="text-center text-muted mt-3">No items have been added to your wishlist.</p>`;
                      document.querySelector('.wishlist-text').classList.remove("d-none");
                    }
                  } else {
                    throw new Error('Failed to remove product from wishlist');
                  }
                })
                  .catch(err => {
                    console.error(err);
                    alert('Failed to remove product from wishlist');
                  });
              });
            })
            .catch(err => {
              console.error("Error fetching wishlist count:", err);
            });
        });
      })
      .catch(err => {
        console.error(err);
        const wishlistSection = document.getElementById('wishlist-section');
        wishlistSection.innerHTML = `
        <p class="text-center text-muted mt-3">Error loading wishlist. Please try again later.</p>`;
      });
  }
  fetchWishlist();

  const fetchProductAlerts = () => {
    fetch(`/ttuser/interest/${loggedInUser.email}`).then(res => res.json())
      .then(alertsList => {
        const alertsSection = document.getElementById('alerts-section');
        if (alertsList.length === 0) {
          alertsSection.innerHTML = `
        <p class="text-center text-muted mt-3">No product alerts have been created.</p>`;
          return;
        }
        document.querySelector('.alerts-text').innerHTML =
          `<i>We will notify you when products matching your alerts become available.</i>`;
        alertsSection.innerHTML = ``;

        alertsList.forEach(item => {
          const fieldMap = {
            category: "Category",
            color: "Color",
            graphics_card: "Graphics Card",
            os: "Operating System",
            processor: "Processor",
            ram_memory: "RAM",
            screen: "Screen Size",
            storage: "Storage",
            product_condition: "Condition",
            date_inserted: "Alert created in"
          };

          /**
           * Converts an ISO date string into a human-readable localized date and time format.
           *
           * @function formatDate
           * @param {string} isoString - A date string in ISO 8601 format (e.g., "2025-04-20T14:30:00Z").
           * @returns {string} - A formatted date string based on the user's locale, including year, 
           * month (long), day, hour, and minute.
           */
          function formatDate(isoString) {
            const date = new Date(isoString);
            return date.toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }

          const itemDetails = Object.entries(item)
            .filter(([key, value]) => key !== "id" && key !== "interested_user"
              && key !== "brand"
              && key !== "product_model"
              && key !== "category"
              && key !== "max_price"
              && key !== "allKeys" && value)
            .map(([key, value]) => {
              const displayKey = fieldMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const displayValue = key === 'date_inserted' ? formatDate(value) : value;
              return `<li><strong>${displayKey}:</strong> ${displayValue}</li>`;
            })
            .join("");

          // Create the card element
          const card = document.createElement('div');
          card.className = 'card rounded-0 border-0 border-bottom';
          card.innerHTML = `
          <div class="card-body">
            <h5 class="card-text"><strong>Alert for:</strong> <i>${item.product_model || 'N/A'}</i></h5>
            <h6 class="card-text"><strong>Brand:</strong> ${item.brand || 'N/A'}</h6>
            <h6 class="card-text"><strong>Category:</strong> ${item.category || 'N/A'}</h6>
            <h6 class="card-text"><strong>Maximum Price:</strong> 
            ${item.max_price ? "€" + item.max_price : 'No Limit'}</h6>
            <button class="mb-2 btn btn-primary btn-sm see-matches-btn">See current matches</button>
            <details class="border rounded py-2 px-3">
              <summary class="btn-link text-decoration-none">See more details</summary>
              <ul class="my-2">
                ${itemDetails}
              </ul>
              <button class="ms-3 mb-2 btn btn-danger btn-sm">Delete Product Alert</button>
            </details>
          </div>`;

          // Append to alerts section
          alertsSection.appendChild(card);

          card.querySelector('.see-matches-btn').addEventListener("click", async () => {
            const products = await getProductAlertResults(item);

            // Create modal container
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'dynamicMatchModal';
            modal.tabIndex = -1;
            modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Product Alert Matches</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  ${products.length > 0 ? `
                    <p>We found ${products.length} product${products.length > 1 ? 's' : ''} matching your alert:</p>
                    <div class="mt-3 border rounded overflow-auto">
                      ${products.map(product => `
                        <div onclick="window.location.href = 'product?is=${product.id}';" class="card rounded-0 border-0 border-bottom">
                          <div class="d-flex align-items-center gap-3 p-0 card-body">
                            <img src="../media/images/products/${product.image}" alt="${product.name}" 
                            class="card-img p-3 border-end rounded-0 product-image"
                            style="
                            max-width: 200px;
                            aspect-ratio: 1;
                            object-fit: contain;
                            cursor: pointer;
                            ">
                            <div class="ml-3">
                              <h5
                              style="cursor: pointer;" class="btn-link text-decoration-none mt-3"
                              >${product.name} <i class="fa fa-angle-right"></i></h5>
                              <p class="mb-2">${product.category}</p>
                              <p><strong>Price:</strong> €${product.price}</p>
                            </div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : `
                    <p class="mt-3">No matching products found. We will notify you when something becomes available!</p>
                  `}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-success" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>`;

            // Append modal to body
            document.body.appendChild(modal);

            // Initialize and show modal
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
          });

          // Attach event listener to this specific button
          const deleteBtn = card.querySelector('.btn-danger');
          deleteBtn.addEventListener("click", async () => {
            const confirmed = await showDialog(
              'Confirm Delete',
              `Are you sure you want to delete this product alert?`,
              'Delete',
              'Cancel'
            );

            if (confirmed) {
              fetch(`/ttuser/interest/remove/${item.id}`, {
                method: 'DELETE'
              })
                .then(response => {
                  if (response.ok) {
                    card.remove();
                    if (alertsSection.innerHTML.trim() == "") {
                      alertsSection.innerHTML = `
                  <p class="text-center text-muted mt-3">No product alerts have been created.</p>`;
                    }
                  }
                })
                .catch(error => {
                  console.error('Error:', error);
                  alert('Error removing product alert');
                });
            }
          });
        });
      });
  }

  fetchProductAlerts();
});

