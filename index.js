import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(express.static("public"));

const apiKey = "d276a4f0050a44e3a292f0e3d4dabb3c";
// const config = {
//   headers: { Authorization: `Bearer ${apiKey}` }
// };

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
            'Burgers': 'catering.restaurant.burger',
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
            'Other': 'catering.restaurant'
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
    homeSection: `<section class="hero-section">
                    <div class="container">
                        <div class="hero-content mx-auto text-center">
                            <h1 class="hero-title">Dine SP</h1>
                            <p class="hero-subtitle">
                                Find the finest restaurants in São Paulo, any dish at any price.
                            </p>
                            
                            <form id="searchForm" class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="neighborhoodSelect" class="form-label">Neighborhoods</label>
                                    <div class="dropdown">
                                        <button class="btn dropdown-search dropdown-toggle w-100 text-start" type="button" 
                                                id="neighborhoodSelect" data-bs-toggle="dropdown" aria-expanded="false">
                                            Choose a neighborhood
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
                                                <li><a class="dropdown-item" href="" data-value="Vila Olímpia">Vila Olímpia</a></li>
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
                                                <li><a class="dropdown-item" href="" data-value="Burgers">Burgers</a></li>
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

  let viewContentHtml = `
                            <div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
                                <h1 class="text-center fw-bold" 
                                    style="color: #382f2f; font-family: 'Poppins', sans-serif;">
                                    Please, select a neighborhood and a cuisine on the home page.
                                </h1>
                            </div>
                        `;

  try {
    if (selectedRestaurant) {
        const backLink = `/view?neighborhood=${encodeURIComponent(neighborhood)}&cuisine=${encodeURIComponent(cuisine)}&page=${page}`;
        const cleanSelectedRestaurant = selectedRestaurant.replace(/[^a-zA-Z0-9]/g, '');
        
        viewContentHtml = `
            <div class="container mt-4">
                <h1 id="reviewsTitle" class="fw-bold mb-3 text-center" style="color: #382f2f; display: none;">
                    Community Reviews for "${cleanSelectedRestaurant}" 👨‍🍳
                </h1>
                
                <div id="postsContainer" class="mt-4"></div>

                <div class="text-center mt-5 mb-4">
                    <a href="${backLink}" class="btn px-4 py-2 fw-bold shadow-sm" 
                       style="background-color: #382f2f; color: white; border-radius: 8px;">
                        <i class="bi bi-arrow-left me-2"></i> Back to restaurant list
                    </a>
                </div>
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
            'Burgers': 'catering.restaurant.burger',
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
            'Other': 'catering.restaurant'
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
                const totalResults = allEstablishments.length;
                const totalPages = Math.ceil(totalResults / itemsPerPage);
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedEstablishments = allEstablishments.slice(startIndex, endIndex);

                listContentHtml = `<ul class="list-group">`;
                paginatedEstablishments.forEach(establishment => {
                    const restaurantName = "­­­­­ ­" + establishment.name;  // Invisible characters to align the restaurant name with the address
                    const restaurantAddress = establishment.address || "Address not available";
                        
                    if (restaurantName) {
                        const encodedNeighborhood = encodeURIComponent(neighborhood);
                        const encodedCuisine = encodeURIComponent(cuisine);
                        const encodedRestaurantName = encodeURIComponent(restaurantName);

                        listContentHtml += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <div class="ms-3 text-start">
                                    <span class="fw-bold d-block fs-5">
                                        ${restaurantName}
                                        <span class="restaurant-stats fs-5 fw-bold" data-restaurant-name="${establishment.name}">
                                            <span class="text-muted" style="font-size: 1.2rem;">| ⭐ Unrated | 💵 Unrated</span>
                                        </span>
                                    </span>
                                    <span class="text-muted fw-bold" style="font-size: 0.85rem;">
                                        📍 ${restaurantAddress}
                                    </span>
                                </div>
                                <a href="/view?neighborhood=${encodedNeighborhood}&cuisine=${encodedCuisine}&restaurantName=${encodedRestaurantName}&page=${page}" 
                                class="text-primary text-decoration-none me-3" 
                                style="font-size: 0.9rem; white-space: nowrap; margin-left: 15px;">
                                See the reviews <i class="bi bi-arrow-right"></i>
                                </a>
                            </li>
                        `;
                    }
                });
                listContentHtml += `</ul>`;

                listContentHtml += `<script>
                    setTimeout(() => {
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
                            if (!str) {
                                return NaN;
                            }
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
                                stats[rawName].sumRate += numRate; 
                                stats[rawName].countRate++; 
                            }
                            if (!isNaN(numPrice)) { 
                                stats[rawName].sumPrice += numPrice; 
                                stats[rawName].countPrice++; 
                            }
                        }

                        document.querySelectorAll('.restaurant-stats').forEach(span => {
                            const originalName = span.getAttribute('data-restaurant-name') || '';
                            const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                            const data = stats[cleanName];
                            
                            let txtRate = 'Unrated';
                            let txtPrice = 'Unrated';

                            if (data) {
                                if (data.countRate > 0) {
                                    txtRate = (data.sumRate / data.countRate).toFixed(1).replace('.', ',');
                                }
                                if (data.countPrice > 0) {
                                    txtPrice = (data.sumPrice / data.countPrice).toFixed(1).replace('.', ',');
                                }
                            }

                            span.innerHTML = '<span class="text-muted" style="font-size: 1.1rem;"> | ⭐ ' + txtRate + ' | 💵 ' + txtPrice + '</span>';
                        });
                    }, 100);
                </script>`;

                const encodedNeighborhood = encodeURIComponent(neighborhood);
                const encodedCuisine = encodeURIComponent(cuisine);
                
                let paginationHtml = `<div class="d-flex justify-content-center align-items-end gap-4 mt-5">`;

                for (let i = 1; i <= totalPages; i++) {
                    const isActive = (i === page);
                    const color = isActive ? '#382f2f' : '#d4c598'; 
                    const transform = isActive ? 'scale(1.3)' : 'scale(1)';
                    const opacity = isActive ? '1' : '0.6'; 

                    const pageLink = `/view?neighborhood=${encodedNeighborhood}&cuisine=${encodedCuisine}&page=${i}`;

                    paginationHtml +=   `
                                            <a href="${pageLink}" class="text-decoration-none d-flex flex-column align-items-center" 
                                            style="transition: all 0.3s ease; transform: ${transform}; opacity: ${opacity};">
                                                
                                                <img src="/images/chefHat.png" alt="Page ${i}" width="45" height="45">

                                                <span class="fw-bold mt-2" style="color: ${color}; font-family: 'Poppins', sans-serif; font-size: 0.9rem;">
                                                    ${i}
                                                </span>
                                            </a>
                                        `;
                }

                paginationHtml += `</div>`;
                
                listContentHtml += paginationHtml;

            } else {
                listContentHtml = `<p class="text-center mt-4">No places found for ${cuisine} in ${neighborhood}.</p>`;
            }
        } else {
            listContentHtml = `<p class="text-center mt-4 text-danger">Location not found.</p>`;
        }

        viewContentHtml =   `
                                <div class="mb-5">
                                    <h1 class="fw-bold mb-5 text-center">Restaurants found 🔎</h1>
                                    <div id="apiResultsContainer"> 
                                        ${listContentHtml} 
                                    </div>
                                </div>
                            `;
    }

  } catch (error) {
    console.error(error);
    viewContentHtml = "<p>Error loading data.</p>";
  }

  res.render("index.ejs", {
    viewSection: `
                    <div class="container-fluid" id="viewScreen">
                        <div class="container" id="viewTextContainer">
                            ${viewContentHtml}
                        </div>
                    </div>
                 `
  });
});

app.get("/review", (req, res) => {
  res.render("index.ejs", {
    reviewSection: `
                    <div id="reviewScreen">
                      <form id="postForm">
                        <div class="text-center mb-3">
                          <label for="usernameInput" class="form-label"><h3>Username (max 20 characters)</h3></label>
                          <input type="text" class="form-control w-50 mx-auto py-3 fs-5" id="usernameInput" placeholder="Ex: Tim_Reviews123" maxlength="20">
                        </div>

                        <div class="text-center mb-3">
                          <label for="restaurantInput" class="form-label"><h3>Restaurant Name</h3></label>
                          <textarea type="text" class="form-control w-50 mx-auto py-3 fs-5" id="restaurantInput" placeholder="Ex: Taiyoo" maxlength="30"></textarea>
                        </div>

                        <div class="text-center mb-3">
                            <label for="neighborhoodInput" class="form-label"><h3>Neighborhood</h3></label>
                            <select class="form-select w-50 mx-auto py-3 fs-5" id="neighborhoodInput">
                                <option value="" selected disabled>Select Neighborhood</option>
                                <option value="Aclimação">Aclimação</option>
                                <option value="Bela Vista">Bela Vista</option>
                                <option value="Bom Retiro">Bom Retiro</option>
                                <option value="Brooklin">Brooklin</option>
                                <option value="Cambuci">Cambuci</option>
                                <option value="Campo Belo">Campo Belo</option>
                                <option value="Consolação">Consolação</option>
                                <option value="Higienópolis">Higienópolis</option>
                                <option value="Ipiranga">Ipiranga</option>
                                <option value="Itaim Bibi">Itaim Bibi</option>
                                <option value="Jardins">Jardins</option>
                                <option value="Lapa">Lapa</option>
                                <option value="Liberdade">Liberdade</option>
                                <option value="Moema">Moema</option>
                                <option value="Perdizes">Perdizes</option>
                                <option value="Pinheiros">Pinheiros</option>
                                <option value="Pompeia">Pompeia</option>
                                <option value="Santana">Santana</option>
                                <option value="Santo Amaro">Santo Amaro</option>
                                <option value="Saúde">Saúde</option>
                                <option value="Tatuapé">Tatuapé</option>
                                <option value="Vila Madalena">Vila Madalena</option>
                                <option value="Vila Mariana">Vila Mariana</option>
                                <option value="Vila Olímpia">Vila Olímpia</option>
                            </select>
                        </div>

                        <div class="text-center mb-3">
                            <label for="cuisineInput" class="form-label"><h3>Cuisine</h3></label>
                            <select class="form-select w-50 mx-auto py-3 fs-5" id="cuisineInput">
                                <option value="" selected disabled>Select Cuisine</option>
                                <option value="African">African</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Argentinian">Argentinian</option>
                                <option value="Bar">Bar</option>
                                <option value="Bakery">Bakery</option>
                                <option value="Brazilian">Brazilian</option>
                                <option value="Brazilian Barbecue">Brazilian Barbecue</option>
                                <option value="Burgers">Burgers</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Coffee Shop">Coffee Shop</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Ice Cream Shop">Ice Cream Shop</option>
                                <option value="Italian">Italian</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Mexican">Mexican</option>
                                <option value="Peruvian">Peruvian</option>
                                <option value="Pizza">Pizza</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Seafood">Seafood</option>
                                <option value="Spanish">Spanish</option>
                            </select>
                        </div>

                        <div class="text-center mb-3">
                            <label for="priceInput" class="form-label"><h3>Price Range</h3></label>
                            <select class="form-select w-50 mx-auto py-3 fs-5" id="priceInput">
                                <option value="" selected disabled>Select Price Range</option>
                                <option value="$">$</option>
                                <option value="$$">$$</option>
                                <option value="$$$">$$$</option>
                                <option value="$$$$">$$$$</option>
                                <option value="$$$$$">$$$$$</option>
                            </select>
                        </div>

                        <div class="text-center mb-3">
                            <label for="ratingInput" class="form-label"><h3>Rating (0-10)</h3></label>
                            <input type="number" class="form-control w-50 mx-auto py-3 fs-5" id="ratingInput" placeholder="Ex: 10" min="0" max="10">
                        </div>

                        <div class="text-center mb-3">
                          <label for="reviewInput" class="form-label"><h3>Review (max 2000 characters)</h3></label>
                          <textarea class="form-control w-50 mx-auto fs-5" id="reviewInput" rows="6" placeholder="Ex: I really liked this place. The food was well-seasoned and fresh." maxlength="2000"></textarea>
                        </div>
                        
                        <div class="text-center mt-4">
                          <button type="submit" class="btn btn-primary w-25 py-3 fs-3 fw-bold">Post</button>
                        </div>
                      </form>
                    </div>
                  `
  });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.post("/get-secret", async (req, res) => {
//   const searchId = req.body.id;

//   try {
//     const result = await axios.get(API_URL + "/secrets/" + searchId, config);
//     res.render("index.ejs", { content: JSON.stringify(result.data) });
//   } catch (error) {
//     res.render("index.ejs", { content: JSON.stringify(error.response.data) });
//   }
// });

// app.post("/post-secret", async (req, res) => {
//   const body = {
//     secret: req.body.secret,
//     score: req.body.score
//   };

//   try {
//     const result = await axios.post(API_URL + "/secrets/", body, config);
//     res.render("index.ejs", { content: JSON.stringify(result.data) });
//   } catch (error) {
//     res.render("index.ejs", { content: JSON.stringify(error.response.data) });
//   }
// });

// app.post("/put-secret", async (req, res) => {
//   const searchId = req.body.id;
//   const body = {
//     secret: req.body.secret,
//     score: req.body.score
//   };

//   try {
//     const result = await axios.put(API_URL + "/secrets/" + searchId, body, config);
//     res.render("index.ejs", { content: JSON.stringify(result.data) });
//   } catch (error) {
//     res.render("index.ejs", { content: JSON.stringify(error.response.data) });
//   }
// });

// app.post("/patch-secret", async (req, res) => {
//   const searchId = req.body.id;
//   const body = {
//     secret: req.body.secret,
//     score: req.body.score
//   };

//   try {
//     const result = await axios.patch(API_URL + "/secrets/" + searchId, body, config);
//     res.render("index.ejs", { content: JSON.stringify(result.data) });
//   } catch (error) {
//     res.render("index.ejs", { content: JSON.stringify(error.response.data) });
//   }
// });

// app.post("/delete-secret", async (req, res) => {
//   const searchId = req.body.id;

//   try {
//     const result = await axios.delete(API_URL + "/secrets/" + searchId, config);
//     res.render("index.ejs", { content: JSON.stringify(result.data) });
//   } catch (error) {
//     res.render("index.ejs", { content: JSON.stringify(error.response.data) });
//   }
// });