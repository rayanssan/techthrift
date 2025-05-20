// pagination.js
const PRODUCTS_PER_PAGE = 20;
let currentPage = 1;
let allProducts = [];
let tableBodyEl, paginationControlsEl;
let renderRowFn;

export function setupPagination(products, tableBodyId, paginationId, renderRowFunction) {
    allProducts = products;
    tableBodyEl = document.getElementById(tableBodyId);
    paginationControlsEl = document.getElementById(paginationId);
    renderRowFn = renderRowFunction;
    renderPage(1);
}

function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const currentItems = allProducts.slice(start, start + PRODUCTS_PER_PAGE);

    tableBodyEl.innerHTML = '';
    currentItems.forEach(product => {
        const row = renderRowFn(product);
        tableBodyEl.appendChild(row);
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
    paginationControlsEl.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link" onclick="window.__changePage(${i})">${i}</button>`;
        paginationControlsEl.appendChild(li);
    }
}

window.__changePage = renderPage;
