// admin.js
// jQuery is available in this script

var fbdata = {};

function readyFB(){
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

	// Log in to facebook first
	// Enable authorise (login) button && bind an event

	jQuery('#authorizebtn').removeClass('button-secondary disabled').addClass('button-primary').click(function(e){
		e.preventDefault();
		if(jQuery(this).hasClass('disabled'))
			return;
		jQuery(this).html('Authorizing...').addClass('disabled');
		FB.login(function(response){
			console.log(response);
			if(response.status == "connected"){
				loggedin(response);
			}
			else {
				// Enable the authorize button again
				jQuery("#authorizebtn").html('Authorize').removeClass('disabled');
			}
		}, {
			scope: 'publish_pages,manage_pages',
			return_scopes: true
		});
	});

}


function loggedin(response){
	// All I have is a STUAT

	// Store the short-term user access token
	fbdata.stAuthToken = response.authResponse.accessToken;

	if(!validateTokenPermissions(response)){
		return false;
	}

	// choosePages();

	getLTAccessToken();
}

function getLTAccessToken(){ // get both tokens in one go
	jQuery.post(ajaxurl, {action: 'npwpltat', slat: fbdata.stAuthToken}, function(response){
		console.log(response);
		if(response.success) {
			// success!
			// fbdata.ltuat = response.access_token;
			// Indicate that we're now authorized!
			choosePage(response.ltpat);
		}
		else{
			console.error(response);
		}
	}, 'json').fail(function(){
		console.error('Could not get LTUAT');
		alert('Critical failure. Please contact admin');
	});
}
function choosePage(pages){

	fbdata.pages = pages;
	var html = "";
	for (var i = 0; i < pages.length; i++) {
		html += '<li><button type="button" data-id="'+i+'">Choose</button> &nbsp;&nbsp;'+pages[i].name+'</li>';
	}
	// Append
	jQuery("ul.page-list").append(html);
	jQuery(".page-list li button").hover(function(){
		jQuery(this).parent().css('font-weight', 'bold');
	}, function(){
		jQuery(this).parent().css('font-weight', '');
	})
	jQuery("ul.page-list button").click(function(){
		jQuery('.pages-choices').fadeOut('fast');
		var id = jQuery(this).data('id');
		jQuery("#npwpltpat").val(fbdata.pages[id].access_token);
		jQuery("#npwppage_id").val(fbdata.pages[id].id);
		jQuery('.status-tag').removeClass('bad').addClass('good').html('Authorized');
		jQuery('#authorizebtn').remove();
	});
	// Show choosePage
	jQuery('#choosepagerow').show();

}

function validateTokenPermissions(response){
	// TODO: implement this
	return true;
}
