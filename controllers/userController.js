const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/categories");
const multer = require("multer");
const path = require("path");
const Order = require("../models/order");
const nodemailer = require("nodemailer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

const home = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("home", { title: "Home", categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const wishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyInWishlist = user.wishlist.some(
      (item) => item.toString() === productId
    );

    if (!alreadyInWishlist) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.status(200).json({ message: "Added to wishlist" });
  } catch (err) {
    console.error("Wishlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user)
      return res.status(404).render("404", { title: "User not found" });

    res.render("wishlist", {
      title: "Your Wishlist",
      wishlistItems: user.wishlist,
    });
  } catch (err) {
    console.error("Failed to load wishlist:", err);
    res.status(500).render("500", { title: "Server error" });
  }
};

const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== productId
    );

    await user.save();

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const message = req.query.message
      ? { text: req.query.message, type: req.query.type || "success" }
      : null;

    res.render("profile", { user, message });
  } catch (err) {
    console.error("Profile load error:", err);
    res.status(500).render("500", { title: "Server Error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.render("profile", {
        user: null,
        message: { text: "User not found", type: "error" },
      });
    }

    const newUsername = req.body.username?.trim();
    const newImage = req.file ? req.file.filename : user.image;

    if (!newUsername) {
      return res.render("profile", {
        user,
        message: { text: "Username cannot be empty", type: "error" },
      });
    }

    user.username = newUsername;
    user.image = newImage;
    await user.save();

    return res.render("profile", {
      user,
      message: {
        text: "Profile updated successfully",
        type: "success",
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).render("profile", {
      user: null,
      message: { text: "Server error during update", type: "error" },
    });
  }
};

const CreateProduct = async (req, res) => {
  const categories = await Category.find();
  res.render("admin/create-product", { categories });
};

const createProductPost = async (req, res) => {
  try {
    if (!req.body || !req.file) {
      return res.status(400).send("Form data or image missing");
    }

    const { name, price, category } = req.body;

    const product = new Product({
      name,
      price,
      category,
      image: `/uploads/${req.file.filename}`,
    });

    await product.save();
    res.redirect("/admin/get-products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("admin/get-products", { products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const categories = await Category.find();

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.render("edit-product", {
      product,
      categories,
      selectedCategoryId: product.category.toString(),
    });
  } catch (err) {
    console.error("Edit product error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name;
    product.price = price;
    product.category = category;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    res.redirect("/admin/get-products");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

const createCategory = (req, res) => {
  res.render("admin/createCategory");
};

const createCategoryPost = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!name || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await Category.create({ name, image });

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;

  try {
    const products = await Product.find({
      category: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
    });

    res.render("category-products", {
      title: `${categoryName} Products`,
      categoryName,
      products,
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const cartDetails = async (req, res) => {
  try {
    res.render("viewCart");
  } catch (err) {
    console.error("Error fetching cart-details", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const transporter = nodemailer.createTransport({
  host: "mail.codebadgertech.com",
  port: 465,
  auth: {
    user: "training@codebadgertech.com",
    pass: "training@30",
  },
});

const checkout = async (req, res) => {
  try {
    const { items, code } = req.body;

    if (!items || !code) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    console.log("Received items:", items); // Debug log

    const order = new Order({
      user: req.user._id,
      items,
      code,
    });

    await order.save();

    const user = await User.findById(req.user._id);

    if (user) {
      const itemsHtml = items
        .map(
          (item) => `<li>${item.name} : ${item.qty || 1} × $${item.price}</li>`
        )
        .join("");

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.qty || 1) * item.price,
        0
      );

      const mailOptions = {
        from: "training@codebadgertech.com",
        to: user.email,
        subject: "Your Order Confirmation",
        html: `
          <div style="max-width: 500px; margin: auto; padding: 20px; border-radius: 8px; background: #f9f9f9; border: 1px solid #e0e0e0; font-family: Arial, sans-serif;">
            <h2 style="color: #1a73e8; text-align: center;">Thank you for your order, ${
              user.username
            }!</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">Here are your order details:</p>
            <ul style="font-size: 16px; color: #333; padding-left: 20px;">
              ${itemsHtml}
            </ul>
            <p style="font-size: 16px; font-weight: bold; color: #333;">Total: $${totalAmount}</p>
            <p style="font-size: 14px; color: #555;">We appreciate your purchase! You will receive updates as your order ships.</p>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
              &copy; ${new Date().getFullYear()} Your Fashion App. All rights reserved.
            </p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error(err);
        else console.log("Order email sent:", info.response);
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("checkout error:", err);
    res.status(500).json({ success: false });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render("admin/orders", { orders, title: "All Orders" });
  } catch (err) {
    console.error("Orders error", err);
    res.status(500).render("500", { title: "Server error" });
  }
};

const searchProduct = async (req, res) => {
  try {
    const searchProduct = req.body.searchProduct;

    const searchResults = await Product.find({
      $text: { $search: searchProduct, $diacriticSensitive: true },
    });

    res.render("search-results", {
      title: `Search Results for "${searchProduct}"`,
      products: searchResults,
      searchTerm: searchProduct,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).render("500", { title: "Server Error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.render("admin/orders", { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to retrieve your orders");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate(orderId, { status: "Delivered" });
    res.redirect("/admin/orders");
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).send("Error updating order status");
  }
};

const getContactPage = (req, res) => {
  res.render("contact", { title: "Contact Us" });
};

module.exports = {
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
};
