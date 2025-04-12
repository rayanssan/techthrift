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
  
    // Create modal dialog
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Wishlist</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="shadow modal-body">
            Wishlist
          </div>
        </div>
      </div>
    `;
  
    // Append modal to body
    document.body.appendChild(modal);
  
    // Initialize and show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  });