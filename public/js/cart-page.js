/* 
 DOMContentLoaded : This runs the enclosed code only after the full HTML is parsed.

It ensures that all elements (like cart-items, checkout-btn, etc.) are available in the DOM before JavaScript interacts with them.
*/

document.addEventListener("DOMContentLoaded", () => {
  // Grabs references to DOM elements used to render cart items and display the grand total.
  const cartItemsContainer = document.getElementById("cart-items");
  const grandTotal = document.getElementById("grand-total");

  // Fetches the cart from localStorage. Parses it from JSON to an object. Returns an empty object if nothing exists.
  const getCart = () => JSON.parse(localStorage.getItem("cart")) || {};

  // Saves the cart object to localStorage after converting it to a JSON string.
  const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));

  // Calculates the total quantity of all cart items. Updates the .cart-count element with that number.

  const updateCartCount = () => {
    const cart = getCart();
    const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) cartCount.textContent = count;
  };

  /* 
      - Increases or decreases the quantity of a product in the cart.
      - Ensures quantity doesn’t go below 1.
      - Saves the updated cart and re-renders the items.
    */

  const changeQty = (productId, type) => {
    const cart = getCart();
    if (!cart[productId]) return;

    if (type === "plus") {
      cart[productId].qty += 1;
    } else if (type === "minus") {
      cart[productId].qty = Math.max(1, cart[productId].qty - 1);
    }

    saveCart(cart);
    renderCartItems();
  };

  /* 
      - Clears the cart display (innerHTML = "")
      - Loops through cart items and:
      - Displays product details (image, name, price, quantity).
      - Adds buttons to increase/decrease quantity and remove item.
      - Updates the grand total and cart count.
    
    */
  const renderCartItems = () => {
    const cart = getCart();
    cartItemsContainer.innerHTML = "";

    let total = 0;

    Object.values(cart).forEach((item) => {
      total += item.qty * item.price;

      cartItemsContainer.innerHTML += `
          <div class="cart-item" data-id="${item.productId}">
            <img src="${item.image}" alt="${item.name}" />
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p>Price: $${item.price.toFixed(2)}</p>
              <div class="cart-qty-controls">
                <button class="minus-btn">−</button>
                <span class="qty">${item.qty}</span>
                <button class="plus-btn">+</button>
                <button class="remove-btn" data-id="${
                  item.productId
                }">&times;</button>
              </div>
            </div>
          </div>
        `;
    });

    grandTotal.textContent = total.toFixed(2);
    updateCartCount();
  };

  // remove item from cart. Deletes the specified item from the cart. Saves the new cart and re-renders the list.

  const removeItem = (productId) => {
    const cart = getCart();
    if (cart[productId]) {
      delete cart[productId];
      saveCart(cart);
      renderCartItems();
    }
  };

  // Event delegation: handles clicks for dynamically rendered plus/minus buttons

  /* 
       - Uses event delegation so even dynamically created buttons work.
  
        - Detects whether the clicked button is:
  
        - A plus button → increase quantity.
  
        - A minus button → decrease quantity.
  
        - A remove button → delete item from cart. 
  
  */
  cartItemsContainer.addEventListener("click", (e) => {
    const target = e.target;
    const cartItem = target.closest(".cart-item");
    if (!cartItem) return;

    const productId = cartItem.dataset.id;
    if (target.classList.contains("plus-btn")) {
      changeQty(productId, "plus");
    } else if (target.classList.contains("minus-btn")) {
      changeQty(productId, "minus");
    } else if (e.target.classList.contains("remove-btn")) {
      removeItem(e.target.dataset.id);
    }
  });

  renderCartItems();
});

// checkout:
/* 
      Checks if cart is empty, If not, it:
  
      - Generates a unique order code like ORD654321.
  
      - Displays that code in the payment modal.
  
      - Stores the code + items in a temporary object (window.checkoutSession).
  
      - Shows the checkout modal.
  */

document.getElementById("checkout-btn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const items = Object.values(cart);

  if (items.length === 0) return alert("Your cart is empty.");

  // Generate unique code
  const code = "ORD" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("payment-code").textContent = code;

  // Save code + items temporarily to window
  window.checkoutSession = { code, items };

  // Show modal
  document.getElementById("checkout-modal").style.display = "flex";
});

// Hides the checkout modal when the user clicks the "X" button.
document.getElementById("close-modal-btn").addEventListener("click", () => {
  document.getElementById("checkout-modal").style.display = "none";
});

/* 
     Sends the order details (code + items) to the backend using fetch(). If the response is successful:
  
      - Shows success alert
  
      - Clears the cart
  
      - Reloads the page
  
      - Otherwise, shows an error alert.
  
  */
document
  .getElementById("confirm-payment-btn")
  .addEventListener("click", async () => {
    const { code, items } = window.checkoutSession;

    const response = await fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, items }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Your payment record has been submitted successfully!");
      localStorage.removeItem("cart");
      window.location.reload();
    } else {
      alert("Something went wrong.");
    }
  });
