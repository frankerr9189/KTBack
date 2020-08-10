const express = require('express');
const router = express.Router();

const {signup, signin, signout, guest} = require('../controllers/auth');
const {userSignupValidator} = require("../validator");

router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);
router.get('/guest', guest);


module.exports = router;