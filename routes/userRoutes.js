const express = require("express");
const router = express.Router();

const {
  home,
  wishlist,
  getWishlist,
  removeFromWishlist,
  getProfilePage,
  updateUserProfile,
  CreateProduct,
  createProductPost,
  getAllProducts,
  editProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  createCategoryPost,
  getProductsByCategory,
  upload,
  cartDetails,
  checkout,
  getAllOrders,
  searchProduct,
  getMyOrders,
  updateOrderStatus,
  getContactPage,
} = require("../controllers/userController");

const { isAdmin, isAuthenticated } = require("../middlewares/auth");

router.get("/", home);

router.post("/wishlist/add", isAuthenticated, wishlist);

router.get("/wishlist", isAuthenticated, getWishlist);

router.post("/wishlist/remove", isAuthenticated, removeFromWishlist);

router.get("/profile", isAuthenticated, getProfilePage);

router.post(
  "/profile/update",
  upload.single("image"),
  isAuthenticated,
  updateUserProfile
);

router.get("/admin/create-product", isAdmin, CreateProduct);

router.post(
  "/admin/create-product",
  upload.single("imageUrl"),
  isAdmin,
  createProductPost
);
router.get("/admin/get-products", isAdmin, getAllProducts);

router.get("/edit-products/:id", isAdmin, editProduct);

router.post("/products/:id", upload.single("imageUrl"), isAdmin, updateProduct);

router.delete("/products/:id", isAdmin, deleteProduct);

router.get("/admin/createCategory", isAdmin, createCategory);

router.post(
  "/admin/createCategory",
  upload.single("image"),
  isAdmin,
  createCategoryPost
);

router.get("/categories/:categoryName", isAuthenticated, getProductsByCategory);

router.get("/viewCart", cartDetails); // get cart page

router.post("/checkout", isAuthenticated, checkout); // save checkout record

router.get("/admin/orders", isAdmin, getAllOrders); // see orders. Please add this route to only admins can see in the frontend

router.post("/search", searchProduct);

router.get("/my-orders", isAuthenticated, getMyOrders);

router.post('/admin/orders/:id/deliver', isAdmin, updateOrderStatus);

router.get('/contact', getContactPage);

module.exports = router;
