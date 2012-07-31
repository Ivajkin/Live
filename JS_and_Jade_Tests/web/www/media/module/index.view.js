/*global makeRequest: false, Asset: false, IOElement: false, HelperGL: false, Class: false, window: false, Content: false, $: false, current_city: false, Engine: false, setup_locale_ru: false, g_locale: false, SectionGL: false, Browser: false, $$: false, get_city_by_geolocation: false, save_user_request: false, get_regions_from_base: false, get_cities_from_base: false, getCookie: false, get_service_types_from_base: false, assert: false, get_resources_from_base: false, Scheduler: false, get_user_services_from_base: false, get_facilities_from_base: false, shorten: false, get_locations_from_base: false, check_login: false, Element: false, isNumber: false, ScheduleModel: false, makeInputUserFriendly: false, get_collection_from_base: false, get_standard_phone_number: false, is_panel: false, insertDatabaseItem: false */
/*
 * @author Ivajkin Timofej
 * at Technovation (ООО "ТН")
 * http://tncor.com <support@tncor.com>
 */
"use strict";

console.log('index.view.js');

// Меню выбора региона, меню "Начать запись".
var select_region = null,
	signup_event = null,
	facility_menu_show = null,
	partners_menu_invoke = null,
	on_city_selected = null,
	admin_login_panel = null,
	on_user_login = null,
	administration_menu_invoke = null,
	/**
	 * Главный экран.
	 * Чистим и рисуем главную форму с рекламой.
	 */
	 refreshMainScreen = null;

/**
 * Создание панели.
 */
var createPanel = null,
	createToolbarButton = null,
	get_selected_button_name = null;

// Движок летающих панелек.
var engine = null;

/*
 * Большая кнопка.
 */
var ButtonBigEl = new Class({
	Extends : IOElement,
	options : {
		text : '',
		title : '',
		panel : null,
		onclick : null
	},
	initialize : function(options) {
		this.parent(options);

		this.input = new Element('div', {
			'name' : this.options.name,
			'text' : this.options.text,
			'class' : 'big_button',
			'title' : options.title
		});

		if(options.panel) {
			this.element = this.toElement();
			options.panel.html_content.adopt(this.element);
			if(options.onclick) {
				this.onclick = options.onclick;
				this.element.addEvent('click', options.onclick);
			}
		}
	},
	enable: function() {
		this.input.removeClass('disabled');
		this.element.addEvent('click', this.onclick);
	},
	disable: function() {
		this.input.addClass('disabled');
		this.element.removeEvent('click', this.onclick);
	},
	element: null,
	onclick: null
});


