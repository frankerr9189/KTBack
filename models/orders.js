import mongoose from 'mongoose';
const shippingSchema = {
    ShipName: {type: String, required: true},
    emailAddress: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String, required: true},
    country: {type: String, required: true},
};

const cartItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    qty: {type: Number, required: true},
    choice: {type: String},
    toppings: {type: String},
    price: {type: String, required: true},
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
    method: {type: Boolean},
    payment: paymentSchema,
    subTotal: {type: Number},
    taxPrice: {type: Number},
    processingFee:{type: Number},
    totalPrice: {type: Number},
    isPaid: {type: Boolean, default: false},
    paidAt: {type: Date},
}, {
    timestamps: true
});

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;