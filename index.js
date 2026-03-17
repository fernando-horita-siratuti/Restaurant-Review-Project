import 'dotenv/config';
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

db.on('error', (err) => {
    console.error('Unexcpected conextion error with the database:', err.message);
});

db.connect()
    .then(() => console.log("Successfully connected to the cloud database."))
    .catch(err => console.error("Error connecting to the database:", err.stack));

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
        user: req.user,
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
    const selectedRestaurant = req.query.restaurantName ? req.query.restaurantName.trim() : undefined;
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;

    let viewContentHtml =   `
                                <div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
                                    <h1 class="text-center fw-bold" style="color: #382f2f">
                                        Please, select a neighborhood and a cuisine on the home page.
                                    </h1>
                                </div>
                            `;

    try {
        if (selectedRestaurant) {
            const backLink = `/view?neighborhood=${encodeURIComponent(neighborhood)}&cuisine=${encodeURIComponent(cuisine)}&page=1`;
            const reviewSort = req.query.reviewSort || 'newest';
            let orderClause = "ORDER BY r.date DESC, r.id DESC"; 
            
            if (reviewSort === 'rating_desc') {
                orderClause = "ORDER BY CAST(r.rating AS DECIMAL) DESC, r.date DESC"; 
            } else if (reviewSort === 'rating_asc') {
                orderClause = "ORDER BY CAST(r.rating AS DECIMAL) ASC, r.date DESC"; 
            }

            const reviewsPerPage = 5;
            const offset = (page - 1) * reviewsPerPage;
            const reviewsResult = await db.query(   
                `
                    SELECT r.*, u.username, COUNT(*) OVER() as full_count 
                    FROM reviews r 
                    LEFT JOIN users u ON r.user_id = u.id 
                    WHERE LOWER(REPLACE(r.restaurant_name, ' ', '')) = LOWER(REPLACE($1, ' ', ''))
                    ${orderClause}
                    LIMIT $2 OFFSET $3
                `,
                [selectedRestaurant, reviewsPerPage, offset]
            );

            const reviews = reviewsResult.rows;
            let reviewsHtml = '';
            let titleHtml = '';
            let sortHtml = ''; 
            let scriptHtml = ''; 
            let pageHtml = ''; 

            if (reviews.length > 0) {
                titleHtml = `
                                <h1 id="reviewsTitle" class="fw-bold mb-0 fs-3 fs-md-1" style="color: #382f2f;">
                                    Community Reviews for "${selectedRestaurant}" 👨‍🍳
                                </h1>
                            `;

                sortHtml =  `
                                <div class="sort-wrapper d-flex justify-content-center justify-content-lg-end w-100" style="position: relative;">
                                    <div style="width: 220px; position: relative;"> 
                                        <div id="reviewSortDropdown" class="custom-dropdown-display shadow-sm w-100 d-flex justify-content-between align-items-center px-3 py-2" style="background-color: #ffffff; border: 1px solid #d4c598; border-radius: 8px; cursor: pointer;">
                                            <span id="reviewSortText" class="fw-medium text-dark">Newest First</span>
                                            <i class="bi bi-chevron-down text-dark"></i>
                                        </div>
                                        <div id="reviewSortOptions" class="custom-dropdown-options shadow-lg w-100 mt-2" style="position: absolute; top: 100%; left: 0; z-index: 1000; border-radius: 8px;">
                                            <div class="custom-dropdown-item review-sort-item text-center py-2" data-value="newest" style="cursor: pointer;">Newest First</div>
                                            <div class="custom-dropdown-item review-sort-item text-center py-2" data-value="rating_desc" style="cursor: pointer;">Highest Rated</div>
                                            <div class="custom-dropdown-item review-sort-item text-center py-2" data-value="rating_asc" style="cursor: pointer;">Lowest Rated</div>
                                        </div>
                                    </div>
                                </div>
                            `;

                reviews.forEach(review => {
                    const cardRate = review.rating + (review.rating >= 8 ? '/10 ⭐' : '/10');
                    const cardPrice = review.price; 
                    const formatedDate = new Date(review.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                    const username = review.username || "Deleted User"; 
                    const userId = review.user_id;

                    reviewsHtml += `
                                        <div class="card shadow-sm border-0 mb-4 mx-auto" style="border-radius: 16px; background-color: #ffffff; max-width: 800px; width: 100%;">
                                            <div class="card-body p-3 p-md-4">
                                                <div class="d-flex justify-content-between align-items-start mb-3 gap-2 gap-md-3">
                                                    <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
                                                        <div class="rounded-circle d-flex justify-content-center align-items-center me-2 me-md-3 shadow-sm flex-shrink-0" style="width: 50px; height: 50px; background-color: #bbae87; color: white;">
                                                            <i class="bi bi-person-fill fs-3"></i>
                                                        </div>
                                                        <div class="text-start text-truncate">
                                                            <h4 class="card-title fw-bold mb-0 text-truncate" style="color: #382f2f;">${username} #${userId}</h4>
                                                        </div>
                                                    </div>
                                                    <div class="rounded shadow-sm d-flex flex-column justify-content-center align-items-center flex-shrink-0" style="background-color: #382f2f; color: #f2ebd9; padding: 8px 12px; margin-top: -5px;">
                                                        <span class="fw-bold fs-4 fs-md-3" style="line-height: 1;">${cardRate}</span>
                                                        <span class="fw-bold" style="font-size: 0.6rem; letter-spacing: 1px; margin-top: 4px;">RATING</span>
                                                    </div>
                                                </div>

                                                <div class="mb-3 text-start">
                                                    <h5 class="fw-bold fs-4 mb-2" style="color: #382f2f;">🍽️ ${review.restaurant_name}</h5>
                                                    <p class="text-muted mb-0 fw-bold" style="font-size: 1.1rem;">
                                                        <span class="d-block d-md-inline">📍 ${review.neighborhood} &nbsp; | &nbsp; 👨‍🍳 ${review.cuisine}</span>
                                                        <span class="d-none d-md-inline"> &nbsp; | &nbsp; </span>
                                                        <span class="d-block d-md-inline mt-1 mt-md-0">💵 ${cardPrice} &nbsp; | &nbsp; 📅 ${formatedDate}</span>
                                                    </p>
                                                </div>

                                                <div class="p-3 rounded text-start" style="background-color: #f2ebd9; border-left: 5px solid #bbae87;">
                                                    <p class="card-text mb-0" style="white-space: pre-wrap; color: #55514b; font-size: 1.05rem; font-style: italic;">"${review.review_text}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                });
                const totalReviews = parseInt(reviews[0].full_count);
                const totalPages = Math.ceil(totalReviews / reviewsPerPage);

                if (totalPages > 1) {
                    pageHtml = '<div class="d-flex justify-content-center align-items-end flex-wrap gap-4 mt-5">';
                    for (let i = 1; i <= totalPages; i++) {
                        const isActive = (i === page);
                        const color = isActive ? '#382f2f' : '#d4c598'; 
                        const transform = isActive ? 'scale(1.3)' : 'scale(1)';
                        const opacity = isActive ? '1' : '0.6'; 
                        
                        const pageLink = `/view?neighborhood=${encodeURIComponent(neighborhood)}&cuisine=${encodeURIComponent(cuisine)}&restaurantName=${encodeURIComponent(selectedRestaurant)}&page=${i}&reviewSort=${reviewSort}`;
                        
                        pageHtml += `
                                        <a href="${pageLink}" class="text-decoration-none d-flex flex-column align-items-center" 
                                        style="transition: all 0.3s ease; transform: ${transform}; opacity: ${opacity};">
                                            <img src="/images/chefHat.png" alt="Page ${i}" width="45" height="45">
                                            <span class="fw-bold mt-2" style="color: ${color}; font-size: 0.9rem;">
                                                ${i}
                                            </span>
                                        </a>
                                    `;
                    }
                    pageHtml += '</div>';
                }

                scriptHtml =    `
                                    <script>
                                        document.addEventListener("DOMContentLoaded", function() {
                                            const sortDisplay = document.getElementById('reviewSortDropdown');
                                            const sortOptions = document.getElementById('reviewSortOptions');
                                            const sortText = document.getElementById('reviewSortText');
                                            const sortItems = document.querySelectorAll('.review-sort-item');

                                            const currentReviewSort = "${reviewSort}";
                                            const labels = {
                                                'newest': 'Newest First',
                                                'rating_desc': 'Highest Rated',
                                                'rating_asc': 'Lowest Rated'
                                            };

                                            if (sortDisplay && sortOptions) {
                                                if (labels[currentReviewSort]) {
                                                    sortText.innerText = labels[currentReviewSort];
                                                }

                                                sortDisplay.addEventListener('click', (e) => {
                                                    e.stopPropagation();
                                                    sortOptions.classList.toggle('show');
                                                });

                                                document.addEventListener('click', (e) => {
                                                    if (!sortDisplay.contains(e.target) && !sortOptions.contains(e.target)) {
                                                        sortOptions.classList.remove('show');
                                                    }
                                                });

                                                sortItems.forEach(item => {
                                                    item.addEventListener('click', (e) => {
                                                        const newSort = e.target.getAttribute('data-value');
                                                        sortOptions.classList.remove('show');
                                                        window.location.href = \`/view?neighborhood=${encodeURIComponent(neighborhood)}&cuisine=${encodeURIComponent(cuisine)}&restaurantName=${encodeURIComponent(selectedRestaurant)}&page=1&reviewSort=\${newSort}\`;
                                                    });
                                                });
                                            }
                                        });
                                    </script>
                                `;

            } else {
                titleHtml = `
                                <div class="fs-3 fw-bold text-muted mb-0">
                                    No community reviews yet for "${selectedRestaurant}" 
                                </div>
                            `;
            }
            viewContentHtml =   `
                                    <div class="container mt-4">
                                        <div class="row align-items-center mb-4">
                                            <div class="col-12 col-lg-3 text-center text-lg-start mb-3 mb-lg-0">
                                                <a href="${backLink}" class="btn fw-bold shadow-sm px-2 py-1" style="background-color: #382f2f; color: white; border-radius: 8px; font-size: 0.9rem;">
                                                    <i class="bi bi-arrow-left"></i> 
                                                    <span class="d-none d-lg-inline ms-1">Back to restaurant list</span>
                                                </a>
                                            </div>
                                            <div class="col-12 col-lg-6 text-center mb-3 mb-lg-0">
                                                ${titleHtml}
                                            </div>
                                            <div class="col-12 col-lg-3 d-flex justify-content-center justify-content-lg-end">
                                                ${sortHtml} 
                                            </div>
                                        </div>
                                        <div id="postsContainer" class="mt-4">
                                            ${reviewsHtml}
                                            ${pageHtml}
                                            ${scriptHtml}
                                        </div>
                                    </div>
                                `;
        } else if (neighborhood && cuisine) {
            const statsQuery = await db.query("SELECT restaurant_name, rating, price FROM reviews");
            const dbStats = statsQuery.rows;
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
                                            const dbReviews = ${JSON.stringify(dbStats)};
                                            const stats = {};
                                            
                                            dbReviews.forEach(rev => {
                                                if(!rev.restaurant_name) return;
                                                const rawName = rev.restaurant_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                                
                                                if (!stats[rawName]) {
                                                    stats[rawName] = { sumRate: 0, countRate: 0, sumPrice: 0, countPrice: 0 };
                                                }
                                                
                                                const numRate = parseFloat(rev.rating);
                                                const numPrice = rev.price ? rev.price.length : NaN; 
                                                
                                                if (!isNaN(numRate)) { 
                                                    stats[rawName].sumRate += numRate; stats[rawName].countRate++; 
                                                }
                                                if (!isNaN(numPrice)) { 
                                                    stats[rawName].sumPrice += numPrice; stats[rawName].countPrice++; 
                                                }
                                            });

                                            allPlaces.forEach(place => {
                                                place.displayName = "­­­­­ ­" + place.name; // Invisible chars added to align with the adress text
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
                                                    if (a.avgRate === -1 && b.avgRate !== -1) return 1;
                                                    if (b.avgRate === -1 && a.avgRate !== -1) return -1;
                                                    return b.avgRate - a.avgRate;
                                                } else if (currentSort === 'price_asc') {
                                                    if (a.avgPrice === -1 && b.avgPrice !== -1) return 1;
                                                    if (b.avgPrice === -1 && a.avgPrice !== -1) return -1;
                                                    return a.avgPrice - b.avgPrice;
                                                } else if (currentSort === 'price_desc') {
                                                    if (a.avgPrice === -1 && b.avgPrice !== -1) return 1;
                                                    if (b.avgPrice === -1 && a.avgPrice !== -1) return -1;
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
                                                const encodedRestName = encodeURIComponent(place.name);
                                                const address = place.address || "Address not available";
                                                
                                                ulHtml += \`
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

                                            let pageHtml = '<div class="d-flex justify-content-center align-items-end flex-wrap gap-4 mt-5">';
                                            for (let i = 1; i <= totalPages; i++) {
                                                const isActive = (i === validPage);
                                                const color = isActive ? '#382f2f' : '#d4c598'; 
                                                const transform = isActive ? 'scale(1.3)' : 'scale(1)';
                                                const opacity = isActive ? '1' : '0.6'; 
                                                
                                                const pageLink = \`/view?neighborhood=\${neighborhood}&cuisine=\${cuisine}&page=\${i}&sort=\${currentSort}\`;
                                                
                                                pageHtml += \`
                                                    <a href="\${pageLink}" class="text-decoration-none d-flex flex-column align-items-center" 
                                                    style="transition: all 0.3s ease; transform: \${transform}; opacity: \${opacity};">
                                                        <img src="/images/chefHat.png" alt="Page \${i}" width="45" height="45">
                                                        <span class="fw-bold mt-2" style="color: \${color}; font-size: 0.9rem;">
                                                            \${i}
                                                        </span>
                                                    </a>
                                                \`;
                                            }
                                            pageHtml += '</div>';
                                            document.getElementById('dynamicPaginationContainer').innerHTML = pageHtml;

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

                                                                const encodedRestName = encodeURIComponent(match.name);
                                                                const address = match.address || "Address not available";
                                                                
                                                                listContainer.innerHTML = \`
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
        user: req.user,
        viewPage:   `
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

    if (req.user) {
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
        user: req.user,
        reviewPage: reviewPage
    });
});

app.post("/review", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.send("<script>alert('You must be logged in to post a review!'); window.location.href = '/login';</script>");
    }

    const userId = req.user.id;
    const username = req.user.username;
    let { restaurantName, neighborhood, cuisine, priceRange, rating, dateVisited, reviewText } = req.body;

    if (restaurantName) {
        restaurantName = restaurantName
            .split(' ')
            .map(word => {
                if (word.length === 0) return word; 
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

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
        user: req.user,
        loginPage:  `
                        <div class="container mt-4">
                            <div class="row justify-content-center">
                                <div class="col-12 col-md-8 col-lg-5">
                                    <div class="card shadow-lg border-0" style="background-color: #f4efeb; border-radius: 20px;">
                                        <div class="card-body p-5 text-center">
                                            <h2 class="fw-bold mb-4" style="color: #433c33;">Welcome Back</h2>
                                            <p class="mb-4" style="color: #6a6053;">Please log in to your account.</p>

                                            <form action="/login" method="POST">
                                                <div class="form-floating mb-3 text-start">
                                                    <input type="email" class="form-control" id="emailInput" name="email" placeholder="name@example.com" required style="border-radius: 10px; border: 1px solid #d8cbb8; transition: border-color 0.3s;" oninput="resetLoginBorders()">
                                                    <label for="emailInput" style="color: #6a6053;">Email address</label>
                                                </div>
                                                
                                                <div class="form-floating mb-4 text-start">
                                                    <input type="password" class="form-control" id="passwordInput" name="password" placeholder="Password" required style="border-radius: 10px; border: 1px solid #d8cbb8; transition: border-color 0.3s;" oninput="resetLoginBorders()">
                                                    <label for="passwordInput" style="color: #6a6053;">Password</label>
                                                </div>

                                                <button type="submit" class="btn w-100 fw-bold fs-5 rounded-pill mb-2" style="background-color: #433c33; color: #ffffff; padding: 10px 0;">
                                                    Login
                                                </button>

                                                <div class="text-center my-3 text-muted fw-bold">OR</div>

                                                <a href="/auth/google" class="btn w-100 fw-bold fs-5 mb-3 d-flex align-items-center justify-content-center" style="background-color: #ffffff; color: #433c33; border: 2px solid #d8cbb8; border-radius: 10px; padding: 10px 0; transition: background-color 0.3s;">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" width="24" height="24" class="me-2">
                                                    Continue with Google
                                                </a>
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

                        <script>
                            document.addEventListener("DOMContentLoaded", () => {
                                const urlParams = new URLSearchParams(window.location.search);
                                const emailInput = document.getElementById('emailInput');
                                const passInput = document.getElementById('passwordInput');

                                if (urlParams.get('error') === 'true' && emailInput && passInput) {
                                    emailInput.style.border = '2px solid #dc3545';
                                    passInput.style.border = '2px solid #dc3545';
                                    
                                    if (urlParams.get('email')) {
                                        emailInput.value = urlParams.get('email');
                                    }
                                }
                            });

                            function resetLoginBorders() {
                                const emailInput = document.getElementById('emailInput');
                                const passInput = document.getElementById('passwordInput');
                                
                                if(emailInput && passInput) {
                                    emailInput.style.border = '1px solid #d8cbb8';
                                    passInput.style.border = '1px solid #d8cbb8';
                                }
                            }
                        </script>
                    `
    });
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        
        if (!user) {
            return res.send(`
                <script>
                    alert('Incorrect email/password. Please try again.'); 
                    window.location.href = '/login?error=true&email=${encodeURIComponent(req.body.email)}';
                </script>
            `);
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.send("<script>alert('You are now logged in!'); window.location.href = '/';</script>");
        });
    })(req, res, next);
});

passport.use(
    "local",
    new Strategy({ usernameField: "email" }, async function verify(email, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const storedHashedPassword = user.password;
                
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        return cb(err);
                    } else {
                        if (valid) {
                            return cb(null, user); 
                        } else {
                            return cb(null, false); 
                        }
                    }
                });
            } else {
                return cb(null, false); 
            }
        } catch (err) {
            return cb(err);
        }
    })
);

passport.use("google", 
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" 
        }, 
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const email = profile.emails[0].value;
                const username = profile.displayName; 

                const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
                
                if (result.rows.length === 0) {
                    const newUser = await db.query(
                        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", 
                        [username, email, "google"]
                    );
                    
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                return cb(err);
            }
        }
    )
);