(function() {
	var user_plans_panel = null,
		user_cabinet = null,
		user_login_panel_show = null,
		user_cabinet_login_pressed = null,
		user_register_confirmation = null,
		user_show_contract = null,
		user_login_or_register_sequence = null;
	
	// Загрузка шрифтов от Google Web Fonts - Lobster и Cuprum.
	// Загружаем ассинхронно.
	function load_fonts() {
		setTimeout(function() {
			Asset.css('http://fonts.googleapis.com/css?family=Lobster&subset=latin,cyrillic');
			Asset.css('http://fonts.googleapis.com/css?family=Cuprum&subset=latin,cyrillic');
		}, 100);
	}

	/*
	 * Смена скина для разных типов предприятий - для врачей одно нарисовано, для парикмахеров другое.
	 */
	function set_skin(type) {
		var logo = $('logo-service'),
			medLogo = $('medical-logo'),
			hairLogo = $('haircut-logo'),
			nailsLogo = $('nails-logo');
		assert(logo, 'There is no logo (service type logo)');
		
		switch(type) {
			case 'medical':
				medLogo.setStyle('opacity', 1);
				hairLogo.setStyle('opacity', 0);
				nailsLogo.setStyle('opacity', 0);
				break;
			case 'haircut':
				hairLogo.setStyle('opacity', 1);
				medLogo.setStyle('opacity', 0);
				nailsLogo.setStyle('opacity', 0);
				break;
			case 'nails':
				nailsLogo.setStyle('opacity', 1);
				hairLogo.setStyle('opacity', 0);
				medLogo.setStyle('opacity', 0);
				break;
			case 'default':
				hairLogo.setStyle('opacity', 0);
				nailsLogo.setStyle('opacity', 0);
				medLogo.setStyle('opacity', 0);
				break;
			default:
				throw 'Invalid service type while trying to change look with set_service_look()';
		}
		
		if('default' !== type) {
			logo.set('morph', {
				duration : 500,
				transition : 'quint:in' /*Fx.Transitions.Bounce.easeOut*/,
				link : 'chain'
			});
			logo.morph({'opacity': [0, 1]});
		}
	}
	
	// Создаём хранилище для информации о выбранной организации.
	var facility = new ScheduleModel.FacilityInfo();
	var current_city = ScheduleModel.current_city;
	
	// Услуга, выбранная на данный момент.
	var current_service_type = null;
	
	
	/**
	 * Пользователь нажал кнопку Войти в панели входа в личный кабинет пользователя.
	 */
	user_cabinet_login_pressed = function( /** string */ phone_number,  /** string */ password, /** function */ callback) {
		assert(window.helper.is('String', phone_number), 'Invalid arguments user_cabinet_login_pressed()');
		assert(window.helper.is('String', password), 'Invalid arguments user_cabinet_login_pressed()');
		
		// Пользователь с таким именем и паролем зарегистрирован в системе? - проверяем.
		ScheduleModel.userManager.doesUserWithPasswordExist(phone_number, password, function(valid_login_pass) {
			// Пользователь с таким именем и паролем зарегистрирован в системе?
			if(valid_login_pass) {
				// Да, есть такой пользователь.
				// Пользователь залогинен.
				ScheduleModel.userManager.login(phone_number, password, function() {
					// Панель со списком записей/планов пользователя. Прошлую панель прячем.
					// Например user_plans_panel(phone_number);
					callback(phone_number);
				});
			} else {
				// Нет, пользователь не зарегистрирован в системе.
				engine.showToolTip(g_locale.invalid_phone_number_or_password, g_locale.message.icons.error);
			}
		});
	};
	
	/**
	 * Пользовательское соглашение "Б" - для простых пользователей.
	 */
	user_show_contract = function(parent_panel) {
		// Пользовательское соглашение (ЯПЗ-Б)
		createPanel(g_locale.user_cabinet.contract.header, function(contract_panel) {
			makeRequest('user-contract.static.html', function(html) {
				contract_panel.addContentBlock({
					text: html
				});
				$('confidence-policy-link').addEvent('click', function() {
					show_confidence_policy(contract_panel);
				});
			});
		}, parent_panel, true);
	};
	
	/**
	 * Панель при регистрации.
	 * Панель: я согласен с условиями пользовательского соглашения; посмотреть соглашение; продолжить.
	 */
	user_register_confirmation = function( /** object */ parent_panel, /** function */ callback) {
		assert(window.helper.is('Function', callback), 'Wrong argument callback in user_register_confirmation()');
		// Регистрация
		createPanel(g_locale.user_cabinet.register.header, function(register_panel) {
			
			// Телефонный номер:
			// Маску убрал, Владимир говорит - непонятно.
			register_panel.phone_number = register_panel.createTextIO({
				header : g_locale.user_cabinet.login.phone_input.header,
				value: '+7'
			});
			makeInputUserFriendly(register_panel.phone_number);

			// ФИО (не обязательно):
			register_panel.name = register_panel.createTextIO({
				header : g_locale.user_cabinet.register.name_input.header,
				line : true
			});
			makeInputUserFriendly(register_panel.name);
			
			// Я согласен с условиями пользовательского соглашения
			var confirm_checkbox = register_panel.createCheckbox({
				header: g_locale.user_cabinet.register.confirm_text,
				value: false
			});
			// Показать условия
			register_panel.addBlock({
				icons: [g_locale.user_cabinet.register.show_contract_button.icon],
				header: g_locale.user_cabinet.register.show_contract_button.header
			}, function() {
				user_show_contract(register_panel);
			});
			// Регистрация
			register_panel.addBlock({
				icons: [g_locale.user_cabinet.register.register_button.icon],
				header: g_locale.user_cabinet.register.register_button.header
			}, function() {
				// Свитчер "Я согласен" в положении true?
				if(confirm_checkbox.checked) {
					var phone_number = get_standard_phone_number(register_panel.phone_number.value),
						name = register_panel.name.value;
					// Телефон нормально сформирован?
					if(is_phone_number_valid(phone_number)) {
						// Да, телефон правильный.
						// Пользователь уже зарегистрирован?
						ScheduleModel.userManager.doesUserExist(phone_number, function(user_exist) {
							// Пользователь уже зарегистрирован?
							if(user_exist) {
								// Извините. Данный телефон уже зарегистрирован в базе. Вернитесь на прошлую форму и введите пароль.
								engine.showToolTip(g_locale.user_phone_registered, g_locale.message.icons.error);
							} else {
								// Генерируем пароль - случайный, но не полностью (для проверки).
								var generated_password = generate_user_password(phone_number);
								if(/u/.test(generated_password)) {
									engine.showToolTip('Введите верный номер телефона', g_locale.message.icons.error);
									return;
								}
								assert(( typeof phone_number.length != 'undefined') && ( typeof name.length != 'undefined'), 'Wrong password and login data');
								// Поздравляем, Вы успешно зарегистрированы в Япозаписи.ru
								engine.showToolTip(g_locale.user_cabinet.register.you_have_been_registered, g_locale.message.icons.info);
								ScheduleModel.userManager.registerUser({
									phone_number: phone_number,
									name: name,
									password: generated_password
								}, function() {
									// Пароль был доставлен на ваш номер телефона. Проверьте входящие сообщения.
									engine.showToolTip(g_locale.password_sent_by_sms, g_locale.message.icons.info);
									// Вызываем что-то пострегистрационное.
									// Возможно возвращаемся ко входу в кабинет.
									callback();
								});
							}
						});
					} else {
						// Нет, телефон неправильный.
						
						// Если человек не указал телефон (например так +7 или пустота в поле ввода).
						if(phone_number === '+7' || phone_number === '') {
							// Введите свой телефон для напоминания пароля
							engine.showToolTip(g_locale.remind_no_number, g_locale.message.icons.error);
						} else {
							// Укажите телефон в формате +7xxxxxxx (например так: +71234567890)
							engine.showToolTip(g_locale.wrong_phone_number_format, g_locale.message.icons.error);
						}
					}
				} else {
					// Для регистрации необходимо подтвердить, что Вы согласны с условиями пользовательского соглашения
					engine.showToolTip(g_locale.user_cabinet.register.you_should_confirm, g_locale.message.icons.error);
				}
			});
		}, parent_panel);
	};
	
	/**
	 * Панель логин/пароль для пользователей.
	 * В callback посылаем результат в виде login, password.
	 * parent_panel - панель после которой мы открываем следующие. Может быть null, тогда панель появляется на пустом месте.
	 */
	user_login_panel_show = function( /** object */ parent_panel,  /** function */ callback) {
		assert(parent_panel || parent_panel === null, 'Wrong 1st argument in parent_panel()');
		assert(window.helper.is('Function', callback), 'Wrong 2nd argument in parent_panel()');
				
		// Личный кабинет
		createPanel(g_locale.user_cabinet.login.header, function(user_login_panel) {
			
			// TODO: Личный кабинет пользователя - текстовка 1 - что это такое и что здесь можно делать.
			user_login_panel.addContentBlock({
				text: g_locale.user_cabinet.tip1
			});
			
			var onsumbit = function(user_login_panel, e) {				
				assert(e.keyCode === 0 || e.keyCode, 'Возможно у event по onkeydown нет свойства keyCode в некоторых браузерах.');
				if(e.keyCode == 13) {
					var phone_number = get_standard_phone_number(user_login_panel.phone_number.value),
					password = user_login_panel.password.value;
					// Если нет значения возможно это логин, а не номен телефона.
					if(!phone_number) {
						phone_number = user_login_panel.phone_number.value;
					}
					assert(( typeof phone_number.length != 'undefined') && ( typeof password.length != 'undefined'), 'Wrong password and login data');
					// Логиним пользователя.
					ScheduleModel.userManager.login(phone_number, password, function() {
						// Войти в свой кабинет нажали.
						user_cabinet_login_pressed(phone_number, password, callback);
					});
				}
			}.bind(this, user_login_panel);
			// Телефонный номер:
			// Маску убрал, Владимир говорит - непонятно.
			user_login_panel.phone_number = user_login_panel.createTextIO({
				header : g_locale.user_cabinet.login.phone_input.header,
				value: '+7'/*,
				mask: window.helper.mask.m_phone*/
			});
			user_login_panel.phone_number.onkeydown = onsumbit;
			makeInputUserFriendly(user_login_panel.phone_number);

			// Пароль:
			user_login_panel.password = user_login_panel.createTextIO({
				header : g_locale.user_cabinet.login.password_input.header,
				line : true
			});
			user_login_panel.password.onkeydown = onsumbit;
			user_login_panel.password.type = 'password';
			makeInputUserFriendly(user_login_panel.password);

			// Войти
			// Войти в свой личный кабинет
			var enter_button = new ButtonBigEl({
				text : g_locale.user_cabinet.login.login_button.text,
				title: g_locale.user_cabinet.login.login_button.tip,
				panel : user_login_panel,
				onclick : function() {
					// Убрал дублирование
					onsumbit({keyCode: 13});
				}
			});
			// Я забыл пароль!
			// Если Вы забыли свой пароль, нажмите эту кнопку, чтобы мы напомнили его Вам
			var remind_button = new ButtonBigEl({
				text : g_locale.user_cabinet.login.remind_button.text,
				title: g_locale.user_cabinet.login.remind_button.tip,
				panel : user_login_panel,
				onclick : function() {
					var phone_number = get_standard_phone_number(user_login_panel.phone_number.value);
					if(is_phone_number_valid(phone_number)) {
						// Да, телефон правильный.
						ScheduleModel.userManager.remindPassword(phone_number, function(err, error_info) {
							if(err) {
								if(error_info === 'NOT_REGISTERED') {
									// Извините, Вы не зарегистрированы. Нажмите кнопку Регистрация, чтобы зарегистрироваться.
									engine.showToolTip(g_locale.you_are_not_registered, g_locale.message.icons.info);
								} else {
									// Извините, не удалась изменить пароль, возможно мы уже высылали Вам пароль сегодня.
									engine.showToolTip(g_locale.password_was_sended_today, g_locale.message.icons.info);
									remind_button.disable();
								}
							} else {
								// SUCCESS!
								remind_button.disable();
								// Пароль был доставлен на ваш номер телефона. Проверьте входящие сообщения.
								engine.showToolTip(g_locale.password_sent_by_sms, g_locale.message.icons.info);
							}
						});
					} else {
						// Нет, телефон неправильный.
						
						// Если человек не указал телефон (например так +7 или пустота в поле ввода).
						if(phone_number === '+7' || phone_number === '') {
							// Введите свой телефон для напоминания пароля
							engine.showToolTip(g_locale.remind_no_number, g_locale.message.icons.error);
						} else {
							// Укажите телефон в формате +7xxxxxxx (например так: +71234567890)
							engine.showToolTip(g_locale.wrong_phone_number_format, g_locale.message.icons.error);
						}
					}
				}
			});
			// Если кнопка выключена и мы изменяем номер телефона - надо её включить.
			user_login_panel.phone_number.addEvent('keydown', function() {
				remind_button.enable();
			});
			
			// Регистрация
			// Вы должны зарегистрироваться, чтобы воспользоваться сервисом Япозаписи.ru
			var register_button = new ButtonBigEl({
				text : g_locale.user_cabinet.login.register_button.text,
				title: g_locale.user_cabinet.login.register_button.tip,
				panel : user_login_panel,
				onclick : function() {
					// Панель: я согласен с условиями пользовательского соглашения; посмотреть соглашение; продолжить.
					// Передаём родительскую панель, чтобы эта исчезла во время регистрации.
					user_register_confirmation(parent_panel, function() {
						engine.backSections(1);
						var phone_number = get_standard_phone_number(user_login_panel.phone_number.value);
						//callback(phone_number);
						// Мы ещё не можем перейти дальше, пользователь сначала должен сам ввести пароль.
						user_login_panel_show(parent_panel, callback);
					});
				}
			});
			
			// TODO: Личный кабинет пользователя - текстовка 2 - что это такое и что здесь можно делать.
			user_login_panel.addContentBlock({
				text: g_locale.user_cabinet.tip2
			});
		}, parent_panel);
	};
	/**
	 * Панель логин/пароль для администраторов.
	 * В callback посылаем результат в виде login, password.
	 */
	admin_login_panel = function(parent_panel, callback) {
		// Вход
		createPanel(g_locale.administration.login.header, function(admin_login_panel) {
			// TODO: Управление организацией - текстовка 2 - что это такое и что здесь можно делать.
			admin_login_panel.addContentBlock({
				text: g_locale.administration.tip
			});
			
			var onsumbit = function(admin_login_panel, e) {
				//assert(e.keyCode, 'Возможно у event по onkeydown нет свойства keyCode в некоторых браузерах.');
				if(e.keyCode == 13) {
					var login = admin_login_panel.login.value, password = admin_login_panel.password.value;
					callback(login, password);
				}
			}.bind(this, admin_login_panel);
			// Логин
			admin_login_panel.login = admin_login_panel.createTextIO({
				header : g_locale.administration.login.login_input.header,
				line : false
			});
			admin_login_panel.login.onkeydown = onsumbit;
			makeInputUserFriendly(admin_login_panel.login);

			// Пароль
			admin_login_panel.password = admin_login_panel.createTextIO({
				header : g_locale.administration.login.password_input.header,
				line : true
			});
			admin_login_panel.password.onkeydown = onsumbit;
			admin_login_panel.password.type = 'password';
			makeInputUserFriendly(admin_login_panel.password);

			// Войти
			// Начать управление учреждением.
			//TODO
			var button = new ButtonBigEl({
				text : g_locale.administration.login.button.text,
				panel : admin_login_panel,
				onclick : function() {
					var login = admin_login_panel.login.value, password = admin_login_panel.password.value;
					assert(( typeof login.length != 'undefined') && ( typeof password.length != 'undefined'), 'Wrong password and login data');
					callback(login, password);
				}
			});
			
			/*
			 TODO: Нет, слишком опасно пока.
			 // Я забыл пароль!
			// Если Вы забыли свой пароль, нажмите эту кнопку, чтобы мы напомнили его Вам
			var remind_button = new ButtonBigEl({
				text : g_locale.user_cabinet.login.remind_button.text,
				title: g_locale.user_cabinet.login.remind_button.tip,
				panel : admin_login_panel,
				onclick : function() {
					var login = admin_login_panel.login.value;
						// Да, телефон правильный.
						ScheduleModel.userManager.remindPassword(phone_number, function(err, error_info) {
							if(err) {
								if(error_info === 'NOT_REGISTERED') {
									// Извините, Вы не зарегистрированы. Нажмите кнопку Регистрация, чтобы зарегистрироваться.
									engine.showToolTip(g_locale.you_are_not_registered, g_locale.message.icons.info);
								} else {
									// Извините, не удалась изменить пароль, возможно мы уже высылали Вам пароль сегодня.
									engine.showToolTip(g_locale.password_was_sended_today, g_locale.message.icons.info);
									remind_button.disable();
								}
							} else {
								// SUCCESS!
								remind_button.disable();
								// Пароль был доставлен на ваш номер телефона. Проверьте входящие сообщения.
								engine.showToolTip(g_locale.password_sent_by_sms, g_locale.message.icons.info);
							}
						});
				}
			});
			// Если кнопка выключена и мы изменяем номер телефона - надо её включить.
			admin_login_panel.login.addEvent('keydown', function() {
				remind_button.enable();
			});*/
		}, parent_panel);
	};
	
	window.addEvent('domready', function() {
		
		// Антигалочка ✔ ✗
		(function() {
			setTimeout(function() {
				var title = $$('title').get('html');
				var match = /✔ (.+)/.exec(title);
				if(match && match[1]) {
					title = match[1];
					$$('title').set('html', title);
				}
			}, 400);
		}) ();
		
		/* UNIT TESTS */
		// Вспомогательная служба, которая помогает отлаживать
		// некоторые возможности движка с помощью вызова специальных комманд.
		// Например "test" вызывает юнит тесты.
		var cheat_buffer = '';
		var cheet_sheet = {
			test : function() {
				document.getElementById('header').className += 'hidden';
				document.getElementById('outer').className += 'hidden';
				document.getElementById('footer').className += 'hidden';
				document.getElementById('unit-tests').className = '';

				/*var fileref1 = document.createElement('script');
				 fileref1.setAttribute("type", "text/javascript");
				 fileref1.setAttribute("src", "tests/qunit.js");

				 var fileref2 = document.createElement('script');
				 fileref2.setAttribute("type", "text/javascript");
				 fileref2.setAttribute("src", "tests/tests.js");*/

				oHead = document.getElementsByTagName('HEAD').item(0);
				oScript = document.createElement("script");
				oScript.type = "text/javascript";
				oScript.src = "tests/tests.js";
				oHead.appendChild(oScript);
			}
		};
		window.addEvent('keydown', function(evt) {
			cheat_buffer += evt.key;
			for(var key in cheet_sheet) {
				if(cheat_buffer.length >= key.length) {
					if(cheat_buffer.substring(cheat_buffer.length - key.length, cheat_buffer.length) == key) {
						cheet_sheet[key]();
					}
				}
			}
			if(cheat_buffer.length >= 32) {
				cheat_buffer = cheat_buffer.substring(1, cheat_buffer.length);
			}
		});
		/* UNIT TESTS FIN */

		//Летающие панельки
		engine = new EngineTN($('main'),{
			unit_css:['wide', 'narrow'],
			header:'header',
			footer:'footer',
			sidebar:'sidebar',
			back_info: document.body,
			// TODO: эффект на production.
			sliding: true,
			unit_marginH:0,
			buttons: {yes:'Да', no:'Нет'},
			margin: screen.width>1024?25:5			
			/*,rightbar:'rightbar'*/
			
		});
		
		window.addEvent('resize', function() {
			engine.resize();
		});

		var addNewSec = null;
		
		//Face-contorl
		/*if(Browser.ie && Browser.version<8) {
			$$('body').set('html','<div style="margin:20% 0 0 40%;font-size:20px;">Sorry, your browser is not accepted!</div>');
			return false;
		}*/
		
		var backFunc = function(e) { 
			var currentSec = e.sec;
			content.removeScrolls(1);
			engine.backSections();
		};
		
		//Добавить скролл, если контент не будет помещаться
		var refreshScroll = function(sec, obj) {	
			content.resizeScrolls();
		};
		
		/**
		 * Создаёт кнопки на правой верхней панели (сохранить/удалить/добавить/изменить).
		 * Принимает
		 *		options = {
		 *				panel: ?,
		 *				text: ?,
		 *				callback: ?,
		 *				style_class: ?
		 *		}
		 */
		createToolbarButton = function createToolbarButton(options) {
			if(options.length) {
				throw -1;
			}
			var panel = options.panel,
				text = options.text,
				callback = options.callback,
				style_class = options.style_class;
				
			var stringified_params = JSON.stringify({
				panel: 'SOMETHING (Circular structure)',
				text: options.text,
				callback: options.callback,
				style_class: options.style_class
			});
			assert(window.helper.is('String', text), 'text must be string in createToolbarButton(' + stringified_params + ')');
			assert(window.helper.is('Function', callback), 'callback must be function in createToolbarButton(' + stringified_params + ')');
			assert(window.helper.is('String', style_class), 'style_class must be string in createToolbarButton(' + stringified_params + ')');
					
			var back_icon = {
				hint: text,
				func: callback,
				iclass: style_class,
				src: g_locale.toolbar_icon[style_class]
			};
			if('ok_toolbar_icon' === style_class || 'save_toolbar_icon' === style_class || 'ok_toolbar_icon_disabled' === style_class) {
				back_icon.width = 72;
			}
			var position = (options.position ? options.position : window.helper.where.right);
			var icon = panel.addToolbarIcon(position, back_icon, window.helper.where.top);
			//icon.addClass();
			assert(typeof icon !== undefined, 'Или конпка не была создана, или функция не вернула значение');
		};
		
		/**
		 * 
		 * Creates (small/big) panel with header,
		 * clearing others if no parent,
		 * calls callback after all.
		 * isAcceptable - есть ли кнопка подтверждения справа, сверху.
		 * onAcceptEvent - событие, происходящее при нажатии на кнопку подтверждения.
		 * @param {Object} header - заголовок панели
		 * @param {Object} callback - вызываем после создания, когда нужно добавлять блоки, но до завершения создания.
		 * @param {Object} parent - родительская панель, не обязательный параметр. Если он равен null или undefined, то удаляем все панели прежде чем создать эту.
		 * @param {Object} isBig - большая ли панель или маленькая.
		 */
		createPanel = function createPanel(header, callback, parent, isBig) {
			assert(window.helper.is('String', header), 'Wrong 1st argument in createPanel()');
			assert(window.helper.is('Function', callback), 'Wrong 2nd argument in createPanel()');
			assert(!parent || is_panel(parent), 'Wrong 3rd argument in createPanel()');
			assert(!isBig || true === isBig, 'Wrong 4th argument in createPanel()');
			
			
			// Если у панели есть родитель - убираем лишние.
			if(parent && engine.unitsTpl.length) {
				var fond = false;
				for(var i = engine.unitsTpl.length-1; i >= 0; --i) {
					if(engine.unitsTpl[i] === parent) {
						fond = true;
						break;
					}
				}
				if(fond) {
					var to_erase_count = engine.unitsTpl.length - i - 1;
					engine.removeRightUnits(to_erase_count);
				}
			}
			
			// Если не указана родительская панель, чистим экран перед выводом.
			var clear = (!parent);
			
			var createdPanel = new UnitEntity();
			var unit_settings = {
				toolbar : {
					header : header
				}
			};
			if(clear) {
				engine.refresh();
			}
			if(isBig) {
				createdPanel.createWide(unit_settings);
			} else {
				createdPanel.createNarrow(unit_settings);
			}
			engine.addUnit(createdPanel);
			//createdPanel.loaderStart();
			createdPanel.addContentBlock = function(options, event) {
				options.unselectable = false;
				options.events = false;
				return this.addBlock(options, event);
			};
			callback(createdPanel);
			
			//createdPanel.loaderStop();
			return createdPanel;
		}
		
		setup_locale_ru();
		
		/**
		 * Gets the name of the selected button.
		 */
		get_selected_button_name = function get_selected_button_name(selected_button) {
			var name_or_id = selected_button.getParent().getElement(".block_select_mem").getElement(".header").get("name");
			return name_or_id;
		};
		
		/**
		 * Обновить информацию в левой нижней панели (регион, планы-услуги).
		 * Параметр user_name не обязательный (если undefined, то просто не меняем).
		 */
		function updateLeftPanelData(user_name) {
			// Меняем надпись - текущий город.
			current_city.get(function(city) {
				$('region').set('text',	city.name);
			});
			// Меняем имя пользователя.
			if(user_name) {
				$('user_plans').set('text', user_name);
			}
		}
		
		administration_menu_invoke = administrationView();
		
		// Форма поздравления после подачи заявки на партнёрский аккаунт.
		var partner_signup_finished = function(facility_name, contact_name, contact_phone_number) {
			assert(window.helper.is('String', facility_name), 'Wrong 1st argument in partner_signup_finished()');
			assert(window.helper.is('String', contact_name), 'Wrong 2nd argument in partner_signup_finished()');
			assert(window.helper.is('String', contact_phone_number), 'Wrong 3rd argument in partner_signup_finished()');
			
			insertDatabaseItem('facility_requests', {
				facility_name: facility_name,
				contact_name: contact_name,
				contact_phone_number: contact_phone_number,
				request_date: (new Date()).toUTCString()
			}, function() {
				// Готово
				createPanel(g_locale.partners.signup.congrats_panel.header, function(signup_finished_panel) {
					// Спасибо! Мы свяжемся с Вами по поводу Вашей заявки в течение 7 рабочих дней. <br/> Всего доброго и до новых встреч! Ваш <a href="http://tncor.com">tncor.com</a>
					signup_finished_panel.addContentBlock({
						text : g_locale.partners.signup.congrats_panel.info
					});
				});
			});
		}
		// Формы для подачи заявки для партнёров - организаций.
		var partner_signup = function(parent_panel) {
			// Заявка
			createPanel(g_locale.partners.signup.signup_panel.header, function(signup_panel) {
				// Вы можете подать заявку на получение партнёрского аккаунта. Это позволит Вам размещать на нашем сайте информацию о себе, а также воспользоваться удобной системой онлайн записи. <br/>Пожалуйста заполните следующие формы:
				signup_panel.addContentBlock({
					text : g_locale.partners.signup.signup_panel.info
				});

				// Название организации:
				var facility_name_input = signup_panel.createTextIO({
					header : g_locale.partners.signup.signup_panel.facility_name_input,
					line : true
				});
				makeInputUserFriendly(facility_name_input);
			
				// ФИО контактного лица:
				var contact_name_input = signup_panel.createTextIO({
					header : g_locale.partners.signup.signup_panel.contact_name_input,
					line : true
				});
				makeInputUserFriendly(contact_name_input);
				// Телефон контактного лица:
				var contact_phone_number_input = signup_panel.createTextIO({
					header : g_locale.partners.signup.signup_panel.contact_phone_number_input,
					line : true
				});
				makeInputUserFriendly(contact_phone_number_input);
				// Подать заявку
				var signupBtn = new ButtonBigEl({
					text: 'Подать заявку',
					panel: signup_panel,
					onclick: function() {
						partner_signup_finished(facility_name_input.value, contact_name_input.value, contact_phone_number_input.value);
	                }
				});
			});
		}
		//  Информация для партнёров - организаций.
		partners_menu_invoke = function() {
           // Партнёрам
           // Информация для партнёров
           createPanel(g_locale.partners.header, function(partners_panel) {
				// Мы рады знакомству с вами и возможному партнёрству...
				partners_panel.addContentBlock({
					text : g_locale.partners.info
				});
				partners_panel.addBlock({
					icons: [g_locale.partners.signup.icon],
					header : g_locale.partners.signup.header,
					text : g_locale.partners.signup.text
				}, partner_signup, true);
           }, null, true);
        };
        
        
        // Пользовательский кабинет, в котором он может смотреть свои планы.
        user_plans_panel = function(phone_number) {
			assert(window.helper.is('String', phone_number), 'Нет телефона пользователя, неправильный аргумент в phone_number()');

			// Обновляем информацию в левой-нижней панели (телефон пользователя).
			on_user_login({
				phone_number : phone_number
			});
			var user_phone_number = get_standard_phone_number(phone_number);
			// Планы
			var plans_panel = createPanel(g_locale.user_plans.header, function(plans_panel) {
				
				// Подгружаем данные по предприятиям и типам услуг.
				get_collection_from_base('facilities', function(facilities, facilities_by_id) {
					get_collection_from_base('service_types', function(facilities_by_id, service_types, service_types_by_id) {
						// Получаем пользовательские запросы.
						get_collection_from_base('user_requests', function(facilities_by_id, service_types_by_id, user_requests) {
							
							for(var i = 0; i < user_requests.length; ++i) {
								var request_phone_number = get_standard_phone_number(user_requests[i].phone_number);
								// Если этот запрос отправил пользователь.
								if(user_phone_number == request_phone_number) {
									// Берём дату запроса в человекочитабельном формате.
									var date = user_requests[i].human_readable_date;
									// Берём время, тоже в читабельном формате.
									var time = user_requests[i].human_readable_time;
									// Берём названиие типа услуг запроса.
									var service_type_id = user_requests[i]._cached_service_type_id;
									var service_type_name = service_types_by_id[service_type_id].name;
									// Берём название предприятия в котором эту услугу будут оказывать.
									var facility_id = user_requests[i]._cached_facility_id;
									var facility_name = facilities_by_id[facility_id].name;
									// Создаём контент блок.
									plans_panel.addBlock({
										icons: [g_locale.user_plans.plan.icon],
										header: service_type_name,
										text: date + ' в ' + time + '<br/>организация: ' + facility_name
												+ '<!--<br/>(для проверки - номер телефона пользователя: ' + request_phone_number + ')-->'
									});
								}
							}
							
						}.bind(this, facilities_by_id, service_types_by_id));
					}.bind(this, facilities_by_id));
				});
				
			});

			// Выйти
			createToolbarButton({
				text : g_locale.user_cabinet.plans.logout_button.tip,
				callback : function() {
					ScheduleModel.userManager.logout();
					user_cabinet();
				},
				style_class : 'logout_toolbar_icon',
				panel : plans_panel
			});
        };
        
        // Если пользователь залогинен - продолжаем, иначе сиквенс с логином/регистрацией пользователя.
        // Путь сюда только от пользовательского кабинета и после календаря, до подтверждения.
        // parent_panel - панель после которой мы открываем следующие. Может быть null, тогда панель появляется на пустом месте.
        user_login_or_register_sequence = function( /** object*/ parent_panel, /** function */ callback) {
			assert(parent_panel || parent_panel === null, 'Wrong 1st argument in user_login_or_register_sequence()');
			assert(window.helper.is('Function', callback), 'Wrong 2nd argument in user_login_or_register_sequence()');
		
			// Залогинен пользователь?
			if(ScheduleModel.userManager.isLoggedIn()) {
				var user_phone_number = ScheduleModel.userManager.getLoggedUserPhoneNumber();
				assert(user_phone_number, 'Пользователь залогинен, а телефона нет. Как так?');
				// Показать список - куда человек записался или,
				// если после выбора времени в календаре при записи - панель подтверждения записи.
				callback(user_phone_number);
			} else {
				// Панель: введите телефон, пароль.
				// Передаём в callback то, что должно быть вызвано после всего, когда пользователь залогиниться.
				// Это просмотр пользовательских планов/записей или же подтверждение на запись на услугу.
				user_login_panel_show(parent_panel, callback);
			}
        };
        
		// Логинимся для пользовательского (не админского) кабинета, в котором можем смотреть свои планы.
		user_cabinet = function() {
			// Передаём в callback то, что должно быть вызвано после всего, когда пользователь залогиниться.
			// В данном случае это просмотр пользовательских планов/записей.
			user_login_or_register_sequence(null, user_plans_panel);
		};


        /**
         * Вызываем после выбора своего города/населённого пункта.
         */
        on_city_selected = function(city_id, city_name) {
			assert(window.helper.is('Number', city_id), 'Wrong city_id argument: on_city_selected(' + city_id + ', ' + city_name + ')');
			assert(window.helper.is('String', city_name), 'Wrong city_name argument: on_city_selected(' + city_id + ', ' + city_name + ')');
			engine.showToolTip('Выбран город: ' + city_name, g_locale.message.icons.info);
			current_city.set_id(city_id);
			updateLeftPanelData();
			// OUT
			signup_event();
        };
		/**
		 * Меню выбора региона.
		 */
		select_region = function() {
			//Выводим подсказку.
			engine.showToolTip(g_locale.region.tooltip, g_locale.message.icons.info);
			//Выводим малую панель.
			// Текущий регион / Другой
			// Выберете город
			createPanel(g_locale.region.header, function(block) {
				// Текущий регион
				//Определяем город.
				get_city_by_geolocation(function(city, error) {
					var block_content = {
						header: 'Предположительно ваш город:',
						text: (error ? 'не определён' : city.name)
					};
					block.addBlock(block_content, function(currentCityBtn) {
						on_city_selected(city.id, city.name);
					});
				});
				// Другой регион
				var block_content = {
					header: 'Другой'
				};
				block.addBlock(block_content, function(customCityBtn) {
					// Регион
					createPanel(g_locale.region.header, function(region) {
						var on_select_region_button_pressed = function(region, button) {
                            // Получаем id выбраного региона.
                            var regionId = get_selected_button_name(button);
                            // Создаём панель для выбора города.
                            createPanel("Город", function(block) {
                                //Функция обрабатывает полученные о
                                // городах данные и формирует на их
                                // основе меню.
                                get_cities_from_base(function(cities) {
                                    var on_select_city_button_pressed = function(city, button) {
                                        var cityNameId = /(.+)#(.+)/.exec(get_selected_button_name(button));
                                        var cityName = cityNameId[1], cityId = parseInt(cityNameId[2]);
                                        //.getParent().getElement(".block_select_mem").getParent().get("name");
                                        //var cityName =
                                        // button.getParent().getElement(".block_select_mem").getParent().get("header");
										on_city_selected(cityId, cityName);
                                    };
                                    for(var i = 0; i < cities.length; ++i) {
                                        if(regionId == cities[i].region_id) {
                                            var block_content = {
                                                name : cities[i].name + '#' + cities[i].id,
                                                header : cities[i].name,
                                                text : g_locale.region.custom.city.timezone + cities[i].timezone
                                            };
                                            block.addBlock(block_content, on_select_city_button_pressed);
                                        }
                                    }
                                });
                            }, region);
                        };

						//Функция обрабатывает полученные о регионах данные и формирует на их основе меню.
						get_regions_from_base(function(regions) {
							for (var i = 0; i < regions.length; ++i) {
								var block_content = {
									name: regions[i].id,
									header: regions[i].name
								};
								/*var choose_city = (function(id,func) {var obj = {id: id, call: function()};})(i,func);*/
								
								// Выбран регион -> Выбор города
								region.addBlock(block_content, on_select_region_button_pressed);
							}
						});
					}, customCityBtn);
				});
			});
		};
		
		/**
         * Меню "Начать запись".
         *		Мед. учреждения
         *		>	Медкомиссии
         *		>	Специалисты
         *		>	Больницы
         *		Парикмахерские
         */
        signup_event = function() {
            // Берём из куки сохранённый регион.
            // Если в куки его не было.
            if(!current_city.get_id()) {
                // Просим выбрать месторасположение.
                select_region();
                return;
            }
            signupView.start_signup(current_city.get_id(), set_skin, user_login_or_register_sequence);
        };
		
			
			
	// При логине пользователя/админа.
	// Обновляем информацию в левой пользовательской панели.
	on_user_login = function(admin) {
		assert(admin, 'data is invalid! on_user_login(' + admin + ')');

		var user_name;
		if(admin.name) {
			user_name = admin.name;
		} else if(admin.phone_number) {
			user_name = get_standard_phone_number(admin.phone_number);
		} else  {
			throw 'invalid admin data!';
		}
		updateLeftPanelData(user_name);
	};

		
	// Берём из куки сохранённый регион.
	// Если в куки его не было.
	if(!current_city.get_id()) {
		var isDefined = false;
		var define_geo = function() {
			engine.showToolTipYesNo('Ваше месторасположение не определено. Выбрать вручную?', g_locale.message.icons.confirm, function(result) {
				engine.hideToolTip();
				if(result) {
					select_region();
				} else {
					engine.showToolTip('Некоторые возможности сервиса не будут работать до выбора региона', g_locale.message.icons.warning);
				}
			});
		}
		get_city_by_geolocation(function(city, error) {
			var city_name = error ? 'не определён' : city.name;
			if(!error) {
				isDefined = !isDefined;
				engine.showToolTip('Предположительно ваш город: ' + city_name, g_locale.message.icons.info);
				current_city.set_id(city.id);
				updateLeftPanelData();
			} else
				define_geo();
		});
		setTimeout(function() {
			if(!isDefined)
				define_geo();
		}, 10000);
		// Просим выбрать месторасположение.
		/* engine.showToolTipYesNo('Месторасположение не определено. Выбрать вручную?', g_locale.message.icons.confirm, function(result) {
		 engine.hideToolTip();
		 if(result) {
		 select_region();
		 } else {
		 engine.showToolTip('Некоторые возможности сервиса не будут работать до выбора региона', g_locale.message.icons.warning);
		 }
		 });*/
	}

		
		/**
         * Главный экран.
         * Чистим и рисуем главную форму с рекламой.
         */
		refreshMainScreen = function() {
			// Если пользователь залогинен (вначале из кукис), то обновляем информацию на левой пользовательской панели.
			if(ScheduleModel.userManager.isLoggedIn()) {
				var phone_number = ScheduleModel.userManager.getLoggedUserPhoneNumber();
				// Обновляем информацию на левой панели.
				on_user_login({
					phone_number: phone_number
				});
			}

			// Краткая справка
			// TODO - no-slide-mode
			if(engine.options.sliding) {
				engine.options.sliding = false;
				setTimeout(function() {
					engine.options.sliding = true;
				}, 500);
			}
			var info_panel = createPanel(g_locale.homepage.header, function(info_panel) {
				// Надо: 1) посоветоваться с Максимом про слайдинг
				// 2) сгенерировать документацию.
				makeRequest('home-screen.static.html', function(html) {
					info_panel.addContentBlock({
						text: html
					});
				}, null, true);
				
			}, null, true);
		};

        // Обновляем главный экран, показываем домашнюю страницу.
        refreshMainScreen(true);
        // Чистим от выбранной больницы из прошлой сессии.
        facility.clear_id();
        // Обновляем данные левой-нижней панели (услуги, регион).
        updateLeftPanelData();
		
        var help_panel_invoke = null, showHelpDescription = null, showHelpOrder = null, showHelpCalendar = null, showHelpPartners = null;
        
    
		help_panel_invoke = function() {			
			// Справка
			createPanel(g_locale.help.header, function(help_panel) {
				// Описание
				// Как работать с системой
				help_panel.addBlock({
					icons: [g_locale.help.description.icon],
					header : g_locale.help.description.header,
					text : g_locale.help.description.text
				}, showHelpDescription);
				
				// Заказ
				// Как заказать услуги
				help_panel.addBlock({
					icons: [g_locale.help.order.icon],
					header : g_locale.help.order.header,
					text : g_locale.help.order.text
				}, showHelpOrder);
				
				// Календарь
				// Как планировать услуги
				help_panel.addBlock({
					icons: [g_locale.help.calendar.icon],
					header : g_locale.help.calendar.header,
					text : g_locale.help.calendar.text
				}, showHelpCalendar);
				
				// Партнёрам
				// Как стать нашим партнёром
				help_panel.addBlock({
					icons: [g_locale.help.partners.icon],
					header : g_locale.help.partners.header,
					text : g_locale.help.partners.text
				}, showHelpPartners);


			});
		};

		/**
         * Проходит по всем типам сервисов из service_types.json совпадающих по
         * типу с type
         * и создаёт на панели panel кнопки, связанные с этим типом.
         * При нажатии на каждую эту кнопку вызывается событие
         * button_pressed_function.
         */
        function create_service_type_buttons(panel, type, button_pressed_function) {
            get_service_types_from_base(function(service_types) {
                for(var i = 0; i < service_types.length; ++i) {
                    if(service_types[i].type === type) {
                        var block_content = {
                            name : service_types[i].id,
                            icons: (service_types[i].icon ? [service_types[i].icon] : null),
                            header : service_types[i].name,
                            text : service_types[i].description
                        };
                        panel.addBlock(block_content, button_pressed_function);
                    }
                }
            }, facility.get_id());
        }
		
		/**
         * Проходит по всем типам типов сервисов из service_types.json и
         * подсчитываем их кол-во для данной больницы (facility.get_id()).
         * Например в какой-то больнице пять хирургов, но больше никого нет,
         * тогда возвращаем { specialist: 5 }.
         * Возвращаем через result_callback в следующем виде: { specialist: 7,
         * medcom: 8, ...}
         */
        function count_service_types_types(result_callback) {
            var result = {};
            get_service_types_from_base(function(service_types) {
                for(var i = 0; i < service_types.length; ++i) {
                    var type = service_types[i].type;
                    if(result[type]) {
                        result[type]++;
                    } else {
                        result[type] = 1;
                    }
                }
                result_callback(result);
            }, facility.get_id());
        }

	//-----------------------------------------------------------------------------------+
	
		showHelpDescription = function(help) {
			
			// Описание системы "Название системы"
			createPanel(g_locale.help.description.info.header, function(description_panel) {
				// TODO: Text lorem ipsum dolor sit amet, consectetur adipisicing elit......
				description_panel.addContentBlock({
					text : g_locale.help.description.info.text
				});
				$('show-soft-rain').addEvent('click', function() {
					$('soft-rain-blockquote').setStyle('display', 'block');
				});
			}, help, true);
		};
		showHelpOrder = function(help) {
			
			// Как осуществить заказ
			createPanel(g_locale.help.order.info.header, function(description_panel) {
				// TODO: Text lorem ipsum dolor sit amet, consectetur adipisicing elit......
				description_panel.addContentBlock({
					text : g_locale.help.order.info.text
				});
			}, help, true);
		};
		showHelpCalendar = function(help) {
			
			// Как планировать услуги
			createPanel(g_locale.help.calendar.info.header, function(description_panel) {
				// TODO: Text lorem ipsum dolor sit amet, consectetur adipisicing elit......
				description_panel.addContentBlock({
					text : g_locale.help.calendar.info.text
				});
			}, help, true);
		};
		showHelpPartners = function(help) {
			
			// Как стать нашим партнёром
			createPanel(g_locale.help.partners.info.header, function(description_panel) {
				// Мы рады знакомству с вами и возможному партнёрству....
				description_panel.addContentBlock({
					text : g_locale.help.partners.info.text
				});
			}, help, true);
		};
	
		addNewSec = function(currentSec, newSec, content_type, footbar){
			var content_type = typeof(content_type) != 'undefined' ? content_type : helper.secT.oneEyed;
	
			//Take care for hell bar
			var footbar  = typeof(footbar) != 'undefined' ? footbar : {};
			var isFootbar  = typeof(footbar.isFootbar) != 'undefined' ? footbar.isFootbar : false;
			var isFootbarLine  = typeof(footbar.isLine) != 'undefined' ? footbar.isLine : true;
	
			var secHeight = content_type==helper.secT.oneEyed?content.calcOneEyedHeight():content.calcMonsterHeight(); 
			var nextLength = currentSec.getAllNext('.section').length;
			//alert(currentSec.get('html'));	
			engine.updateContent(content_type, nextLength);
			content.removeScrolls(nextLength);
			//Добавить блок
			newSec.injectAfter(currentSec); 
			content.makeScroll(newSec,content_type,{isFootbar:isFootbar, isLine:isFootbarLine});
			
			//Обработать добавленный блок
			engine.nextSection(newSec);	
		};
		
		/*window.addEvent('resize', function(){
			content.init();
		});*/
		
		
	
		// Test mootools FX. 
		if($) {
			var scissors = $("scissors_decorator");
			if(scissors && scissors.set && scissors.addEvent && scissors.morph) {
				scissors.addEvent('click', function() {
					/*var scissorsFx = new Fx.Morph(scissors);
					scissorsFx.start({
						'left': [(left ? left : 0), 1400]
					});*/
					scissors.set('morph', {
						duration : 1000,
						transition : Fx.Transitions.Bounce.easeOut,
						link : 'chain'
					});

					scissors.morph({
						'left': [0, 2000]
					}).morph({
						'left': [-150, 0]
					});
				});
			}
		}
		
        // Начать запись.
        $('signup').addEvent('click', signup_event);
		// Вход в кабинет пользователя (просмотр планов).
		$('user_cabinet').addEvent('click', user_cabinet);
		$('user_plans').addEvent('click', user_cabinet);
		// Управление.
		$('administration').addEvent('click', administration_menu_invoke);
        // При нажатии на логотип обновляем экран (домашняя страница).
        $('logo').addEvent('click', refreshMainScreen);
        // Выбрать регион.
        $('region').addEvent('click', select_region);
		// Информация для партнёров.
		$('partners').addEvent('click', partners_menu_invoke);
		/*****Вешаем обработчик на Help******/
		$('help').addEvent('click', help_panel_invoke);
		
		// Если мы выбираем какой-то пункт в сайдбаре
		// - мы очищаем текущий стиль хидера с его иконкой.
		var sidebar_buttons = [$('signup'), $('user_cabinet'),
		 $('user_plans'), $('administration'),
		 $('logo'), $('region'),
		 $('partners'),
		 $('help')];
		sidebar_buttons.forEach(function(button) {
		 	// При выборе элемента сайдбара меняем скин на никакой.
		 	button.addEvent('click', set_skin.bind(this, 'default'));
		 	// При нажатии выделяем текущий элемент, а остальные гасим.
		 	button.addEvent('click', function(button) {
				sidebar_buttons.forEach(function(button) {
					button.removeClass('selected');
				});
		 		button.addClass('selected');
		 	}.bind(this, button));
		 });
	});
	
	load_fonts();
	
	$('resource-loading-bar-big').dispose();
}) ();

console.log('index.view.js executed');