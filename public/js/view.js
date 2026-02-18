const USERNAMES_KEY = "usernames";
const RESTAURANT_TEXTS_KEY = "restaurantTexts";
const NEIGHBORHOOD_KEY = "neighborhoods"; 
const CUISINE_KEY = "cuisines"; 
const PRICE_KEY = "prices";
const RATING_TEXTS_KEY = "ratings"; 
const REVIEW_TEXTS_KEY = "reviewTexts";

function getArraysFromStorage() {
  try {
    const users = JSON.parse(localStorage.getItem(USERNAMES_KEY) || "[]");
    const restaurants = JSON.parse(localStorage.getItem(RESTAURANT_TEXTS_KEY) || "[]");
    const neighborhoods = JSON.parse(localStorage.getItem(NEIGHBORHOOD_KEY) || "[]"); 
    const cuisines = JSON.parse(localStorage.getItem(CUISINE_KEY) || "[]"); 
    const prices = JSON.parse(localStorage.getItem(PRICE_KEY) || "[]");
    const rates = JSON.parse(localStorage.getItem(RATING_TEXTS_KEY) || "[]");
    const reviews = JSON.parse(localStorage.getItem(REVIEW_TEXTS_KEY) || "[]");

    return { 
      usernames: users, 
      restaurantTexts: restaurants, 
      neighborhoods: neighborhoods, 
      cuisines: cuisines,
      prices: prices,
      ratings: rates, 
      reviewTexts: reviews 
    };
  } catch (err) {
    console.error("Error localStorage:", err);
    return { usernames: [], restaurantTexts: [], neighborhoods: [], cuisines: [], prices: [], ratings: [], reviewTexts: [] };
  }
}

function updateUI() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const targetRestaurant = params.get('restaurantName'); 

  if (!targetRestaurant) {
    container.innerHTML = "";
    return; 
  }

  const { usernames, restaurantTexts, neighborhoods, cuisines, prices, ratings, reviewTexts } = getArraysFromStorage();
  container.innerHTML = "";

  const count = Math.max(usernames.length, restaurantTexts.length);
  let reviewsFound = false;

  for (let i = count - 1; i >= 0; i--) {
    const user = usernames[i] || "Anonymous";
    const rest = restaurantTexts[i] || "Restaurant";
    const neigh = neighborhoods[i] || "Unknown"; 
    const cuis = cuisines[i] || "Unknown"; 
    const price = prices[i] || "Price: N/A";
    const rate = ratings[i] || "Rating: N/A";
    const review = reviewTexts[i] || "N/A";

    function clearText(text) {
      return text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    const restClean = clearText(rest);
    const targetClean = clearText(targetRestaurant);

    if (restClean !== targetClean) {
      continue;
    }

    reviewsFound = true;

    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm"; 
    
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "card-body";
    
    const htmlContent = `
                          <h3 class="card-title fw-bold" style="color: #382f2f;">Username: ${user}</h3>
                          <h5 class="card-subtitle mb-1 fw-bold" style="color: #382f2f;">Restaurant: ${rest}</h5>
                          <p class="text-muted mb-2 fs-6" style="font-size: 0.9rem;">📍 ${neigh} &nbsp; | &nbsp; 🍽️ ${cuis} &nbsp; | &nbsp; 💵 ${price}</p>
                          <h5 class="card-subtitle mb-2 fw-bold" style="color: #382f2f;">Rating: ${rate}</h5>
                          <p class="card-text mt-3" style="white-space: pre-wrap;">${review}</p>
                        `;
    
    bodyDiv.innerHTML = htmlContent;
    card.appendChild(bodyDiv);
    container.appendChild(card);
  }

  const titleElement = document.getElementById("reviewsTitle");
  
  if (reviewsFound) {
    if (titleElement) titleElement.style.display = "block";
  } else {
    if (titleElement) titleElement.style.display = "none";
    
    container.innerHTML = `
                            <div class="text-center mt-3 fs-3 fw-bold text-muted">
                              No community reviews yet for "${targetRestaurant}" :/
                            </div>
                          `;
  }
}

document.addEventListener("DOMContentLoaded", updateUI);