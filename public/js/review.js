const USERNAMES_KEY = "usernames";
const RESTAURANT_TEXTS_KEY = "restaurantTexts";
const NEIGHBORHOOD_KEY = "neighborhoods"; 
const CUISINE_KEY = "cuisines"; 
const RATING_TEXTS_KEY = "ratings"; 
const REVIEW_TEXTS_KEY = "reviewTexts";

const usernamesWrite = JSON.parse(localStorage.getItem(USERNAMES_KEY) || "[]");
const restaurantTextsWrite = JSON.parse(localStorage.getItem(RESTAURANT_TEXTS_KEY) || "[]");
const neighborhoodsWrite = JSON.parse(localStorage.getItem(NEIGHBORHOOD_KEY) || "[]"); 
const cuisinesWrite = JSON.parse(localStorage.getItem(CUISINE_KEY) || "[]"); 
const ratingsWrite = JSON.parse(localStorage.getItem(RATING_TEXTS_KEY) || "[]"); 
const reviewTextsWrite = JSON.parse(localStorage.getItem(REVIEW_TEXTS_KEY) || "[]");

function saveToStorage() {
  localStorage.setItem(USERNAMES_KEY, JSON.stringify(usernamesWrite));
  localStorage.setItem(RESTAURANT_TEXTS_KEY, JSON.stringify(restaurantTextsWrite));
  localStorage.setItem(NEIGHBORHOOD_KEY, JSON.stringify(neighborhoodsWrite)); 
  localStorage.setItem(CUISINE_KEY, JSON.stringify(cuisinesWrite)); 
  localStorage.setItem(RATING_TEXTS_KEY, JSON.stringify(ratingsWrite));
  localStorage.setItem(REVIEW_TEXTS_KEY, JSON.stringify(reviewTextsWrite));
}

function addUsername(username) {
  usernamesWrite.push(('Username: ' + username).trim());
  saveToStorage();
}

function addRestaurantText(restaurantText) {
  restaurantTextsWrite.push(('Restaurant: ' + capitalizeRestaurantName(restaurantText)).trim());
  saveToStorage();
}

function addNeighborhood(neighborhood) { 
  neighborhoodsWrite.push(neighborhood);
  saveToStorage();
}

function addCuisine(cuisine) { 
  cuisinesWrite.push(cuisine);
  saveToStorage();
}

function addRating(rating) {
  const notaLimpa = (rating || "").trim();
  if (!notaLimpa) return;

  let notaFinal;
  if (notaLimpa.length > 3) {
    notaFinal = 'Rating: ' + notaLimpa.slice(0, 3) + '/10';
  } else {
    notaFinal = 'Rating: ' + notaLimpa + '/10';
  }
  ratingsWrite.push(notaFinal);
  saveToStorage();
}

function addReviewText(reviewText) {
  reviewTextsWrite.push(reviewText.trim());
  saveToStorage();
}

function capitalizeRestaurantName(restaurantText) {
  return restaurantText.toLowerCase().split(' ').map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("button.btn-primary.w-25");

  button.addEventListener("click", (e) => {
    e.preventDefault(); 

    const username = document.getElementById("usernameInput").value;
    const restaurantText = document.getElementById("restaurantInput").value;
    const neighborhood = document.getElementById("neighborhoodInput").value; 
    const cuisine = document.getElementById("cuisineInput").value; 
    const rating = document.getElementById("ratingInput").value; 
    const reviewText = document.getElementById("reviewInput").value;

    if (username.length < 1) { 
      alert("Please, enter your username."); 
      return; 
    }
    if (restaurantText.length < 1) { 
      alert("Please, enter the name of the restaurant."); 
      return; 
    }
    if (neighborhood === "") { 
      alert("Please, select a neighborhood."); return; } 
    if (cuisine === "") { alert("Please, select a cuisine."); 
      return; 
    } 
    if (rating.length < 1 || parseInt(rating) < 0 || parseInt(rating) > 10) { 
      alert("Please, enter a valid rating between 0 and 10."); 
      return; 
    }
    if (reviewText.length < 1) { 
      alert("Please, enter your review."); 
      return; 
    }

    addUsername(username);
    addRestaurantText(restaurantText);
    addNeighborhood(neighborhood); 
    addCuisine(cuisine); 
    addRating(rating); 
    addReviewText(reviewText);
    
    document.getElementById("usernameInput").value = "";
    document.getElementById("restaurantInput").value = "";
    document.getElementById("neighborhoodInput").value = ""; 
    document.getElementById("cuisineInput").value = ""; 
    document.getElementById("ratingInput").value = ""; 
    document.getElementById("reviewInput").value = "";

    alert("Your review was successfully posted!");
  });
});

function clearStorageManually() {
  if (confirm("Tem certeza que deseja limpar todos os posts?")) {
    localStorage.clear();
    window.location.reload();
  }
}