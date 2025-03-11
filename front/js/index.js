async function displayWork() {
   const req = await fetch('http://localhost:3000/api/products/')
   const res = await req.json()
   res.forEach(el => {
      const product = document.querySelector('.products')
      product.insertAdjacentHTML('beforeend',`
         <article>
               <img src="${el.image}" alt="${el.titre}">
               <a href="product.html?id=${el._id} ">Buy ${el.shorttitle}</a>
         </article>
      `)
   })
}

displayWork()