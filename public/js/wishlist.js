const wishlistButtons = document.querySelectorAll(".category-wishlist-btn");

wishlistButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("clicked");

    const icon = button.querySelector("i");
    if (button.classList.contains("clicked")) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");

      const productId = button.dataset.productId;

      fetch("/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.message);
        })
        .catch((err) => {
          console.error("Failed to add to wishlist:", err);
        });
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");

      const productId = button.dataset.productId;

      fetch("/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.message);
        })
        .catch((err) => {
          console.error("Failed to remove from wishlist:", err);
        });
    }
  });
});
