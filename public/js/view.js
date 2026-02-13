const USERNAMES_KEY = "usernames";
const RESTAURANT_TEXTS_KEY = "restaurantTexts";
const NEIGHBORHOOD_KEY = "neighborhoods"; 
const CUISINE_KEY = "cuisines"; 
const RATING_TEXTS_KEY = "ratings"; 
const REVIEW_TEXTS_KEY = "reviewTexts";

function getArraysFromStorage() {
  try {
    const users = JSON.parse(localStorage.getItem(USERNAMES_KEY) || "[]");
    const restaurants = JSON.parse(localStorage.getItem(RESTAURANT_TEXTS_KEY) || "[]");
    const locations = JSON.parse(localStorage.getItem(NEIGHBORHOOD_KEY) || "[]"); 
    const gastronomies = JSON.parse(localStorage.getItem(CUISINE_KEY) || "[]"); 
    const rates = JSON.parse(localStorage.getItem(RATING_TEXTS_KEY) || "[]");
    const reviews = JSON.parse(localStorage.getItem(REVIEW_TEXTS_KEY) || "[]");

    return { 
        usernames: users, 
        restaurantTexts: restaurants, 
        neighborhoods: locations, 
        cuisines: gastronomies,
        ratings: rates, 
        reviewTexts: reviews 
    };
  } catch (err) {
    console.error("Error localStorage:", err);
    return { usernames: [], restaurantTexts: [], neighborhoods: [], cuisines: [], ratings: [], reviewTexts: [] };
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

  const { usernames, restaurantTexts, neighborhoods, cuisines, ratings, reviewTexts } = getArraysFromStorage();
  container.innerHTML = "";

  const count = Math.max(usernames.length, restaurantTexts.length);
  let reviewsFound = false;

  for (let i = count - 1; i >= 0; i--) {
    const user = usernames[i] || "Anonymous";
    const rest = restaurantTexts[i] || "Restaurant";
    const neigh = neighborhoods[i] || "Unknown"; 
    const cuis = cuisines[i] || "Unknown"; 
    const rate = ratings[i] || "Rating: N/A";
    const review = reviewTexts[i] || "N/A";

    const restClean = rest.trim().toLowerCase();
    const targetClean = targetRestaurant.trim().toLowerCase();

    if (restClean !== targetClean) {
        continue;
    }

    reviewsFound = true;

    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm"; 
    
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "card-body";
    
    const htmlContent = `
                            <h3 class="card-title fw-bold" style="color: #382f2f;">${user}</h3>
                            <h5 class="card-subtitle mb-1 fw-bold" style="color: #382f2f;">${rest}</h5>
                            <p class="text-muted mb-2 fs-6" style="font-size: 0.9rem;">📍 ${neigh} &nbsp; | &nbsp; 🍽️ ${cuis}</p>
                            <h5 class="card-subtitle mb-2 fw-bold" style="color: #382f2f;">${rate}</h5>
                            <p class="card-text mt-3">${review}</p>
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