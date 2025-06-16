document.querySelectorAll(".remove-wishlist-btn").forEach((button) => {
  button.addEventListener("click", () => {
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
        button.closest(".wishlist-card").remove();
      })
      .catch((err) => {
        console.error("Failed to remove:", err);
      });
  });
});
