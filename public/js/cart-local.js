// localStorage stores the cart items in the browser.For now we have not synced the local storage to our database so the items in the localStorage will not be persistent across differnet devices.

document.addEventListener("DOMContentLoaded", () => {
  const cartBtns = document.querySelectorAll(".cart");
  const plusBtns = document.querySelectorAll(".plus-btn");
  const minusBtns = document.querySelectorAll(".minus-btn");
  const cartCount = document.querySelector(".cart-count");

  /*
    window.getCart

    Retrieves the saved cart from localStorage.

    Parses it from JSON and returns it as an object.

    If nothing is saved, it returns an empty object {}.

    // Expose globally - we're defining a global function called getCart and attaching it to the window object.That means you can now call this function from anywhere in your JavaScript (or even from the browser console) like: window.getCart(); or simply getCart();

  */
  window.getCart = () => {
    return JSON.parse(localStorage.getItem("cart")) || {};
  };

  /* 
     window.saveCart

    Takes a cart object as input.

    Converts it to a JSON string.

    Saves it to localStorage under the key "cart".
  */
  window.saveCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  /*
    Counts total items in the cart by summing all quantities using reduce (readup array higher order functions).

    Updates the cart count display on the page (on the cart icon).
  */

  window.updateCartCount = () => {
    const cart = getCart();
    const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.textContent = count;
  };

  /* 
  
    Changes the quantity of a product in the cart.

      If type is "plus", it adds one.

      If type is "minus", it subtracts one but ensures minimum quantity is 1.

      Then it saves the cart and updates the count.
  */

  window.changeQty = (productId, type) => {
    const cart = getCart();

    if (cart[productId]) {
      if (type === "plus") {
        cart[productId].qty += 1;
      } else if (type === "minus") {
        cart[productId].qty = Math.max(1, cart[productId].qty - 1); //Math.max(1, ...): ensure the result is never less than 1.
      }
      saveCart(cart);
      updateCartCount();
    }
  };

  /* 
    Adds a new product to the cart if it’s not already there.

   Sets initial quantity to 1 and saves the cart.
 */

  const addToCart = (productId, name, price, image) => {
    const cart = getCart();
    if (!cart[productId]) {
      cart[productId] = { productId, name, price, image, qty: 1 };
      saveCart(cart);
      updateCartCount();
    }
  };

  /* 
    This code ensures that:

    A product can only be added once to the cart.

    The product's details are gathered from the DOM.

    Feedback is given to the user, both visually (button text/disable) and via alert.

      1. cartBtns.forEach(...)
      Loops through every "Add to Cart" button on the page.

      Attaches a click event listener to each one.

      2. e.target.closest(".category-product-card")
      Finds the entire product card containing the clicked button.
      This ensures we get data from the correct product.

       3. Extracts Product Details:
        productId: From a hidden data-product-id attribute, name: Text content of the product’s title, price: Extracts number from the price text (removes $), image: Gets the product image URL,.

      4. Checks if the item is already in the cart: 
          - Calls the getCart() function to fetch the current cart from localStorage.
          - If this product is not yet in the cart, it proceeds to add it.
  
  */

  cartBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".category-product-card");
      const productId = card.querySelector(".category-wishlist-btn").dataset
        .productId;
      const name = card.querySelector("h3").textContent;
      const price = parseFloat(
        card.querySelector(".category-price").textContent.replace("$", "")
      );
      const image = card.querySelector("img").getAttribute("src");

      const cart = getCart();

      if (!cart[productId]) {
        addToCart(productId, name, price, image);
        alert("Added to cart!");
        btn.textContent = "Added";
        btn.disabled = true;
        btn.classList.add("added");
      } else {
        alert("Already in cart — use + or - to update quantity.");
      }
    });
  });

  /* 
      Adds click event to plus buttons.
        
      Increases the quantity using changeQty.
  */

  plusBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".category-product-card"); //.closet() is a DOM method that looks for the nearest ancestor of an element (including the element itself) that matches the given CSS selector.
      const productId = card.querySelector(".category-wishlist-btn").dataset
        .productId;
      changeQty(productId, "plus");
    });
  });

  /* 
  
     Adds click event to minus buttons.

      Decreases the quantity using changeQty.
  */

  minusBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".category-product-card");
      const productId = card.querySelector(".category-wishlist-btn").dataset
        .productId;
      changeQty(productId, "minus");
    });
  });

  // Mark 'Add to Cart' buttons as added on load

  /* 
   When the page loads, it checks the cart and updates any “Add to Cart” buttons for products already added.

   Prevents re-adding.
  */

  const cart = getCart();
  cartBtns.forEach((btn) => {
    const card = btn.closest(".category-product-card")
    const productId = card.querySelector(".category-wishlist-btn").dataset
    .productId;

    if (cart[productId]) {
      btn.textContent = "Added to cart";
      btn.disabled = true;
      btn.classList.add("added");
    }
  });
  updateCartCount(); //on load
});
