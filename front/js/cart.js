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

// Function to load the data to get price and image
async function getData(id) {
   
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
      const data = JSON.parse(localStorage.getItem(key));
      const dataComplete = await getData(data.id)
      divArticles.insertAdjacentHTML('afterbegin', `
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
         `)
      console.log(`Clé : ${key}`, data);
   });
}