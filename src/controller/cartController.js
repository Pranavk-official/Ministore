const mongoose = require("mongoose");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
const Cart = require("../model/cartSchema");
const User = require("../model/userSchema");

module.exports = {
  getCart: async (req, res) => {
    const userCart = await Cart.findOne({ user_id: req.user.id }).populate(
      "items.product_id"
    );
    console.log(userCart.items);
    res.render("shop/cart", {
      userCart,
    });
  },
  addToCart: async (req, res) => {
    const product_id = req.params.id;
    try {
      const product = await Product.findOne({
        _id: product_id,
        isActive: true,
      });
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not Found" });
      }
      const userCart = await Cart.findOne({ user_id: req.user.id });
      if (!userCart) {
        const newCart = new Cart({
          user_id: req.user.id,
          items: [
            {
              product_id,
              quantity: 1,
              itemTotal: product.sellingPrice,
            },
          ],
          totalPrice: product.sellingPrice,
        });

        await newCart.save();
        return res
          .status(200)
          .json({ sucess: true, message: "sucessfully added to cart" });
      } else {
        const itemExists = userCart.items.find(
          (item) => item.product_id.toString() === product_id
        );
        if (itemExists) {
          return res
            .status(400)
            .json({ success: false, message: "Already Added to cart" });
        }
        userCart.items.push({
          product_id,
          quantity: 1,
          itemTotal: product.sellingPrice,
        });
        let totalPrice = 0;
        for (item of userCart.items) {
          totalPrice += item.itemTotal;
        }
        userCart.totalPrice = totalPrice;
        await userCart.save();
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal serever error" });
    }
  },
  updateQuantity: async (req, res) => {
    try {
      const productId = req.params.productId
      const qty = req.query.qty

      console.log(typeof req.params.productId);
      console.log(typeof req.query.qty);

    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, message: error.message || 'Internal Server Error'})
    }
  },
};
