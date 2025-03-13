/* 
Modale
<dialog>
   <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Félicitations</p>
   <p>La commande a été passée avec succès</p>
   <p id="command-number">Votre numéro de commande est : XXXXXXXXXXXX</p>
</dialog>
*/

// Function to load the data to get price and image
async function getData(id) {
   const req = await fetch(`http://localhost:3000/api/products/${id}`)
   return await req.json()
}

// Function to show an error when too many articles are in cart
function modaleErrorShow(value){
   const article = document.querySelector('article')
   const modale = document.createElement('dialog')
   article.after(modale)
   modale.innerHTML = value > 0 ? `
      <i class="fa-solid fa-xmark"></i>
      <p id="title-modale">Erreur</p>
      <p>Vous ne pouvez pas avoir ${value} unité(s) dans votre panier, veuillez sélectionner entre 1 et 100 unités</p>
      ` : `
      <i class="fa-solid fa-xmark"></i>
      <p id="title-modale">Erreur</p>
      <p>Vous ne pouvez pas avoir ${value} unité(s) dans votre panier, veuillez sélectionner entre 1 et 100 unités. Pour supprimer un produit du panier, cliquez sur le bouton "Supprimer"</p>
      `;
   modale.showModal()
   const cross = document.querySelector('.fa-xmark')
   cross.addEventListener('click', e => {
      modale.remove()
   })
}

// Function to confirm the deletion of an article
function modaleDelete(key, article, quantity, price, id){
   const modale = document.createElement('dialog')
   modale.id = "delete"
   article.after(modale)
   modale.innerHTML = `
      <i class="fa-solid fa-xmark"></i>
      <p id="title-modale">Supprimer un article</p>
      <p>Êtes-vous sûr de vouloir supprimer cet article ?</p>
      <div>
         <button id="yes">Oui</button>
         <button id="no">Non</button>
      </div>
      `;
   modale.showModal()

   // Listening to the cross to remove the modal
   const cross = document.querySelector('.fa-xmark')
   cross.addEventListener('click', e => {
      modale.remove()
   })

   // Closing the modal if user refuses to delete the article
   const noButton = document.querySelector('#no')
   noButton.addEventListener('click', e => {
      modale.remove()
   })

   // Deleting the article if user confirms the deletion
   const yesButton = document.querySelector('#yes')
   yesButton.addEventListener('click', e => {
      totalArticle -= quantity
      totalPrice -= (price * quantity)
      totalPrice = Number(totalPrice.toFixed(2))

      // Deleting id from the cart
      const index = cart.indexOf(id);
      if (index !== -1) {
         cart.splice(index, 1); // Supprime un seul élément à l'index trouvé
      }

      // Updating visually total articles and price
      const showTotal = document.querySelector('#total-article')
      showTotal.innerText = `${totalArticle} articles pour un montant de ${totalPrice} €`
      localStorage.removeItem(key)
      article.remove()
      modale.remove()
   })
}

// Function to display form errors' modal
function modaleErrorForm(errors){
   const modale = document.createElement('dialog')
   modale.innerHTML = `
   <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Erreur</p>
   <p>Les champs suivants sont invalides, veuillez les vérifier</p>
   <ul>

   </ul>
   `
   form.after(modale)
   const errorList = document.querySelector('dialog > ul')
   for (const error of errors) {
      errorList.insertAdjacentHTML('beforeend', `<li>${error}</li>`)
   }
   modale.showModal()
   const cross = document.querySelector('.fa-xmark')
   cross.addEventListener('click', e => {
      modale.remove()
   })
   setTimeout(() => {
      modale.remove()
   }, 3000);
}

// Function to show a modal when order is confirmed
function modaleConfirmOrder(commandNumber){
   const modale = document.createElement('dialog')
   modale.innerHTML = `
   <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Félicitations</p>
   <p>La commande a été passée avec succès</p>
   <p id="command-number">Votre numéro de commande est : ${commandNumber}</p>
   `
   form.after(modale)
   modale.showModal()
   const cross = document.querySelector('.fa-xmark')
   cross.addEventListener('click', e => {
      modale.remove()
   })
}

// Function to clear all after order
function clearPage(){
   Object.keys(localStorage).forEach(() => {
   
      // Updating visually total articles and price
      const article = document.querySelector('article')
      article.remove()
   })

   // Emptying localStorage
   localStorage.clear()

   // Emptying cart
   cart = []

   // Updating total's values
   totalArticle = 0
   totalPrice = 0

   // Display change
   const showTotal = document.querySelector('#total-article')
   showTotal.innerText = `${totalArticle} articles pour un montant de ${totalPrice} €`
}

// Function to send the order's datas
async function sendOrder(contact, products) {
   try {       
      // POST request
      const req = await fetch("http://localhost:3000/api/products/order", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({contact, products})
      });
  
      // Verifying if request was successful
      if (!req.ok) {
          throw new Error(`Erreur HTTP : ${req.status}`);
      }
  
      const res = await req.json();

      // Display order number
      modaleConfirmOrder(res.orderId)

      // Emptying cart, page and localStorage

  } catch (error) {
      console.error("Erreur :", error);
  }
}

