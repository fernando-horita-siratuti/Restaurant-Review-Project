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
                                    <label for="neighborhoodSelect" class="form-label">Neighbourhoods</label>
                                    <div class="dropdown">
                                        <button class="btn dropdown-search dropdown-toggle w-100 text-start" type="button" 
                                                id="neighborhoodSelect" data-bs-toggle="dropdown" aria-expanded="false">
                                            Choose a neighbourhood
                                        </button>
                                        <ul class="dropdown-menu w-100" style="max-height: 300px; overflow-y: auto;">
                                            <li><input type="text" class="form-control mx-2 mb-2" id="searchNeighborhood" 
                                                    placeholder="Buscar bairro..." style="width: calc(100% - 1rem);"></li>
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
                                                    placeholder="Buscar culinária..." style="width: calc(100% - 1rem);"></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <div id="cuisineList">
                                                <li><a class="dropdown-item" href="" data-value="Any">Any</a></li>
                                                <li><a class="dropdown-item" href="" data-value="African">African</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Middle Eastern">Arabic</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Argentinian">Argentinian</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Bar">Bar</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Bakery">Bakery</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Brazilian">Brazilian</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Brazilian Barbecue">Brazilian Barbecue</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Burgers">Burgers</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Chinese">Chinese</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Coffee Shop">Coffee Shop</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Contemporary">Contemporary</a></li>
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
                                                <li><a class="dropdown-item" href="" data-value="Vegan">Vegan</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Vegetarian">Vegetarian</a></li>
                                                <li><a class="dropdown-item" href="" data-value="Other">Other</a></li>
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

app.get("/view", (req, res) => {
  res.render("index.ejs", {
    viewSection: `
                  <div class="container-fluid" id="viewScreen">
                    <div class="container" id="viewTextContainer">
                        <h1 class="fw-bold">All Reviews 🍽️</h1>
                        <div id="postsContainer"></div>
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
                                <option value="Contemporary">Contemporary</option>
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
                                <option value="Vegan">Vegan</option>
                                <option value="Vegetarian">Vegetarian</option>
                                <option value="Other">Other</option>
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

async function getPlaceId(bairro, cidade = "São Paulo") {
    try {
        const location = encodeURIComponent(`${bairro}, ${cidade}, BR`);
        const url = `https://api.geoapify.com/v1/geocode/search?text=${location}&format=json&apiKey=${apiKey}`;
        const res = await axios.get(url);
        const body = res.data;

        if (!body.results || body.results.length === 0) {
            console.log(`There are no restaurants registered in: ${bairro}`);

            return;
        }

        return body.results[0].place_id;
    } catch (err) {
        console.error("Error on calling Geoapify:", err.message || err);

        return;
    }
}

async function getEstablishment(placeId, category) {
    try {
        const q = encodeURIComponent(`${bairro}, ${cidade}, BR`);
        const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=place:${cityId}&apiKey=${apiKey}`;
        const res = await axios.get(url);
        const body = res.data;

        if (!body.results || body.results.length === 0) {
            console.log(`There are no restaurants classified as ${category} registered in: ${bairro}`);

            return;
        }
        
        return body.results[0].place_id;
    } catch (err) {
        console.error("Error on calling Geoapify:", err.message || err);

        return;
    }
}

console.log(getPlaceId("Pinheiros"));

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});