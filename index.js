import 'dotenv/config';
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"
import session from "express-session";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));

const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false 
    }
});

db.on('error', (err) => {
    console.error('Unexcpected conextion error with the database:', err.message);
});

db.connect()
    .then(() => console.log("Successfully connected to the cloud database."))
    .catch(err => console.error("Error connecting to the database:", err.stack));

app.use(session({
    secret: 'dinesp_key', 
    resave: false,
    saveUninitialized: false
}));

const apiKey = process.env.GEOAPIFY_API_KEY;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/verify-restaurant", async (req, res) => {
    const { restaurantName, neighborhood, cuisine } = req.query;

    try {
        let placeId = await getNeighborhoodId(neighborhood);

        const categoriesMap = {
            'Any': 'catering.restaurant',
            'African': 'catering.restaurant.african',
            'Arabic': 'catering.restaurant.arab',
            'Argentinian': 'catering.restaurant.argentinian',
            'Bar': 'catering.bar',
            'Bakery': 'commercial.food_and_drink.bakery', 
            'Brazilian': 'catering.restaurant.brazilian',
            'Brazilian Barbecue': 'catering.restaurant.barbecue', 
            'Burger': 'catering.restaurant.burger',
            'Chinese': 'catering.restaurant.chinese',
            'Coffee Shop': 'catering.cafe.coffee_shop',
            'French': 'catering.restaurant.french',
            'German': 'catering.restaurant.german',
            'Ice Cream Shop': 'catering.ice_cream',
            'Italian': 'catering.restaurant.italian',
            'Japanese': 'catering.restaurant.japanese',
            'Korean': 'catering.restaurant.korean',
            'Mexican': 'catering.restaurant.mexican',
            'Peruvian': 'catering.restaurant.peruvian',
            'Pizza': 'catering.restaurant.pizza',
            'Portuguese': 'catering.restaurant.portuguese',
            'Seafood': 'catering.restaurant.seafood',
            'Spanish': 'catering.restaurant.spanish'
        };
        
        const apiCategory = categoriesMap[cuisine];
        const establishments = await getEstablishment(placeId, apiCategory);
        const userInput = restaurantName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const exists = establishments.some(place => {
            const apiName = place.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return apiName === userInput; 
        });

        res.json({ valid: exists });

    } catch (error) {
        console.error("Verification error:", error);
        res.json({ valid: false, error: "Intern error" });
    }
});

app.get("/", (req, res) => {
    res.render("index.ejs", { 
        activePage: "home",
        user: req.session.user,
        homePage: `
                        <section class="hero-section">
                            <div class="container">
                                <div class="hero-content mx-auto text-center">
                                    <h1 class="hero-title">Dine SP</h1>
                                    <p class="hero-subtitle fw-bold">
                                        Find the finest restaurants in São Paulo, any dish at any price.
                                    </p>
                                    
                                    <form id="searchForm" class="row g-3 mb-4">
                                        <div class="col-md-6">
                                            <label for="neighborhoodSelect" class="form-label">Neighborhoods</label>
                                            <div class="dropdown">
                                                <button class="btn dropdown-search dropdown-toggle w-100 text-start" type="button" 
                                                    id="neighborhoodSelect" data-bs-toggle="dropdown" aria-expanded="false">
                                                    Select a neighborhood
                                                </button>
                                                <ul class="dropdown-menu w-100" style="max-height: 300px; overflow-y: auto;">
                                                    <li><input type="text" class="form-control mx-2 mb-2" id="searchNeighborhood" 
                                                        placeholder="Search neighborhood..." style="width: calc(100% - 1rem);"></li>
                                                    <li><hr class="dropdown-divider"></li>
                                                    <div id="neighborhoodList">
                                                        <li><a class="dropdown-item" href="" data-value="Any">Any</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Aclimação">Aclimação</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Bela Vista">Bela Vista</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Bom Retiro">Bom Retiro</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Brooklin">Brooklin</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Cambuci">Cambuci</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Campo Belo">Campo Belo</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Consolação">Consolação</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Higienópolis">Higienópolis</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Ipiranga">Ipiranga</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Itaim Bibi">Itaim Bibi</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Jardins">Jardins</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Lapa">Lapa</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Liberdade">Liberdade</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Moema">Moema</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Perdizes">Perdizes</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Pinheiros">Pinheiros</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Pompeia">Pompeia</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Santana">Santana</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Santo Amaro">Santo Amaro</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Saúde">Saúde</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Tatuapé">Tatuapé</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Vila Madalena">Vila Madalena</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Vila Mariana">Vila Mariana</a></li>
                                                    </div>
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <label for="cuisineSelect" class="form-label">Cuisines</label>
                                            <div class="dropdown">
                                                <button class="btn dropdown-search dropdown-toggle w-100 text-start" type="button" 
                                                    id="cuisineSelect" data-bs-toggle="dropdown" aria-expanded="false">
                                                    Select the cuisine
                                                </button>
                                                <ul class="dropdown-menu w-100" style="max-height: 300px; overflow-y: auto;">
                                                    <li><input type="text" class="form-control mx-2 mb-2" id="searchCuisine" 
                                                            placeholder="Search cuisine..." style="width: calc(100% - 1rem);"></li>
                                                    <li><hr class="dropdown-divider"></li>
                                                    <div id="cuisineList">
                                                        <li><a class="dropdown-item" href="" data-value="Any">Any</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="African">African</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Arabic">Arabic</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Argentinian">Argentinian</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Bar">Bar</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Bakery">Bakery</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Brazilian">Brazilian</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Brazilian Barbecue">Brazilian Barbecue</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Burger">Burger</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Chinese">Chinese</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Coffee Shop">Coffee Shop</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="French">French</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="German">German</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Ice Cream Shop">Ice Cream Shop</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Italian">Italian</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Japanese">Japanese</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Korean">Korean</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Mexican">Mexican</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Peruvian">Peruvian</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Pizza">Pizza</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Portuguese">Portuguese</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Seafood">Seafood</a></li>
                                                        <li><a class="dropdown-item" href="" data-value="Spanish">Spanish</a></li>
                                                    </div>
                                                </ul>
                                            </div>
                                        </div>
                                    </form>
                                    
                                    <button type="submit" class="search-btn" onclick="handleSearch()">
                                        <i class="bi bi-search me-2"></i>
                                        Search restaurants
                                    </button>
                                </div>
                            </div>
                        </section>
                    `
    });
});

