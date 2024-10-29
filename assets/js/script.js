// APIs URL 
const BOOKS_API_URL = 'https://wolnelektury.pl/api/authors/adam-mickiewicz/kinds/liryka/parent_books/';
const BEST_SELLING_BOOK_API = 'https://wolnelektury.pl/api/books/studnia-i-wahadlo/';

const loader = document.getElementById("loader");
const navBar = document.querySelector(".navbar-nav");
const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
const FeaturedBooksList = document.querySelector(".featured .booksList .row");
const allProducts = document.querySelector(".all-products");
const bestSellingBookImg = document.querySelector(".best-sellings .img");
const bestSellingBookInfo = document.querySelector(".best-sellings .info");
const PopularBooksList = document.querySelector(".popular .booksList .row");
const popularNav = document.querySelector(".popular .nav");
const tabLinks = document.querySelectorAll(".popular .nav-link");
const sendBtn = document.querySelector(".send");

function showLoader() {
    loader.style.setProperty('display', 'flex', 'important');
}
function hideLoader() {
    loader.style.setProperty('display', 'none', 'important');;
}

showLoader();

// Store fetch operations in an array and wait for all of them to complete
const fetchOperations = [
    fetchFeaturedBooks(),
    fetchBestSelling(),
    fetchPopularBooks()
];


Promise.all(fetchOperations)
    .then(() => hideLoader())
    .catch(error => {
        console.error("Failed to fetch all resources:", error);
        hideLoader(); // so if any error happened with fetching data the site will not stuck in loader
    });


// change navLink class onclick 
navBar.addEventListener("click", function (event) {
    if (event.target.classList.contains("nav-link")) {
        navLinks.forEach(link => {
            link.classList.remove("active");
        });
        event.target.classList.add("active");
    }
});

// Alert when user click on add to cart btn
function addToCartFun() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Your book has been added to cart successfully",
        showConfirmButton: false,
        timer: 1500
    });
}

// Book Card Creation Function 
const createBookCard = function (book, genre) {
    return `
        <div class="card col-lg-3 col-md-6 p-2 bg-main border-0" style="max-width: 20rem;" data-genre="${genre || ''}">
            <div class="img p-5 bg-secondary border border-1 border-secondary-subtle position-relative overflow-hidden">
                <img src="${book.simple_thumb}" alt="${book.title}" class="card-img-top">
                <button 
                    class="add-to-cart-btn position-absolute fw-semibold opacity-0 text-white bg-black w-100 border-0 text-uppercase"
                    onclick="addToCartFun()">
                    Add to Cart
                </button>
            </div>
            <div class="card-body pt-5 d-flex flex-column align-items-center justify-content-center gap-2">
                <span class="book-name heading-font fw-semibold fs-3 text-center">${book.title}</span>
                <span class="book-author text-body-tertiary">${book.author}</span>
            </div>
        </div>
    `;
};


// Books filter for popular book section(tabs)
function filterBooks(genre) {
    const allBooks = PopularBooksList.querySelectorAll('.card');
    allBooks.forEach(book => {
        book.style.display = (genre === 'all' || book.getAttribute('data-genre') === genre) ? 'block' : 'none';
    });
}

let viewAllFlag = false; // only featured books have been displayed 

// toggle between all books and featured books onclick
allProducts.addEventListener("click", function () {
    (viewAllFlag == true) ? fetchFeaturedBooks() : fetchAll();
    viewAllFlag = !viewAllFlag; // toggle flag
});

//Fetch Featured Books Section Data
function fetchFeaturedBooks() {
    return fetch(BOOKS_API_URL)
        .then(response => response.json())
        .then(data => {
            // Featured Books 
            FeaturedBooksList.innerHTML = '';
            const featuredDisplayData = data.slice(-4).map(book => {
                const element = createBookCard(book, book.genre);
                FeaturedBooksList.innerHTML += element;
            });
            allProducts.innerHTML = "View All Products";

        })
        .catch(error => console.error("Failed to fetch featured books:", error));
}

//Fetch All Books Section Data
function fetchAll() {
    fetch(BOOKS_API_URL)
        .then(response => response.json())
        .then(data => {
            let allBooksHTML = '';
            data.forEach(book => {
                allBooksHTML += createBookCard(book, book.genre);
            });
            FeaturedBooksList.innerHTML = allBooksHTML;
            allProducts.innerHTML = "View Only Featured";
        })
        .catch(error => console.error("Failed to fetch all books:", error));
}

//Fetch Popular Books Section Data
function fetchPopularBooks() {
    return fetch(BOOKS_API_URL)
        .then(response => response.json())
        .then(data => {
            // Popular Books
            const popularDisplayData = data.slice(17, 25).map(book => {

                // translate genre so we can filter it
                const genreTranslator = {
                    "Ballada": "romantic",
                    "Pieśń": "fictional",
                    "Wiersz": "romantic",
                    "Oda": "adventure"
                };
                
                const genre = genreTranslator[book.genre] || "technology";

                const newElem = createBookCard(book, genre);
                PopularBooksList.innerHTML += newElem;
            });

        })
        .catch(error => console.error("Failed to fetch popular books:", error));
}

//Fetch Best Books Selling Section Data
function fetchBestSelling() {
    return fetch(BEST_SELLING_BOOK_API)
        .then(res => res.json())
        .then(bookData => {
            const img = `<img src="${bookData.cover}" alt="${bookData.title} class="img-fluid">`;
            bestSellingBookImg.innerHTML = img;

            const author = `<span class="text-body-tertiary">by ${bookData.authors[0].name}</span>`;
            bestSellingBookInfo.innerHTML = author;

            const title = `<h3 class="text-capitalize fw-semibold heading-font">${bookData.title}</h3>`;
            bestSellingBookInfo.innerHTML += title;

            const paragraph = bookData.fragment_data.html;
            const paragraphElement = document.createElement('div');
            paragraphElement.classList.add('text-body-tertiary', 'fw-semibold', 'lh-lg');
            paragraphElement.innerHTML += paragraph;
            bestSellingBookInfo.appendChild(paragraphElement);

        })
        .catch(error => console.error("Failed to fetch best book:", error));
}

// change tab class onclick
popularNav.addEventListener("click", function (event) {
    if (event.target.classList.contains("nav-link")) {
        event.preventDefault(); // to prevent the scroll behavior onclick
        tabLinks.forEach(link => {
            link.classList.remove("active");
        });
        event.target.classList.add("active");

        // Filter books based on the selected genre
        const selectedGenre = event.target.getAttribute('data-cat');
        filterBooks(selectedGenre);
    }
});

// Alert when user click on send message btn
sendBtn.addEventListener("click", function (event) {
    event.preventDefault(); // to prevent refresh 
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Your message has been sent successfully",
        showConfirmButton: false,
        timer: 1500
    });
})




