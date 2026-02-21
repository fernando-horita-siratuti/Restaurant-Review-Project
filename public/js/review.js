const USERNAMES_KEY = "usernames";
const RESTAURANT_TEXTS_KEY = "restaurantTexts";
const NEIGHBORHOOD_KEY = "neighborhoods"; 
const CUISINE_KEY = "cuisines"; 
const PRICE_KEY = "prices";
const RATING_TEXTS_KEY = "ratings"; 
const REVIEW_TEXTS_KEY = "reviewTexts";

const usernamesWrite = JSON.parse(localStorage.getItem(USERNAMES_KEY) || "[]");
const restaurantNameWrite = JSON.parse(localStorage.getItem(RESTAURANT_TEXTS_KEY) || "[]");
const neighborhoodsWrite = JSON.parse(localStorage.getItem(NEIGHBORHOOD_KEY) || "[]"); 
const cuisinesWrite = JSON.parse(localStorage.getItem(CUISINE_KEY) || "[]"); 
const pricesWrite = JSON.parse(localStorage.getItem(PRICE_KEY) || "[]");
const ratingsWrite = JSON.parse(localStorage.getItem(RATING_TEXTS_KEY) || "[]"); 
const reviewTextsWrite = JSON.parse(localStorage.getItem(REVIEW_TEXTS_KEY) || "[]");

function saveToStorage() {
  localStorage.setItem(USERNAMES_KEY, JSON.stringify(usernamesWrite));
  localStorage.setItem(RESTAURANT_TEXTS_KEY, JSON.stringify(restaurantNameWrite));
  localStorage.setItem(NEIGHBORHOOD_KEY, JSON.stringify(neighborhoodsWrite)); 
  localStorage.setItem(CUISINE_KEY, JSON.stringify(cuisinesWrite)); 
  localStorage.setItem(PRICE_KEY, JSON.stringify(pricesWrite));
  localStorage.setItem(RATING_TEXTS_KEY, JSON.stringify(ratingsWrite));
  localStorage.setItem(REVIEW_TEXTS_KEY, JSON.stringify(reviewTextsWrite));
}

function addUsername(username) {
  usernamesWrite.push((username).trim());
  saveToStorage();
}

function addRestaurantText(restaurantText) {
  restaurantNameWrite.push((capitalizeRestaurantName(restaurantText)).trim());
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

function addPrice(price) {
  pricesWrite.push(price);
  saveToStorage();
}

function addRating(rating) {
  const notaLimpa = (rating || "").trim();
  if (!notaLimpa) {
    return;
  }

  let notaFinal;
  if (notaLimpa.length > 3) {
    if (notaLimpa >= 8) {
      notaFinal = notaLimpa.slice(0, 3) + '/10 ⭐';
    } else {
      notaFinal = notaLimpa.slice(0, 3) + '/10';
    }
  } else {
    if (notaLimpa >= 8) {
      notaFinal = notaLimpa + '/10 ⭐';
    } else {
      notaFinal = notaLimpa + '/10';
    }
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

async function verifyRestaurantRegionAndCuisine(restaurantName, neighborhood, cuisine) {
    try {
      const params = new URLSearchParams({
        restaurantName: restaurantName,
        neighborhood: neighborhood,
        cuisine: cuisine
      });
      
      const response = await fetch(`/api/verify-restaurant?${params.toString()}`);
      const data = await response.json();

      return data.valid;

    } catch (error) {
      console.error("Error verifying restaurant:", error);
      return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("button.btn-primary.w-25");

  button.addEventListener("click", async (e) => {
    e.preventDefault(); 

    const username = document.getElementById("usernameInput").value;
    const restaurantText = document.getElementById("restaurantInput").value;
    const neighborhood = document.getElementById("neighborhoodInput").value; 
    const cuisine = document.getElementById("cuisineInput").value;
    const price = document.getElementById("priceInput").value; 
    const rating = document.getElementById("ratingInput").value; 
    const reviewText = document.getElementById("reviewInput").value;
    const isRestaurantValid = await verifyRestaurantRegionAndCuisine(restaurantText, neighborhood, cuisine);

    if (username.length < 1 || username.length > 200) { 
      alert("Please enter a valid username (1-200 characters)."); 
      return; 
    }
    if (restaurantText.length < 1) { 
      alert("Please enter the name of the restaurant."); 
      return; 
    }
    if (neighborhood === "") { 
      alert("Please select a neighborhood."); 
      return;
    } 
    if (cuisine === "") { 
      alert("Please select a cuisine."); 
      return; 
    }
    if (price === "") {
      alert("Please select a price range.");
      return;
    }
    if (rating.length < 1 || parseInt(rating) < 0 || parseInt(rating) > 10) { 
      alert("Please enter a valid rating between 0 and 10."); 
      return; 
    }
    if (reviewText.length < 1 || reviewText.length > 2000) { 
      alert("Please enter a valid review (1-2000 characters)."); 
      return; 
    }
    if (isRestaurantValid === false) {
      alert("The restaurant does not exist in the selected neighborhood and cuisine.");
      return;
    }

    addUsername(username);
    addRestaurantText(restaurantText);
    addNeighborhood(neighborhood); 
    addCuisine(cuisine); 
    addPrice(price);
    addRating(rating); 
    addReviewText(reviewText);
    
    document.getElementById("usernameInput").value = "";
    document.getElementById("restaurantInput").value = "";
    document.getElementById("neighborhoodInput").value = ""; 
    document.getElementById("cuisineInput").value = "";
    document.getElementById("priceInput").value = ""; 
    document.getElementById("ratingInput").value = ""; 
    document.getElementById("reviewInput").value = "";

    alert("Your review was successfully posted!");
  });
});