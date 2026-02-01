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
  const { usernames, restaurantTexts, neighborhoods, cuisines, ratings, reviewTexts } = getArraysFromStorage();

  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  const count = Math.max(usernames.length, restaurantTexts.length);
  if (count === 0) {
    container.innerHTML = '<div class="text-center mt-3 fs-3 fw-bold">No reviews yet :/</div>';
    return;
  }

  for (let i = count - 1; i >= 0; i--) {
    const user = usernames[i] || "Anonimous";
    const rest = restaurantTexts[i] || "Restaurant";
    const neigh = neighborhoods[i] || "Unknown"; 
    const cuis = cuisines[i] || "Unknown"; 
    const rate = ratings[i] || "Rating: N/A";
    const review = reviewTexts[i] || "N/A";

    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm"; 

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "card-body";

    const usernameEl = document.createElement("h3");
    usernameEl.className = "card-title fw-bold";
    usernameEl.style.color = "#382f2f";
    usernameEl.textContent = user;

    const restEl = document.createElement("h5");
    restEl.className = "card-subtitle mb-1 fw-bold"; 
    restEl.style.color = "#382f2f";
    restEl.textContent = rest;

    const locationCuisineEl = document.createElement("p");
    locationCuisineEl.className = "text-muted mb-2 fs-6";
    locationCuisineEl.style.fontSize = "0.9rem";
    locationCuisineEl.innerHTML = `📍 ${neigh} &nbsp; | &nbsp; 🍽️ ${cuis}`;

    const ratingEl = document.createElement("h5");
    ratingEl.className = "card-subtitle mb-2 fw-bold";
    ratingEl.style.color = "#382f2f";
    ratingEl.textContent = rate;

    const reviewEl = document.createElement("p");
    reviewEl.className = "card-text mt-3";
    reviewEl.textContent = review;

    bodyDiv.appendChild(usernameEl);
    bodyDiv.appendChild(restEl);
    bodyDiv.appendChild(locationCuisineEl); 
    bodyDiv.appendChild(ratingEl);
    bodyDiv.appendChild(reviewEl);

    card.appendChild(bodyDiv);
    container.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", updateUI);