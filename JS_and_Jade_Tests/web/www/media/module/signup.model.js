/*globals assert: false, isNumber: false, helper: false, get_collection_from_base: false, console: false */
"use strict";

var signupModel = {
	city_id: null,
	facility_id: null,
	facility_type: null,
	is_facility_selected: function() /** Boolean */ {
		return isNumber(this.facility_id);
	},
	service_type_id: null,
	is_service_type_selected: function() /** Boolean */ {
		return isNumber(this.service_type_id);
	},
	resource_id: null,
	// Выдаём полученные в результате объекты - тип услуги, ресурс, пользовательскую услугу и предприятие.
	extract: function(/** Function */ callback) {
		get_collection_from_base('service_types', function(service_types, service_types_by_id) {
			get_collection_from_base('resources', function(resources, resources_by_id) {
				get_collection_from_base('facilities', function(facilities, facilities_by_id) {
					get_collection_from_base('user_services', function(user_services) {
						
						var service_type = service_types_by_id[this.service_type_id],
							resource = resources_by_id[this.resource_id],
							facility = facilities_by_id[this.facility_id];
						// Выделяем определённую пользовательскую услугу на основе информации о типе услуги, предприятии (избыточно, для проверки) и ресурса.
						var user_services_of_others = user_services.filter(function(user_service) {
							// Оказывается ли тип услуги в этой пользовательской услуге.
							var serve_job = false;
							user_service.available_time.forEach(function(interval) {
								if(serve_job) { return; }
								if(interval.service_type_ids.contains(service_type.id)) { serve_job = true; }
							});
							return user_service.resource_id === resource.id && user_service.facility_id === facility.id && serve_job;
						});
						// Если получилось больше одной услуги - непорядок.
						if(user_services_of_others.length !== 1) { console.log('Непорядок, при экстрактинге user_service получилось несколько п. услуг для одного ресурса на предприятии, оказывающего определенный вид услуги.'); }
						// Выдаём результат.
						callback({
							service_type: service_type,
							resource: resource,
							facility: facility,
							user_service: user_services_of_others[0]
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	}
	/*set_filter: function(city, facility_type, facility, service_type, resource) {
		assert(city			|| null === city,			'Wrong 1st argument in set_city_id()');
		assert(facility		|| null === facility,		'Wrong 2nd argument in set_city_id()');
		assert(service_type	|| null === service_type,	'Wrong 3rd argument in set_city_id()');
		assert(resource		|| null === resource,		'Wrong 4th argument in set_city_id()');
		
		// Возможные конфигурации:
		assert(city && !facility && !service_type && !resource, 'Wrong arguments in set_city_id()');
		assert(!city && facility && !service_type && !resource, 'Wrong arguments in set_city_id()');
		assert(!city && !facility && service_type && !resource, 'Wrong arguments in set_city_id()');
		assert(!city && facility && service_type && !resource, 'Wrong arguments in set_city_id()');
		assert(!city && !facility && !service_type && resource, 'Wrong arguments in set_city_id()');
		
		this._city = city;
		this._facility_type = facility_type;
		this._facility = facility;
		this._service_type = service_type;
		this._resource = resource;
		
		if(city && !facility && !service_type && !resource) {
			// facilities
			// service_types
			// resources
			// Выбираем все facilities, в этом городе (city), у которых
		}
	},
	_filters: {
		_city: null,
		_facility_type: null,
		_facility: null,
		_service_type: null,
		_resource: null
	},
	_user_services: null,
	_filtered: {
		facilities: null,
		service_types: null,
		resources: null
	},*/
	/**
	 * Фильтрация user_services по предприятию, типу услуг и по ресурсу.
	 */
	/*_userServicesFilter: {
		set_user_services: function(user_services) {
			assert(user_services && isNumber(user_services.length), 'Wrong argument of set_user_services() in signup.model.js');
			this._user_services = user_services;
		},
	    get: function() {
			assert(this._user_services, 'Не настроен this._user_services! signup.model.js');
	        if(!this._user_services_filtered) {
	            this._refresh();
	        }
	        return this._user_services_filtered;
	    },
	    _refresh: function() {
	        // Обнуляем до значения без фильтров.
	        this._user_services_filtered = this._user_services;
	        // Фильтруем по предприятию.
	        if(this._filters.facility) {
	            this._user_services_filtered = this._user_services_filtered.filter(function(user_service) {
	                return parseInt(this._filters.facility.id, 10) === parseInt(user_service.facility_id, 10);
	            });
	        }
	        // Фильтруем по типу услуг.
	        if(this._filters.service_type) {
	            this._user_services_filtered = this._user_services_filtered.filter(function(user_service) {
	                for(var i = 0; i < user_service.available_time.length; ++i) {
	                    for(var j = 0; j < user_service.available_time[i].service_type_ids.length; ++j) {
	                        if(parseInt(user_service.available_time[i].service_type_ids[j], 10) === parseInt(this._filters.service_type.id, 10)) {
	                            return true;
	                        }
	                    }
	                }
	                return false;
	            });
	        }
	        // Фильтруем по выбранному ресурсу.
	        if(this._filters.resource) {
	            this._user_services_filtered = this._user_services_filtered.filter(function(user_service) {
	                return parseInt(this._filters.resource.id, 10) === parseInt(user_service.resource_id, 10);
	            });
	        }
	    },
	    _user_services: null,
	    _filters: {
			city: null,
	        facility: null,
	        service_type: null,
	        resource: null
	    },
	    _user_services_filtered: null
	}*/
};
