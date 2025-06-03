"use strict";

/**
 * Displays a Bootstrap modal with a message and a title, and returns a Promise
 * that resolves when the user closes the modal.
 * 
 * @async
 * @function showMessage
 * @param {string} title - The title to be displayed on the modal header.
 * @param {string} message - The main content or message to display inside the modal body.
 * @param {string} type - The Bootstrap contextual class to style the modal (e.g., 'success', 'danger', 'warning').
 * @returns {Promise<void>} - Resolves when the modal is closed.
 */
function showMessage(title, message, type) {
    const modalId = 'responseModal';

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

    // Remove existing modal if present
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Append the new modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Return a promise that resolves when the modal is hidden
    return new Promise((resolve) => {
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
            resolve();  // Resolve the promise here
        }, { once: true }); // Ensure the event listener fires only once
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

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const icon = document.getElementById('mode-icon');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        icon?.classList.replace('fa-moon', 'fa-sun');
    } else if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        icon?.classList.replace('fa-sun', 'fa-moon');
    } else {
        document.body.classList.remove('dark-mode', 'light-mode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            icon?.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon?.classList.replace('fa-sun', 'fa-moon');
        }
    }
});

document.getElementById('toggle-mode')?.addEventListener('click', function () {
    const icon = document.getElementById('mode-icon');

    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else if (document.body.classList.contains('light-mode')) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('light-mode');
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    }
});