app.get("/auth/google", 
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

app.get("/auth/google/callback", 
    passport.authenticate("google", {
        successRedirect: "/", 
        failureRedirect: "/login?error=true"
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            cb(null, result.rows[0]);
        } else {
            cb(null, false);
        }
    } catch (err) {
        cb(err);
    }
});

app.get("/register", (req, res) => {
    res.render("index.ejs", { 
        activePage: "register",
        user: req.user,
        signUpPage: `
                        <div class="container mt-4">
                            <div class="row justify-content-center">
                                <div class="col-12 col-md-8 col-lg-5">
                                    <div class="card shadow-lg border-0" style="background-color: #f4efeb; border-radius: 20px;">
                                        <div class="card-body p-5 text-center">
                                            <h2 class="fw-bold mb-4" style="color: #433c33;">Create Account</h2>
                                            <p class="mb-4" style="color: #6a6053;">Join us and start reviewing your favorite spots.</p>

                                            <form action="/register" method="POST" onsubmit="return validatePasswords(event)">
                                                <div class="form-floating mb-3 text-start">
                                                    <input type="text" class="form-control" id="usernameRegister" name="username" placeholder="Username" required style="border-radius: 10px; border: 1px solid #d8cbb8;" maxlength="20">
                                                    <label for="usernameRegister" style="color: #6a6053;">Username (max 20 characters)</label>
                                                </div>

                                                <div class="form-floating mb-3 text-start">
                                                    <input type="email" class="form-control" id="emailRegister" name="email" placeholder="name@example.com" required style="border-radius: 10px; border: 1px solid #d8cbb8;">
                                                    <label for="emailRegister" style="color: #6a6053;">Email address</label>
                                                </div>
                                                
                                                <div class="form-floating mb-1 text-start">
                                                    <input type="password" class="form-control" id="passwordRegister" name="password" placeholder="Password" 
                                                    pattern="(?=.*[A-Z])(?=.*[!@#$&*]).{6,}" 
                                                    title="Password must be at least 6 characters long, contain at least one uppercase letter and one special character (!@#$&*)."
                                                    required style="border-radius: 10px; border: 1px solid #d8cbb8; transition: border-color 0.3s;" oninput="resetPasswordBorders()">
                                                    <label for="passwordRegister" style="color: #6a6053;">Password</label>
                                                </div>
                                                <div class="text-start mb-3 ms-2">
                                                    <small style="color: #8c7a6b; font-size: 0.8rem;">
                                                        <i class="bi bi-info-circle me-1"></i>Min. 6 characters, 1 uppercase letter and 1 special character.
                                                    </small>
                                                </div>

                                                <div class="form-floating mb-4 text-start">
                                                    <input type="password" class="form-control" id="passwordConfirmationRegister" name="passwordConfirmation" placeholder="Confirm Password" 
                                                    required style="border-radius: 10px; border: 1px solid #d8cbb8; transition: border-color 0.3s;" oninput="resetPasswordBorders()">
                                                    <label for="passwordConfirmationRegister" style="color: #6a6053;">Confirm Password</label>
                                                </div>

                                                <button type="submit" class="btn w-100 fw-bold fs-5 rounded-pill mb-2" style="background-color: #433c33; color: #ffffff; padding: 10px 0;">
                                                    Sign Up
                                                </button>

                                                <div class="text-center my-3 text-muted fw-bold">OR</div>

                                                <a href="/auth/google" class="btn w-100 fw-bold fs-5 mb-3 d-flex align-items-center justify-content-center" style="background-color: #ffffff; color: #433c33; border: 2px solid #d8cbb8; border-radius: 10px; padding: 10px 0; transition: background-color 0.3s;">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" width="24" height="24" class="me-2">
                                                    Continue with Google
                                                </a>
                                            </form>

                                            <script>
                                                function validatePasswords(event) {
                                                    const passInput = document.getElementById('passwordRegister');
                                                    const confirmInput = document.getElementById('passwordConfirmationRegister');

                                                    if (passInput.value !== confirmInput.value) {
                                                        event.preventDefault(); 
                                                        passInput.style.border = '2px solid #dc3545';
                                                        confirmInput.style.border = '2px solid #dc3545';
                                                        alert("Passwords do not match. Please try again.");

                                                        return false;
                                                    }

                                                    return true; 
                                                }

                                                function resetPasswordBorders() {
                                                    const passInput = document.getElementById('passwordRegister');
                                                    const confirmInput = document.getElementById('passwordConfirmationRegister');
                                                    
                                                    passInput.style.border = '1px solid #d8cbb8';
                                                    confirmInput.style.border = '1px solid #d8cbb8';
                                                }
                                            </script>

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
                        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
                        [username, email, hash]
                    );
                    const novoUsuario = result.rows[0];

                    req.user = {
                        id: novoUsuario.id,
                        username: novoUsuario.username,
                        email: novoUsuario.email
                    };

                    res.send(`<script>alert('Account created successfully! You are now logged in.'); window.location.href = '/';</script>`);
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

app.get("/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render("index.ejs", {
            activePage: "profile",
            user: null, 
            profilePage:    `
                                <div class="d-flex justify-content-center align-items-center mt-5">
                                    <div class="card shadow-lg border-0 text-center p-5" style="background-color: #f4efeb; border-radius: 20px; max-width: 500px; width: 100%;">
                                        <i class="bi bi-lock-fill mb-3" style="font-size: 3.5rem; color: #433c33;"></i>
                                        <h2 class="fw-bold mb-3" style="color: #433c33;">Access Denied</h2>
                                        <p class="fs-5 mb-4" style="color: #6a6053;">You must be logged in to view your profile.</p>
                                        <a href="/login" class="btn w-100 fw-bold fs-5 rounded-pill" style="background-color: #433c33; color: #ffffff; padding: 12px 0;">
                                            Go to Login
                                        </a>
                                    </div>
                                </div>
                            `
        });
    }

    const userId = req.user.id;
    const username = req.user.username;
    const page = parseInt(req.query.page) || 1;
    const reviewsPerPage = 5;
    const offset = (page - 1) * reviewsPerPage;

    const sortOrder = req.query.sort || 'newest';
    let orderClause = "ORDER BY date DESC, id DESC"; 
    
    if (sortOrder === 'rating_desc') {
        orderClause = "ORDER BY CAST(rating AS DECIMAL) DESC, date DESC"; 
    } else if (sortOrder === 'price_asc') {
        orderClause = "ORDER BY LENGTH(price) ASC, date DESC"; 
    } else if (sortOrder === 'price_desc') {
        orderClause = "ORDER BY LENGTH(price) DESC, date DESC"; 
    } else if (sortOrder === 'alpha_asc') {
        orderClause = "ORDER BY restaurant_name ASC, date DESC"; 
    }

    try {
        const reviewsResult = await db.query(
            `
                SELECT *, COUNT(*) OVER() as full_count 
                FROM reviews 
                WHERE user_id = $1 
                ${orderClause} 
                LIMIT $2 OFFSET $3
            `, 
            [userId, reviewsPerPage, offset]
        );

        const reviews = reviewsResult.rows;
        let reviewsHtml = '';
        let pagHtml = '';
        let sortHtml = '';
        let scriptHtml = '';

        if (reviews.length > 0) {
            
            sortHtml =  `
                            <div class="sort-wrapper" style="position: relative; width: 220px; z-index: 1050;">
                                <div id="profileSortDropdown" class="custom-dropdown-display shadow-sm w-100 d-flex justify-content-between align-items-center px-3 py-2" style="background-color: #ffffff; border: 1px solid #d4c598; border-radius: 8px; cursor: pointer;">
                                    <span id="profileSortText" class="fw-medium text-dark">Newest First</span>
                                    <i class="bi bi-chevron-down text-dark"></i>
                                </div>
                                <div id="profileSortOptions" class="custom-dropdown-options shadow-lg w-100 mt-2" style="position: absolute; top: 100%; right: 0; z-index: 1060; border-radius: 8px; overflow: hidden; background-color: white;">
                                    <div class="custom-dropdown-item profile-sort-item text-center py-2" data-value="newest" style="cursor: pointer;">Newest First</div>
                                    <div class="custom-dropdown-item profile-sort-item text-center py-2" data-value="price_desc" style="cursor: pointer;">Highest Price</div>
                                    <div class="custom-dropdown-item profile-sort-item text-center py-2" data-value="price_asc" style="cursor: pointer;">Lowest Price</div>
                                    <div class="custom-dropdown-item profile-sort-item text-center py-2" data-value="rating_desc" style="cursor: pointer;">Highest Rated</div>
                                    <div class="custom-dropdown-item profile-sort-item text-center py-2" data-value="alpha_asc" style="cursor: pointer;">Restaurant (A-Z)</div>
                                </div>
                            </div>
                        `;

            reviews.forEach(review => {
                const cardRate = review.rating + (review.rating >= 8 ? '/10 ⭐' : '/10');
                const cardPrice = review.price; 
                const formatedDate = new Date(review.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                reviewsHtml +=  `
                                    <div class="card shadow-sm border-0 mb-4 mx-auto" style="border-radius: 16px; background-color: #ffffff; max-width: 800px; width: 100%;">
                                        <div class="card-body p-3 p-md-4">
                                            <div class="d-flex justify-content-between align-items-stretch mb-3 gap-2 gap-md-3">
                                                <div class="d-flex flex-column justify-content-between text-start flex-grow-1 mb-0 pb-1">
                                                    <h5 class="fw-bold fs-4 mb-0" style="color: #382f2f;">🍽️ ${review.restaurant_name}</h5>
                                                    
                                                    <p class="text-muted mb-1 fw-bold" style="font-size: 1.1rem;">
                                                        <span class="d-block d-md-inline">📍 ${review.neighborhood} &nbsp; | &nbsp; 👨‍🍳 ${review.cuisine}</span>
                                                        <span class="d-none d-md-inline"> &nbsp; | &nbsp; </span>
                                                        <span class="d-block d-md-inline mt-1 mt-md-0">💵 ${cardPrice} &nbsp; | &nbsp; 📅 ${formatedDate}</span>
                                                    </p>
                                                </div>
                                                
                                                <div class="d-flex flex-column align-items-end flex-shrink-0">
                                                    <div class="d-flex gap-3 mb-3" style="margin-top: -8px;">
                                                        <a href="/edit/${review.id}" class="text-muted" title="Edit Review" style="transition: color 0.2s;"><i class="bi bi-pencil-square fs-5"></i></a>
                                                        <a href="/delete/${review.id}" class="text-danger" title="Delete Review" style="transition: color 0.2s;"><i class="bi bi-trash3 fs-5"></i></a>
                                                    </div>

                                                    <div class="rounded shadow-sm d-flex flex-column justify-content-center align-items-center" style="background-color: #382f2f; color: #f2ebd9; padding: 8px 12px;">
                                                        <span class="fw-bold fs-4 fs-md-3" style="line-height: 1;">${cardRate}</span>
                                                        <span class="fw-bold" style="font-size: 0.6rem; letter-spacing: 1px; margin-top: 4px;">RATING</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-3 rounded text-start" style="background-color: #f2ebd9; border-left: 5px solid #bbae87;">
                                                <p class="card-text mb-0" style="white-space: pre-wrap; color: #55514b; font-size: 1.05rem; font-style: italic;">"${review.review_text}"</p>
                                            </div>
                                        </div>
                                    </div>
                                `;
            });

            const totalReviews = parseInt(reviews[0].full_count);
            const totalPages = Math.ceil(totalReviews / reviewsPerPage);

            if (totalPages > 1) {
                pagHtml = '<div class="d-flex justify-content-center align-items-end flex-wrap gap-4 mt-5">';
                for (let i = 1; i <= totalPages; i++) {
                    const isActive = (i === page);
                    const color = isActive ? '#382f2f' : '#d4c598'; 
                    const transform = isActive ? 'scale(1.3)' : 'scale(1)';
                    const opacity = isActive ? '1' : '0.6'; 
                    
                    pagHtml +=  `
                                    <a href="/profile?page=${i}&sort=${sortOrder}" class="text-decoration-none d-flex flex-column align-items-center" 
                                    style="transition: all 0.3s ease; transform: ${transform}; opacity: ${opacity};">
                                        <img src="/images/chefHat.png" alt="Page ${i}" width="45" height="45">
                                        <span class="fw-bold mt-2" style="color: ${color}; font-size: 0.9rem;">
                                            ${i}
                                        </span>
                                    </a>
                                `;
                }
                pagHtml += '</div>';
            }

            scriptHtml =    `
                                <script>
                                    (function() {
                                        const sortDisplay = document.getElementById('profileSortDropdown');
                                        const sortOptions = document.getElementById('profileSortOptions');
                                        const sortText = document.getElementById('profileSortText');
                                        const sortItems = document.querySelectorAll('.profile-sort-item');

                                        const currentSort = "${sortOrder}";
                                        const labels = {
                                            'newest': 'Newest First',
                                            'price_desc': 'Highest Price',
                                            'price_asc': 'Lowest Price',
                                            'rating_desc': 'Highest Rated',
                                            'alpha_asc': 'Restaurant (A-Z)'
                                        };

                                        if (sortDisplay && sortOptions) {
                                            if (labels[currentSort]) {
                                                sortText.innerText = labels[currentSort];
                                            }

                                            sortDisplay.addEventListener('click', (e) => {
                                                e.stopPropagation();
                                                sortOptions.classList.toggle('show');
                                            });

                                            document.addEventListener('click', (e) => {
                                                if (!sortDisplay.contains(e.target) && !sortOptions.contains(e.target)) {
                                                    sortOptions.classList.remove('show');
                                                }
                                            });

                                            sortItems.forEach(item => {
                                                item.addEventListener('click', (e) => {
                                                    const newSort = e.target.getAttribute('data-value');
                                                    sortOptions.classList.remove('show');
                                                    window.location.href = \`/profile?page=1&sort=\${newSort}\`;
                                                });
                                            });
                                        }
                                    })();
                                </script>
                            `;

        } else {
            reviewsHtml =   `
                                <div class="text-center mt-5 p-5 bg-white shadow-sm mx-auto" style="border-radius: 16px; max-width: 800px; border: 1px dashed #d4c598;">
                                    <h3 class="fw-bold text-muted mb-3">No reviews yet!</h3>
                                    <p class="text-muted fs-5 mb-4">You haven't shared your culinary adventures with the community.</p>
                                    <a href="/review" class="btn btn-primary px-4 py-2 fw-bold shadow-sm" style="background-color: #382f2f; border: none; border-radius: 8px;">
                                        Write your first review
                                    </a>
                                </div>
                            `;
        }

        const profileContent =  `
                                    <div class="container mt-5 text-center mb-5">
                                        <div class="mb-5">
                                            <div class="d-inline-flex justify-content-center align-items-center rounded-circle shadow-sm mb-3" style="width: 120px; height: 120px; background-color: #bbae87; color: white;">
                                                <i class="bi bi-person-fill" style="font-size: 5rem;"></i>
                                            </div>
                                            <h1 class="fw-bold" style="color: #382f2f; font-size: 3rem;">${username}</h1>
                                            <span class="badge rounded-pill fw-medium fs-6 mt-2" style="background-color: #382f2f; color: #f2ebd9; padding: 8px 16px;">
                                                User ID: #${userId}
                                            </span>
                                        </div>
                                        
                                        <div class="d-flex justify-content-between align-items-center mx-auto mb-4 pb-2" style="max-width: 800px; border-bottom: 2px solid #d4c598;">
                                            <h3 class="fw-bold mb-0 text-start" style="color: #382f2f;">
                                                My Reviews
                                            </h3>
                                            ${sortHtml}
                                        </div>
                                        
                                        <div id="postsContainer">
                                            ${reviewsHtml}
                                            ${pagHtml}
                                            ${scriptHtml}
                                        </div>
                                    </div>
                                `;

        res.render("index.ejs", {
            activePage: "profile",
            user: req.user,
            profilePage: profileContent
        });
    } catch (err) {
        console.error("Error loading profile:", err);
        res.send("Error loading profile data.");
    }
});

app.get("/edit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    const reviewId = req.params.id;
    const userId = req.user.id;

    try {
        const result = await db.query(
            "SELECT * FROM reviews WHERE id = $1 AND user_id = $2", 
            [reviewId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).send("Review not found or you don't have permission to edit it.");
        }

        const reviewData = result.rows[0];
        const formatedDateForInput = new Date(reviewData.date).toISOString().split('T')[0];
        const editFormHtml =    `
                                    <div class="container mt-5 mb-5 text-center">
                                        <h2 class="fw-bold mb-4" style="color: #382f2f;">Edit Your Review</h2>
                                        
                                        <form action="/edit/${reviewData.id}" method="POST" class="mx-auto text-start p-4 shadow-sm" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #d4c598;">
                                            
                                            <input type="hidden" name="restaurantName" value="${reviewData.restaurant_name}">
                                            <input type="hidden" name="neighborhood" value="${reviewData.neighborhood}">
                                            <input type="hidden" name="cuisine" value="${reviewData.cuisine}">
                                            <input type="hidden" name="rating" value="${reviewData.rating}">

                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #382f2f;">Price Range</label>
                                                <div class="dropdown w-100">
                                                    <input type="hidden" id="priceInput" name="priceRange" value="${reviewData.price}">
                                                    
                                                    <button class="form-control dropdown-toggle w-100 d-flex justify-content-between align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #ffffff; cursor: pointer; border: 1px solid #ced4da; border-radius: 0.375rem;">
                                                        <span class="dropdown-text" id="priceDropdownText">${reviewData.price}</span>
                                                    </button>
                                                    
                                                    <ul class="dropdown-menu w-100 shadow-sm" id="priceDropdownMenu">
                                                        <li><a class="dropdown-item" href="#" data-value="$">$</a></li>
                                                        <li><a class="dropdown-item" href="#" data-value="$$">$$</a></li>
                                                        <li><a class="dropdown-item" href="#" data-value="$$$">$$$</a></li>
                                                        <li><a class="dropdown-item" href="#" data-value="$$$$">$$$$</a></li>
                                                        <li><a class="dropdown-item" href="#" data-value="$$$$$">$$$$$</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #382f2f;">Date Visited</label>
                                                <input type="date" name="dateVisited" class="form-control" value="${formatedDateForInput}" required>
                                            </div>

                                            <div class="mb-4">
                                                <label class="form-label fw-bold" style="color: #382f2f;">Review</label>
                                                <textarea name="reviewText" class="form-control" rows="4" required>${reviewData.review_text}</textarea>
                                            </div>

                                            <div class="d-flex justify-content-between mt-4">
                                                <a href="/profile" class="btn btn-outline-secondary px-4 fw-bold">Cancel</a>
                                                <button type="submit" class="btn text-white px-4 fw-bold" style="background-color: #382f2f;">Save Changes</button>
                                            </div>
                                        </form>

                                        <script>
                                            (function() {
                                                const priceItems = document.querySelectorAll('#priceDropdownMenu .dropdown-item');
                                                const priceInput = document.getElementById('priceInput');
                                                const priceText = document.getElementById('priceDropdownText');

                                                priceItems.forEach(item => {
                                                    item.addEventListener('click', function(e) {
                                                        e.preventDefault(); 
                                                        const val = this.getAttribute('data-value');
                                                        
                                                        priceInput.value = val;
                                                        priceText.textContent = val;
                                                    });
                                                });
                                            })();
                                        </script>
                                    </div>
                                `;

        res.render("index.ejs", {
            activePage: "review", 
            user: req.user,
            reviewPage: editFormHtml, 
            profilePage: "" 
        });

    } catch (err) {
        console.error("Error fetching review for edit:", err);
        res.status(500).send("Error loading edit page.");
    }
});

app.post("/edit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    const reviewId = req.params.id;
    const userId = req.user.id;
    let { restaurantName, neighborhood, cuisine, priceRange, rating, dateVisited, reviewText } = req.body;

    try {
        await db.query(
            `
            UPDATE reviews 
            SET restaurant_name = $1, neighborhood = $2, cuisine = $3, price = $4, rating = $5, date = $6, review_text = $7
            WHERE id = $8 AND user_id = $9
            `,
            [restaurantName, neighborhood, cuisine, priceRange, rating, dateVisited, reviewText, reviewId, userId]
        );

        res.send(`<script>alert('Post edited successfully!'); window.location.href = '/profile';</script>`);
    } catch (err) {
        console.error("Error updating review:", err);
        res.status(500).send("Error updating your review.");
    }
});

app.get("/delete/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    const reviewId = req.params.id;
    const userId = req.user.id;

    try {
        const result = await db.query(
            "SELECT * FROM reviews WHERE id = $1 AND user_id = $2", 
            [reviewId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).send("Review not found.");
        }

        const reviewData = result.rows[0];

        const deleteConfirmationHtml =  `
                                            <div class="container mt-5 mb-5 d-flex justify-content-center align-items-center" style="min-height: 50vh;">
                                                <div class="card shadow-lg border-0 text-center p-4 p-md-5" style="border-radius: 16px; background-color: #ffffff; max-width: 500px; width: 100%; border-top: 6px solid #dc3545;">
                                                    
                                                    <div class="mb-4">
                                                        <i class="bi bi-exclamation-circle text-danger" style="font-size: 4.5rem;"></i>
                                                    </div>
                                                    
                                                    <h3 class="fw-bold mb-3" style="color: #382f2f;">Are you sure?</h3>
                                                    
                                                    <p class="fs-5 mb-4" style="color: #55514b;">
                                                        You are about to delete your review for: "${reviewData.restaurant_name}"</strong><br>
                                                        <span style="font-size: 1rem;">This action cannot be undone.</span>
                                                    </p>
                                                    
                                                    <form action="/delete/${reviewData.id}" method="POST" class="d-flex justify-content-center gap-3 mt-2">
                                                        <a href="/profile" class="btn btn-outline-secondary px-4 py-2 fw-bold" style="border-radius: 8px;">Cancel</a>
                                                        <button type="submit" class="btn btn-danger px-4 py-2 fw-bold shadow-sm" style="border-radius: 8px;">Yes, Delete It</button>
                                                    </form>
                                                </div>
                                            </div>
                                        `;

        res.render("index.ejs", {
            activePage: "profile", 
            user: req.user,
            profilePage: deleteConfirmationHtml 
        });

    } catch (err) {
        console.error("Error fetching review for deletion:", err);
        res.status(500).send("Error loading delete confirmation page.");
    }
});

app.post("/delete/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    const reviewId = req.params.id;
    const userId = req.user.id;

    try {
        await db.query(
            `
            DELETE from reviews
            WHERE id = $1 AND user_id = $2
            `,
            [reviewId, userId]
        );

        res.redirect("/profile");
    } catch (err) {
        console.error("Error updating review:", err);
        res.status(500).send("Error deleting your review.");
    }
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