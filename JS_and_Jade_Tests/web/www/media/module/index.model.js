/*globals Class: false, setCookie: false, getCookie: false, assert: false, window: false, console: false, makeRequest: false, doNothing: false, get_standard_phone_number: false, get_collection_from_base: false, insertDatabaseItem: false, send_sms_message: false, g_locale: false */

// Вспомогательный объект.
window.helper = new Helper();

// Модель представления для веб части сервиса Япозаписи.рф.
var ScheduleModel = new function() {
	
	/**
	 * Объект, который занимается логином пользоватлелей,
	 * отвечает на то - есть ли пользователь с его паролем в системе (в базе данных),
	 * логинит пользователей, регистристрирует новых.
	 */
	var UserManager = new Class({
		initialize: function() {
			assert(!UserManager.singleton, 'ScheduleModel.UserManager был инициализирован больше одного раза.');
			UserManager.singleton = this;
			
			var user_phone_number = this.user_phone_number,
				user_password = this.user_password;
			if(user_phone_number && user_password) {
				this.login(user_phone_number, user_password, doNothing);
			}
		},
		login: function( /** string */ user_phone_number, /** string */ user_password, /** function */ callback) {
			var invalid_arguments_message = 'Invalid arguments in UserManager.login(' + [user_phone_number, user_password, callback].join(', ') + ')';
			assert(window.helper.is('String', user_phone_number), invalid_arguments_message + 1);
			assert(window.helper.is('String', user_password), invalid_arguments_message + 2);
			assert(window.helper.is('Function', callback), invalid_arguments_message + 3);
			
			// Выбираем подходящего пользователя - с нужным телефоном и паролем.
			this._getMatchingUser(function(user) {
					return user.phone_number === user_phone_number && user.password === user_password;
				}, function(user) {
					// Если он есть.
					if(user) {
						// Сохраняем данные.
						this.user_phone_number = user_phone_number;
						this.user_password = user_password;
						this.user = user;
					} else {
						// Иначе затираем данные.
						this.user_phone_number = null;
						this.user_password = null;
						this.user = null;
					}
					callback();
			}.bind(this));
		},
		/**
		 * Выдаёт в callback первого пользователя, на которого match вернёт true.
		 * Если нет такого выдаёт в callback null.
		 */
		_getMatchingUser: function( /** function */ match, /** function */ callback) {
			assert(window.helper.is('Function', match), 'Invalid arguments in ScheduleModel.userManager._getMatchingUser()');
			assert(window.helper.is('Function', callback), 'Invalid arguments in ScheduleModel.userManager._getMatchingUser()');
			
			get_collection_from_base('users', function(match, callback, users) {
				assert(window.helper.is('Function', match), 'Invalid arguments in ScheduleModel.userManager._getMatchingUser()--get_collection_from_base');
				assert(window.helper.is('Function', callback), 'Invalid arguments in ScheduleModel.userManager._getMatchingUser()--get_collection_from_base');
				for(var i = 0; i < users.length; ++i) {
					var m = match(users[i]);
					if(m === true) {
						callback(users[i]);
						return;
					} else {
						assert(m === false, 'Функция match вернула не true и не false в ScheduleModel.userManager._getMatchingUser()');
					}
				}
				callback(null);
			}.bind(this, match, callback));
		},
		/**
		 * Существует ли пользователь с задаными телефоном и паролем.
		 * В callback возвращаем true или false.
		 */
		doesUserWithPasswordExist: function( /** string */ phone_number, /** string */ password, /** function */ callback) {
			assert(window.helper.is('String', phone_number), 'Invalid arguments in ScheduleModel.userManager.doesUserExist()');
			assert(window.helper.is('String', password), 'Invalid arguments in ScheduleModel.userManager.doesUserExist()');
			assert(window.helper.is('Function', callback), 'Invalid arguments in ScheduleModel.userManager.doesUserExist()');
			phone_number = get_standard_phone_number(phone_number);
			
			/*get_collection_from_base('users', function(phone_number, password, callback, users) {
				var valid_login_pass = false;
				phone_number = get_standard_phone_number(phone_number);
				for(var i = 0; i < users.length; ++i) {
					if(users[i].phone_number === phone_number && users[i].password === password) {
						valid_login_pass = true;
						break;
					}
				}
				callback(valid_login_pass);
			}.bind(this, phone_number, password, callback));*/
			// Перебираем всех пользовалей, оцениваем их по значению первой функции, если находим - возвращаем во вторую, иначе во вторую null.
			this._getMatchingUser(function(phone_number, password, user) {
				return user.phone_number === phone_number && user.password === password;
			}.bind(this, phone_number, password), function(user) {
				callback(user !== null);
			});
		},
		doesUserExist: function( /** string */ phone_number, /** function */ callback) {
			assert(window.helper.is('String', phone_number), 'Invalid arguments in ScheduleModel.userManager.doesUserExist()');
			assert(window.helper.is('Function', callback), 'Invalid arguments in ScheduleModel.userManager.doesUserExist()');
			phone_number = get_standard_phone_number(phone_number);
			
			this._getMatchingUser(function(phone_number, user) {
				return user.phone_number === phone_number;
			}.bind(this, phone_number), function(user) {
				callback(user !== null);
			});
		},
		logout: function() {
			assert(this.user, 'Вы пытаетесь выйти (logout) из пользовательского аккаунта, в то время как, вы ещё не зашли в него! ScheduleModel.userManager.logout()');
			this.user = null;
		},
		isLoggedIn: function() /** boolean */ {
			return !!this.user;
		},
		getLoggedUserPhoneNumber: function() /** object */ {
			var ret = this.user.phone_number;
			assert(ret, 'User phone number do not exist in UserManager.getLoggedUserPhoneNumber()');
			return ret;
		},
		getLoggedUserPassword: function() /** object */ {
			var ret = this.user.password;
			assert(ret, 'User password do not exist in UserManager.getLoggedUserPassword()');
			return ret;
		},
		registerUser: function( /** object */ user, /** function */ callback) {
			assert(window.helper.is('String', user.phone_number), 'Invalid arguments in ScheduleModel.userManager.registerUser()');
			assert(window.helper.is('String', user.password), 'Invalid arguments in ScheduleModel.userManager.registerUser()');
			assert(window.helper.is('String', user.name), 'Invalid arguments in ScheduleModel.userManager.registerUser()');
			assert(window.helper.is('Function', callback), 'Invalid arguments in ScheduleModel.userManager.registerUser()');
			
			// Псевдоавтоинкремент.
			var max_id = 0;
			get_collection_from_base('users', function(users) {
				users.forEach(function(cuser) {
					max_id = Math.max(cuser.id, max_id);
				});
			});
			user.id = max_id + 1;
			
			insertDatabaseItem('users', user, function(user) {
				// Посылаем по смс сообщение о том, что человек был зарегистрирован.
				send_sms_message(user.phone_number, user.password, g_locale.you_had_been_registered_with_password + user.password, callback);
			}.bind(this, user));
		},
		remindPassword: function(phone_number, callback) {
			assert(window.helper.is('String', phone_number), 'Invalid arguments in ScheduleModel.userManager.remindPassword()');
			assert(window.helper.is('Function', callback), 'Invalid arguments in ScheduleModel.userManager.remindPassword()');
			this._getMatchingUser(function(user) {
				return user.phone_number === phone_number;
			},  function(user) {
				if(user === null) {
					var err = 'Такой пользователь не зарегистрирован!';
					callback(err, 'NOT_REGISTERED');
					return;
				}
				user.password = generate_user_password(user.phone_number);
				
					setUserPassword(user, function(user, result) {
						// Уже слали сегодня!
						if(result !== 'OK') {
							var err = 'Уже слали сегодня!';
							callback(err);
						} else {
							// Посылаем по смс сообщение о том, что новый пароль был сегенерирован.
							// Изменён Ваш пароль в Япозаписи.ru. Новый пароль: 
							send_sms_message(user.phone_number, user.password, g_locale.new_password_generated + user.password, callback);
						}
					}.bind(this, user));
			}.bind(this));
		},
		user: null,
		user_phone_number: null,
		user_password: null
	});
	this.userManager = new UserManager();
	
	// Данные о выбранном предприятии.
	this.FacilityInfo = new Class({
		// Id больницы, выбранной на данный момент.
		_id: null,
		/**
		 * Выбираем текущую больницу, если уже выбрана, не обязательно выбирать второй раз.
		 * @param {Number} id
		 */
		set_id: function(id) {
			this._id = parseInt(id, 10);
		},
		/**
		 * Возвращаем id больницы, выбранной в данный момент.
		 */
		get_id: function() {
			return this._id;
		},
		
		/**
		 * Было ли предприятие уже выбрано.
		 */
		is_selected: function() /** boolean */ {
			return null !== this.get_id();
		},
		/**
		 * Чистим id больницы, выбранной в данный момент.
		 */
		clear_id: function() {
			this._id = null;
		},
		
		// Сохранённые данные о выбранной организации (только для записи, не для администрирования).
		_facility: null,
		get: function(callback) {
			if(this._facility) {
				callback(this._facility);
			} else {
				get_collection_from_base('facilities', function(facilities) {
					for(var i = 0; i < facilities.length; ++i) {
						if(parseInt(facilities[i].id, 10) === parseInt(this.get_id(), 10)) {
							this._facility = facilities[i];
							break;
						}
					}
					callback(this._facility);
				}.bind(this));
			}
		},
		
		facility_type: {
			get: function() {
				return this._type;
			},
			set: function(new_type) {
				assert(window.helper.is('String', new_type), 'new_type is not a string in ScheduleModel.FacilityInfo.facility_type.set(' + new_type + ')');
				this._type = new_type;
			},
			_type: null
		}
	});
	
	// User info to register.
	// Лучше в дальнейшем эту конструкцию упразднить, она почти не делает ничего полезного,
	// так как это практически алиас для interval_info.
    this.RegistrationInfo = new Class({
		// Конструктор - инициализирует interval_info.
        initialize : function(options) {
            if(options.interval_info) {
                this.interval_info = options.interval_info;
            }
        },
        // Получаем строку для interval_info в формате,
        // пригодном для чтения человеческим существом.
        getHumanReadableString : function() {
            return this.interval_info.getHumanReadableString();
        },
        // Сам interval_info с данными о выбранном промежутке времени.
        interval_info : null
    });
    
    // Информация о пользователе.
	this.UserInfo = new Class({
		// Конструктор - инициализируем ФИО, номер телефона, email,
		// bool - напоминать или нет о записи по смс (пока выключена возможность),
		// информация о регистрации.
		// Также создаём случайный id для регистрации,
		// сохраняем для кеширования в базе данных id предприятия и типа услуги.
        initialize : function(options) {
            /*this.name = options.name;*/
            if(options.phone_number) {
                this.phone_number = options.phone_number;
            }
            /*if(options.email) {
                this.email = options.email;
            }*/
            /*if(options.use_phone_to_notify) {
                this.use_phone_to_notify = options.use_phone_to_notify;
            }*/

            this.registrationInfo = options.registrationInfo;

            this.registration_id = this.createId();

            this._cached_facility_id = options.facility_id;

            this._cached_service_type_id = options.service_type_id;
            
            
            this.password = options.password;
        },
        /*name : "Unknown",*/
        phone_number : "",
        /*email : "",*/
        /*use_phone_to_notify : false,*/
        registration_id : null,
        registrationInfo : null,
        _cached_facility_id : null,
        _cached_service_type_id : null,
        password: null,
        // Генерируем случайный регистрационный номер (пока четырёхзначный),
        // по которому человека будут принимать.
        createId : function() {
            return Math.floor(Math.random() * 10000);
            //((this.name[0].toInt() ^ 732311 + this.name[1].toInt() ^ 323712) |
            // (this.name[1].toInt() ^ 2321 + this.name[2].toInt() ^
            // 4353245))%999 + (Math.random()*10000);
        },
        // Сохраняем данные на сервер, записываем человека на приём.
        saveToServer : function() {
            //save_user_request(this);
			var request_info = {
				phone_number : this.phone_number,
				/*name: this.name,*/
				/*email : this.email,
				use_phone_to_notify : this.use_phone_to_notify,*/
				registration_id : this.registration_id,
				/*resource_id: this.registrationInfo.interval_info.resource.id +
				 '&work_start_time_minutes=' + request_info.registrationInfo.interval_info.work_start_time_minutes +
				 '&human_readable_date=' + request_info.registrationInfo.interval_info.human_readable_date +
				 '&_cached_resource_name=' + request_info.registrationInfo.interval_info.resource.name +
				 '&_cached_facility_id=' + request_info._cached_facility_id +
				 '&_cached_service_type_id=' + request_info._cached_service_type_id;*/
				_cached_facility_id: this._cached_facility_id,
				_cached_service_type_id: this._cached_service_type_id,
				registrationInfo : this.registrationInfo
			};
			var request_string = '/cmd/save_user_request' +
									/*'?name=' + request_info.name +*/
									'?phone_number=' + request_info.phone_number +
									/*'&email=' + request_info.email +*/
									/*'&use_phone_to_notify=' + request_info.use_phone_to_notify +*/
									'&registration_id=' + request_info.registration_id +
									'&resource_id=' + request_info.registrationInfo.interval_info.resource.id +
									'&work_start_time_minutes=' + request_info.registrationInfo.interval_info.work_start_time_minutes +
									'&human_readable_date=' + request_info.registrationInfo.interval_info.human_readable_date +
									'&human_readable_time=' + request_info.registrationInfo.interval_info.human_readable_time +
									'&_cached_resource_name=' + request_info.registrationInfo.interval_info.resource.name +
									'&_cached_facility_id=' + request_info._cached_facility_id +
									'&_cached_service_type_id=' + request_info._cached_service_type_id;

			if(console && console.log) {
				console.log('Request: ' + request_string);
			}
			makeRequest(request_string, function(save_data) {
				var ok_msg = 'OK',
					time_slot_already_used = 'TIME_SLOT_ALREADY_USED';
				assert((save_data === ok_msg) || (time_slot_already_used === ok_msg), "User info have not successfully saved!");
				/*if(user_password_generated.test(ok_msg)) {
					var created_user_password = user_password_generated.exec(ok_msg)[1];
					callback(created_user_password);
				}*/
				
				//callback();
				
			});
			/*insertDatabaseItem('user_requests', request_info);*/
        },
        // Можно ли использовать эти данные для регистрации пользователя,
        // данные должны быть корректными, email должен соответствовать формату email и т.д.
        isDataValid : function(callback) {
            /*var is_name_valid = (this.name && this.name !== '' && this.name.length && this.name.length >= 3);*/
            var is_phone_number_valid = (this.phone_number && this.phone_number !== '' && this.phone_number.length && this.phone_number.length >= 6);
            /*var is_id_valid = (this.registration_id >= 0 && this.registration_id < 10000);*/
  
			var is_pass_valid;
			get_collection_from_base('users', function(users) {
				for(var i = 0; i < users.length; ++i) {
					if(users[i].phone_number == this.phone_number && users[i].password == this.password) {
						is_pass_valid = true;
						break;
					}
				}
				var result = is_phone_number_valid && is_pass_valid;
				callback(result);
			}.bind(this));
        }
    });
    
    // Информация о текущем (выбранном) городе.
    // Его id и кешированая полная информация.
	this.current_city = {
		/*
		 * Sets current city id (cities in database/cities.json) in cookies.
		 */
		set_id: function(id) {
			id = parseInt(id, 10);
			// Не работает удаление кукис, да оно и не нужно.
			// Вообще убрал эту функцию из common.js.
			//deleteCookie("city_id");
			// Меняем занчение city_id в кукис на текущий id выбранного города.
			setCookie("city_id", id.toString());
			// Обнуляем кеш с информацией о выбранном городе (если по id не сходится).
			if(this._cached.city_data && (this._cached.city_data.id !== id)) {
				this._cached.city_data = null;
			}
		},
		/*
		 * Gets current city id (cities in database/cities.json) from cookies.
		 */
		get_id: function() {
			return getCookie("city_id");
		},
		/*
		 * Gets current city (cities in database/city_coordinates.json) and sends it to callback.
		 * callback is Function.
		 */
		get: function(callback) {
			assert(window.helper.is('Function', callback), 'callback is not a Function, invalid argument! current_city.get().');
			// Если в кеше уже сохранены данные для текущего города.
			if(this._cached.city_data) {
				// Возвращаем данные из кеша (в callback).
				callback(this._cached.city_data);
			} else {
				get_cities_from_base(function(cities) {
					var id = this.get_id();
					for (var i = 0; i < cities.length; ++i) {
						if (parseInt(id, 10) === parseInt(cities[i].id, 10)) {
							this._cached.city_data = cities[i];
							callback(cities[i]);
							break;
						}
					}
				}.bind(this));
			}
		},
		// Кеш с сохранёнными данными, для большей скорости обработки,
		// меньшего количества поисков.
		_cached: {
			// Кеш с данными о текущем выбранном городе.
			city_data: null
		}
	};

} ();
