"use strict";

document.getElementById("wishlist").addEventListener("click", () => {
  // Remove any existing modal
  const existingModal = document.getElementById("wishlistModal");
  if (existingModal) existingModal.remove();

  // Create modal wrapper
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "wishlistModal";
  modal.tabIndex = -1;
  modal.setAttribute("aria-hidden", "true");

  // Modal content
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Wishlist</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Wishlist Section -->
          <div class="mb-4 mt-2">
            <p>Your saved products and alerts will appear here.</p>
          </div>

          <hr>

          <!-- Watchlist Section -->
          <div>
            <h6>Add a Product Alert</h6>
            <p>Enter the details of a product you're looking for. We'll notify you if it's available.</p>
            <form id="watchlistForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="watchBrand" class="form-label">Brand</label>
                  <input list="brandOptions" class="form-control" id="watchBrand" name="brand" required placeholder="e.g. Apple">
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
                <div class="col-md-6">
                  <label for="watchCondition" class="form-label">Condition</label>
                  <select class="form-select" id="watchCondition" name="product_condition">
                    <option selected disabled>Select condition</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="watchColor" class="form-label">Color</label>
                  <input type="text" class="form-control" id="watchColor" name="color" placeholder="e.g. Silver">
                </div>
                <div class="col-md-6">
                  <label for="watchYear" class="form-label">Year</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="watchYear" 
                    name="year" 
                    min="1979" 
                    max="${new Date().getFullYear()}"
                    step="1" 
                    inputmode="numeric"
                    pattern="[0-9]{4}"
                    oninput="this.value = this.value.slice(0, 4);" 
                    onkeydown="return event.keyCode !== 69 && event.keyCode !== 190 && event.keyCode !== 187 && event.keyCode !== 189;" 
                    onpaste="return false;"
                    placeholder="e.g. 2023"
                  >
                </div>
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
                  <input type="text" class="form-control" id="watchProcessor" name="processor" placeholder="e.g. Apple A15, Intel i5">
                </div>

                <!-- Screen -->
                <div class="col-md-6 conditional-field" data-categories="TVs & Monitors,Smartphones,Laptops & PCs,Tablets">
                  <label for="watchScreen" class="form-label">Screen Size</label>
                  <input type="text" class="form-control" id="watchScreen" name="screen" placeholder="e.g. 6.1&quot;, 15.6&quot;">
                </div>

                <!-- RAM -->
                <div class="col-md-6 conditional-field" data-categories="Smartphones,Laptops & PCs,Tablets">
                  <label for="watchRAM" class="form-label">RAM (GB)</label>
                  <input type="number" class="form-control" id="watchRAM" name="ram_memory" min="1" max="1" placeholder="e.g. 16">
                </div>

                <!-- Graphics Card -->
                <div class="col-md-6 conditional-field" data-categories="Laptops & PCs">
                  <label for="watchGraphics" class="form-label">Graphics Card</label>
                  <input type="text" class="form-control" id="watchGraphics" name="graphics_card" placeholder="e.g. NVIDIA RTX 3060">
                </div>

                <!-- Storage -->
                <div class="col-md-6 conditional-field" data-categories="Smartphones,Laptops & PCs,Tablets,Gaming">
                  <label for="watchStorage" class="form-label">Storage</label>
                  <div class="input-group">
                    <input type="number" class="form-control" id="watchStorage" name="storage" min="1" max="999" placeholder="e.g. 256">
                    <select class="form-select" id="storageUnit" onchange="document.getElementById('watchStorage').placeholder = this.value === 'TB' ? 'e.g. 1' : 'e.g. 256'">
                      <option value="GB" selected>GB</option>
                      <option value="TB">TB</option>
                    </select>
                  </div>
                </div>

                <!-- Operating System -->
                <div class="col-md-6 conditional-field" data-categories="Smartphones,Laptops & PCs,Tablets">
                  <label for="watchOS" class="form-label">Operating System</label>
                  <input list="osOptions" class="form-control" id="watchOS" name="os" placeholder="e.g. Android, Windows">
                  <datalist id="osOptions">
                    <option value="Android">
                    <option value="iOS">
                    <option value="Windows">
                    <option value="macOS">
                    <option value="Linux">
                  </datalist>
                </div>

              </div>

              <div class="mt-3 d-grid">
                <button type="submit" class="btn btn-primary">Add to Wishlist</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

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
  const event = new Event("change");
  document.getElementById("watchCategory").dispatchEvent(event);

  // Initialize and show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Handle Watchlist form submission
  document.getElementById("watchlistForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const watchData = Object.fromEntries(formData.entries());

    console.log("Watchlist submitted:", watchData);

    // TODO: Send to backend API when implemented
    alert("Watchlist preferences have been save");
  });
});
