/*globals makeRequest: false, getAdministrationModel: false, createPanel: false, engine: false, createToolbarButton: false, g_locale: false, console: false, ResourceScheduler: false, get_service_types_from_base: false, getCookie: false, assert: false, window: false, makeInputUserFriendly: false, isNumber: false, shorten: false, refreshMainScreen: false, ButtonBigEl: false, $$: false, doNothing: false */
/*
 * @author Ivajkin Timofej <ivajkin@tncor.com>
 * at Technovation (ООО "ТН")
 * http://tncor.com
 */

console.log('administration.view.js');

/**
 * Политика конфиденциальности.
 */
var show_confidence_policy = function(parent_panel) {
	// Политика конфиденциальности
	createPanel('Политика конфиденциальности', function(contract_panel) {
		makeRequest('confidence-policy.static.html', function(html) {
			contract_panel.addContentBlock({
				text : html
			});
		});
	}, parent_panel, true);
};

/*
 * Тарифы на услуги, оказываемые ООО «ТН» в рамках сервиса «Я по записи».
 * Приложение к пользовательскому соглашению
 */
var show_tariff = function(parent_panel) {
	// Политика конфиденциальности
	createPanel('Тарифы на услуги', function(contract_panel) {
		makeRequest('tariff-info.static.html', function(html) {
			contract_panel.addContentBlock({
				text : html
			});
		});
	}, parent_panel, true);
};

/*
 * Administration panels.
 */
