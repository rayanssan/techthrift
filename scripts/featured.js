"use strict";

let featuredCategories = [
    {name: "Apple", image: "appleFeatured.png"}, 
    {name: "Android", image: "androidFeatured.avif"}, 
    {name: "Windows", image: "windowsFeatured.png"},
    {name: "Samsung", image: "samsungFeatured.png"}, 
];

featuredCategories.forEach(category => { 
    const card = `
    <div onclick="window.location.href = 'search?is=${
        encodeURIComponent(category.name)
    }&featured=true&featuredImage=${encodeURIComponent(category.image)}';"
        class="d-flex mb-2 featured-link">
        <div class="card w-100 shadow justify-content-center overflow-hidden" style="height: 150px">
                <img alt="${category.name} Image" 
                    src="../media/images/featured/${category.image}" 
                    class="rounded px-3" 
                    style="height: 305px; object-fit: contain;">
        </div>
    </div>`;
    document.getElementById('featuredContainer').insertAdjacentHTML('beforeend', card);
});
