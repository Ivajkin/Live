/*global HelperGL: false, Class: false, window: false, Content: false, $: false, set_current_city_id: false, get_current_city_id: false, Engine: false, setup_locale_ru: false, g_locale: false, SectionGL: false, Browser: false, $$: false, get_city_by_geolocation: false, save_user_request: false, get_regions_from_base: false, get_cities_from_base: false, get_current_city: false, setCookie: false, getCookie: false, get_service_types_from_base: false, assert: false, get_resources_from_base: false, Scheduler: false, get_user_services_from_base: false, get_facilities_from_base: false, shorten: false, get_locations_from_base: false, check_login: false, Element: false, BoolEl: false, isNumber: false, makeRequest: false, dropGCache: false, get_collection_from_base: false, insertDatabaseItem: false, doNothing: false, refreshDatabaseItemInfo: false */

function getAdministrationModel() {
	var Model = {
		administratorInfo : {
			facility : null,
			resources_of_the_facility : null,
			locations_of_the_facility : null,
			resource : null
		},
		// Сменяем текущее предприятие и подтягиваем его данные с сервера.
		// После вызываем callback.
		setFacility : function(facility_id, callback) {
			facility_id = parseInt(facility_id, 10);
			assert(window.helper.is('Number', facility_id), 'facility_id is not a number!');
			assert(window.helper.is('Function', callback), 'callback is not a function!');
			var loaded = 0;
			// Вызываем для синхронизации асинхронных вызовов.
			var next = function() {
				if(++loaded === 3) {
					callback();
				}
			};
			// Берём данные предприятия принадлежащего администратору (по id).
			get_facilities_from_base( function(facilities, facilities_by_id) {
				this.administratorInfo.facility = facilities_by_id[facility_id];
				if(!this.administratorInfo.facility) {
					throw "Facility id is invalid!";
				}
				next();
			}.bind(this));

			// Сохраняем данные о ресурсах (сотрудниках) предприятия.
			this.administratorInfo.resources_of_the_facility = [];
			get_resources_from_base( function(resources) {
				this.administratorInfo.resources_of_the_facility = resources;
				next();
			}.bind(this), facility_id);

			// Сохраняем данные о помещениях предприятия.
			this.administratorInfo.locations_of_the_facility = [];
			get_locations_from_base( function(locations) {
				locations.forEach( function(location) {
					if(location.facility_id == facility_id) {
						this.administratorInfo.locations_of_the_facility.push(location);
					}
				}.bind(this));
				next();
			}.bind(this));
		},
		setFacilityServiceTypes : function(service_type_ids) {
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.facility.name, 'Facility not chosen yet.');
			this.administratorInfo.facility.service_type_ids = service_type_ids;
			// изменение информации в настоящей базе
			this.refreshDatabaseItemInfo('facilities', this.administratorInfo.facility);
		},
		setResourceServiceTypes : function(service_type_ids) {
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.facility.name, 'Facility not chosen yet.');
			assert(service_type_ids && service_type_ids.length, 'Invalid parameters: setResourceServiceTypes(' + service_type_ids + ')');

			this.administratorInfo.resource.service_type_ids = service_type_ids;
			// изменение информации в настоящей базе
			this.refreshDatabaseItemInfo('resources', this.administratorInfo.resource);

		},
		/**
		 * Выбираем текущего работника по его id.
		 * Затем вызываем callback.
		 */
		setResource : function(resource_id, callback) {
			// Дополнительная проверка, если заваливается, значит туда ему и дорога (так как значит это не число,
			// а значит это дополнительная проверка к юнит тесту)
			resource_id = parseInt(resource_id, 10);
			// Проверка типов параметров.
			assert(window.helper.is('Number', resource_id), 'resource_id is not a number!');
			assert(window.helper.is('Function', callback), 'callback is not a function!');
			// Берём данные выбранного работника.
			var resources = this.administratorInfo.resources_of_the_facility;
			var finished = false;
			
			for(var key in resources) {
				if( typeof resources[key].id !== 'undefined') {
					var resource = resources[key];
					if(resource.id == resource_id) {
						this.administratorInfo.resource = resource;
						callback();
						finished = true;
						break;
					}
				}
			}
			assert(finished, 'Invalid id or there is no such resource.');


		},
		/**
		 * Изменяем данные текущего выбранного работника:
		 * ФИО, описание.
		 */
		setResourceData : function(name, description) {
			assert(name && description, 'Invalid parameters: setResourceData(' + name + ', ' + description + ')');
			// TODO изменить реальную информацию из базы!!!! DONE? - вроде работает.
			this.administratorInfo.resource.name = name;
			this.administratorInfo.resource.description = description;
			this.refreshDatabaseItemInfo('resources', this.administratorInfo.resource);
		},
		/**
		 * Создаём нового работника.
		 */
		addNewResource : function(name, description, callback) {
			// Проверка типов параметров.
			assert(window.helper.is('String', name), 'Invalid arguments for addNewResource(): name is not a string');
			assert(window.helper.is('String', description), 'Invalid arguments for addNewResource(): description is not a string');
			assert(window.helper.is('Function', callback), 'Invalid arguments for addNewResource(): callback is not a function');
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.facility.name, 'Facility not chosen yet.');
			// TODO добавление работника в настоящую базу!!!! DONE?
			// TODO!!! DONE?
			get_resources_from_base( function(all_resources) {
				get_collection_from_base('user_services', function(user_services) {
					// Псевдо-автоинкремент.
					var max_id = 0;
					all_resources.forEach(function(resource) {
						if(max_id < resource.id) {
							max_id = resource.id;
						}
					});
					max_id++;
					
					var service_max_id = 0;
					user_services.forEach(function(user_service) {
						if(service_max_id < user_service.id) {
							service_max_id = user_service.id;
						}
					});
					service_max_id++;
					
					get_resources_from_base(function(resources) {
						var new_resource = {
							id : max_id,
							name : name,
							description : description,
							disabled : [],
							service_type_ids : []
						};
						// TODO добавление в базу. DONE?
						all_resources.push(new_resource);
						
						get_collection_from_base('locations', function(locations) {
							var facility_id = this.getFacility().id;
							var location_id = locations.filter(function(location) {
								return location.facility_id === facility_id;
							})[0].id;
							assert(isNumber(location_id), 'location_id does not exist while addNewResource()');
							insertDatabaseItem('resources', new_resource, function() {
								var service = {
									  "available_time": [],
									  "cost": 0,
									  "description": "Краткое описание вида деятельности",
									  "facility_id": this.getFacility().id,
									  "id": service_max_id,
									  "location_id": location_id,
									  "name": "краткое название вида деятельности",
									  "resource_id": new_resource.id,
									  "to_complete_service_time": 20
								};
								insertDatabaseItem('user_services', service, function() {
									dropGCache();
									this.setFacility(this.getFacility().id, function(max_id) {
										callback(max_id);
									}.bind(this, max_id));
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this), this.administratorInfo.facility.id);
				}.bind(this));
			}.bind(this));
		},
		/**
		 * Создаём новое помещение.
		 * Посылаем полученный id в callback.
		 */
		addNewLocation : function(name, callback) {
			// Проверка типов параметров.
			assert(window.helper.is('String', name), 'Invalid arguments for addNewLocation(): name is not a string');
			assert(window.helper.is('Function', callback), 'Invalid arguments for addNewLocation(): callback is not a function');
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.facility.name, 'Facility not chosen yet.');
			
			get_locations_from_base( function(locations, locations_by_id) {
				// Псевдо-автоинкремент.
				var max_id = 0;
				locations.forEach(function(location) {
					if(max_id < location.id) {
						max_id = location.id;
					}
				});
				max_id++;
				var new_location = {
					id : max_id,
					name : name,
					facility_id : this.getFacility().id
				};
				insertDatabaseItem('locations', new_location);
				callback(max_id);
			}.bind(this));
		},
		/**
		 * Удаляем работника.
		 */
		removeResource : function(resource_id, callback) {
			
			assert(isNumber(resource_id), "resource_id is not a number. removeResource(" + resource_id + "," + callback + ")");
			assert(window.helper.is('Function', callback), "callback is not a function. removeResource(" + resource_id + "," + callback + ")");
			resource_id = parseInt(resource_id, 10);
			
			this.removeDatabaseItem('resources', resource_id);
			var resources = [];
			for(var key in this.administratorInfo.resources_of_the_facility) {
				if(window.helper.is('Object', this.administratorInfo.resources_of_the_facility[key])) {
					resources.push(this.administratorInfo.resources_of_the_facility[key]);
				}
			}
			this.administratorInfo.resources_of_the_facility = resources;
			
			get_collection_from_base('user_services', function(resource_id, user_services, user_services_by_id) {
				for(var i = 0; i < user_services.length; ++i) {
					var current_resource_id = parseInt(user_services[i].resource_id, 10);
					if(current_resource_id === resource_id) {
						this.removeDatabaseItem('user_services', user_services[i].id);
					}
				}
				dropGCache();
				this.setFacility(this.getFacility().id, function() {
					callback();
				});
			}.bind(this, resource_id));
		},
		getResource : function() {
			// Тестируем, зарегистрирован ли ресурс.
			assert(this.administratorInfo.resource && this.administratorInfo.resource.name, 'Resource not chosen yet.');
			return this.administratorInfo.resource;
		},
		// Возвращает название текущего предприятия.
		getFacility : function() {
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.facility.name, 'Facility not chosen yet.');
			return this.administratorInfo.facility;
		},
		// Меняет данные организации в базе данных на сервере - название, адрес домашней страницы и описание текущего предприятия.
		setFacilityData : function(name, url, description) {
			// TODO: настоящая передача на сервер! DONE?
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && name && url && description, 'Facility not chosen yet or data is invalid.');
			this.administratorInfo.facility.name = name;
			this.administratorInfo.facility.homepage_url = url;
			this.administratorInfo.facility.description = description;
			this.refreshDatabaseItemInfo('facilities', this.administratorInfo.facility);
		},
		// Меняет данные услуги (например Баркан-терапевт или Елена-акушер) в базе данных на сервере - название, адрес домашней страницы и описание текущего предприятия.
		setUserServiceData : function(user_service) {
			// Обратите внимание, сколько ассертов нужно вследствие отсутствия строгой типизации:
			var stringified_param = JSON.stringify(user_service);
			assert(isNumber(user_service.id), 'user_service.id должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			assert(isNumber(user_service.resource_id), 'user_service.resource_id должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			assert(isNumber(user_service.facility_id), 'user_service.facility_id должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			assert(isNumber(user_service.cost), 'user_service.cost должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			assert(isNumber(user_service.to_complete_service_time), 'user_service.to_complete_service_time должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			assert(isNumber(user_service.location_id), 'user_service.location_id должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			assert(user_service.available_time && isNumber(user_service.available_time.length), 'user_service.available_time не существует или не массив. setUserServiceData(' + stringified_param + ')');
			// TODO: По хорошему тут нужна строгая типизация.
			user_service.available_time.forEach(function(interval) {
				assert(window.helper.is('String', interval.date), 'interval.date должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
				assert(interval.service_type_ids, 'interval.service_type_ids должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
				assert(window.helper.is('String', interval.start), 'interval.start должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
				assert(window.helper.is('String', interval.finish), 'interval.finish должен быть числом при вызове setUserServiceData(' + stringified_param + ')');
			});
			
			assert(parseInt(user_service.resource_id, 10) === parseInt(this.administratorInfo.resource.id, 10), 'user_service.resource_id должен быть равным id текущего работника, т.к. мы меняем его расписание из панели смены расписания, а не в любой момент. При вызове setUserServiceData(' + stringified_param + ')');
			
			this.refreshDatabaseItemInfo('user_services', user_service);
		},
		// Возвращает кол-во работников на текущем предприятии.
		getEmployeeCount : function() {
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.resources_of_the_facility, 'Facility not chosen yet.');
			return this.administratorInfo.resources_of_the_facility.length;
		},
		// Возвращает работников текущего предприятия.
		getEmployee : function() {
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.resources_of_the_facility, 'Facility not chosen yet.');
			return this.administratorInfo.resources_of_the_facility;
		},
		// Возвращает помещения текущего предприятия.
		getLocations : function() {
			// Тестируем, зарегистрировано ли предприятие.
			assert(this.administratorInfo.facility && this.administratorInfo.locations_of_the_facility, 'Facility not chosen yet.');
			return this.administratorInfo.locations_of_the_facility;
		},
		// Обновляем информацию об объекте в базе данных.
		refreshDatabaseItemInfo: function(collection, item) {
			assert(typeof collection == 'string', 'collection not a string in refreshDatabaseItemInfo()');
			assert(typeof item == 'object', 'item not an object in refreshDatabaseItemInfo()');
			
			refreshDatabaseItemInfo(collection, item, function() {
				if(isNumber(this.getFacility().id)) {
					this.setFacility(this.getFacility().id, doNothing);
				}
			}.bind(this));
		},
		// Удаляем объект из базы данных.
		removeDatabaseItem: function(collection, item_id) {
			assert(typeof collection == 'string', 'collection not a string in removeDatabaseItem()');
			item_id = parseInt(item_id, 10);
			assert(isNumber(item_id), 'item.id is not a number in removeDatabaseItem()');
			
			var request = '/cmd/db/remove?collection=' + collection + '&id=' + item_id;
			// Посылаем запрос, слушаем результат.
			makeRequest(request, function (result) {
				assert(result === 'OK', 'Не удалось удалить объект из ' + collection + ' предприятия. Id объекта: ' + JSON.stringify(item_id));
				dropGCache();
				if(isNumber(this.getFacility().id)) {
					this.setFacility(this.getFacility().id, doNothing);
				}
			}.bind(this));
		}
	};
	return Model;
}