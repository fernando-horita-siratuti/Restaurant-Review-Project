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
  const button = document.querySelector("button.btn.btn-primary");
  const form = document.getElementById("postForm");

  button.addEventListener("click", async (e) => {
    e.preventDefault(); 

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

    const allElements = [restElement, neighBtn, cuisineBtn, priceBtn, ratingElement, dateElement, reviewElement];
    allElements.forEach(el => el.classList.remove('border', 'border-danger', 'border-2'));

    const restaurantText = restElement.value;
    const neighborhood = neighHidden.value; 
    const cuisine = cuisineHidden.value;
    const price = priceHidden.value; 
    const rating = ratingElement.value; 
    const date = dateElement.value;
    const reviewText = reviewElement.value;

    const today = new Date();
    const todayFormatted = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

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
    if (rating.length < 1 || parseFloat(rating) < 0 || parseFloat(rating) > 10) { 
      alert("Please enter a valid rating between 0 and 10."); 
      ratingElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (date === "") { 
      alert("Please enter a valid date."); 
      dateElement.classList.add('border', 'border-danger', 'border-2');
      return; 
    }
    if (date > todayFormatted) {
      dateElement.classList.add('border', 'border-danger', 'border-2');
      alert("The date of your visit cannot be in the future.");
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

    form.submit();
  });

  document.querySelectorAll('.elegant-input').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('border', 'border-danger', 'border-2');
    });
  });

  document.querySelectorAll('#reviewScreen .dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault(); // Evita que a página pule para o topo
      
      // 1. Pega o valor e o texto da opção clicada
      const value = this.getAttribute('data-value');
      const text = this.innerText;
      const dropdown = this.closest('.dropdown');
      
      // 2. Muda o texto do botão para o que o usuário escolheu
      dropdown.querySelector('.dropdown-text').innerText = text;
      
      // 3. Salva o valor no input "hidden" (é isso que vai para o Node.js/Validação!)
      dropdown.querySelector('input[type="hidden"]').value = value;
      
      // 4. Remove a borda vermelha de erro (se tiver)
      const dropdownBtn = dropdown.querySelector('.dropdown-toggle');
      dropdownBtn.classList.remove('border', 'border-danger', 'border-2');
    });
  });
});