const Order = require('../models/orders');
const {errorHandler} = require('../helpers/dbErrorHandler');
const pricePerTopping = 0.5;
const config = require('../config/config');
const stripe = require('stripe')(config.stripe_secret_key);
const stripeAccountId = 'acct_1HRNLcDQrRsPJFuN'; //'acct_1HRNJ5IsucVTpH7r' acct_1HRoIZEdg2uAuc8C


function getPrice(order){
    return order.quantity * (order.price + order.toppings.filter(t => t.checked).length * pricePerTopping);
}

exports.sessionOne = async (req, res) => {
console.log('SessionOne create order: ', req.body.order);
const cart = req.body.order.orderItems;
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
 
const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ 
        name: 'Final Due:',
        amount: finalTotal * 100,
        currency: 'usd',
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: finalProcessingFee * 100,
      },
    success_url: "http://localhost:3000/thankyou",
    cancel_url: "http://localhost:3000/checkout",
  },{
      stripeAccount: stripeAccountId,
  });
  
  req.body.order.sessionData = session.id;
  console.log("session ", req.body.order.sessionData);

  //create order in Mongo **no credit card info sent or stored
  const order = new Order(req.body.order);
  order.save((error, data)=> {
      if(error) {
          return res.status(400).json({
              error: "Could not create order. Sorry"
          });
      }
      res.json({ id: session.id, data });
  });

};


// exports.fulfill = (req, res)=>{
//     // Set your secret key. Remember to switch to your live secret key in production!
// // See your keys here: https://dashboard.stripe.com/account/apikeys
// const stripe = require('stripe')('sk_test_51HJqHJGl9xwp0fdr6IujPQSYcrQ1lHHj8VrSnkuHql4mfPPxCAEw9qDps6ISYovgY9An6TIhf7KQoYBPAKktFCu20070aqUZUJ');

// // Find your endpoint's secret in your Dashboard's webhook settings
// const endpointSecret = 'whsec_...';

// const fulfillOrder = (session) => {
//     // TODO: fill me in
//     console.log("Fulfilling order", session);
//   }
  
//     const payload = request.body;
//     const sig = request.headers['stripe-signature'];
  
//     let event;
  
//     try {
//       event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
//     } catch (err) {
//       return response.status(400).send(`Webhook Error: ${err.message}`);
//     }
  
//     // Handle the checkout.session.completed event
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
  
//       // Fulfill the purchase...
//       fulfillOrder(session);
//     }
  
//     response.status(200);
//   };


exports.create = (req, res) => {
        console.log('Create Order: ', req.body.order);
        console.log('Payment: ', req.body.payment);
        
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

        //stripe.paymentIntents
    stripe.paymentIntents.create({
        payment_method_types: ['card'],
           amount: finalTotal * 100,
           currency: 'usd',
       }, {
        stripeAccount: '{stripeAccountId}', //client AccountId
       });

       //create order in Mongo **no credit card info sent or stored
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