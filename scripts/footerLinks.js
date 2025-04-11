document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.footer-modal-link').forEach(link => {
        link.addEventListener('click', function (e) {
            console.log("Modal link clicked");

            e.preventDefault();

            const title = this.getAttribute('data-title') || 'Info';
            const content = this.getAttribute('data-content') || '';

            let modal = document.getElementById('footer-info-modal');

            if (!modal) {
                modal = document.createElement("div");
                modal.id = "footer-info-modal";
                modal.style.position = "fixed";
                modal.style.top = "0";
                modal.style.left = "0";
                modal.style.width = "100vw";
                modal.style.height = "100vh";
                modal.style.background = "rgba(0, 0, 0, 0.8)";
                modal.style.display = "flex";
                modal.style.justifyContent = "center";
                modal.style.alignItems = "center";
                modal.style.zIndex = "9999";

                modal.innerHTML = `
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 rounded" style="background: white; padding: 2rem; max-width: 600px; position: relative;">
                            <button type="button" class="btn-close position-absolute top-0 end-0 pt-4 pb-2" style="padding-right: 25px;" aria-label="Close"></button>
                            <h5 class="mb-3" id="modal-title" style="font-size: 1.5rem; font-weight: bold; text-align: left;"></h5>
                            <p id="modal-content" class="text-start"></p>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                modal.querySelector(".btn-close").addEventListener("click", () => modal.remove());
                modal.addEventListener("click", (event) => {
                    if (event.target === modal) {
                        modal.remove();
                    }
                });
            }

            modal.querySelector("#modal-title").innerHTML = title;
            modal.querySelector("#modal-content").innerHTML = content;

            // Append to DOM again in case it was removed before
            document.body.appendChild(modal);
        });
    });
});
