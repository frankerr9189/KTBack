const express = require("express");
const router = express.Router();

const {requireSignin, isAuth} = require("../controllers/auth");
const {userById} = require("../controllers/user");
const {generateGuestToken, generateToken, processPayment} = require("../controllers/braintree");

router.get('/braintree/getToken/:userId', requireSignin, isAuth, generateToken );
router.post('/braintree/payment/:userId', requireSignin, isAuth, processPayment );

//router.get('/braintree/getTokenGuest', generateGuestToken);
//router.post('/braintree/guestpayment', processPayment );

router.param('userId', userById);

module.exports = router;