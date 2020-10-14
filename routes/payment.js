const _ = require('lodash');
const config = require('../config/config');
const stripe = require('stripe')(config.stripe_secret_key);
const express = require("express");
const router = express.Router();

function nestObj(keys, val) {
    var o = {}, k = keys.split('.')
    return k.reduce((r, e, i) => r[e] || (r[e] = (k.length-1 != i) ? {} : val), o), o
  }

    //Returns the fields needed
router.post('/stripe/account/get', function (req, res, next){
        const stripeAccountId = 'acct_1HRoIZEdg2uAuc8C'; //'acct_1HRNJ5IsucVTpH7r' acct_1HRoIZEdg2uAuc8C

        if(!stripeAccountId){
            res.send({
                success: true,
                message: 'Missing stripe account.',
                setupBegan:false,
                account: null,
            });
        } else {
            stripe.accounts.retrieve(
                stripeAccountId,
                (err, account)=>{
                    if(err){
                        res.send({
                            success: false,
                            message: `Error: ${err.message}`,
                            setupBegan: true,
                        });
                    }else{
                        res.send({
                            success: true,
                            message: "Stripe account.",
                            setupBegan: true,
                            account: account,
                        });
                    }
                }
            );
            
        }
    });

    // Begin Stripe Connect Setup
    router.post('/stripe/account/setup', function (req, res, next){
        const country = req.body.countryCode;
        const email = 'fxavierk@aol.com';

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

//account verification
 router.post('/stripe/account/save', function (req, res, next){
    const stripeAccountId = 'acct_1HRoIZEdg2uAuc8C'; //'acct_1HRNJ5IsucVTpH7r' acct_1HRoIZEdg2uAuc8C
    if(!stripeAccountId){
        res.send({
            success: true,
            message: 'Missing stripe account.',
            setupBegan:false,
            account: null,
        });
    } else {
        let i = 0;
        let stripeObj = {};
        // Have stripe account id
        _.forEach(req.body, (value, key) => {
            const obj = nestObj(key, value);
            console.log('obj', obj);

            stripeObj = Object.assign(stripeObj, obj);
           // stripeObj = assign(stripeObj, obj);

        i += 1;

        if(i === Object.keys(req.body).length){
            console.log('end', stripeObj);

            stripe.accounts.update(
                stripeAccountId,
                stripeObj
            ).then(()=>{
                res.send({
                    success: true,
                    message: 'Saved',
                });
      }, (err) => {
          console.log('er', err);
          return res.send({
              success: false,
              message: 'error',
          });
      });
    }// end of 1 === object.length
});
    };
 });


/* Update Stripe account
router.post('/stripe/account/save', function (req, res, next){
    const stripeAccountId = 'acct_1HRoIZEdg2uAuc8C';
        console.log(req.body);
        stripe.accounts.update(
            stripeAccountId,
            { metadata:
                {'business_type': req.body.values.businessType},
                {'business_profile.mcc': req.body.values.merchantCategoryCode},
                'business_profile.name': req.body.values.URL,
                'external_account': req.body.values.externalAccount,
                'company.name': req.body.values.companyName,
                'company.address.line1': req.body.values.companyAddress1,
                'company.address.line2': req.body.values.companyAddress2,
                'company.address.postal_code': req.body.values.companyPostalCode,
                'company.address.city': req.body.values.companyCity,
                'company.address.state': req.body.values.companyState,
                'company.address.country': 'US',
                'company.phone': req.body.values.companyPhone,
                'company.tax_id': req.body.values.companyTaxID,
                'representative.first_name': req.body.values.repFName,
                'representative.last_name': req.body.values.repLName,
                'representative.dob.day': req.body.values.repDOBDay,
                'representative.dob.month': req.body.values.repDOBMonth,
                'representative.dob.year': req.body.values.repDOBYear,
                'representative.address.line1': req.body.values.repAddress1,
                'representative.address.line2': req.body.values.repAddress2,
                'representative.address.postal_code': req.body.values.repPostal_Code,
                'representative.address.city': req.body.values.repCity,
                'representative.address.state': req.body.values.repState,
                'representative.address.country': req.body.values.repCountry,
                'representative.ssn_last_4': req.body.values.repTaxInformation,
                'representative.relationship.title': req.body.values.repTitleCompany,
                'representative.email': req.body.values.repEmail,
                'representative.phone': req.body.values.repPhone,
                'owners.first_name': req.body.values.ownerFName,
                'owners.last_name': req.body.values.ownerLName,
                'owners.email': req.body.values.ownerEmail,
            }
        )
      });*/

module.exports = router;