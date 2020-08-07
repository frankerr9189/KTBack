const Order = require('../models/orders');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
        console.log('Create Order: ', req.body);
        req.body.order.user = req.profile;
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