app.get("/view", async (req, res) => {
    const neighborhood = req.query.neighborhood;
    const cuisine = req.query.cuisine;
    const selectedRestaurant = req.query.restaurantName;
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;

    let viewContentHtml =   `
                                <div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
                                    <h1 class="text-center fw-bold" 
                                        style="color: #382f2f">
                                        Please, select a neighborhood and a cuisine on the home page.
                                    </h1>
                                </div>
                            `;

    try {
        if (selectedRestaurant) {
            const backLink = `/view?neighborhood=${encodeURIComponent(neighborhood)}&cuisine=${encodeURIComponent(cuisine)}&page=${page}`;
            const cleanSelectedRestaurant = selectedRestaurant.replace(/[^a-zA-Z0-9]/g, '');
            
            viewContentHtml =   `
                                    <div class="container mt-4">
                                        <div class="row align-items-center mb-4">
                                            <div class="col-2 col-md-3 text-start">
                                                <a href="${backLink}" class="btn fw-bold shadow-sm px-2 py-1" 
                                                style="background-color: #382f2f; color: white; border-radius: 8px; font-size: 0.9rem;">
                                                    <i class="bi bi-arrow-left"></i> 
                                                    <span class="d-none d-lg-inline ms-1">Back to restaurant list</span>
                                                </a>
                                            </div>
                                            
                                            <div class="col-8 col-md-6 text-center">
                                                <h1 id="reviewsTitle" class="fw-bold mb-0 fs-3 fs-md-1" style="color: #382f2f; display: none;">
                                                    Community Reviews for "${cleanSelectedRestaurant}" 👨‍🍳
                                                </h1>
                                            </div>
                                            <div class="col-2 col-md-3"></div>
                                        </div>
                                        <div id="postsContainer" class="mt-4"></div>
                                    </div>
                                `;
        } else if (neighborhood && cuisine) {
            const categoriesMap = {
                'Any': 'catering.restaurant',
                'African': 'catering.restaurant.african',
                'Arabic': 'catering.restaurant.arab',
                'Argentinian': 'catering.restaurant.argentinian',
                'Bar': 'catering.bar',
                'Bakery': 'commercial.food_and_drink.bakery', 
                'Brazilian': 'catering.restaurant.brazilian',
                'Brazilian Barbecue': 'catering.restaurant.barbecue', 
                'Burger': 'catering.restaurant.burger',
                'Chinese': 'catering.restaurant.chinese',
                'Coffee Shop': 'catering.cafe.coffee_shop',
                'French': 'catering.restaurant.french',
                'German': 'catering.restaurant.german',
                'Ice Cream Shop': 'catering.ice_cream',
                'Italian': 'catering.restaurant.italian',
                'Japanese': 'catering.restaurant.japanese',
                'Korean': 'catering.restaurant.korean',
                'Mexican': 'catering.restaurant.mexican',
                'Peruvian': 'catering.restaurant.peruvian',
                'Pizza': 'catering.restaurant.pizza',
                'Portuguese': 'catering.restaurant.portuguese',
                'Seafood': 'catering.restaurant.seafood',
                'Spanish': 'catering.restaurant.spanish',
            };

            const apiCategory = categoriesMap[cuisine];
            
            let placeId = null;
            if (neighborhood === 'Any') {
                placeId = await getNeighborhoodId("São Paulo");
            } else {
                placeId = await getNeighborhoodId(neighborhood);
            }
            
            let listContentHtml = "";

            if (placeId) {
                const allEstablishments = await getEstablishment(placeId, apiCategory);
                
                if (allEstablishments && allEstablishments.length > 0) {
                    const encodedNeighborhood = encodeURIComponent(neighborhood);
                    const encodedCuisine = encodeURIComponent(cuisine);
                    const currentSort = req.query.sort || 'alpha';

                    listContentHtml = `
                                        <div id="dynamicListContainer"></div>
                                        <div id="dynamicPaginationContainer"></div>

                                        <script>
                                            const allPlaces = ${JSON.stringify(allEstablishments)};
                                            const currentPage = ${page};
                                            const itemsPerPage = ${itemsPerPage};
                                            const neighborhood = "${encodedNeighborhood}";
                                            const cuisine = "${encodedCuisine}";
                                            const currentSort = "${currentSort}";
                                            const restTexts = JSON.parse(localStorage.getItem('restaurantTexts') || '[]');
                                            const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
                                            const prices = JSON.parse(localStorage.getItem('prices') || '[]');
                                            const stats = {};
                                            
                                            const extractRate = (str) => {
                                                if (!str) {
                                                    return NaN;
                                                }
                                                const match = str.toString().replace(',', '.').match(/\\d+(\\.\\d+)?/);
                                                return match ? parseFloat(match[0]) : NaN;
                                            };

                                            const extractPrice = (str) => {
                                                const text = str.toString().replace(',', '.');
                                                const dollars = text.match(/\\$/g);
                                                if (dollars) {
                                                    return dollars.length;
                                                }
                                                return NaN;
                                            };

                                            for(let i = 0; i < restTexts.length; i++) {
                                                if(!restTexts[i]) continue;
                                                const rawName = restTexts[i].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                                if (!stats[rawName]) {
                                                    stats[rawName] = { sumRate: 0, countRate: 0, sumPrice: 0, countPrice: 0 };
                                                }
                                                const numRate = extractRate(ratings[i]);
                                                const numPrice = extractPrice(prices[i]);
                                                
                                                if (!isNaN(numRate)) { 
                                                    stats[rawName].sumRate += numRate; stats[rawName].countRate++; 
                                                }
                                                if (!isNaN(numPrice)) { 
                                                    stats[rawName].sumPrice += numPrice; stats[rawName].countPrice++; 
                                                }
                                            }

                                            allPlaces.forEach(place => {
                                                place.displayName = "­­­­­ ­" + place.name; // Invisible chars to align the restaurant name with the address
                                                const cleanName = place.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                                const data = stats[cleanName];
                                                
                                                place.avgRate = -1;
                                                place.avgPrice = -1;
                                                place.txtRate = 'Unrated';
                                                place.txtPrice = 'Unrated';
                                                
                                                if (data) {
                                                    if (data.countRate > 0) {
                                                        place.avgRate = data.sumRate / data.countRate;
                                                        place.txtRate = place.avgRate.toFixed(1).replace('.', ',') + '/10';
                                                    }
                                                    if (data.countPrice > 0) {
                                                        place.avgPrice = data.sumPrice / data.countPrice;
                                                        place.txtPrice = place.avgPrice.toFixed(1).replace('.', ',') + '/5';
                                                    }
                                                }
                                            });

                                            allPlaces.sort((a, b) => {
                                                if (currentSort === 'rating_desc') {
                                                    if (a.avgRate === -1 && b.avgRate !== -1) {
                                                        return 1;
                                                    }
                                                    if (b.avgRate === -1 && a.avgRate !== -1) {
                                                        return -1;
                                                    }
                                                    return b.avgRate - a.avgRate;
                                                } else if (currentSort === 'price_asc') {
                                                    if (a.avgPrice === -1 && b.avgPrice !== -1) {
                                                    return 1;
                                                    }
                                                    if (b.avgPrice === -1 && a.avgPrice !== -1) {
                                                        return -1;
                                                    }
                                                    return a.avgPrice - b.avgPrice;
                                                } else if (currentSort === 'price_desc') {
                                                    if (a.avgPrice === -1 && b.avgPrice !== -1) {
                                                        return 1;
                                                    }
                                                    if (b.avgPrice === -1 && a.avgPrice !== -1) {
                                                        return -1;
                                                    }
                                                    return b.avgPrice - a.avgPrice;
                                                } else {
                                                    return a.name.localeCompare(b.name);
                                                }
                                            });

                                            const totalPages = Math.ceil(allPlaces.length / itemsPerPage);
                                            let validPage = currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
                                            
                                            const startIndex = (validPage - 1) * itemsPerPage;
                                            const endIndex = startIndex + itemsPerPage;
                                            const paginatedPlaces = allPlaces.slice(startIndex, endIndex);

                                            let ulHtml = '<ul class="list-group">';
                                            paginatedPlaces.forEach(place => {
                                                const encodedRestName = encodeURIComponent(place.displayName);
                                                const address = place.address || "Address not available";
                                                
                                                ulHtml +=  \`
                                                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                                                    <div class="ms-3 text-start">
                                                                        <span class="fw-bold d-block fs-5">
                                                                            \${place.displayName}
                                                                            <span class="restaurant-stats fw-bold ms-2">
                                                                                <span class="text-muted" style="font-size: 1.1rem;"> | ⭐ \${place.txtRate} | 💵 \${place.txtPrice}</span>
                                                                            </span>
                                                                        </span>
                                                                        <span class="text-muted fw-bold" style="font-size: 0.85rem;">
                                                                            📍 \${address}
                                                                        </span>
                                                                    </div>
                                                                    <a href="/view?neighborhood=\${neighborhood}&cuisine=\${cuisine}&restaurantName=\${encodedRestName}&page=\${validPage}&sort=\${currentSort}" 
                                                                    class="text-primary text-decoration-none me-3" 
                                                                    style="font-size: 0.9rem; white-space: nowrap; margin-left: 15px;">
                                                                    See the reviews <i class="bi bi-arrow-right"></i>
                                                                    </a>
                                                                </li>
                                                            \`;
                                            });
                                            ulHtml += '</ul>';
                                            document.getElementById('dynamicListContainer').innerHTML = ulHtml;

                                            let pagHtml = '<div class="d-flex justify-content-center align-items-end flex-wrap gap-4 mt-5">';
                                            for (let i = 1; i <= totalPages; i++) {
                                                const isActive = (i === validPage);
                                                const color = isActive ? '#382f2f' : '#d4c598'; 
                                                const transform = isActive ? 'scale(1.3)' : 'scale(1)';
                                                const opacity = isActive ? '1' : '0.6'; 
                                                
                                                const pageLink = \`/view?neighborhood=\${neighborhood}&cuisine=\${cuisine}&page=\${i}&sort=\${currentSort}\`;
                                                
                                                pagHtml += \`
                                                    <a href="\${pageLink}" class="text-decoration-none d-flex flex-column align-items-center" 
                                                    style="transition: all 0.3s ease; transform: \${transform}; opacity: \${opacity};">
                                                        <img src="/images/chefHat.png" alt="Page \${i}" width="45" height="45">
                                                        <span class="fw-bold mt-2" style="color: \${color}; font-size: 0.9rem;">
                                                            \${i}
                                                        </span>
                                                    </a>
                                                \`;
                                            }
                                            pagHtml += '</div>';
                                            document.getElementById('dynamicPaginationContainer').innerHTML = pagHtml;

                                            const displayBox = document.getElementById('customSortDropdown');
                                            const optionsBox = document.getElementById('customSortOptions');
                                            const textBox = document.getElementById('customSortText');
                                            const items = document.querySelectorAll('.custom-dropdown-item');

                                            const labels = {
                                                'alpha': 'A-Z (Default)',
                                                'rating_desc': 'Highest Rated',
                                                'price_asc': 'Lowest Price',
                                                'price_desc': 'Highest Price'
                                            };

                                            if (displayBox && optionsBox) {
                                                if (labels[currentSort]) {
                                                    textBox.innerText = labels[currentSort];
                                                }

                                                displayBox.addEventListener('click', (e) => {
                                                    e.stopPropagation();
                                                    optionsBox.classList.toggle('show');
                                                });

                                                document.addEventListener('click', (e) => {
                                                    if (!displayBox.contains(e.target) && !optionsBox.contains(e.target)) {
                                                        optionsBox.classList.remove('show');
                                                    }
                                                });

                                                items.forEach(item => {
                                                    item.addEventListener('click', (e) => {
                                                        const newSort = e.target.getAttribute('data-value');
                                                        optionsBox.classList.remove('show');
                                                        window.location.href = \`/view?neighborhood=\${neighborhood}&cuisine=\${cuisine}&page=1&sort=\${newSort}\`;
                                                    });
                                                });
                                            }
                                        </script>
                                    `;

                } else {
                    listContentHtml = `<p class="text-center mt-4">No places found for ${cuisine} in ${neighborhood}.</p>`;
                }
            } else {
                listContentHtml = `<p class="text-center mt-4 text-danger">Location not found.</p>`;
            }

            viewContentHtml = `
                                <div class="mb-5">
                                    <div class="title-sort-container position-relative mb-5">
                                        <h1 class="fw-bold mb-0 text-center">Restaurants Found 🔎</h1>
                                        
                                        <div class="sort-wrapper">
                                            <div id="customSortDropdown" class="custom-dropdown-display shadow-sm">
                                                <span id="customSortText">A-Z (Default)</span>
                                                <i class="bi bi-chevron-down ms-2"></i>
                                            </div>
                                            <div id="customSortOptions" class="custom-dropdown-options shadow-lg">
                                                <div class="custom-dropdown-item" data-value="alpha">A-Z (Default)</div>
                                                <div class="custom-dropdown-item" data-value="rating_desc">Highest Rated</div>
                                                <div class="custom-dropdown-item" data-value="price_asc">Lowest Price</div>
                                                <div class="custom-dropdown-item" data-value="price_desc">Highest Price</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="container mb-4 mt-3 text-center position-relative" style="max-width: 625px;">
                                        <input type="text" id="restaurantSearchBox" class="form-control elegant-input mx-auto shadow-sm" placeholder="Search by restaurant name..." autocomplete="off">
                                        
                                        <ul id="searchSuggestions" class="dropdown-menu w-100 shadow-lg text-start" style="display: none; position: absolute; top: 100%; left: 0; z-index: 1050; max-height: 250px; overflow-y: auto; border-radius: 12px; border: 1px solid #bbae87;"></ul>
                                    </div>

                                    <div id="apiResultsContainer" class="cards-container"> 
                                        ${listContentHtml} 
                                    </div>

                                    <script>
                                        document.addEventListener("DOMContentLoaded", function() {
                                            const searchBox = document.getElementById('restaurantSearchBox');
                                            const suggestionsBox = document.getElementById('searchSuggestions');
                                            const listContainer = document.getElementById('dynamicListContainer');
                                            const paginationContainer = document.getElementById('dynamicPaginationContainer');
                                            
                                            let originalListHtml = "";
                                            if (listContainer) originalListHtml = listContainer.innerHTML;
                                            
                                            if (searchBox && suggestionsBox && typeof allPlaces !== 'undefined') {
                                                
                                                searchBox.addEventListener('input', function() {
                                                    const searchTerm = this.value.toLowerCase().trim();
                                                    suggestionsBox.innerHTML = ''; 

                                                    if (searchTerm.length === 0) {
                                                        suggestionsBox.style.display = 'none';
                                                        listContainer.innerHTML = originalListHtml;
                                                        paginationContainer.style.display = ''; 
                                                        return;
                                                    }

                                                    const matches = allPlaces.filter(place => {
                                                        const cleanName = place.name.toLowerCase();
                                                        return cleanName.includes(searchTerm);
                                                    });

                                                    if (matches.length > 0) {
                                                        suggestionsBox.style.display = 'block';
                                                        
                                                        matches.forEach(match => {
                                                            const suggestionListItem = document.createElement('li');
                                                            const dropdownOptionLink = document.createElement('a');
                                                            dropdownOptionLink.className = 'dropdown-item py-2 fw-medium';
                                                            dropdownOptionLink.href = '#';
                                                            dropdownOptionLink.style.cursor = 'pointer';
                                                            dropdownOptionLink.style.color = '#382f2f';
                                                            dropdownOptionLink.textContent = match.name;
                                                            
                                                            dropdownOptionLink.addEventListener('click', function(e) {
                                                                e.preventDefault(); 
                                                                searchBox.value = match.name; 
                                                                suggestionsBox.style.display = 'none'; 
                                                                
                                                                paginationContainer.style.display = 'none';

                                                                const encodedRestName = encodeURIComponent(match.displayName);
                                                                const address = match.address || "Address not available";
                                                                
                                                                listContainer.innerHTML =  \`
                                                                                                <ul class="list-group">
                                                                                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                                                                                        <div class="ms-3 text-start">
                                                                                                            <span class="fw-bold d-block fs-5">
                                                                                                                \${match.displayName}
                                                                                                                <span class="restaurant-stats fw-bold ms-2">
                                                                                                                    <span class="text-muted" style="font-size: 1.1rem;"> | ⭐ \${match.txtRate} | 💵 \${match.txtPrice}</span>
                                                                                                                </span>
                                                                                                            </span>
                                                                                                            <span class="text-muted fw-bold" style="font-size: 0.85rem;">
                                                                                                                📍 \${address}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <a href="/view?neighborhood=\${neighborhood}&cuisine=\${cuisine}&restaurantName=\${encodedRestName}&page=1&sort=\${currentSort}" 
                                                                                                        class="text-primary text-decoration-none me-3" 
                                                                                                        style="font-size: 0.9rem; white-space: nowrap; margin-left: 15px;">
                                                                                                        See the reviews <i class="bi bi-arrow-right"></i>
                                                                                                        </a>
                                                                                                    </li>
                                                                                                </ul>
                                                                                            \`;
                                                            });
                                                            
                                                            suggestionListItem.appendChild(dropdownOptionLink);
                                                            suggestionsBox.appendChild(suggestionListItem);
                                                        });
                                                    } else {
                                                        suggestionsBox.style.display = 'none';
                                                    }
                                                });

                                                document.addEventListener('click', function(e) {
                                                    if (!searchBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
                                                        suggestionsBox.style.display = 'none';
                                                    }
                                                });
                                            }
                                        });
                                    </script>
                                </div>
                            `;
        }
    } catch (error) {
        console.error(error);
        viewContentHtml = "<p>Error loading data.</p>";
    }

    res.render("index.ejs", {
        activePage: "view",
        user: req.session.user,
        viewPage: `
                        <div class="container-fluid" id="viewScreen">
                            <div class="container" id="viewTextContainer">
                                ${viewContentHtml}
                            </div>
                        </div>
                     `
    });
});

