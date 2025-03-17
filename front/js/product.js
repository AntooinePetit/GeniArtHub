async function getData() {

   try{
      // Get id from URL
      const url = new URLSearchParams(window.location.search)
      const work = url.get('id')
   
      // Get work with id
      const req = await fetch(`http://localhost:3000/api/products/${work}`)
      const res = await req.json()

      getWork(res)

   } catch(error){
      console.error(error)
      
      displayError()
   }
}

function displayError(){
   // Changing the page title
   const pageTitle = document.querySelector('title')
   pageTitle.innerText = `Oeuvre inconnue - GeniArtHub`

   const article = `
      <article class="error">
               <h1>Erreur 404 ! Cette oeuvre n'existe pas</h1>
      </article>
   `

   // Changing page content
   const detailOeuvre = document.querySelector('.detailoeuvre')
   detailOeuvre.innerHTML = article
}

function getWork(work) {
   // Changing the page title
   const pageTitle = document.querySelector('title')
   pageTitle.innerText = `${work.titre} - GeniArtHub`

   // Creating long description
   const long = longDescription(work.description)

   // Creating short description (2 sentences)
   const short = shortDescription(work.description)

   // Creating page content
   const article = `
   <article>
      <figure>
            <img src="${work.image}" alt="${work.titre}">
      </figure>
      <div>
            <h1>${work.titre}</h1>
            <p>${short}</p>
            <div class="price">
               <p>Acheter pour</p>
               <span class="showprice">${work.declinaisons[0].prix} €</span>
            </div>
            <div class="declinaison">
               <input type="number" name="quantity" id="quantity" placeholder="1" value="1" minlength="1">
               <select name="format" id="format">
               </select>
            </div>
            <a class="button-buy" href="#">Buy ${work.shorttitle}</a>
      </div>
   </article>

   <aside>
      <h2>Description de l’oeuvre :  ${work.titre}</h2>
      ${long}
   </aside>
   `
   // Changing page content
   const detailOeuvre = document.querySelector('.detailoeuvre')
   detailOeuvre.innerHTML = article

   // Loading prices in the select
   const selectFormat = document.querySelector('#format')
   work.declinaisons.forEach(format => {
      selectFormat.insertAdjacentHTML('beforeend', `<option>Format ${format.taille}</option>`)
   })

   // Listening to the #format selection to display the price
   selectFormat.addEventListener('input', e => {
      const showPrice = document.querySelector('.showprice')
      const formats = work.declinaisons
      const choice = selectFormat.value.slice(7)
      const format = formats.find(el => String(el.taille) === String(choice))
      showPrice.innerText = `${format.prix} €`
   })

   // Verifying if user tries to buy the correct quantity
   const buttonBuy = document.querySelector('.button-buy')
   buttonBuy.addEventListener('click', e => {
      e.preventDefault()
      const quantity = document.querySelector('#quantity')
      if(quantity.value > 100 || quantity.value < 1){
         modaleErrorShow(quantity.value)
      } else {
         saveData(work._id, quantity.value, selectFormat.value)
      }
   })
}

// Function to format the long description
function longDescription(text){
   // Split text into sentences while keeping punctuation
   const sentences = text.match(/[^.!?]+[.!?]/g) || []; 
   let paragraphs = [];

   // Group sentences in pairs
   for (let i = 0; i < sentences.length; i += 2) {
      const chunk = sentences.slice(i, i + 2).join(' ').trim();
      paragraphs.push(`<p>${chunk}</p>`);
   }

   // Return a string containing multiple <p> tags
   return paragraphs.join('');
}

// Function to return the 2 first sentences of the description
function shortDescription(text){
   // Extract the first 2 sentences
   const sentences = text.match(/[^.!?]+[.!?]/g) || [];  
   return sentences.slice(0, 2).join(' ').trim(); 
}

function modaleErrorShow(value){
   const article = document.querySelector('article')
   const modale = document.createElement('dialog')
   article.after(modale)
   modale.innerHTML = `
   <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Erreur</p>
   <p>Vous ne pouvez pas avoir ${value} unité(s) dans votre panier, veuillez sélectionner entre 1 et 100 unités</p>
   `
   modale.showModal()
   const cross = document.querySelector('.fa-xmark')
   cross.addEventListener('click', e => {
      modale.remove()
   })
}

function modaleValidateShow(){
   const article = document.querySelector('article')
   const modale = document.createElement('dialog')
   article.after(modale)
   modale.innerHTML = `
   <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Ajouté au panier</p>
   <p>Votre produit a bien été ajouté au panier</p>
   `
   modale.showModal()
   const cross = document.querySelector('.fa-xmark')
   cross.addEventListener('click', e => {
      modale.remove()
   })
   setTimeout(() => {
      modale.remove()
   }, 3000);
}

// function saveData(id, value, format){
//    const safeFormat = format.replace(/\s+/g, '-');
//    const key = `article-${id}-${safeFormat}`
//    const existingProduct = localStorage.getItem(key)

//    if(existingProduct){
//       const productData = JSON.parse(existingProduct)
//       productData.quantity += Number(value);
//       if(productData.quantity > 100){
//          modaleErrorShow(productData.quantity)
//       } else {
//          localStorage.setItem(key, JSON.stringify(productData))
//          modaleValidateShow()
//       }
//       return;
//    }
//    const product = {id : String(id), quantity : Number(value), format:String(format)}
//    localStorage.setItem(key, JSON.stringify(product))
//    modaleValidateShow()
// }

function saveData(id, value, format){
   const quantity = parseInt(value);

   // We build our cart OR we get the cart if it already exists
   const cart = JSON.parse(localStorage.getItem('cart')) || []

   // We check if the artwork is already in the cart
   const existingProductIndex = cart.findIndex(el => el.id === id && el.taille === format)

   if(existingProductIndex === -1){
      cart.push({
         id,
         taille: format,
         quantity
      })
      modaleValidateShow()
      localStorage.setItem("cart", JSON.stringify(cart))
      return
   }

   // Product is already in the cart, we check if new quantity is less than 100, and if it's good > add to cart
   const currentQuantity = cart[existingProductIndex].quantity
   const newQuantity = currentQuantity + quantity

   // If new quantity is more than 100, we show an error message
   if(newQuantity > 100){
      modaleErrorShow(newQuantity)
      return
   }

   // Update the quantity of the product in the cart
   cart[existingProductIndex].quantity = newQuantity
   localStorage.setItem("cart", JSON.stringify(cart))
   modaleValidateShow()
}

getData()