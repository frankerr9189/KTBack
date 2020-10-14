const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const cartItemSchema = new mongoose.Schema({
    product: { type: ObjectId, ref: "Product" },
    name: String,
    quantity: {type: Number},
    //choice: {type: String},
    toppings: [],
    price: {type: Number},
});

const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    orderItems: [cartItemSchema],
    ShipName: {type: String},
    ShipEmail: {type: String},
    ShipAddress: {type: String},
    ShipCity: {type: String},
    ShipState: {type: String},
    ShipZip: {type: String},
    method: {type: String},
    //payment: paymentSchema,
    subTotal: {type: Number},
    taxPrice: {type: Number},
    processingFee:{type: Number},
    totalPrice: {type: Number},
    sessionData: {type: String},
    status: {
        type: String,
        default: "DO NOT PROCESS",
        enum: ["DO NOT PROCESS", "Not Processed", "Completed", "Cancelled"]
    }
    // isPaid: {type: Boolean, default: false},
    // paidAt: {type: Date},
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