app.get("/review", (req, res) => {
    let reviewPage = "";

    if (req.session.user) {
        reviewPage =  `
                        <div id="reviewScreen" class="d-flex justify-content-center">
                            <form id="postForm" action="/review" method="POST" class="w-100" style="max-width: 900px;">
                            
                            <div class="row g-4 mb-4 mt-2">
                                <div class="col-12 text-start">
                                    <label for="restaurantInput" class="form-label review-label fw-bold">Restaurant Name</label>
                                    <input type="text" class="form-control elegant-input" id="restaurantInput" name="restaurantName" placeholder="Ex: Taiyoo" maxlength="30" required>
                                </div>
                            </div>

                            <div class="row g-3 mb-4">
                                <div class="col-md-3 text-start">
                                    <label class="form-label review-label fw-bold">Neighborhood</label>
                                    <div class="dropdown w-100">
                                        <input type="hidden" id="neighborhoodInput" name="neighborhood" value="">
                                        <button class="btn elegant-input dropdown-toggle w-100 d-flex justify-content-between align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <span class="dropdown-text">Select a neighborhood</span>
                                        </button>
                                        <ul class="dropdown-menu w-100" style="max-height: 250px; overflow-y: auto;">
                                        <li><a class="dropdown-item" href="#" data-value="Aclimação">Aclimação</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Bela Vista">Bela Vista</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Bom Retiro">Bom Retiro</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Brooklin">Brooklin</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Cambuci">Cambuci</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Campo Belo">Campo Belo</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Consolação">Consolação</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Higienópolis">Higienópolis</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Ipiranga">Ipiranga</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Itaim Bibi">Itaim Bibi</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Jardins">Jardins</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Lapa">Lapa</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Liberdade">Liberdade</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Moema">Moema</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Perdizes">Perdizes</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Pinheiros">Pinheiros</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Pompeia">Pompeia</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Santana">Santana</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Santo Amaro">Santo Amaro</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Saúde">Saúde</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Tatuapé">Tatuapé</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Vila Madalena">Vila Madalena</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Vila Mariana">Vila Mariana</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="col-md-3 text-start">
                                    <label class="form-label review-label fw-bold">Cuisine</label>
                                    <div class="dropdown w-100">
                                        <input type="hidden" id="cuisineInput" name="cuisine" value="">
                                        <button class="btn elegant-input dropdown-toggle w-100 d-flex justify-content-between align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <span class="dropdown-text">Select a cuisine</span>
                                        </button>
                                        <ul class="dropdown-menu w-100" style="max-height: 250px; overflow-y: auto;">
                                        <li><a class="dropdown-item" href="#" data-value="African">African</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Arabic">Arabic</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Argentinian">Argentinian</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Bar">Bar</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Bakery">Bakery</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Brazilian">Brazilian</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Brazilian Barbecue">Brazilian Barbecue</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Burger">Burger</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Chinese">Chinese</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Coffee Shop">Coffee Shop</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="French">French</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="German">German</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Ice Cream Shop">Ice Cream Shop</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Italian">Italian</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Japanese">Japanese</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Korean">Korean</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Mexican">Mexican</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Peruvian">Peruvian</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Pizza">Pizza</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Portuguese">Portuguese</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Seafood">Seafood</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="Spanish">Spanish</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="col-md-2 text-start">
                                    <label class="form-label review-label fw-bold">Price Range</label>
                                    <div class="dropdown w-100">
                                        <input type="hidden" id="priceInput" name="priceRange" value="">
                                        <button class="btn elegant-input dropdown-toggle w-100 d-flex justify-content-between align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <span class="dropdown-text">Select $-$$$$$</span>
                                        </button>
                                        <ul class="dropdown-menu w-100">
                                        <li><a class="dropdown-item" href="#" data-value="$">$</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="$$">$$</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="$$$">$$$</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="$$$$">$$$$</a></li>
                                        <li><a class="dropdown-item" href="#" data-value="$$$$$">$$$$$</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="col-12 custom-rating text-start">
                                    <label for="ratingInput" class="form-label review-label fw-bold">Rating</label>
                                    <input type="number" class="form-control elegant-input" id="ratingInput" name="rating" placeholder="Ex: 10" min="0" max="10" step="0.5" style="padding-left: 10px; padding-right: 10px;" required>
                                </div>

                                <div class="col-12 custom-date text-start">
                                    <label for="dateInput" class="form-label review-label fw-bold">Date Visited</label>
                                    <input type="date" class="form-control elegant-input" id="dateInput" name="dateVisited" style="padding-left: 10px; padding-right: 10px;" required> 
                                </div>
                            </div>

                            <div class="row mb-5">
                                <div class="col-12 text-start">
                                    <label for="reviewInput" class="form-label review-label fw-bold">Review (max 2000 characters)</label>
                                    <textarea class="form-control elegant-input" id="reviewInput" name="reviewText" rows="6" placeholder="Ex: I really liked this place. The food was well-seasoned and fresh." maxlength="2000" required></textarea>
                                </div>
                            </div>
                            
                            <div class="text-center">
                                <button type="submit" class="btn btn-primary px-5 py-2 fs-4 fw-bold shadow-sm" style="border-radius: 8px;">Post</button>
                            </div>
                            </form>
                        </div>
                     `;
    } else {
        reviewPage =    `
                            <div class="d-flex justify-content-center align-items-center mt-5">
                                <div class="card shadow-lg border-0 text-center p-5" style="background-color: #f4efeb; border-radius: 20px; max-width: 500px; width: 100%;">
                                    <i class="bi bi-lock-fill mb-3" style="font-size: 3.5rem; color: #433c33;"></i>
                                    <h2 class="fw-bold mb-3" style="color: #433c33;">Access Denied</h2>
                                    <p class="fs-5 mb-4" style="color: #6a6053;">You must be logged in to post a review for a restaurant.</p>
                                    <a href="/login" class="btn w-100 fw-bold fs-5 rounded-pill" style="background-color: #433c33; color: #ffffff; padding: 12px 0;">
                                        Go to Login
                                    </a>
                                </div>
                            </div>
                        `;
    }

    res.render("index.ejs", {
        activePage: "review",
        user: req.session.user,
        reviewPage: reviewPage
    });
});

