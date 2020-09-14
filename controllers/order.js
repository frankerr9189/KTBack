const Order = require('../models/orders');
const {errorHandler} = require('../helpers/dbErrorHandler');
const pricePerTopping = 0.5;

function getPrice(order){
    return order.quantity * (order.price + order.toppings.filter(t => t.checked).length * pricePerTopping);
}

exports.create = (req, res) => {
        console.log('Create Order: ', req.body.order);
        console.log('Payment: ', req.body.payment)
        
        const prePayment = req.body.payment;

        req.body.order.user = req.profile;

        const subtotal = req.body.order.orderItems.reduce((total, items) => {
            return total + getPrice(items);
        }, 0);

    const finalSubtotal = subtotal.toFixed(2);
    req.body.order.subTotal = finalSubtotal;
    const tax = subtotal * 0.07;
    const finalTax = tax.toFixed(2);
    req.body.order.taxPrice = finalTax;
    const processingFee = (tax + subtotal) * 0.05;
    const finalProcessingFee = processingFee.toFixed(2);
    req.body.order.processingFee = finalProcessingFee;
    const total = subtotal + tax + processingFee;
    const finalTotal = total.toFixed(2);
    req.body.order.totalPrice = finalTotal;
    req.body.payment.amount = finalTotal;
    
    console.log("finalSubtotal: ", finalSubtotal);
    console.log("finalTax: ", finalTax);
    console.log("finalProcessingFee: ", finalProcessingFee);
    console.log("finalTotal: ", finalTotal);

        const order = new Order(req.body.order);
         order.save((error, data)=> {
             if(error) {
                 return res.status(400).json({
                     error: "Could not create order. Sorry"
                 });
             }
             res.json(data);
         });
};

exports.listOrders = (req, res) => {
    Order.find()
    .populate('user', "_id name address")
    .sort('-created')
    .exec((err,orders) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues);
};

exports.getMethodValues = (req, res) => {
    res.json(Order.schema.path('method').enumValues);
};

exports.updateOrderStatus = (req, res) => {
    Order.update({_id: req.body.orderId}, {$set: {status: req.body.status}}, 
        (err, order) =>{
            if(err) {
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(order);
    } );
};

exports.orderById = (req, res, next, id) => {
    Order.findById(id)
    .populate('products.product', 'name price')
    .exec((err, order) => {
        if(err||!order){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        req.order = order;
        next();
    });
};