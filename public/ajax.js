// ajax.js

function ajax(url, method, data, success, error){
	var request = new XMLHttpRequest();
	request.open(method, url, true);
	var successcb, errorcb;

	if(method == "GET" && typeof data === "function"){
		successcb = data;
		errorcb = success;
	}
	else{
		successcb = success;
		errorcb = error;
	}

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var resp = request.responseText;
			successcb(resp);
		} else {
			// We reached our target server, but it returned an error
			errorcb(request);

		}
	};

	request.onerror = function(){
		errorcb(request);
	};

	if(method === "POST"){
		request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		request.send(JSON.stringify(data	));
	}
	else{
		request.send();
	}
}