app.post("/review", async (req, res) => {
    if (!req.session.user) {
        return res.send("<script>alert('You must be logged in to post a review!'); window.location.href = '/login';</script>");
    }

    const userId = req.session.user.id;
    const username = req.session.user.username;
    const { restaurantName, neighborhood, cuisine, priceRange, rating, dateVisited, reviewText } = req.body;

    try {
        await db.query(
            `INSERT INTO reviews (user_id, restaurant_name, neighborhood, cuisine, price, rating, date, username, review_text) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [userId, restaurantName, neighborhood, cuisine, priceRange, rating, dateVisited, username, reviewText]
        );

        res.send("<script>alert('Your review was successfully posted!'); window.location.href = '/review';</script>");
    } catch (err) {
        console.error("Error storing the review:", err);
        res.send("<script>alert('An error occurred while posting your review.'); window.history.back();</script>");
    }
});

app.get("/login", (req, res) => {
    res.render("index.ejs", { 
        activePage: "login",
        user: req.session.user,
        loginPage: `
                    <div class="container mt-4">
                        <div class="row justify-content-center">
                            <div class="col-12 col-md-8 col-lg-5">
                                <div class="card shadow-lg border-0" style="background-color: #f4efeb; border-radius: 20px;">
                                    <div class="card-body p-5 text-center">
                                        <h2 class="fw-bold mb-4" style="color: #433c33;">Welcome Back</h2>
                                        <p class="mb-4" style="color: #6a6053;">Please log in to your account.</p>

                                        <form action="/login" method="POST">
                                            <div class="form-floating mb-3 text-start">
                                                <input type="email" class="form-control" id="emailInput" name="email" placeholder="name@example.com" required style="border-radius: 10px; border: 1px solid #d8cbb8;">
                                                <label for="emailInput" style="color: #6a6053;">Email address</label>
                                            </div>
                                            
                                            <div class="form-floating mb-4 text-start">
                                                <input type="password" class="form-control" id="passwordInput" name="password" placeholder="Password" required style="border-radius: 10px; border: 1px solid #d8cbb8;">
                                                <label for="passwordInput" style="color: #6a6053;">Password</label>
                                            </div>

                                            <button type="submit" class="btn w-100 fw-bold fs-5 rounded-pill mb-3" style="background-color: #433c33; color: #ffffff; padding: 10px 0;">
                                                Login
                                            </button>
                                        </form>

                                        <p class="mt-3 mb-0" style="color: #433c33;">
                                            Don't have an account? 
                                            <a href="/register" class="text-decoration-none fw-bold" style="color: #8c7a6b;">Register</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                   `
    });
});

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", 
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedPassword = user.password;

            bcrypt.compare(password, storedPassword, (err, result) => {
                if (err) {
                    console.log("Error comparing passwords: ", err);
                } else {
                    if (result) {
                        req.session.user = {
                            id: user.id,
                            username: user.username, 
                            email: user.email
                        };
                        
                        res.send("<script>alert('You are now logged in!'); window.location.href = '/';</script>");
                    } else {
                        res.send("<script>alert('Incorret email/password. Please try again.'); window.location.href = '/login';</script>");
                    }
                }
            }); 
        } else {
            res.send("<script>alert('Incorret email/password. Please try again.'); window.location.href = '/login';</script>");
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/register", (req, res) => {
    res.render("index.ejs", { 
        activePage: "register",
        user: req.session.user,
        signUpPage: `
                        <div class="container mt-4">
                            <div class="row justify-content-center">
                                <div class="col-12 col-md-8 col-lg-5">
                                    <div class="card shadow-lg border-0" style="background-color: #f4efeb; border-radius: 20px;">
                                        <div class="card-body p-5 text-center">
                                            <h2 class="fw-bold mb-4" style="color: #433c33;">Create Account</h2>
                                            <p class="mb-4" style="color: #6a6053;">Join us and start reviewing your favorite spots.</p>

                                            <form action="/register" method="POST">
                                                <div class="form-floating mb-3 text-start">
                                                    <input type="text" class="form-control" id="usernameRegister" name="username" placeholder="Username" required style="border-radius: 10px; border: 1px solid #d8cbb8;" maxlength="20">
                                                    <label for="usernameRegister" style="color: #6a6053;">Username (max 20 characters)</label>
                                                </div>

                                                <div class="form-floating mb-3 text-start">
                                                    <input type="email" class="form-control" id="emailRegister" name="email" placeholder="name@example.com" required style="border-radius: 10px; border: 1px solid #d8cbb8;">
                                                    <label for="emailRegister" style="color: #6a6053;">Email address</label>
                                                </div>
                                                
                                                <div class="form-floating mb-4 text-start">
                                                    <input type="password" class="form-control" id="passwordRegister" name="password" placeholder="Password" required style="border-radius: 10px; border: 1px solid #d8cbb8;">
                                                    <label for="passwordRegister" style="color: #6a6053;">Password</label>
                                                </div>

                                                <button type="submit" class="btn w-100 fw-bold fs-5 rounded-pill mb-3" style="background-color: #433c33; color: #ffffff; padding: 10px 0;">
                                                    Sign Up
                                                </button>
                                            </form>

                                            <p class="mt-3 mb-0" style="color: #433c33;">
                                                Already have an account? 
                                                <a href="/login" class="text-decoration-none fw-bold" style="color: #8c7a6b;">Login</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
    });
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const saltRounds = 10;

    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", 
            [email]
        );

        if (checkResult.rows.length > 0) {
            res.send("<script>alert('Email already exists. Try logging in.'); window.location.href = '/login';</script>");
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log("Error hashing password: ", err);
                } else {
                    const result = await db.query(
                        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
                        [username, email, hash]
                    );

                    res.redirect("/");
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(); 
    res.send("<script>alert('Successfully logged out.'); window.location.href = '/';</script>");
});

