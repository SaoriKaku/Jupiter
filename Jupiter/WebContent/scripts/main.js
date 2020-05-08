
(function() {
	//step1: (function() {})()
	
	//step2: add variables
	/* Variables 
	var user_id = '1111';
	var user_fullname = 'John';
	var lng = -122.08;
	var lat = 37.38;
	*/
	
	//step3: create helper functions
	/* A helper function that makes a navigation button active
	   @param btnId - The id of the navigation button */
	function activeBtn(btnId) { // 选择nav里面所有btn
		var btns = document.querySelectorAll('.main-nav-btn');
		// deactivate all navigation buttons
		for (var i = 0; i < btns.length; i++) {
			// The \b metacharacter is used to find a match at the beginning or end of a word.
			btns[i].className = btns[i].className.replace(/\bactive\b/, '');
		}
		// active the one that has id = btnId
		var btn = document.querySelector('#' + btnId);	
		btn.className += ' active';
	}

	function showLoadingMessage(msg) {
	    var itemList = document.querySelector('#item-list');
	    itemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i> ' + msg + '</p>';
	}

	function showWarningMessage(msg) {
	    var itemList = document.querySelector('#item-list');
	    itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i> ' + msg + '</p>';
	}

	function showErrorMessage(msg) {
	    var itemList = document.querySelector('#item-list');
	    itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-circle"></i> ' + msg + '</p>';
	}

	/* A helper function that creates a DOM element <tag options...>
	   @param tag
	   @param options
	   @returns {Element} */
	function $create(tag, options) {
	    var element = document.createElement(tag);
	    // options是一个list: 里面是key-value，给当前这个tag加上options里面的key-value
	    for (var key in options) {
	    	if (options.hasOwnProperty(key)) {
	    		element[key] = options[key];
	    	}
	    }
	    return element;
	}

	/* AJAX helper
	   @param method - GET|POST|PUT|DELETE
	   @param url - API end point
	   @param data - request payload data
	   @param successCallback - Successful callback function
	   @param errorCallback - Error callback function */
	function ajax(method, url, data, successCallback, errorCallback) {
		var xhr = new XMLHttpRequest();
	    xhr.open(method, url, true);
	    xhr.onload = function() { // onload省去了readystate == 4
		    if (xhr.status === 200) {
		        successCallback(xhr.responseText);
		    } 
		    else {
		        errorCallback();
		    }
	    };
	    xhr.onerror = function() {
	    	console.error("The request couldn't be completed.");
	    	errorCallback();
	    };
	    if (data === null) {
	    	xhr.send();
	    } 
	    else {
	    	xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
	    	xhr.send(data);
	    }
	}	
	
	//step 4: main function(entrance)
	init();

	//step 5: define init function
	/* Initialize major event handlers */
	function init() {
	    // register event listeners
		// 1. #login-form-btn -> onSessionInvalid
	    document.querySelector('#login-form-btn').addEventListener('click', onSessionInvalid);
	    // 2. #login-btn -> login
	    document.querySelector('#login-btn').addEventListener('click', login);
	    // 3. #register-form-btn -> showRegisterForm，点击register按钮就转换到register页面
	    document.querySelector('#register-form-btn').addEventListener('click', showRegisterForm);
	    // 4. #register-btn -> register，点击register按钮就注册
	    document.querySelector('#register-btn').addEventListener('click', register);
	    // 5. #nearby-btn -> loadNearbyItems，点击nearby就向后端search nearby items
	    document.querySelector('#nearby-btn').addEventListener('click', loadNearbyItems);
	    // 6. #fav-btn -> loadFavoriteItems，点击fav按钮就向后端数据库中下载favorite items
	    document.querySelector('#fav-btn').addEventListener('click', loadFavoriteItems);
	    // 7. #recommend-btn -> loadRecommendedItems，点击recommend按钮就下载search recommend items
	    document.querySelector('#recommend-btn').addEventListener('click', loadRecommendedItems);
	    validateSession();
	    // onSessionValid({"user_id":"1111","name":"John Smith","status":"OK"});
	}
	
	/* showRegisterForm(); -> hideElement(var); 
	                       -> clearRegisterResult();
	                       -> showElement(var); */
	function showRegisterForm() {
	    var loginForm = document.querySelector('#login-form');
	    var registerForm = document.querySelector('#register-form');
	    var itemNav = document.querySelector('#item-nav');
	    var itemList = document.querySelector('#item-list');
	    var avatar = document.querySelector('#avatar');
	    var welcomeMsg = document.querySelector('#welcome-msg');
	    var logoutBtn = document.querySelector('#logout-link');
	    hideElement(itemNav);
	    hideElement(itemList);
	    hideElement(avatar);
	    hideElement(logoutBtn);
	    hideElement(welcomeMsg);
	    hideElement(loginForm);
	    clearRegisterResult();
	    showElement(registerForm);
	}  
	
	function clearRegisterResult() {
	    document.querySelector('#register-result').innerHTML = '';
	}
	
	//step 6: define validateSession function
	/* Session: onSessionInvalid(); onSessionValid(result);
	 * 1. 先设置成sessionInvalid状态，然后让后端确认session是否valid 
	 * 2. 如果session valid，就call onSessionValid(result) 
	 * "status": "OK", "user_id": userId, "name": firstName + " " + lastName;
	 * "status": "Invalid Session";
	 */
	function validateSession() {
		onSessionInvalid();
	    // The request parameters
	    var url = './login';
	    var req = JSON.stringify({});
	    // display loading message
	    showLoadingMessage('Validating session...');
	    // make AJAX call
	    ajax('GET', url, req,
	    // session is still valid
	    function(res) {
	        var result = JSON.parse(res);
	        if (result.status === 'OK') {
	        	onSessionValid(result);
	        }
	    });
	}
	
	/* "status": "OK", "user_id": userId, "name": firstName + " " + lastName; 
	 * onSessionValid(result) -> showElement(var); 
	                          -> hideElement(var); 
	                          -> initGeoLocation(); */
	function onSessionValid(result) {
	    user_id = result.user_id;
	    user_fullname = result.name;
	    var loginForm = document.querySelector('#login-form');
	    var registerForm = document.querySelector('#register-form');
	    var itemNav = document.querySelector('#item-nav');
	    var itemList = document.querySelector('#item-list');
	    var avatar = document.querySelector('#avatar');
	    var welcomeMsg = document.querySelector('#welcome-msg');
	    var logoutBtn = document.querySelector('#logout-link');
	    welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;
	    showElement(itemNav); //显示中间左边栏
	    showElement(itemList); //显示中间主边栏
	    showElement(avatar); //显示右上角小头像
	    showElement(welcomeMsg); //显示右上角message
	    showElement(logoutBtn, 'inline-block'); //显示右上角logout
	    hideElement(loginForm); //隐藏login form
	    hideElement(registerForm); //隐藏register form
	    initGeoLocation();
	}
	
	/* onSessionInvalid(); -> hideElement(var); 
	                       -> clearLoginError(); 
	                       -> showElement(var); */
	function onSessionInvalid() {
	    var loginForm = document.querySelector('#login-form');
	    var registerForm = document.querySelector('#register-form');
	    var itemNav = document.querySelector('#item-nav');
	    var itemList = document.querySelector('#item-list');
	    var avatar = document.querySelector('#avatar');
	    var welcomeMsg = document.querySelector('#welcome-msg');
	    var logoutBtn = document.querySelector('#logout-link');
	    hideElement(itemNav); //隐藏中间左边栏
	    hideElement(itemList); //隐藏中间主边栏
	    hideElement(avatar); //隐藏右上角小头像
	    hideElement(logoutBtn); //隐藏右上角logout
	    hideElement(welcomeMsg); //隐藏右上角message
	    hideElement(registerForm); //隐藏register form
	    clearLoginError(); //login-error设置为空
	    showElement(loginForm); //显示login form
	}
	
	function showElement(element, style) {
	    var displayStyle = style ? style : 'block';
	    element.style.display = displayStyle;
	}
	
	function hideElement(element) {
	    element.style.display = 'none';
	}

	function clearLoginError() {
	    document.querySelector('#login-error').innerHTML = '';
	}
	
	//step 7: init Geolocation: onValidSession()里面最后call initGeoLocation()
	//step 8: define init Geolocation function
	/* initGeoLocation(); -> onPositionUpdated -> loadNearbyItems();
	                         onLoadPositionFailed(); -> getLocationFromIP();
	                      -> onLoadPositionFailed(); -> getLocationFromIP(); */
	function initGeoLocation() {
	    if (navigator.geolocation) {
	    	navigator.geolocation.getCurrentPosition(onPositionUpdated, onLoadPositionFailed, {maximumAge: 60000});
	    	showLoadingMessage('Retrieving your location...');
	    } 
	    else {
	    	onLoadPositionFailed();
	    }
	}
	
	//step 8.1: onPositionUpdated function
	//step 8.3: define onPositionUpdated function
	/* onPositionUpdated(position); -> loadNearbyItems(); */
	function onPositionUpdated(position) {
	    lat = position.coords.latitude;
	    lng = position.coords.longitude;
	    loadNearbyItems();
	}
	
	//step 8.2: onLoadPositionFailed function
	//step 8.4: define onLoadPositionFailed function
	/* onLoadPositionFailed() -> getLocationFromIP();  */
	function onLoadPositionFailed() {
	    console.warn('navigator.geolocation is not available');
	    getLocationFromIP();
	}

	//step 8.5: getLocationFromIP function
	//step 8.6: define getLocationFromIP function
	/* getLocationFromIP(); -> loadNearbyItems(); */
	function getLocationFromIP() {
	    // get location from http://ipinfo.io/json
	    var url = 'http://ipinfo.io/json'
	    var data = null;
	    ajax('GET', url, data, function(res) {
	    	var result = JSON.parse(res);
	    	if ('loc' in result) {
	    		var loc = result.loc.split(',');
	    		lat = loc[0];
	    		lng = loc[1];
	    	} 
	    	else {
	    		console.warn('Getting location by IP failed.');
	    	}
	    	loadNearbyItems();
	    });
	}
	
	//step 9: loadNearbyItems function
	//step 10: define loadNearbyItems function
	// AJAX call server-side APIs
	/* API #1 Load the nearby items API end point: [GET] /search?user_id=1111&lat=37.38&lon=-122.08 
	   loadNearbyItems() -> success: -> showWarningMessage('No nearby item.');
	                                 -> listItems(items);
	                     -> fail: showErrorMessage('Cannot load nearby items.'); */
	function loadNearbyItems() {
	    console.log('loadNearbyItems');
	    activeBtn('nearby-btn');
	    // The request parameters
	    var url = './search';
	    var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
	    var data = null;
	    // display loading message
	    showLoadingMessage('Loading nearby items...');
	    // make AJAX call
	    ajax('GET', url + '?' + params, data,
	    // successful callback
	    function(res) {
	        var items = JSON.parse(res);
	        if (!items || items.length === 0) {
	        	showWarningMessage('No nearby item.');
	        } 
	        else {
	        	listItems(items);
	        }
	     },
	     // failed callback
	     function() {
	        showErrorMessage('Cannot load nearby items.');
	     });
	 }
	
	//step 11: listItems function
	//step 12: define listItems function
	// Create item list
	/* List recommendation items base on the data received
	   @param items - An array of item JSON objects */
	function listItems(items) {
	    var itemList = document.querySelector('#item-list');
	    itemList.innerHTML = ''; // clear current results
	    for (var i = 0; i < items.length; i++) {
	    	addItem(itemList, items[i]);
	    }
	}

	//step 13: addItem function
	//step 14: define addItem function
	/* Add a single item to the list
	   @param itemList - The <ul id="item-list"> tag (DOM container)
	   @param item - The item data (JSON object)
	   <li class="item">
	       <img alt="item image" src="https://s3-media3.fl.yelpcdn.com/bphoto/EmBj4qlyQaGd9Q4oXEhEeQ/ms.jpg" />
	       <div>
	           <a class="item-name" href="#" target="_blank">Item</a>
	           <p class="item-category">Vegetarian</p>
	           <div class="stars">
	               <i class="fa fa-star"></i>
	           </div>
	       </div>
	       <p class="item-address">699 Calderon Ave<br/>Mountain View<br/> CA</p>
	       <div class="fav-link">
	           <i class="fa fa-heart"></i>
	       </div>
	   </li> */
	function addItem(itemList, item) {
	    var item_id = item.item_id;
	    // create the <li> tag and specify the id and class attributes
	    var li = $create('li', {id: 'item-' + item_id, className: 'item'});
	    // set the data attribute ex. <li data-item_id="G5vYZ4kxGQVCR" data-favorite="true">
	    li.dataset.item_id = item_id;
	    li.dataset.favorite = item.favorite;
	    // item image
	    if (item.image_url) {
	    	li.appendChild($create('img', {src: item.image_url}));
	    } 
	    else {
	    	li.appendChild($create('img', {src: '../pic/default.jpg'}));
	    }
	    // section
	    var section = $create('div');
	    // title
	    var title = $create('a', {className: 'item-name', href: item.url, target: '_blank'});
	    title.innerHTML = item.name;
	    section.appendChild(title);
	    // category
	    var category = $create('p', {className: 'item-category'});
	    category.innerHTML = 'Category: ' + item.categories.join(',');
	    section.appendChild(category);
	    // stars
	    var stars = $create('div', {className: 'stars'});
	    for (var i = 0; i < item.rating; i++) {
	    	var star = $create('i', {className: 'fa fa-star'});
	    	stars.appendChild(star); //在div里面添加star
	    }
	    if (('' + item.rating).match(/\.5$/)) {
	    	stars.appendChild($create('i', {className: 'fa fa-star-half-o'}));
	    }
	    section.appendChild(stars);
	    li.appendChild(section);
	    // address
	    var address = $create('p', {className: 'item-address'});
	    // ',' => '<br/>',  '\"' => ''
	    address.innerHTML = item.address.replace(/,/g, '<br/>').replace(/\"/g, '');
	    li.appendChild(address);
	    // favorite link
	    var favLink = $create('p', {className: 'fav-link'});
	    favLink.onclick = function() {changeFavoriteItem(item_id);};
	    favLink.appendChild($create('i', {
	    	id: 'fav-icon-' + item_id,
	    	className: item.favorite ? 'fa fa-heart' : 'fa fa-heart-o'
	    }));
	    li.appendChild(favLink);
	    itemList.appendChild(li);
	}
	
	//step 15: changeFavoriteItem function
	//step 16: define changeFavoriteItem function
	/* API #4 Toggle favorite (or visited) items
	   @param item_id - The item business id
	   API end point: [POST]/[DELETE] /history request json data: {user_id: 1111, visited: [a_list_of_business_ids] }
	   loadFavoriteItems(); -> success: -> li.dataset.favorite = favorite;
	                                       favIcon.className = favorite ? 'fa fa-heart' : 'fa fa-heart-o'; */
	function changeFavoriteItem(item_id) {
	    // check whether this item has been visited or not
	    var li = document.querySelector('#item-' + item_id);
	    var favIcon = document.querySelector('#fav-icon-' + item_id);
	    var favorite = !(li.dataset.favorite === 'true'); //取反
	    // request parameters
	    var url = './history';
	    var req = JSON.stringify({user_id: user_id, favorite: [item_id]});
	    var method = favorite ? 'POST' : 'DELETE';
	    ajax(method, url, req,
	    // successful callback
	    function(res) {
	        var result = JSON.parse(res);
	        if (result.status === 'OK' || result.result === 'SUCCESS') {
	        	li.dataset.favorite = favorite;
	        	favIcon.className = favorite ? 'fa fa-heart' : 'fa fa-heart-o';
	        }
	    });
	}
	
	//step 17: nearby, favorite, recommendation (only change url)
	/* API #2 Load favorite (or visited) items API end point: [GET], /history?user_id=1111
	   loadFavoriteItems(); -> success: -> showWarningMessage('No favorite item.');
	                                    -> listItems(items);
	                        -> showErrorMessage('Cannot load favorite items.'); */
	function loadFavoriteItems() {
	    activeBtn('fav-btn');
	    // request parameters
	    var url = './history';
	    var params = 'user_id=' + user_id;
	    var req = JSON.stringify({});
	    // display loading message
	    showLoadingMessage('Loading favorite items...');
	    // make AJAX call
	    ajax('GET', url + '?' + params, req, function(res) {
	    	var items = JSON.parse(res);
	    	if (!items || items.length === 0) {
	    		showWarningMessage('No favorite item.');
	    	} 
	    	else {
	    		listItems(items);
	    	}
	    }, function() {
	    	showErrorMessage('Cannot load favorite items.');
	    });
	}
	
	/* API #3 Load recommended items API end point: [GET], /recommendation?user_id=1111
	   loadRecommendedItems(); -> success: -> showWarningMessage('No recommended item. Make sure you have favorites.');
	                                       -> listItems(items);
	                           -> showErrorMessage('Cannot load recommended items.'); */
	function loadRecommendedItems() {
	    activeBtn('recommend-btn');
	    // request parameters
	    var url = './recommendation' + '?' + 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
	    var data = null;
	    // display loading message
	    showLoadingMessage('Loading recommended items...');
	    // make AJAX call
	    ajax('GET', url, data,
	    // successful callback
	    function(res) {
	        var items = JSON.parse(res);
	        if (!items || items.length === 0) {
	        	showWarningMessage('No recommended item. Make sure you have favorites.');
	        } 
	        else {
	        	listItems(items);
	        }
	    },
	    // failed callback
	    function() {
	        showErrorMessage('Cannot load recommended items.');
	    });
	}

	//step 18 : add login
	//step 19: define login
	/* Login: -> success: onSessionValid(result);
	          -> fail: showLoginError(); */
	function login() {
	    var username = document.querySelector('#username').value;
	    var password = document.querySelector('#password').value;
	    //console.log("js: password = " + password);
	    password = md5(username + md5(password));
	    // The request parameters
	    var url = './login';
	    var req = JSON.stringify({user_id : username, password : password});
	    ajax('POST', url, req,
	    // successful callback
	    function(res) {
	        var result = JSON.parse(res);
	        // successfully logged in
	        if (result.status === 'OK') {
	        	onSessionValid(result);
	        }
	    },
	    // error
	    function() {
	      	showLoginError();
	    },
	    true);
	}

	function showLoginError() {
		document.querySelector('#login-error').innerHTML = 'Invalid username or password';
	}
	
	//step 20 : add register
	//step 21: define register
	/* Register -> success: -> showRegisterResult('Succesfully registered');
	                        -> showRegisterResult('User already existed');
	            -> fail: showRegisterResult('Failed to register'); */
	function register() {
	    var username = document.querySelector('#register-username').value;
	    var password = document.querySelector('#register-password').value;
	    var firstName = document.querySelector('#register-first-name').value;
	    var lastName = document.querySelector('#register-last-name').value;
	    if (username === "" || password == "" || firstName === "" || lastName === "") {
	    	showRegisterResult('Please fill in all fields');
	    	return;
	    }
	    if (username.match(/^[a-z0-9_]+$/) === null) {
	    	showRegisterResult('Invalid username');
	    	return;
	    }
	    // 给密码简单加密
	    password = md5(username + md5(password));
	    // The request parameters
	    var url = './register';
	    var req = JSON.stringify({user_id : username, password : password, first_name: firstName, last_name: lastName});
	    ajax('POST', url, req,
	    // successful callback
	    function(res) {
	        var result = JSON.parse(res);
	        // successfully logged in
	        if (result.status === 'OK') {
	        	showRegisterResult('Succesfully registered');
	        } 
	        else {
	        	showRegisterResult('User already existed');
	        }
	    },
	    // error
	    function() {
	    	showRegisterResult('Failed to register');
	    },
	    true);
	}

	function showRegisterResult(registerMessage) {
	    document.querySelector('#register-result').innerHTML = registerMessage;
	}

})();
