const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const cors = require("cors");
//const router = express.Router();
const Order = require('./models/orders');
const {errorHandler} = require('./helpers/dbErrorHandler');

// const dotenv = require('dotenv');
// dotenv.config();
require('dotenv').config();

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/orders");
const braintreeRoutes = require('./routes/braintree');
const accountRoutes = require('./routes/payment')

//db connection
mongoose.connect(
    process.env.MONGO_URI,
    {useNewUrlParser: true}
).then(()=> console.log('DB Connected'))

mongoose.connection.on('error', err=>{
    console.log(`DB connection error: ${err.message}`)
});

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '150mb', extended: true}));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
//app.use(express.json());
//app.use(bodyParser.raw());
app.use(express.json({limit: '150mb'}));
//app.use(express.urlencoded({limit: '150mb'}));
//app.use(bodyParser());


//routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use("/api", braintreeRoutes);
app.use('/api', accountRoutes);
/*
const stripe = require('stripe')('sk_test_51HJqHJGl9xwp0fdr6IujPQSYcrQ1lHHj8VrSnkuHql4mfPPxCAEw9qDps6ISYovgY9An6TIhf7KQoYBPAKktFCu20070aqUZUJ', {
    timeout: 60 * 1000, // 60 seconds
  });

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = 'whsec_RFDFqMz4r4NTgm2i91bPF5uFiXzYqVTS';
  
  function updatePaidOrder(currentSession) {
    console.log('in update function');
    Order.updateOne({sessionData: currentSession}, {$set: {status : "Not Processed"}},
    (err, data) =>{
      if(err) {
          return status(400).json({
              error: errorHandler(error)
          });
      }
      //return status(200);
    });
  };

  // Stripe requires the raw body to construct the event
   app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
     let event;
     
     try {
       event = request.body;
     } catch (err) {
         console.log(`Webhook Error: ${err.message}`);
       response.status(400).send(`Webhook Error: ${err.message}`);
     }
  
     // Handle the event
     switch (event.type) {
       case 'checkout.session.completed':
         const sessionId = event.data.object;
         const currentSession = sessionId.id;
         console.log('PaymentIntent was successful! ', sessionId);
         updatePaidOrder(currentSession);
         break;
       default:
         // Unexpected event type
         return response.status(400).end();
     };
     // Return a 200 response to acknowledge receipt of the event
    // response.json({received: true});
   });
*/ 
//end of comment
const port = process.env.PORT || 8000;

app.listen(port, ()=> console.log(`Server is running on port ${port}`));