async function getNeighborhoodId(neighborhood, cidade = "São Paulo") {
    try {
        const location = encodeURIComponent(`${neighborhood}, ${cidade}, BR`);
        const url = `https://api.geoapify.com/v1/geocode/search?text=${location}&format=json&apiKey=${apiKey}`;
        const res = await axios.get(url);
        const body = res.data;

        return body.results[0].place_id;
    } catch (err) {
        console.error("Error on calling Geoapify:", err.message || err);

        return;
    }
}

async function getEstablishment(neighborhoodId, category) {
    try {
        const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=place:${neighborhoodId}&apiKey=${apiKey}&limit=100`;
        const res = await axios.get(url);
        const body = res.data;

        if (!body.features || body.features.length === 0) {
            return [];
        }

        const establishments = body.features.map((item) => {
            const street = item.properties.street;
            const houseNumber = item.properties.housenumber;
            
            let formattedAddress = "Unknown address";

            if (street && houseNumber) {
                formattedAddress = `${street}, ${houseNumber}`;
            } else if (street) {
                formattedAddress = street; 
            } else if (item.properties.address_line1) {
                formattedAddress = item.properties.address_line1; 
            }

            return {
                name: item.properties.name,
                address: formattedAddress
            };
        });

        const validEstablishments = establishments.filter(e => e.name);

        validEstablishments.sort((a, b) => a.name.localeCompare(b.name));
        
        return validEstablishments;
    } catch (err) {
        console.error("Error on calling Geoapify:", err.message || err);
        
        return;
    }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});