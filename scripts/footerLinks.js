"use strict";

document.addEventListener('DOMContentLoaded', function () {
    // Create the modal
    let modalEl = document.getElementById('footer-info-modal');
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.className = "modal fade";
      modalEl.id = "footer-info-modal";
      modalEl.tabIndex = -1;
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 rounded bg-white p-4 position-relative" style="max-width: 600px;">
            <button type="button" class="btn-close position-absolute top-0 end-0 mt-3 me-3" data-bs-dismiss="modal" aria-label="Close"></button>
            <h5 class="mb-3" id="modal-title" style="font-size: 1.5rem; font-weight: bold;"></h5>
            <p id="modal-content" class="text-start mb-0"></p>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }
  
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
  
    document.querySelectorAll(['.footer-modal-link', '.learn-more-button']).forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const title = this.getAttribute('data-title') || 'Info';
        const content = this.getAttribute('data-content') || '';
  
        modalEl.querySelector("#modal-title").textContent = title;
        modalEl.querySelector("#modal-content").innerHTML = content;
  
        bsModal.show();
      });
    });
  });
  