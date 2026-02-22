const USERNAMES_KEY = "usernames";
const RESTAURANT_TEXTS_KEY = "restaurantTexts";
const NEIGHBORHOOD_KEY = "neighborhoods"; 
const CUISINE_KEY = "cuisines"; 
const PRICE_KEY = "prices";
const RATING_TEXTS_KEY = "ratings"; 
const DATE_KEY = "dates";
const REVIEW_TEXTS_KEY = "reviewTexts";

const usernamesWrite = JSON.parse(localStorage.getItem(USERNAMES_KEY) || "[]");
const restaurantNameWrite = JSON.parse(localStorage.getItem(RESTAURANT_TEXTS_KEY) || "[]");
const neighborhoodsWrite = JSON.parse(localStorage.getItem(NEIGHBORHOOD_KEY) || "[]"); 
const cuisinesWrite = JSON.parse(localStorage.getItem(CUISINE_KEY) || "[]"); 
const pricesWrite = JSON.parse(localStorage.getItem(PRICE_KEY) || "[]");
const ratingsWrite = JSON.parse(localStorage.getItem(RATING_TEXTS_KEY) || "[]"); 
const datesWrite = JSON.parse(localStorage.getItem(DATE_KEY) || "[]");
const reviewTextsWrite = JSON.parse(localStorage.getItem(REVIEW_TEXTS_KEY) || "[]");

function saveToStorage() {
  localStorage.setItem(USERNAMES_KEY, JSON.stringify(usernamesWrite));
  localStorage.setItem(RESTAURANT_TEXTS_KEY, JSON.stringify(restaurantNameWrite));
  localStorage.setItem(NEIGHBORHOOD_KEY, JSON.stringify(neighborhoodsWrite)); 
  localStorage.setItem(CUISINE_KEY, JSON.stringify(cuisinesWrite)); 
  localStorage.setItem(PRICE_KEY, JSON.stringify(pricesWrite));
  localStorage.setItem(RATING_TEXTS_KEY, JSON.stringify(ratingsWrite));
  localStorage.setItem(DATE_KEY, JSON.stringify(datesWrite));
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

function addDate(date) {
  datesWrite.push(date);
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
  const button = document.querySelector("button.btn.btn-primary.px-5.py-2.fs-4.fw-bold.shadow-sm");

  button.addEventListener("click", async (e) => {
    e.preventDefault(); 

    const userElement = document.getElementById("usernameInput");
    const restElement = document.getElementById("restaurantInput");
    const ratingElement = document.getElementById("ratingInput");
    const dateElement = document.getElementById("dateInput"); 
    const reviewElement = document.getElementById("reviewInput");

    const neighHidden = document.getElementById("neighborhoodInput");
    const neighBtn = neighHidden.closest('.dropdown').querySelector('.dropdown-toggle');
    
    const cuisineHidden = document.getElementById("cuisineInput");
    const cuisineBtn = cuisineHidden.closest('.dropdown').querySelector('.dropdown-toggle');
    
    const priceHidden = document.getElementById("priceInput");
    const priceBtn = priceHidden.closest('.dropdown').querySelector('.dropdown-toggle');

    const allElements = [userElement, restElement, neighBtn, cuisineBtn, priceBtn, ratingElement, dateElement, reviewElement];
    allElements.forEach(el => el.classList.remove('border', 'border-danger', 'border-2'));

    const username = userElement.value;
    const restaurantText = restElement.value;
    const neighborhood = neighHidden.value; 
    const cuisine = cuisineHidden.value;
    const price = priceHidden.value; 
    const rating = ratingElement.value; 
    const date = dateElement.value;
    const reviewText = reviewElement.value;

    if (username.length < 1 || username.length > 200) { 
      alert("Please enter a valid username (1-200 characters)."); 
      userElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (restaurantText.length < 1) { 
      alert("Please enter the name of the restaurant."); 
      restElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (neighborhood === "") { 
      alert("Please select a neighborhood."); 
      neighBtn.classList.add('border', 'border-danger', 'border-2');
      return;
    } 
    if (cuisine === "") { 
      alert("Please select a cuisine."); 
      cuisineBtn.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (price === "") {
      alert("Please select a price range.");
      priceBtn.classList.add('border', 'border-danger', 'border-2');
      return;
    }
    if (rating.length < 1 || parseInt(rating) < 0 || parseInt(rating) > 10) { 
      alert("Please enter a valid rating between 0 and 10."); 
      ratingElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (date === "") { 
      alert("Please enter a valid date."); 
      dateElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (reviewText.length < 1 || reviewText.length > 2000) { 
      alert("Please enter a valid review (1-2000 characters)."); 
      reviewElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }

    const isRestaurantValid = await verifyRestaurantRegionAndCuisine(restaurantText, neighborhood, cuisine);

    if (isRestaurantValid === false) {
      alert("The restaurant does not exist in the selected neighborhood and cuisine.");
      restElement.classList.add('border', 'border-danger', 'border-2');
      neighBtn.classList.add('border', 'border-danger', 'border-2');
      cuisineBtn.classList.add('border', 'border-danger', 'border-2');
      return;
    }

    const [year, month, day] = date.split('-');
    const brazilianDate = `${day}/${month}/${year}`;

    addUsername(username);
    addRestaurantText(restaurantText);
    addNeighborhood(neighborhood); 
    addCuisine(cuisine); 
    addPrice(price);
    addRating(rating); 
    addDate(brazilianDate);
    addReviewText(reviewText);
    
    userElement.value = "";
    restElement.value = "";
    ratingElement.value = "";
    dateElement.value = "";
    reviewElement.value = "";
    
    neighHidden.value = ""; 
    neighHidden.closest('.dropdown').querySelector('.dropdown-text').innerText = "Select";
    
    cuisineHidden.value = "";
    cuisineHidden.closest('.dropdown').querySelector('.dropdown-text').innerText = "Select";
    
    priceHidden.value = ""; 
    priceHidden.closest('.dropdown').querySelector('.dropdown-text').innerText = "Select";

    alert("Your review was successfully posted!");
  });

  document.querySelectorAll('.elegant-input').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('border', 'border-danger', 'border-2');
    });
  });

  document.querySelectorAll('#reviewScreen .dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
      const dropdownBtn = this.closest('.dropdown').querySelector('.dropdown-toggle');
      dropdownBtn.classList.remove('border', 'border-danger', 'border-2');
    });
  });
});