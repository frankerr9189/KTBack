const express = require("express");
const router = express.Router();

const {requireSignin, isAuth, isAdmin} = require("../controllers/auth");
const {userById} = require("../controllers/user");
const {create, listOrders, getStatusValues, orderById, updateOrderStatus, guestShipping, getMethodValues} = require("../controllers/order");

router.post('/order/create/:userId', requireSignin, isAuth, create);

router.get('/order/list/:userId', requireSignin, isAuth, isAdmin, listOrders);
router.get('/order/status-values/:userId', requireSignin, isAuth, isAdmin, getStatusValues);
router.put('/order/:orderId/status/:userId', requireSignin, isAuth, isAdmin, updateOrderStatus);
//router.get('/order/methodValues/:userId', requireSignin, isAuth, getMethodValues);

router.param('userId', userById);
router.param('orderId', orderById);


router.param("userId", userById);

module.exports = router;