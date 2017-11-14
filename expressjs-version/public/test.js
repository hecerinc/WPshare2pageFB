// test.js
// Source: https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension
// https://developers.facebook.com/docs/facebook-login/access-tokens#pagetokens


var loginbtn = document.getElementById('loginbtn');
var llutbtn = document.getElementById('llutbtn');
var llptbtn = document.getElementById('llptbtn');
var submitbtn = document.getElementById('submitbtn');
var postform = document.getElementById('postcontent');

var fbdata = {};
var prelimresponse;
function readyFB() {
	FB.getLoginStatus(function(response) {
		// statusChangeCallback(response);
		console.log(response);
		if(response.status == "connected"){
			loggedin(response);
		}
		else {
			notloggedin();
		}
	});
}
function notloggedin(){

	loginbtn.addEventListener('click', function(){
		FB.login(function(response){
			console.log(response);
			if(response.status == "connected"){
				loggedin(response);
			}
		}, {
			scope: 'publish_pages,manage_pages',
			return_scopes: true
		});
	});
}
function loggedin(response){
	loginbtn.classList.add('active');
	loginbtn.innerHTML = "Good to go!";
	loginbtn.disabled = true;


	if(!validateTokenPermissions(response)){
		return false;
	}
	// Store the short-term user access token
	fbdata.stAuthToken = response.authResponse.accessToken;
	llutbtn.addEventListener('click', getLTAccessToken);
}

function getLTAccessToken(){
	ajax('/ltutoken', 'POST', {slat: fbdata.stAuthToken}, function(response){
		var response = JSON.parse(response);
		if(response.access_token){
			// success!
			fbdata.ltuat = response.access_token;
			llutbtn.classList.add('active');
			llutbtn.innerHTML = "Good to go!";
			llutbtn.disabled = true;

			// Bind the third button
			llptbtn.addEventListener('click', getLTPageToken);
		}
	}, function(request){
		console.error('Error', request);
	});
}

function getLTPageToken(){
	ajax('/ltptoken', 'POST', {ltuat: fbdata.ltuat}, function(response){
		var response = JSON.parse(response);
		console.log(response);

		if(response.success){
			// TODO: don't assume it's the first element
			choosePage(response);
		}
		else{
			console.error("Error", response);
		}
	}, function(request){
		console.error('Error', request);
	});
}

function sendPost(){
	var msg = document.getElementById('msg').value;
	var pageuri = "/" + fbdata.ltpat.id + '/feed';

	FB.api(pageuri, 'POST', {
		access_token: fbdata.ltpat.access_token,
		message: msg,
		link: 'https://coolors.co/',
		picture: 'a_link_to_a_picture.jpg' // to be used as thumb
		// published: false
	}, function(response){
		console.log(response);
		prelimresponse = response;
	});

}


function choosePage(response){

	var pages = response.body.data;
	fbdata.pages = pages;
	var html = "";
	for (var i = 0; i < pages.length; i++) {
		html += '<div class="page-choice" data-id="'+i+'">'+pages[i].name+'</div>';
	}
	// Append
	document.querySelector('#choosepage .pages').innerHTML = html;
	var pageelems = document.querySelectorAll('.page-choice');

	for (var i = 0; i < pageelems.length; i++) {
		pageelems[i].addEventListener('click', chooseSinglePage);
	}
	// Show choosePage
	document.getElementById('choosepage').style.display = 'block';

}
function chooseSinglePage(e){
	var id = e.target.dataset.id;
	fbdata.ltpat = fbdata.pages[id];

	document.getElementById('choosepage').style.display = 'none';

	llptbtn.classList.add('active');
	llptbtn.innerHTML = "Good to go!";
	llptbtn.disabled = true;

	// Activate send button!
	submitbtn.disabled = false;
	submitbtn.classList.remove("disabled");
	postcontent.addEventListener('submit', function(e){
		e.preventDefault();
		sendPost();
	});
}

function validateTokenPermissions(response){
	// TODO: implement this
	return true;
}


/*

Steps to take:

1. Check if the user is already logged in
2. If not, FB.login(callback, {scope: 'manage_pages,publish_pages', return_scopes: true})
	- This will return manage_pages and publish_pages if it was granted (but not for which pages)
3. Store the USER access_token somewhere!
4. To obtain which pages you *do* have access to, FB.api('/me/accounts', access_token) and store the access token for the page you're interested in (it's different from the USER access token in the previous step)

*/