var administrationView = function() {
	
	// Модель представления.
	var Model = getAdministrationModel();

	// Переключатели вкл/выкл для типов услуг.
	var service_type_selectors_interval = [];
	// Панель настройки интервала в расписании работника.
	var interval_setup_panel = null;
	// Объект расписания.
	var scheduler = null;
	// Выезжает панель в которой
	function on_setup_selection(/** Object */ interval) {
		/** interval: {
		 *		date: "9.7.2011",
		 *		service_type_ids: [1,2,3,4...],
		 *		start: "10:00",
		 *		finish: "13:02",
		 *		clone_weeks_forward: function(week_count) {...}
		 * }
		 */
		// Удаляем кнопку "Сохранить" и "Удалить" если уже существует.
		interval_setup_panel.removeToolbarIcon(window.helper.where.left, 0);
		interval_setup_panel.removeToolbarIcon(window.helper.where.right, 0);
		// Чистим панель.
		interval_setup_panel.clear();
		interval_setup_panel.addContentBlock({
			text : 'Выберите услуги, оказываемые сотрудником в этот интервал времени. Чтобы удалить настоящий интервал, нажмите на значок корзины в верхней панели инструментов. Удаление не может быть произведено, если в этом интервале записаны клиенты.'
		});
		
		interval_setup_panel.addContentBlock({
			header: 'Время:',
			text: interval.date + ', ' + get_readable_time(interval.start) + '-' + get_readable_time(interval.finish)
		});

		// TODO: нормально типы услуг выбирать для работника.
		get_service_types_from_base(function(service_types) {
			// Создаём свитчеры для всех типов услуг, которые может оказывать данный работник.
			service_type_selectors_interval = [];
			service_types.forEach(function(service_type) {
				// Создаём свитчеры только для тех типов услуг, которые выбраны у работника в его service_type_ids.
				if(Model.getResource().service_type_ids.contains(service_type.id)) {
					// Название типа услуги (например "Терапевт" или "Санкнижка" или "Педикюр").
					// TODO на далёкое будущее: если несколько услуг одинаково называються, но имеют разное описание.
					interval_setup_panel.addContentBlock({
						header : service_type.name,
						line : false
					});
					// проход по всем service_type_ids и true/false по contains.
					var input = interval_setup_panel.createCheckbox({
						value : interval.service_type_ids.contains(service_type.id),
						name : service_type.id
					});
					// Сохраняем свитчер в массив, чтобы потом достать из него данные.
					service_type_selectors_interval.push(input);
				}
			});
		});
		
		interval_setup_panel.addContentBlock({
			text : 'Скопировать интервал на следующий месяц'
		});
		// Кнопка "Размножить"
		// Размножить
		// Скопировать интервал на следующую неделю
		var enter_button = new ButtonBigEl({
			text : 'Продублировать',
			title : 'Скопировать интервал на следующий месяц',
			panel : interval_setup_panel,
			onclick : function() {
				interval.clone_weeks_forward(3);
				save();
			}
		});


		var save = function() {
			// Сохраняем
			var service_type_ids = [];
			service_type_selectors_interval.forEach(function(service_type_selector) {
				// Если текущий свитчер выбран (Включен).
				if(service_type_selector.checked) {
					// Добавляем вид деятельности (его id) в текущий набор для интервала.
					service_type_ids.push(parseInt(service_type_selector.name, 10));
				}
			});
			// Нельзя сохранить пустой список, в этом интервале работник что-то должен делать (ограничение целостности).
			if(service_type_ids.length) {
				// Сохраняем новые значения типов услуг, оказывает или нет в определённом интервале.
				scheduler.set_selected_interval_service_type_ids(service_type_ids);
				// Берём текущие данные и посылаем для сохранения на сервер.
				scheduler.getState(function(user_service_data_state) {
					// Сохраняем изменения в расписании через модель на сервер в базу данных.
					Model.setUserServiceData(user_service_data_state);
				});
				// Успешно сохранено
				engine.showToolTip(g_locale.saved_successfully, g_locale.message.icons.info);
			} else {
				// Нужно выбрать как минимум один вид деятельности!
				engine.showToolTip(g_locale.select_one_cannot_save, g_locale.message.icons.error);
			}

		};

		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : save,
			style_class : 'ok_small_toolbar_icon',
			panel : interval_setup_panel
		});
		// Удалить
		createToolbarButton({
			text : 'Удалить',
			callback : function() {
				interval.dispose();
				save();
			},
			style_class : 'remove_toolbar_icon',
			panel : interval_setup_panel,
			position: window.helper.where.left
		});
	}

	/*
	 * Создаём календарь, для редактирования расписания сотрудника.
	 */
	function create_admin_resource_schedule(resource, parent_panel) {
		// Создаём саму панель для расписания.
		var schedule_panel = createPanel('Расписание работы', function(schedule_panel) {
			// Находимся ли мы в режиме редактирования календаря.
			var is_scheduler_in_edit_mode = false;
			// Создаём календарь на неделю с выбранного понедельника.
			function create_calendar(/** Date */ date) {
				schedule_panel.clear();
				schedule_panel.addContentBlock({
					name : "canvas_container",
					text : '<div id="calendar_canvas"></div>'
				});
				var schedule_panel_info_block = schedule_panel.addContentBlock({
					text : '<div id="info_block"> </div>'
				});
				scheduler = new ResourceScheduler(resource, on_setup_selection, date, create_calendar);
				if(is_scheduler_in_edit_mode) {
					scheduler.startEdit( doNothing );
				}
			}

			var thisWeekMonday = new Date();
			thisWeekMonday.setDate(thisWeekMonday.getDate() - thisWeekMonday.getDay() + 1);
			create_calendar(thisWeekMonday);
						
			// Изменить
			createToolbarButton({
				text : 'Изменить',
				callback : function(icon) {
					createPanel('Настройки', function(setup_panel) {
						// Убираем кнопку "Изменить" на панели расписания.
						schedule_panel.removeToolbarIcon(window.helper.where.right, 0);
		
						// Изменяем внешний объект.
						interval_setup_panel = setup_panel;
		
						// Убираем кнопку back на панели настройки.
						interval_setup_panel.removeToolbarIcon(window.helper.where.left, 0);
		
						// Добавляем её на панель расписания.
						// NOT 100%!
						setTimeout(function() {
							schedule_panel.showBack();
							$$('.bar_icon').show();
						}, 1600);
						interval_setup_panel.addContentBlock({
							text : 'Выберите интервал или создайте новый'
						});
						if(!is_scheduler_in_edit_mode) {
							is_scheduler_in_edit_mode = true;
							icon.hide();
							scheduler.startEdit(function() {
							});
						}
					}, schedule_panel);
				},
				style_class : 'edit_toolbar_icon',
				panel : schedule_panel
			});
			// Печать
			// TODO
			/*createToolbarButton({
			 text : 'Печать',
			 callback : function() {
			 console.log('TODO!');
			 },
			 style_class : 'print_toolbar_icon',
			 panel : schedule_panel
			 });*/


		}, parent_panel, true);
	}

	// Объект скрывающий взаимодействие с куки для данных админа.
	var adminCookies = {
		login: null,
		password: null,
		// Изменить логин.
		setLogin : function(login) {
			assert(window.helper.is('String', login), 'login is not a string in adminCookies.setLogin(' + login + ')');
			this.login = login;
		},
		// Выдать логин.
		getLogin : function() {
			return this.login;
		},
		// Почистить логин.
		clearLogin : function() {
			this.login = null;
		},
		
		// Изменить пароль.
		setPassword : function(password) {
			assert(window.helper.is('String', password), 'login is not a string in adminCookies.setPassword(' + password + ')');
			this.password = password;
		},
		// Выдать пароль.
		getPassword : function() {
			return this.password;
		},
		// Почистить пароль.
		clearPassword : function() {
			this.password = null;
		}
	};

	/*
	 * Extracts login and password data from the panel, checks it creates panels if correct.
	 */
	function loginAdmin(parent_panel, _login, password) {
		/*var _login = parent_panel.login.value, password = parent_panel.password.value;*/
		check_login(_login, password, function(admin) {
			if(admin) {
				on_user_login(admin);
				// Созраняем login/password в кукис.
				adminCookies.setLogin(_login);
				adminCookies.setPassword(password);
				facility_administration(admin.facility_id);
			} else {
				engine.showToolTip(g_locale.administration.login.wrong_password, g_locale.message.icons.error);
			}
		});
	}

	/**
	 * Выйти (logout) из админской панели, почистить куки и вернуться на "homepage".
	 */
	function logoutAdmin() {
		// Чистим кукис.
		adminCookies.clearLogin();
		adminCookies.clearPassword();
		// Вызываем "homepage/homescreen"
		refreshMainScreen();
	}

	/**
	 * Выбор услуг, которые оказывает работник - ТОЛЬКО (!) подмножество типов услуг организации.
	 */
	function employee_service_type_select(parent_panel) {

		// Переключатели вкл/выкл для типов услуг.
		var service_type_selectors = [];
		// Услуги
		var employee_panel = createPanel(g_locale.administration.employee.services.panel.header, function(employee_panel) {
			// Каждый работник обязан выполнять определённую работу. Некоторые специалисты могут изменять вид деятельности в течение дня, а иногда способны оказывать разные услуги в одно и то же время.
			// Выберете виды деятельности в которых участвуют работники организации.
			employee_panel.addContentBlock({
				text : g_locale.administration.employee.services.panel.text
			});
			// TODO: нормально типы услуг выбирать для работника.
			get_service_types_from_base(function(service_types) {
				service_types.forEach(function(service_type) {
					if(Model.getFacility().service_type_ids.contains(service_type.id)) {
						employee_panel.addContentBlock({
							header : service_type.name,
							text: service_type.description,
							line : false
						});
						// проход по всем service_type_ids и true/false по contains.
						var input = employee_panel.createCheckbox({
							value : Model.getResource().service_type_ids.contains(service_type.id),
							name : service_type.id
						});
						service_type_selectors.push(input);
					}
				});
			});
		}, parent_panel, true);
		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : function() {
				var service_type_ids = [];
				service_type_selectors.forEach(function(service_type_selector) {
					if(service_type_selector.checked) {
						assert(isNumber(service_type_selector.name), 'Индекс не является числом! ' + service_type_selector.name);
						service_type_ids.push(service_type_selector.name);
					}
				});
				if(service_type_ids.length === 0) {
					// Нужно выбрать как минимум один вид деятельности!
					engine.showToolTip(g_locale.select_one_cannot_save, g_locale.message.icons.error);
				} else {
					Model.setResourceServiceTypes(service_type_ids);
					// Успешно сохранено
					engine.showToolTip(g_locale.saved_successfully, g_locale.message.icons.info);
				}
			},
			style_class : 'save_toolbar_icon',
			panel : employee_panel
		});
	}

	/**
	 * Панель выбранного работника (например "Петров А.С.").
	 */
	function one_employee_menu(previus_panel_update_and_this_invoke, parent_panel, employee_id) {
		var update = function(parent_panel, employee_id) {
			Model.setFacility(this.getFacility().id, function(parent_panel, employee_id) {
				one_employee_menu.bind(this, parent_panel, employee_id)();
			}.bind(this, parent_panel, employee_id));
		}.bind(this, parent_panel, employee_id);
		Model.setResource(employee_id, function() {
			// Текущий сотрудник (ресурс).
			var resource = Model.getResource();

			// Профиль
			var employee_panel = createPanel(g_locale.administration.employee.header, function(employee_panel) {

				// ?ФИО работника?
				employee_panel.addContentBlock({
					text : resource.name + "<br/>"
				});

				// Описание работника.
				employee_panel.addContentBlock({
					text : resource.description
				});

				// Услуги
				// Услуги оказываемые сотрудником, его обязанности
				employee_panel.addBlock({
					icons : [g_locale.administration.employee.services.icon],
					header : g_locale.administration.employee.services.header,
					text : g_locale.administration.employee.services.text
				}, employee_service_type_select);
				
				// Расписание
				// Время работы, отпуска, отметки о болезнях
				employee_panel.addBlock({
					icons : [g_locale.administration.employee.schedule.icon],
					header : g_locale.administration.employee.schedule.header,
					text : g_locale.administration.employee.schedule.text
				}, create_admin_resource_schedule.bind(this, resource));

			}, parent_panel);
			// Изменить.
			createToolbarButton({
				text : g_locale.administration.employee.edit_tip,
				callback : function() {
					//previus_panel_update_and_this_invoke();
					edit_employee_info_panel(employee_panel, previus_panel_update_and_this_invoke);
				},
				style_class : 'edit_toolbar_icon',
				panel : employee_panel
			});
			// Удалить сотрудника.
			createToolbarButton({
				text : g_locale.administration.employee.remove_tip,
				callback : function() {
					// Вы действительно хотите уничтожить данные о сотруднике?
					engine.showToolTipYesNo(g_locale.administration.employee.to_remove_message, g_locale.message.icons.confirm, function(result) {
						engine.hideToolTip();
						if(result) {
							Model.removeResource(resource.id, function() {
								previus_panel_update_and_this_invoke();
							}.bind(Model));
						}
					});
				},
				style_class : 'remove_toolbar_icon',
				panel : employee_panel
			});
		});
	}

	/**
	 * Изменение информации о сотруднике.
	 */
	function edit_employee_info_panel(parent_panel, callback) {
		var edit_panel = createPanel(g_locale.administration.employee.edit.header, function(edit_panel) {
			edit_panel.addContentBlock({
				header : g_locale.administration.employee.edit.text
			});
			// ФИО
			edit_panel.addContentBlock({
				header : g_locale.administration.employee.edit.name
			});
			edit_panel.name = edit_panel.createTextIO({
				value : Model.getResource().name
			});
			makeInputUserFriendly(edit_panel.name);

			// Информация
			edit_panel.addContentBlock({
				header : g_locale.administration.employee.edit.description
			});
			edit_panel.description = edit_panel.createTextIO({
				value : Model.getResource().description
			});
			makeInputUserFriendly(edit_panel.description);
		}, parent_panel, true);
		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : function() {
				// Сохраняем данные работника.
				// TODO
				var name = edit_panel.name.value, description = edit_panel.description.value;
				Model.setResourceData(name, description);
				// Успешно сохранено
				engine.showToolTip(g_locale.saved_successfully, g_locale.message.icons.info);
				
				callback();
			},
			style_class : 'save_toolbar_icon',
			panel : edit_panel
		});
	}

	/**
	 * Меню создания (регистрации) нового сотрудника.
	 */
	function create_employee_menu(parent_panel, refreshPrevious) {

		// Зарегистрировать нового сотрудника
		// Создание (регистрация) нового сотрудника
		var create_employee_panel = createPanel(g_locale.administration.employee.create.header, function(create_employee_panel) {

			// Обязательно заполните информацию о ваших работниках. Именно её увидят ваши клиенты когда будут записываться на приём.
			create_employee_panel.addContentBlock({
				text : g_locale.administration.employee.create.text
			});

			// ФИО
			create_employee_panel.name = create_employee_panel.createTextIO({
				name : 'name',
				header : g_locale.administration.employee.create.name,
				line : true
			});
			makeInputUserFriendly(create_employee_panel.name);

			// Информация
			create_employee_panel.description = create_employee_panel.createTextIO({
				name : 'description',
				header : g_locale.administration.employee.create.description,
				line : true
			});
			makeInputUserFriendly(create_employee_panel.description);

		}, parent_panel, true);
		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : function() {
				// Собираем данные об имени и описании сотрудника.
				var name = create_employee_panel.name.value, description = create_employee_panel.description.value;
				var failed = (name.length < 3);
				if(failed) {
					engine.showToolTip(g_locale.save_failed + ' Слишком короткое имя.', g_locale.message.icons.error);
				} else {
					// Всё получилось, сохраняем. :)
					Model.addNewResource(name, description, function() {
						engine.backSections(1);
						engine.showToolTip(g_locale.created_successfully, g_locale.message.icons.info);
						refreshPrevious();
					});
				}
			},
			style_class : 'save_toolbar_icon',
			panel : create_employee_panel
		});
	}

	/**
	 * Панель "Мои сотрудники".
	 */
	function all_employee_menu(parent_panel, _, callback) {
		// Мои сотрудники
		var employee_panel = createPanel('Мои сотрудники', function(employee_panel) {
			// TODO: из базы нормальных загружать по организации.
			var employee = Model.getEmployee();
			var employee_exists = !!(employee.length);
			if(employee_exists) {
				employee.forEach(function(e) {
					var employee_id = e.id;
					var previus_panel_update_and_this_invoke = function(employee_panel, employee_id) {
						all_employee_menu(parent_panel, function(employee_panel, _, employee_id) {
							one_employee_menu.bind(this, previus_panel_update_and_this_invoke, employee_panel, employee_id)();
						}.bind(this, employee_panel, employee_id));
					}.bind(this, employee_panel, employee_id);
					employee_panel.addBlock({
						icons : [g_locale.administration.employee.icon],
						name : e.id,
						header : e.name,
						text : (e.description ? shorten(e.description, 32) : e.description)
					}, one_employee_menu.bind(this, previus_panel_update_and_this_invoke, employee_panel, employee_id));
				});
			}
			if(callback) {
				callback(employee_panel);
			}
		}, parent_panel);
		// Добавить сотрудника
		createToolbarButton({
			text : g_locale.administration.employee.add_tip,
			callback : function() {
				create_employee_menu(employee_panel, all_employee_menu.bind(this, parent_panel, null, null));
			},
			style_class : 'add_toolbar_icon',
			panel : employee_panel
		});
	}

	/**
	 * Выбор тех услуг, которые оказывает организация.
	 */
	function select_services_for_facility(parent_panel) {
		// Переключатели вкл/выкл для типов услуг.
		var service_type_selectors = [];
		// Услуги
		var facility_services_panel = createPanel(g_locale.administration.facility.services.panel.header, function(facility_services_panel) {
			// Каждый работник обязан выполнять определённую работу. Некоторые специалисты могут изменять вид деятельности в течение дня, а иногда способны оказывать разные услуги в одно и то же время.
			// Выберете виды деятельности в которых участвуют работники организации.

			facility_services_panel.addContentBlock({
				text : g_locale.administration.facility.services.panel.text
			});
			// TODO: нормально типы услуг выбирать для типа организации.
			// TODO: добавить тип услуги "прочие"!
			get_service_types_from_base(function(service_types) {
				// TODO FILTER
				service_types.forEach(function(service_type) {
					/*facility_services_panel.addBlock({
					icons: [service_type.icon],
					header: service_type.name,
					text: service_type.description
					});*/
					// Выводим только возможные типы услуг - по типу текущего предприятия.
					if(service_type.facility_type == Model.getFacility().type) {
						facility_services_panel.addContentBlock({
							header : service_type.name,
							text: service_type.description,
							line : false
						});
						assert(Array.prototype.contains, 'Array.prototype.contains does not exist!');
						// проход по всем service_type_ids и true/false по contains.
						var service_type_ids = Model.getFacility().service_type_ids;
						var is_facility_provides_service = service_type_ids.contains(service_type.id);
						var input = facility_services_panel.createCheckbox({
							value : is_facility_provides_service,
							name : service_type.id
						});
						service_type_selectors.push(input);
					}
				});
			});
		}, parent_panel, true);
		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : function() {
				engine.showToolTipYesNo('Сохранить изменения?', g_locale.message.icons.confirm, function(result) {
					engine.hideToolTip();
					if(result) {
						var service_type_ids = [];
						service_type_selectors.forEach(function(service_type_selector) {
							if(service_type_selector.checked) {
								assert(isNumber(service_type_selector.name), 'Индекс не является числом! ' + service_type_selector.name);
								service_type_ids.push(service_type_selector.name);
							}
						});
						Model.setFacilityServiceTypes(service_type_ids);
						// Успешно сохранено
						engine.showToolTip(g_locale.saved_successfully, g_locale.message.icons.info);
					}
				});
			},
			style_class : 'save_toolbar_icon',
			panel : facility_services_panel
		});
	}

	/**
	 * Подробная информация об организации.
	 */
	function show_important_information_on_facility(parent_panel) {
		// TODO: отображение настоящей информации.
		// Подробная информация об организации
		createPanel(g_locale.administration.facility.information.panel.header, function(info_panel) {
			info_panel.addContentBlock({
				header : g_locale.administration.facility.information.panel.text
			});
			
			info_panel.addContentBlock({
				header : 'К вам записались:'
			});
			
			get_collection_from_base('user_requests', function(user_requests) {
				get_collection_from_base('service_types', function(service_types, service_types_by_id) {
					user_requests.forEach(function(user_request) {
						if(parseInt(user_request._cached_facility_id, 10) === parseInt(Model.getFacility().id, 10)) {
							
							var service_type_name = service_types_by_id[user_request._cached_service_type_id].name;
							/*info_panel.addContentBlock({
								text: [
									{"ФИО", user_request.name},
									{"Телефон", user_request.phone_number},
									{"Email", user_request.email},
									{"Разрешил звонить", user_request.use_phone_to_notify},
									{"Номер регистрации", user_request.registration_id},
									{"Дата", user_request.human_readable_date},
									{"Время", user_request.human_readable_time},
									{"К кому записан", user_request._cached_resource_name},
									{"Когда записывался", user_request._date_time_registered},
									{"Услуга", service_type_name}
								].map(function(element) {
									element
								});
							});*/
							info_panel.addContentBlock({
								text:	'<table id="user-request-info-table">' +
											'\n\t<tr>' +
													["Телефон", "Номер регистрации",
													"Дата", "Время", "К кому записан", "Когда записывался", "Услуга"].map(function(element) {
														return ('\n\t\t<th>\n\t\t' + '<div class="header">' + element + '</div>' + '\n\t\t</th>');
													}).join('') +
											'\n\t</tr>' +
											'\n\t<tr>' +
													[user_request.phone_number, user_request.registration_id,
													user_request.human_readable_date, user_request.human_readable_time,
													user_request._cached_resource_name, user_request._date_time_registered,
													service_type_name].map(function(element) {
														return ('\n\t\t<td>\n\t\t' + element + '\n\t\t</td>');
													}).join('') +
											'\n\t</tr>' +
										'</table>'
							});
							//	Not shown:
							//		"resource_id": Number,
							//		"work_start_time_minutes": Number,
							//		"_cached_facility_id": Number,
							//		"prolog_name": String
						}
					});
				});
			});
		}, parent_panel, true);
	}
	
	/**
	 * Панель с пользовательским соглашением А (организациям).
	 */
	function show_admin_contract(parent_panel) {
		// Пользовательское соглашение «А»
		createPanel(g_locale.administration.facility.contract.panel.header, function(contract_panel) {
			makeRequest('admin-contract.static.html', function(html) {
				contract_panel.addContentBlock({
					text: html
				});
				$$('.confidence-policy-link').addEvent('click', function() {
					show_confidence_policy(contract_panel);
				});
				$$('.tariff-link').addEvent('click', function() {
					show_tariff(contract_panel);
				});
			});
		}, parent_panel, true);
	}

	/**
	 * Меню изменения информации о помещении/кабинете/офисе.
	 */
	function create_or_edit_location_menu(parent_panel, location) {
		// TODO: проверка уникальности названия!!
		// Создать помещение
		// Изменить помещение
		var location_panel = createPanel(( location ? 'Изменить помещение' : 'Создать помещение'), function(location_panel) {
			location_panel.name = location_panel.createTextIO({
				name : 'name',
				header : 'Название',
				line : true
			});
			makeInputUserFriendly(location_panel.name);
			if(location && location.name && location.name.length) {
				location_panel.name.value = location.name;
			}
		}, parent_panel);
		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : function() {
				assert(!location, 'Ещё нельзя изменять');
				// Добавляем в базу данных.
				Model.addNewLocation(location_panel.name.value, function(location_id) {
					// Успешно сохранено
					engine.showToolTip(g_locale.saved_successfully, g_locale.message.icons.info);
				});
			},
			style_class : 'save_toolbar_icon',
			panel : location_panel
		});
	}

	/**
	 * Изменить и добавить помещения/кабинеты/офисы.
	 */
	function facility_locations_menu(parent_panel) {
		// Помещения
		var locations_panel = createPanel(g_locale.administration.facility.locations.panel.header, function(locations_panel) {
			// Кабинеты:
			locations_panel.addContentBlock({
				header : g_locale.administration.facility.locations.panel.text
			});
			var locations = Model.getLocations();
			locations.forEach(function(location) {
				locations_panel.addBlock({
					text : location.name
				});
			});
		}, parent_panel);
		// Добавить помещение (офис, кабинет).
		createToolbarButton({
			text : g_locale.administration.facility.locations.panel.add_tip,
			callback : function() {
				create_or_edit_location_menu(locations_panel);
			},
			style_class : 'add_toolbar_icon',
			panel : locations_panel
		});
	}

	/**
	 * Редактировать информацию об организации (название, описание, сайт и т.д.).
	 */
	function facility_info_edit(parent_panel) {
		// Изменить данные: ?НАЗВАНИЕ ПРЕДПРИЯТИЯ?
		var edit_panel = createPanel(g_locale.administration.facility.edit.header + ' ' + Model.getFacility().name, function(edit_panel) {

			// На этой панели вы можете изменить данные вашей организации. Пользователи доверяют тем организациям, о которых больше знают. Если пользователи доверяют организации, они делают больше заказов. Обязательно заполните поля "описание" и "домашняя страница".
			edit_panel.addContentBlock({
				header : g_locale.administration.facility.edit.text
			});
			// TODO: Заплнить автоматически текущей информацией, отслеживать изменения и закрытие.
			// Название
			edit_panel.name = edit_panel.createTextIO({
				name : 'name',
				header : g_locale.administration.facility.edit.name_input,
				line : true
			});
			edit_panel.name.value = Model.getFacility().name;

			// Домашняя страница
			edit_panel.url = edit_panel.createTextIO({
				name : 'url',
				header : g_locale.administration.facility.edit.url_input,
				line : true
			});
			edit_panel.url.value = Model.getFacility().homepage_url;

			// Описание
			edit_panel.description = edit_panel.createTextIO({
				name : 'description',
				header : g_locale.administration.facility.edit.description_input,
				line : true
			});
			edit_panel.description.value = Model.getFacility().description;
		}, parent_panel, true);
		// Сохранить
		createToolbarButton({
			text : g_locale.save_tip,
			callback : function(facility_edit_info_panel) {
				var name = facility_edit_info_panel.name.value;
				var url = facility_edit_info_panel.url.value;
				var description = facility_edit_info_panel.description.value;
				// Проверяем валидность данных.
				var isDataValid = (name && name.length > 2 && url && description);
				if(isDataValid) {
					// Передаём изменённые данные.
					Model.setFacilityData(name, url, description);
					// Успешно сохранено
					engine.showToolTip(g_locale.saved_successfully, g_locale.message.icons.info);
				} else {
					// Извините, не удалось сохранить
					engine.showToolTip(g_locale.save_failed, g_locale.message.icons.error);

				}
			}.bind(this, edit_panel),
			style_class : 'save_toolbar_icon',
			panel : edit_panel
		});
	}

	/*
	 * Creates facility administration panel.
	 */
	function facility_administration(facility_id) {
		// Регистрируем выбор организации и подгружаем связанные данные.
		Model.setFacility(facility_id, function() {

			// Организация
			var facility_panel = createPanel(g_locale.administration.facility.header, function(facility_panel) {
				// ?НАЗВАНИЕ ПРЕДПРИЯТИЯ?
				// Всего сотрудников: ?
				// Оказываемых услуг: ?
				var facility_name = Model.getFacility().name;
				var facility_type_text = g_locale.facility_type_names[Model.getFacility().type];
				assert(facility_name && facility_type_text, 'Или с локализацией что-то не так или с выбранной организацией.');
				facility_panel.addContentBlock({
					header : facility_name,
					text : '<p>Тип организации: ' + facility_type_text + '</p>' + '<p>Всего сотрудников: ' + Model.getEmployeeCount() + '</p>' /*+
					 '<p>Оказываемых услуг: ?</p>'*/
				});

				// Услуги
				// Выбрать оказываемые организацией услуги и виды работ
				facility_panel.addBlock({
					icons : [g_locale.administration.facility.services.icon],
					header : g_locale.administration.facility.services.header,
					text : g_locale.administration.facility.services.text
				}, select_services_for_facility);

				// Помещения
				// Помещения, офисы, кабинеты - места где вы оказываете услуги
				facility_panel.addBlock({
					icons : [g_locale.administration.facility.locations.icon],
					header : g_locale.administration.facility.locations.header,
					text : g_locale.administration.facility.locations.text
				}, facility_locations_menu);

				// Сотрудники
				// Изменить информацию о сотрудниках
				facility_panel.addBlock({
					icons : [g_locale.administration.facility.workers.icon],
					header : g_locale.administration.facility.workers.header,
					text : g_locale.administration.facility.workers.text
				}, all_employee_menu);
				
				// Подробно
				// Показать подробную информацию о ситуации в организации
				facility_panel.addBlock({
					icons : [g_locale.administration.facility.information.icon],
					header : g_locale.administration.facility.information.header,
					text : g_locale.administration.facility.information.text
				}, show_important_information_on_facility);
				
				// Условия использования
				// Показать пользовательское соглашение
				facility_panel.addBlock({
					icons : [g_locale.administration.facility.contract.icon],
					header : g_locale.administration.facility.contract.header,
					text : g_locale.administration.facility.contract.text
				}, show_admin_contract);
			});
			// Изменить информацию об организации
			createToolbarButton({
				text : g_locale.administration.facility.edit.button_tip,
				callback : function() {
					facility_info_edit(facility_panel);
				},
				style_class : 'edit_toolbar_icon',
				panel : facility_panel
			});
			// Выйти (чтобы зайти под другим паролем)
			createToolbarButton({
				text : g_locale.administration.facility.logout.button_tip,
				callback : function() {
					logoutAdmin();
				},
				style_class : 'logout_toolbar_icon',
				panel : facility_panel
			});
		});
	}

	/**
	 *  Меню управления организацией.
	 */
	var administration_menu_invoke = function() {
		check_login(adminCookies.getLogin(), adminCookies.getPassword(), function(admin) {
			if(admin) {
				on_user_login(admin);
				facility_administration(admin.facility_id);
			} else {
				admin_login_panel(null, function(_login, password) {
					loginAdmin(null, _login, password);
				});
			}
		});
	};
	
	return administration_menu_invoke;
	/*
	 * Test if it is valid login/password pair for administrator and if it is creates administration panel.
	 */
	/*function if_it_is_admin_start_administration(_login, password, callback) {
		check_login(_login, password, function(admin) {
			var is_it_admin;
			if(admin) {
				on_user_login(admin);
				// Созраняем login/password в кукис.
				adminCookies.setLogin(_login);
				adminCookies.setPassword(password);
				facility_administration(admin.facility_id);
				
				is_it_admin = true;
				callback(is_it_admin);
			} else {
				is_it_admin = false;
				callback(is_it_admin);
			}
		});
	}
	return if_it_is_admin_start_administration;*/
};

console.log('administration.view.js executed');
