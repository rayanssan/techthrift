"use strict";

window.addEventListener('userAuthenticated', (event) => {
  const loggedInUser = event.detail;
  if (loggedInUser == null) {
    document.getElementById('alerts-section').innerHTML = `
    <p class="text-center text-muted mt-3">No product alerts have been created.</p>`;
    return;
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
          <div>
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
                    <option selected disabled>Select condition</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                  </select>
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
                      <option value="iOS">
                      <option value="Windows">
                      <option value="macOS">
                      <option value="Linux">
                    </datalist>
                </div>
              </div>

              <!-- Submit -->
              <div class="mt-3 d-grid">
                <button type="submit" class="btn btn-success">Create Product Alert</button>
              </div>
            </form>
          </div>
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

    // Trigger once
    const changeCategoryEvent = new Event("change");
    document.getElementById("watchCategory").dispatchEvent(changeCategoryEvent);

    // Initialize and show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Handle new product alert form submission
    document.getElementById("product-alert-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      console.log(formData);
      const watchData = Object.fromEntries(formData.entries());

      if (watchData.storage) {
        watchData.storage = `${watchData.storage} ${document.querySelector("#storageUnit").value}`;
      }
      if (watchData.ram_memory) {
        watchData.ram_memory += " GB";
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

        showMessage('Success', 'Product alert created!', 'success');
        fetchWishlist();
      } catch (err) {
        console.error("Error creating product alert:", err.message);
        showMessage('Error', 'Failed to create product alert. Please try again.', 'danger');
      }
    });
  });

  const fetchWishlist = () => {
    fetch(`/ttuser/interest/${loggedInUser.email}`).then(res => res.json())
    .then(alertsList => {
      if (alertsList.length === 0) {
        document.getElementById('alerts-section').innerHTML = `
        <p class="text-center text-muted mt-3">No product alerts have been created.</p>`;
        return;
      }
      const alertsSection = document.getElementById('alerts-section');
      document.querySelector('.alerts-text').innerHTML =
        `<i>We will notify you when products matching your alerts become available.</i>`
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
            && key !== "category"
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
          <h6 class="card-text"><strong>Brand:</strong> <i>${item.brand || 'N/A'}</i></h6>
          <h6 class="card-text"><strong>Category:</strong> ${item.category || 'N/A'}</h6>
          <details>
            <summary>See more details</summary>
            <ul class="my-2">
              ${itemDetails}
            </ul>
            <button class="ms-3 btn btn-danger btn-sm">Delete Product Alert</button>
          </details>
        </div>
        `;

        // Append to alerts section
        alertsSection.appendChild(card);

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
                if (document.getElementById('alerts-section').innerHTML == "") {
                  document.getElementById('alerts-section').innerHTML = `
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

  fetchWishlist();
});

