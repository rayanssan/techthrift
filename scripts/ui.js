"use strict";

/**
 * Displays a Bootstrap modal with a message and a title.
 * 
 * @function showMessage
 * @param {string} title - The title to be displayed on the modal header.
 * @param {string} message - The main content or message to display inside the modal body.
 * @param {string} type - The Bootstrap contextual class to style the modal (e.g., 'success', 'danger', 'warning').
 */
function showMessage(title, message, type) {
    const modalId = 'responseModal';

    // Create modal HTML dynamically
    const modalHtml = `
          <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body text-${type}">
                          ${message}
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-${type}" data-bs-dismiss="modal">Close</button>
                      </div>
                  </div>
              </div>
          </div>
        `;

    // Insert modal into the body if not already present
    let existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();  // Remove the old modal if it exists
    }

    // Append new modal HTML to the body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show the modal using Bootstrap's modal API
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
        document.getElementById(modalId).remove();
    });
}

/**
 * Displays a confirmation dialog using Bootstrap modal and returns a Promise that resolves
 * to `true` if the user confirms, or `false` if the user cancels.
 * 
 * @function showDialog
 * @param {string} title - The title of the confirmation modal.
 * @param {string} message - The message to display in the modal body.
 * @param {string} [confirmText='Yes'] - Text for the confirm button.
 * @param {string} [cancelText='No'] - Text for the cancel button.
 * @returns {Promise<boolean>} - A Promise that resolves to true if confirmed, false otherwise.
 */
function showDialog(title, message, confirmText = 'Yes', cancelText = 'No') {
    const modalId = 'confirmDialogModal';

    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                        <button type="button" class="btn btn-danger" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    return new Promise((resolve) => {
        let existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);

        modalEl.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'confirm') {
                resolve(true);
                modal.hide();
            } else if (e.target.dataset.action === 'cancel') {
                resolve(false);
                modal.hide();
            }
        });

        modalEl.addEventListener('hidden.bs.modal', () => {
            modalEl.remove();
        });

        modal.show();
    });
}