// Var to get the total
let totalPrice = 0;
let totalArticle = 0

// List of ids for the order
let cart = []

// Gather all the datas in the localStorage
const divArticles = document.querySelector('#articles')
if (localStorage.length === 0) {
   divArticles.insertAdjacentHTML('afterbegin', `
      <article>
         <p>Votre panier est vide. Veuillez ajouter au moins un article à votre panier</p>
      </article>`)
} else {
   Object.keys(localStorage).forEach(async key => {

      // Load the articles in the cart
      const data = JSON.parse(localStorage.getItem(key));

      // Load the full article's information for price and image
      const dataComplete = await getData(data.id)

      // Save the id in the cart
      cart.push(String(dataComplete._id))

      // Getting the correct price for the article and format
      const formats = dataComplete.declinaisons
      const choice = data.format.slice(7)
      const price = formats.find(el => String(el.taille) === String(choice)).prix

      // Addind visually the article to cart
      const newArticle = document.createElement('article')
      newArticle.innerHTML = `
            <img src="${dataComplete.image}" alt="${dataComplete.titre}">
            <h2>${dataComplete.titre}</h2>
            <p>${data.format}</p>
            <p>${price} €</p>
            <div class="input-container">
               <label for="quantity-${key}">Quantité : </label>
               <input type="number" name="quantity-${key}" id="quantity-${key}"  placeholder="${data.quantity}" value="${data.quantity}" minlength="1">
            </div>
            <button id="delete-${key}">Supprimer</button>
         `
      divArticles.prepend(newArticle)

      // Counting total articles and price
      totalArticle += data.quantity
      totalPrice += (price * data.quantity)
      totalPrice = Number(totalPrice.toFixed(2))

      // Updating visually total articles and price
      const showTotal = document.querySelector('#total-article')
      showTotal.innerText = `${totalArticle} articles pour un montant de ${totalPrice} €`

      // Listening for a quantity change to update the cart, localStorage and totalArticle/totalPrice
      const quantityInput = document.querySelector(`#quantity-${key}`)
      quantityInput.addEventListener('input', e => {
         const newValue = quantityInput.value
         const oldValue = data.quantity
         if(newValue > 100){
            modaleErrorShow(newValue)
            quantityInput.value = 100
            return;
         }
         if(newValue < 1){
            modaleErrorShow(newValue)
            quantityInput.value = 1
            return;
         }
         data.quantity = Number(newValue)
         localStorage.setItem(key, JSON.stringify(data))
         totalArticle += (newValue - oldValue)
         totalPrice += (newValue - oldValue) * price
         totalPrice = Number(totalPrice.toFixed(2))
         const showTotal = document.querySelector('#total-article')
         showTotal.innerText = `${totalArticle} articles pour un montant de ${totalPrice} €`
      })

      // Deleting an article from the cart
      const deleteButton = document.querySelector(`#delete-${key}`)
      deleteButton.addEventListener('click', e => {
         modaleDelete(key, newArticle, data.quantity, price, dataComplete._id)
      })

   });
}

// Verifying the datas in the form
const form = document.querySelector('form')
form.addEventListener('submit', e => {
   e.preventDefault()
   let firstName;
   let lastName;
   let address;
   let city;
   let email;
   let error = []
   const regexFirstName = /^[a-zA-ZÀ-ÿ- ]{2,}$/
   const regexLastName = /^[a-zA-ZÀ-ÿ- ]{2,}$/
   const regexAddress = /^[a-zA-Z0-9à-ÿÀ-ÿ' -]{10,}$/
   const regexCity = /^[a-zA-Zà-ÿÀ-ÿ -]{3,}$/
   const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/
   const firstNameInput = document.querySelector('#first-name')
   if(regexFirstName.test(firstNameInput.value)){
      firstName = firstNameInput.value
   } else {
      error.push('Prénom')
   }
   
   const lastNameInput = document.querySelector('#last-name')
   if(regexLastName.test(lastNameInput.value)){
      lastName = lastNameInput.value
   } else {
      error.push('Nom')
   }

   const addressInput = document.querySelector('#address')
   if(regexAddress.test(addressInput.value)){
      address = addressInput.value
   } else {
      error.push('Adresse')
   }

   const cityInput = document.querySelector('#city')
   if(regexCity.test(cityInput.value)){
      city = cityInput.value
   } else {
      error.push('Ville')
   }

   const emailInput = document.querySelector('#mail')
   if(regexEmail.test(emailInput.value)){
      email = emailInput.value
   } else {
      error.push('Email')
   }

   if(error != ""){
      modaleErrorForm(error)
      return
   }

   const contact = {firstName, lastName, address, city, email}

   if(cart != ""){
      sendOrder(contact, cart)
      clearPage()
   }
})