/* 
Article in cart
<article>
   <img src="img/01.png" alt="">
   <h2>Eclat Ethéré : Bird</h2>
   <p>Format 40 x 30</p>
   <p>35,25€</p>
   <div class="input-container">
      <label for="quantity">Quantité : </label>
      <input type="number" name="quantity" id="quantity"  placeholder="2" value="2" minlength="1">
   </div>
   <button>Supprimer</button>
</article>

If no article
<article>
   <p>Votre panier est vide. Veuillez ajouter au moins un article à votre panier</p>
</article>

Modale
<dialog>
   <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Félicitations</p>
   <p>La commande a été passée avec succès</p>
   <p id="command-number">Votre numéro de commande est : XXXXXXXXXXXX</p>
</dialog>
*/

// const modale = document.querySelector('dialog')
// modale.showModal()

// Var to get the total
let totalPrice = 0;
let totalArticle = 0


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
function modaleDelete(key, article, quantity, price){
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
      // Updating visually total articles and price
      const showTotal = document.querySelector('#total-article')
      showTotal.innerText = `${totalArticle} articles pour un montant de ${totalPrice} €`
      localStorage.removeItem(key)
      article.remove()
      modale.remove()
   })
}

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
      // Getting the correct price for the article and format
      const formats = dataComplete.declinaisons
      const choice = data.format.slice(7)
      const price = formats.find(el => String(el.taille) === String(choice)).prix
      console.log(price)
      console.log(dataComplete)
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
      console.log(`Clé : ${key}`, data);
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
         modaleDelete(key, newArticle, data.quantity, price)
      })
   });
}

// Verifying the datas in the form