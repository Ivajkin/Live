/*globals Element: false, MooSwitch: false, asyncTest: false, calcMD5: false, get_standard_phone_number: false, equal: false, window: false, test: false, ok: false, equals: false, same: false, stop: false, start: false, module: false, notEqual: false, ScheduleModel: false, generate_user_password: false */

window.addEvent('domready', function() {
			
	function rand_id_get() {
		return Math.floor(Math.random()*1000 + 7);
	}
	
	module('Mootools');
	test('Element', 2, function() {
		ok(Element, 'Element class exists');
		var el = new Element('div', {'id': '_something_00'});
		ok(el, 'Element has been created');
	});
	test('MooSwitch', 3, function() {
		ok(MooSwitch, 'MooSwitch object exists');
		var el = new Element('div', {'id': '_something_01'});
		ok(el, 'Element has been created');
		var moo = new MooSwitch(el);
		ok(moo, 'MooSwitch creating normally');
	});
	
	// DONE: index.model.js is covered (25.08.2011).
	module('index.model.js');	
	test('main', 4, function() {
		equals(typeof(ScheduleModel), 'object', "Check object");
		ok(ScheduleModel.FacilityInfo, "Check FacilityInfo");
		ok(ScheduleModel.RegistrationInfo, "Check RegistrationInfo");
		ok(ScheduleModel.UserInfo, "Check UserInfo");
	});
	test('FacilityInfo', 13, function() {
		
		var facilityInfo = new ScheduleModel.FacilityInfo();
		ok(facilityInfo.set_id, 'facilityInfo.set_id exists');
		ok(facilityInfo.get_id, 'facilityInfo.set_id exists');
		ok(facilityInfo.clear_id, 'facilityInfo.set_id exists');
		for(var i = 0; i < 5; ++i) {
			var rand_id = rand_id_get();
			facilityInfo.set_id(rand_id);
			equals(facilityInfo.get_id(), rand_id, "Facility set_id+get_id is correct");
			facilityInfo.clear_id();
			notEqual(facilityInfo.get_id(), rand_id, "Facility clear_id+get_id is correct");
		}
	});
	test('RegistrationInfo', 1, function() {
		var registrationInfo = new ScheduleModel.RegistrationInfo(0);
		ok(registrationInfo.getHumanReadableString, 'registrationInfo.getHumanReadableString exists');
	});
	asyncTest('current_city', 9, function() {
		var current_city = ScheduleModel.current_city;
		equal(typeof(current_city), 'object', 'ScheduleModel.current_city exists');
		
		for(var i = 0; i < 5; ++i) {
			var rand_id = Math.floor(Math.random()*2);
			current_city.set_id(rand_id);
			equal(current_city.get_id(), rand_id, 'current_city.get_id() works');
		}
		
		equal(typeof(current_city.get), 'function', 'current_city.get() exists');
		current_city.get(function(city) {
			ok(city, 'current_city.get() get some data');
			ok(city.id || (city.id === 0), 'assuming data is correct');
			start();
		});
	});
	
	test('get_standard_phone_number()', function() {
		ok(window.helper.is('Function', get_standard_phone_number), 'get_standard_phone_number is a function');
		equal(get_standard_phone_number('+7-924-2005-039'), '9242005039', 'get_standard_phone_number works');
		equal(get_standard_phone_number('9242005039'), '9242005039', 'get_standard_phone_number works');
		equal(get_standard_phone_number('89242005039'), '9242005039', 'get_standard_phone_number works');
		equal(get_standard_phone_number('79242005039'), '9242005039', 'get_standard_phone_number works');
		equal(get_standard_phone_number('7-924-20-05-039'), '9242005039', 'get_standard_phone_number works');
		equal(get_standard_phone_number('71234567890'), '1234567890', 'get_standard_phone_number works');
		equal(get_standard_phone_number('+8(924) 200-5039'), '9242005039', 'get_standard_phone_number works');
	});
	
	test('generate_user_password()', function() {
		ok(window.helper.is('Function', generate_user_password), 'generate_user_password is a function');
		ok(!/u/.test(generate_user_password('89242005039')), 'Случайный пароль не должен содержать символ "u"');
		equal(generate_user_password('89242005039')[0], generate_user_password('89242005039')[0], 'Первый символ случайно сгенерированного пароля должен быть одинаковым у одного телефона');
		equal(generate_user_password('+71234442321')[0], generate_user_password('+712-3444-2321')[0], 'Первый символ случайно сгенерированного пароля должен быть одинаковым у одного телефона');
		equal(generate_user_password('+71234442321')[0], generate_user_password('8-1234-442-321')[0], 'Первый символ случайно сгенерированного пароля должен быть одинаковым у одного телефона');
		equal(generate_user_password('+71234442321')[0], generate_user_password('1234442321')[0], 'Первый символ случайно сгенерированного пароля должен быть одинаковым у одного телефона');
		equal(generate_user_password('+71234442321')[0], generate_user_password('7-123-444-2321')[0], 'Первый символ случайно сгенерированного пароля должен быть одинаковым у одного телефона');
	});
	
	// DONE: common.js is covered (25.08.2011).
	module('Utilities (common.js)');
	test('calcMD5()', 2, function() {
		equal( typeof(calcMD5), 'function', 'calcMD5() exists');
		equal( calcMD5('thomas'), 'ef6e65efc188e7dffd7335b646a85a21', 'calcMD5() works for "thomas" string');
	});
	test('Array.prototype.intersect()', 4, function() {
		equal( typeof(Array.prototype.intersect), 'function', 'Array.prototype.intersect() exists');
		equal(
				JSON.stringify(sort([12, 2, 4, 9, 11, 19].intersect([8, 4, 2, 11, 40]), function(a,b) {return a>b;})),
				JSON.stringify([2, 4, 11]),
				'Array.prototype.intersect() works');
		equal(
				JSON.stringify(sort([4,8,15,17].intersect([9,3,2,4]), function(a,b) {return a>b;})),
				JSON.stringify([4]),
				'Array.prototype.intersect() works');
		equal(
				JSON.stringify(sort(['Joe', 'Michel', 'Lorem'].intersect(['Hloe', 'Michel', 'Joe', 'Tydyd']), function(a,b) {return a[0]>b[0];})),
				JSON.stringify(['Joe', 'Michel']),
				'Array.prototype.intersect() works');
	});
	test('Array.prototype.contains()', 4, function() {
		equal( typeof(Array.prototype.contains), 'function', 'Array.prototype.contains() exists');
		ok([12, 2, 4, 'Hoar'].contains('Hoar'), 'Array.prototype.contains() works for String');
		ok([12, 2, 4, 'Hoar', 12, [2]].contains(12), 'Array.prototype.contains() works for number');
		notEqual([12, 2, 4, 'Hoar', 12, [2]].contains(null), 'Array.prototype.contains() works for not presented in array');
	});
	asyncTest('makeCachedRequest()', 2, function() {
		equal( typeof(makeCachedRequest), 'function', 'makeCachedRequest() exists');
		makeCachedRequest('/index.html', function(result1) {
			makeCachedRequest('/index.html', function(result2) {
				equal(result1, result2, 'Cached request really cached for the interval');
				start();
			}, 1000);
		}, 1000);
	});
	test('parseHttpRequest()', 1, function() {
		equal( typeof(parseHttpRequest), 'function', 'parseHttpRequest() exists');
	});
	test('makeRequest()', 1, function() {
		equal( typeof(makeRequest), 'function', 'makeRequest() exists');
	});
	test('getCookie(), setCookie(), getValue()', 8, function() {
		equal( typeof(getCookie), 'function', 'getCookie() exists');
		equal( typeof(setCookie), 'function', 'setCookie() exists');
		//equal( typeof(deleteCookie), 'function', 'deleteCookie() exists');
		equal( typeof(getValue), 'function', 'getValue() exists');
		
		for(var i = 0; i < 5; ++i) {
			var rand_id = rand_id_get();
			var cookie_string = '___UNIT_TEST_COOKIE_TEST__';
			setCookie(cookie_string, rand_id);
			equal(getCookie(cookie_string), rand_id, 'Cookie save-restore (setCookie(), getCookie()) is correct');
		}
		
		// TODO удаление cookies не работает!
		/*deleteCookie();
		notEqual(getCookie(cookie_string), rand_id, 'deleteCookie is correct');*/
	});
	asyncTest('get_collection_from_base()', 5, function() {
		ok(g_cached, 'g_cached exist');
		ok(g_cached_by_id, 'g_cached_by_id exist');
		
		get_collection_from_base('cities', function(data) {
			ok(data, 'Data returned: '+ JSON.stringify(data));
			ok(data.length, 'Data is array');
			ok(data[0].region_id || (data[0].region_id == '0'), 'region_id exist');
			start();
		});
	});
	test('add_to_favorites()', 1, function() {
		equal( typeof(add_to_favorites), 'function', 'add_to_favorites exists');
	});
	test('save_user_request()', 1, function() {
		equal( typeof(save_user_request), 'function', 'save_user_request exists');
	});
	test('check_login()', 1, function() {
		equal( typeof(check_login), 'function', 'check_login exists');
	});
	test('shorten()', 4, function() {
		equal( typeof(shorten), 'function', 'shorten exists');
		equals(shorten('123456', 2).substring(2, 5), '...', 'Dots at the end.');
		equals(shorten('1234567', 3).substring(3, 6), '...', 'Dots at the end.');
		equals(shorten('1234567', 3).substring(1, 4), '23.', 'Dots at the end.');
	});
	test('getDomOffset()', 1, function() {
		same(getDomOffset(document.body), {
			top : 0,
			left : 0
		}, 'Body coordinates {top: 0, left: 0}');
	});
	test('getDaysInMonthCount()', 4, function() {
		equal( typeof(getDaysInMonthCount), 'function', 'getDaysInMonthCount exists');
		equal( getDaysInMonthCount(2011, 8), 31, 'getDaysInMonthCount is correct for 8/2011');
		equal( getDaysInMonthCount(2011, 9), 30, 'getDaysInMonthCount is correct for 9/2011');
		equal( getDaysInMonthCount(2012, 2), 29, 'getDaysInMonthCount is correct for 2/2012');
	});
	test('assert()', 1, function() {
		assert(true, 'nothing');
		ok(true, 'Assertion not thrown on "true" argument');
	});
	test('Array.prototype.filter()', 3, function() {
		equal( typeof(Array.prototype.filter), 'function', 'Array.prototype.filter() exists');
		equal( JSON.stringify([23, 54, 11, 45, 17, 2, 57, 32, 8].filter(function(element) { return (element%2 === 1 && element > 8.5); })),
			JSON.stringify([23, 11, 45, 17, 57]), 'Array.prototype.filter() works');
		equal( JSON.stringify(['Joe', 'Michel'].filter(function(element) { return ['Joe'].contains(element); })),
			JSON.stringify(['Joe']), 'Array.prototype.filter() works');
	});
	test('dataRange()', 3, function() {
		equal( typeof(dateRange), 'function', 'dataRange() exists');
		var res1 = dateRange(new Date(2011, 7, 30), new Date(2011, 8, 3));
		var res2 = dateRange(new Date(2011, 8, 3), new Date(2011, 7, 30));
		same(res1, 4, 'dateRange() work properly. (normal).');
		same(res2, 4, 'dateRange() work properly. (reversed-swapped).');
	});

	test('sort()', 2, function() {
		equal(
			JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]),
			JSON.stringify(sort([6, 7, 2, 5, 1, 4, 3, 8, 9], function(a, b) { return a > b; })),
			"Sort function work fine for numbers!");
		equal(
			JSON.stringify(['Addy', 'Bobby', 'Charley', 'Dennis', 'Eva', 'Fred', 'Gregory', 'Hank']),
			JSON.stringify(sort(['Hank', 'Gregory', 'Bobby', 'Eva', 'Dennis', 'Addy', 'Fred', 'Charley'], function(a, b) { return a[0] > b[0]; })),
			"Sort function work fine for strings!");
	});
	test('isNumber()', function() {
		equals(typeof(isNumber), 'function', 'isNumber exist');
		equals(isNumber(89), true, 'isNumber correct');
		equals(isNumber(true), false, 'isNumber correct');
		equals(isNumber(false), false, 'isNumber correct');
	});
	test('Function.prototype.bind()', function() {
		equal( typeof(Function.prototype.bind), 'function', 'Function.prototype.bind exists');
		var foo = function() {};
		equal( typeof(foo.bind), 'function', 'bind exists in functions');
		
		var thing = new function() {
			this.id = 42;
		};
		equal((function() {return this.id}.bind(thing))(), 42, 'Function.prototype.bind works')
		
		for(var bi = 0; bi < 5; ++bi) {
			var a = Math.random()*10;
			var b = Math.random()*10;
			var c = Math.random()*10;
			var foo = function(a, b, c) { return a + b - c; }.bind(this, a, b);
			var result = foo(c);
			equal(result, a + b - c, "function.bind work for arguments! Args: (" + a + ', ' + b + ', ' + c + ')');
		}
	});
	test('get_city_by_geolocation()', function() {
		equal( typeof(get_city_by_geolocation), 'function', 'get_city_by_geolocation exists');
		// Поверим, что он работает.
		/*get_city_by_geolocation(function() {
			start();
			ok(true, 'get_city_by_geolocation() returned some data');
		});*/
	});
	asyncTest('is_panel()', function() {
		equal( typeof(is_panel), 'function', 'is_panel exists');
		// Поверим, что он работает.
		createPanel('Text', function(panel) {
			ok(is_panel(panel), 'It works!');
			start();
		});
	});
	
	module('administration.model.js');
	test('getAdministrationModel()', function() {
		equal(typeof(getAdministrationModel), 'function', 'getAdministrationModel() exists and is a function');
	});
	var Model = getAdministrationModel();
	test('Model (basic test)', function() {
		equal(typeof(Model), 'object', 'Model is an object');
		equal(typeof(Model.administratorInfo), 'object', 'Model has administratorInfo');
		equal(typeof(Model.setFacility), 'function', 'Model has setFacility()');
		equal(typeof(Model.setFacilityServiceTypes), 'function', 'Model has setFacilityServiceTypes()');
		equal(typeof(Model.setResourceServiceTypes), 'function', 'Model has setResourceServiceTypes()');
		equal(typeof(Model.setResource), 'function', 'Model has setResource()');
		equal(typeof(Model.setResourceData), 'function', 'Model has setResourceData()');
		equal(typeof(Model.addNewResource), 'function', 'Model has addNewResource()');
		equal(typeof(Model.removeResource), 'function', 'Model has removeResource()');
		equal(typeof(Model.getResource), 'function', 'Model has getResource()');
		equal(typeof(Model.getFacility), 'function', 'Model has getFacility()');
		equal(typeof(Model.setFacilityData), 'function', 'Model has setFacilityData()');
		equal(typeof(Model.getEmployeeCount), 'function', 'Model has getEmployeeCount()');
		equal(typeof(Model.getEmployee), 'function', 'Model has getEmployee()');
		equal(typeof(Model.getLocations), 'function', 'Model has getLocations()');
		equal(typeof(Model.refreshDatabaseItemInfo), 'function', 'Model has refreshDatabaseItemInfo()');
	});
	asyncTest('Model.setFacility(), Model.getFacility()', function() {
		var sem = 2;
		Model.setFacility(0, function() {
			ok(true, 'Facility set');
			var facility = Model.getFacility();
			equal( typeof (facility), 'object', 'Facility set to object');
			equal(facility.id, 0, 'Facility set properly');
			raises( function() {
				Model.setFacility(-1, function() {
				});
			}, "Facility id not exist, must throw error on select");
			Model.setFacility(0, function() {
				ok(true, 'Facility set');
				start();
			});
		});
	});
	asyncTest('Model.setResource(), Model.getResource()', function() {
		var sem = 2;
		Model.setResource(0, function() {
			ok(true, 'Resource set');
			var resource = Model.getResource();
			equal( typeof (resource), 'object', 'Resource set to object');
			equal(resource.id, 0, 'Resource set properly');
			raises( function() {
				Model.setResource(-1, function() {
				});
			}, "Resource id not exist, must throw error on select");
			Model.setResource(0, function() {
				start();
			});
		});
	});
	var created_resource_id;
	asyncTest('Model.addNewResource(), Model.removeResource()', function() {
		Model.setFacility(0, function() {
			Model.addNewResource('__Name_' + rand_id_get(), '__Descr_' + rand_id_get(), function(new_id) {
				created_resource_id = new_id;
				ok(true, 'Function executed callback');
				Model.setResource(new_id, function() {
					var res = Model.getResource();
					equal(typeof res, 'object', 'resource created is an object');
					equal(typeof res.id, 'number', 'resource has an id');
					equal(typeof res.name, 'string', 'resource has an name');
					equal(typeof res.description, 'string', 'resource has an description');
					ok(res.disabled, 'resource has an disabled');
					ok(res.service_type_ids, 'resource has an service_type_ids');
					equal(typeof res.service_type_ids.length, 'number', 'resource has an service_type_ids.length (array)');
					Model.setFacility(0, function() {
						ok(true, 'Facility set');
						raises( function() {
							Model.setResource(new_id, function() {
							  
							});
						}, "resource deleted, must throw error on select");
						
						notEqual(typeof created_resource_id, 'undefined', 'Resource was created');
						equal(typeof Model.removeResource, 'function', "Model.removeResource() exists and is Function");
						Model.removeResource(created_resource_id, function() {
							ok(true, 'Callback called after remove');
							raises(function() {
								Model.setResource(created_resource_id, function() {
									
								});
							}, "resource deleted, must throw error on select");
							
							start();
						});
					});
					start();
				});
			});
		});
	});
	
	/*module('Schedule (prolog)');
	asyncTest('ask plan for', function() {
		equal(typeof makeCachedRequest, 'function', 'makeCachedRequest() exists');
		makeCachedRequest('/cmd/ask_schedule?service_type_ids=[1,2]&facility_id=0&intime=500000', function(result) {
			ok(true, 'Callback called');
			ok(result, 'Result returned: ' + result);
			equal(typeof(result), 'string', 'Result returned while asking for plan: ' + result);
			start();
		}, 10);
		
	});*/
});