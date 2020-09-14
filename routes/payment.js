const config = require('../config/config');
const stripe = require('stripe')(config.stripe_secret_key);
const express = require("express");
const router = express.Router();

    //Returns the fields needed
router.post('/stripe/account/get', function (req, res, next){
        const stripeAccountId = 'acct_1HRNJ5IsucVTpH7r';

        if(!stripeAccountId){
            res.send({
                success: true,
                message: 'Missing stripe account.',
                setupBegan:false,
            });
        } else {
            res.send({
                success: true,
                message: "Stripe account.",
                setupBegan: true,
            });
        }
    });

    // Begin Stripe Connect Setup
    router.post('/stripe/account/setup', function (req, res, next){
        const country = req.body.countryCode;
        const email = 'frankerr9189@gmail.com';

        if(country !== 'CA' &&
        country !== 'US')
        {
            res.send({
                success: false,
                message: 'Error: Invalid country',
            });
        }else{
        stripe.accounts.create({
            type: 'custom',
            country,
            email,
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
              },
            }, function(err, account){
                if (err){
                    res.send({
                        success: false,
                        message: `Error: ${err.message}`,
                    });
                } else {
                    console.log('account', account);
                    const {id} = account;
                    stripe.accounts.update(
                        id,
                        {
                            tos_acceptance: {
                                date: Math.floor(Date.now() /1000),
                                ip: req.ip
                            }
                        },
                    ).then(()=> {
                        res.send({
                            success: true,
                            message: 'Account setup has started.',
                            accountId: id,
                        });
                    });
                }
            });
        }
          });



module.exports = router;