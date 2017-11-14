var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});
// Long-term user acces token
router.post('/ltutoken', function(req, res, next){
	console.log(req.body);
	var sltoken = req.body.slat || false;

	if(!sltoken){
		return res.status(400).send("No short-lived token passed");
	}
	if(process.env.LTUAT){
		return res.json({access_token: process.env.LTUAT});
	}

	request({
		uri: 'https://graph.facebook.com/v2.11/oauth/access_token',
		headers: {
			'Host': 'graph.facebook.com'
		},
		qs: {
			'grant_type': 'fb_exchange_token',
			'client_id': process.env.APP_ID,
			'client_secret': process.env.APP_SECRET,
			'fb_exchange_token': sltoken
		},
		timeout: 1500
	}, function(error, response, body){
		if(error){
			console.error(error);
			return res.status(500).send('There was an error during the request, please check the console.');
		}
		console.log(body);
		if(response.statusCode >= 200 && response.statusCode < 400){
			return res.status(200).send(response.body);
		}
		else{
			console.error("There was an error of another kind:");
			console.error(response);
		}
		res.status(500).send("An error was generated");
	});
});

router.post('/ltptoken', function(req, res, next){

	// Perform a normal page token request
	// https://developers.facebook.com/docs/facebook-login/access-tokens#pagetokens

	console.log(req.body);
	var ltuatoken = req.body.ltuat || false;
	if(!ltuatoken) {
		return res.status(400).send('No long-term access token passed');
	}
	if(process.env.LTPAT){
		return res.json({success: 'success', body: {data: [
			{
				access_token: process.env.LTPAT,
				id: process.env.PAGE_ID
			}
		]}});
	}
	request({
		uri: 'https://graph.facebook.com/v2.11/me/accounts',
		headers: {
			'Host': 'graph.facebook.com'
		},
		qs: {'access_token': ltuatoken },
		timeout: 1500
	}, function(error, response, body){
		if(error){
			console.error(error);
			return res.status(500).json({'error': 'error', 'msg': 'There was an error performing the request, please check the console.'});
		}
		if(response.statusCode >= 200 && response.statusCode < 400) {
			return res.status(200).json({success: 'success', body: JSON.parse(response.body)});
		}
		else{
			console.error('There was an error of another kind:');
			console.error(response);
		}
		res.status(500).json({'error': 'error', msg: 'An error was generated'});
	});
});

module.exports = router;
