/*globals get_collection_from_base: false, createPanel: false, g_locale: false, assert: false, signupModel: false, helper: false, isNumber: false, is_panel: false, shorten: false, $: false, Scheduler: false, console: false */
"use strict";

var signupView = {
	user_login_or_register_sequence: null,
	start_signup: function(/** Number */ city_id, /** Function */ set_skin, /** Function */ user_login_or_register_sequence) {
		assert(isNumber(city_id), 'Wrong 1st argument start_signup() in signup.view.js');
		assert(helper.is('Function', set_skin), 'Wrong 2nd argument start_signup() in signup.view.js');
		assert(helper.is('Function', user_login_or_register_sequence), 'Wrong 3rd argument start_signup() in signup.view.js');
		
		signupModel.city_id = city_id;
		
		this.user_login_or_register_sequence = user_login_or_register_sequence;
		
		// Типы услуг
		createPanel(g_locale.signup.header, function(block) {
			
			// Добавляем кнопку для типа предприятия: medical|nails|haircut.
			var addFacilityTypeButton = function(facility_type) {
				assert(facility_type === 'medical' || facility_type === 'nails' || facility_type === 'haircut', 'Неверный аргумент facility_type во время addFacilityTypeButton(' + facility_type + ')');
				// Иконки, заголовки и описание из файла локализации.
				var loc_info = g_locale.signup[facility_type];
				var block_content = {
					icons : [loc_info.icon],
					header : loc_info.header,
					text : loc_info.text
				};
				// Добавляем блок.
				block.addBlock(block_content, function(facility_type, parent_panel) {
					// Заменяем скин для типа организации (пока меняется только логотип).
					set_skin(facility_type);
					// Чистим данные о выбранной организации.
					signupModel.facility_id = null;
					// Сохраняем данные о типе предприятия (больницы, парикмахерские, ногтевой бизнес).
					signupModel.facility_type = facility_type;
					// Создаём панель для дальнейшего выбора услуги и записи на неё.
					this.on_facility_type_selected(parent_panel);
				}.bind(this, facility_type));
			}.bind(this);
			
			// Мед. учреждения
			// Медицинские услуги
			addFacilityTypeButton('medical');

			// Парикмахерские
			// Стрижки, уход за волосами
			addFacilityTypeButton('haircut');

			// Ногтевые сервисы
			// Уход за ногтями, моделирование, наращивание и украшение
			addFacilityTypeButton('nails');
		}.bind(this));
	},
		/**
         * Создаёт панель для выбора возможностей мед.|ногтев.|парикм. учреждений.
         * Мед. учреждения
         *  >	Медкомиссии
         *  >	Специалисты
         *  >	Больницы
         * @param {Object} parent_panel
         * @param {String} facility_type - medical|nails|haircut
         */
        on_facility_type_selected: function(parent_panel) {
			// Получаем данные о типе предприятия (больницы, парикмахерские, ногтевой бизнес).
			var facility_type = signupModel.facility_type;
			assert(facility_type, 'facility_type ещё не выбран, нельзя показывать меню записи.');

			// Учреждение ещё НЕ выбрано до открытия этой панели.
			// Чистим если старые данные о выборе.
			signupModel.facility_id = null;
			signupModel.service_type_id = null;
			signupModel.resource_id = null;
			signupModel.user_service_id = null;
			
		    // Медкомиссии, Специалисты, Больницы
		    // Выводим название типа услуг (например "Медицинские услуги").
		    createPanel(g_locale.signup[facility_type].header, function(block) {
				var block_content = null;
				// TODO: убрать частный случай для парикмахерских.
				if(facility_type === 'haircut') {
					block.addContentBlock({
						text : '<p id="haircut-dont-work-message" class="info-block-centered">Раздел находится в стадии разработки. Если Вы хотите опубликовать свою организацию здесь подайте заявку в разделе <strong>Организациям</strong>.</p>'
					});
				} else {
					// Получаем все предприятия из базы.
					get_collection_from_base('facilities', function(facilities, facilities_by_id) {
						// Определяем, существуют ли в этом городе предприятия оказывающие услуги в данной сфере.
						var facility_that_suit_exists = false;
						for(var i = 0; i < facilities.length; ++i) {
							if((facilities[i].type === facility_type) && (parseInt(facilities[i].city_id, 10) === parseInt(signupModel.city_id, 10))) {
								facility_that_suit_exists = true;
								break;
							}
						}
						// Если есть предприятия - продолжаем нормальным путём.
						if(facility_that_suit_exists) {
							// Берём данные о локализации и составе меню.
							var locale_info = g_locale.signup[facility_type];
							// Ещё не выбрана организация.
								// Организации.
								block_content = {
									icons: [g_locale.places_icon],
									header : 'Организации',
									text : 'Выбор конкретной организации'
								};
								block.addBlock(block_content, function(parent_panel) {
									// Чистим если старые данные о выборе.
									signupModel.facility_id = null;
									signupModel.service_type_id = null;
									signupModel.resource_id = null;
									signupModel.user_service_id = null;
									
									var firstTime = false;
									this.select_facility_menu_invoke(parent_panel, function(parent) {
										this.facility_menu_show(parent);
									}.bind(this));
								}.bind(this));
								
							// Выбираем только те, которые возможны.
							var createServiceTypeButtons = function(panel, service_type_ids) {

								var _createServiceTypeButtons = function(panel, service_type_ids) {
									// Получаем из базы типы услуг.
									get_collection_from_base('service_types', function(panel, service_type_ids, service_types, service_types_by_id) {
										for(var i = 0; i < service_type_ids.length; ++i) {
											var service_type_id = service_type_ids[i];
											var service_type = service_types_by_id[service_type_id];
											panel.addBlock({
												icons: [service_type.icon],
												header : service_type.name,
												text : service_type.description
											}, 
											// bind приходиться использовать.
											function(service_type_id, parent_panel) {
												// Событие происходит при выборе услуги (нажали например Терапевт).
												var is_facility_selected = false;
												this.on_service_type_selected(is_facility_selected, service_type_id, parent_panel);
											}.bind(this, service_type_id));
										}
									}.bind(this, panel, service_type_ids));
								}.bind(this);
								// Берём выбранную в данный момент организацию.
								var facility_id = parseInt(signupModel.facility_id, 10);
								// Если существует, верный id.
								if(isNumber(facility_id)) {
									// Фильтруем service_type_ids по service_type_ids организации.
									// (фильтруем по услугам, которые она предоставляет).

									// Получаем все услуги из базы.
									get_collection_from_base('user_services', function(service_type_ids, _createServiceTypeButtons, facility_id, user_services, user_services_by_id) {
										var facility_service_type_ids = [];
										for(var i = 0; i < user_services.length; ++i) {
											var current_facility_id = parseInt(user_services[i].facility_id, 10);
											// Если это услуга выбранного предприятия.
											if(facility_id === current_facility_id) {
												// То записываем.
												user_services[i].available_time.forEach(function(interval) {
														facility_service_type_ids = facility_service_type_ids.concat(interval.service_type_ids);
												});
											}
										}
										// Получаем пересечение множеств (массивы с уникальными элементами).
										var possible_service_type_ids = service_type_ids.intersect(facility_service_type_ids);
										// Создаём кнопки для тех услуг, которые предприятие может оказать.
										_createServiceTypeButtons(panel, possible_service_type_ids);
									}.bind(this, service_type_ids, _createServiceTypeButtons, facility_id));
								} else {
									// Иначе проходим обычным способом.
									_createServiceTypeButtons(panel, service_type_ids);
								}
							}.bind(this);
							// Создаём подменю.
							var createSubmenu = function(panel, submenu) {
								// Проходимся по элементам подменю.
								for(var i = 0; i < submenu.length; ++i) {
									// Побавляем элемент подменю.
									block.addBlock({
										header : submenu[i].header,
										text : submenu[i].text,
										icons: [submenu[i].icon]
									}, function(submenu_element, parent_panel) {
										createPanel(submenu_element.header, function(panel) {

											if(submenu_element.submenu) {
												createSubmenu(panel, submenu_element.submenu);
											}
											if(submenu_element.service_type_ids) {
												createServiceTypeButtons(panel, submenu_element.service_type_ids);
											}
										}, parent_panel);
									}.bind(this, submenu[i]));
								}
							};
							if(locale_info.submenu) {
								createSubmenu(block, locale_info.submenu);
							}
							if(locale_info.service_type_ids) {
								createServiceTypeButtons(block, locale_info.service_type_ids);
							}
						} else {
							// Иначе сообщаем, что ничего нет.
							// В Вашем городе пока не зарегистрировано организаций по выбранному профилю.
							block.addContentBlock({
								text: '<div class="info-block-centered">' + g_locale.there_is_no_facility_of_such_type_in_the_city + '</div>'
							});
						}
					}.bind(this));
				}
			}.bind(this), parent_panel);
        },
		/**
         * Создаёт панель для выбора возможностей конкретной больницы.
         * Сковордино:
         *  >	Медкомиссии
         *  >	Специалисты
         * @param {Object} parent_panel
         * @param {String} facility_type - medical|nails|haircut
         */
        facility_menu_show: function(parent_panel) {
			// Получаем данные о типе предприятия (больницы, парикмахерские, ногтевой бизнес).
			var facility_type = signupModel.facility_type;
			assert(facility_type, 'facility_type ещё не выбран, нельзя показывать меню записи.');
		    
			// Чистим если старые данные о выборе.
			signupModel.service_type_id = null;
			signupModel.resource_id = null;
			signupModel.user_service_id = null;
		    
		    // Медкомиссии, Специалисты, Больницы
		    // Выводим название типа услуг (например "Медицинские услуги").
		    createPanel(g_locale.signup[facility_type].header, function(block) {
				var block_content = null;
				// TODO: убрать частный случай для парикмахерских.
				if(facility_type === 'haircut') {
					block.addContentBlock({
						text : '<p id="haircut-dont-work-message" class="info-block-centered">Раздел находится в стадии разработки. Если Вы хотите опубликовать свою организацию здесь подайте заявку в разделе <strong>Организациям</strong>.</p>'
					});
				} else {
					// Получаем все предприятия из базы.
					get_collection_from_base('facilities', function(facilities, facilities_by_id) {
						// Определяем, существуют ли в этом городе предприятия оказывающие услуги в данной сфере.
						var facility_that_suit_exists = false;
						for(var i = 0; i < facilities.length; ++i) {
							if((facilities[i].type === facility_type) && (parseInt(facilities[i].city_id, 10) === parseInt(signupModel.city_id, 10))) {
								facility_that_suit_exists = true;
								break;
							}
						}
						// Если есть предприятия - продолжаем нормальным путём.
						if(facility_that_suit_exists) {
							// Берём данные о локализации и составе меню.
							var locale_info = g_locale.signup[facility_type];
								
							// Выбираем только те, которые возможны.
							var createServiceTypeButtons = function(panel, service_type_ids) {

								var _createServiceTypeButtons = function(panel, service_type_ids) {
									// Получаем из базы типы услуг.
									get_collection_from_base('service_types', function(panel, service_type_ids, service_types, service_types_by_id) {
										for(var i = 0; i < service_type_ids.length; ++i) {
											var service_type_id = service_type_ids[i];
											var service_type = service_types_by_id[service_type_id];
											panel.addBlock({
												icons: [service_type.icon],
												header : service_type.name,
												text : service_type.description
											}, 
											// bind приходиться использовать.
											function(service_type_id, parent_panel) {
												// Событие происходит при выборе услуги (нажали например Терапевт).
												var is_facility_selected = true;
												this.on_service_type_selected(is_facility_selected, service_type_id, parent_panel);
											}.bind(this, service_type_id));
										}
									}.bind(this, panel, service_type_ids));
								}.bind(this);
								// Берём выбранную в данный момент организацию.
								var facility_id = parseInt(signupModel.facility_id, 10);
								// Если существует, верный id.
								if(isNumber(facility_id)) {
									// Фильтруем service_type_ids по service_type_ids организации.
									// (фильтруем по услугам, которые она предоставляет).

									// Получаем все услуги из базы.
									get_collection_from_base('user_services', function(service_type_ids, _createServiceTypeButtons, facility_id, user_services, user_services_by_id) {
										var facility_service_type_ids = [];
										for(var i = 0; i < user_services.length; ++i) {
											var current_facility_id = parseInt(user_services[i].facility_id, 10);
											// Если это услуга выбранного предприятия.
											if(facility_id === current_facility_id) {
												// То записываем.
												user_services[i].available_time.forEach(function(interval) {
														facility_service_type_ids = facility_service_type_ids.concat(interval.service_type_ids);
												});
											}
										}
										// Получаем пересечение множеств (массивы с уникальными элементами).
										var possible_service_type_ids = service_type_ids.intersect(facility_service_type_ids);
										// Создаём кнопки для тех услуг, которые предприятие может оказать.
										_createServiceTypeButtons(panel, possible_service_type_ids);
									}.bind(this, service_type_ids, _createServiceTypeButtons, facility_id));
								} else {
									// Иначе проходим обычным способом.
									_createServiceTypeButtons(panel, service_type_ids);
								}
							}.bind(this);
							// Создаём подменю.
							var createSubmenu = function(panel, submenu) {
								// Проходимся по элементам подменю.
								for(var i = 0; i < submenu.length; ++i) {
									// Побавляем элемент подменю.
									block.addBlock({
										header : submenu[i].header,
										text : submenu[i].text,
										icons: [submenu[i].icon]
									}, function(submenu_element, parent_panel) {
										createPanel(submenu_element.header, function(panel) {

											if(submenu_element.submenu) {
												createSubmenu(panel, submenu_element.submenu);
											}
											if(submenu_element.service_type_ids) {
												createServiceTypeButtons(panel, submenu_element.service_type_ids);
											}
										}, parent_panel);
									}.bind(this, submenu[i]));
								}
							};
							if(locale_info.submenu) {
								createSubmenu(block, locale_info.submenu);
							}
							if(locale_info.service_type_ids) {
								createServiceTypeButtons(block, locale_info.service_type_ids);
							}
						} else {
							// Иначе сообщаем, что ничего нет.
							// В Вашем городе пока не зарегистрировано организаций по выбранному профилю.
							block.addContentBlock({
								text: '<div class="info-block-centered">' + g_locale.there_is_no_facility_of_such_type_in_the_city + '</div>'
							});
						}
					}.bind(this));
				}
			}.bind(this), parent_panel);
       },
       
		
		/**
         * Вызываем меню выбора больницы в текущем регионе.
         * callback вызываем в конце, передавая туда текущую панель, после
         * которой появится следующая.
         * @param {Object} parent
         * @param {Object} callback
         */
		select_facility_menu_invoke: function (parent, callback) {
			assert(is_panel(parent) && helper.is('Function', callback), 'Wrong arguments in select_facility_menu_invoke()');
			// Список организаций
            createPanel(g_locale.facility_list.header, function(facilities_panel) {
                get_collection_from_base('facilities', function(facilities) {
	                get_collection_from_base('user_services', function(user_services) {
	                    var city_id = signupModel.city_id,
							content_block = null;
	                    var on_select_facility_button_pressed = function(facility_id, parent) {
							signupModel.facility_id = facility_id;
							callback(facilities_panel);
						};
						// Отбираем те предприятия, которые находятся в выбранном городе, относящиеся к определенному типу предприятий (сфере деятельности).
						var facilities_of_city_of_type = facilities.filter(function(facility) {
							return parseInt(facility.city_id, 10) === parseInt(signupModel.city_id, 10) && facility.type === signupModel.facility_type;
						});
						// Если выбран определенный вид услуг фильтруем по нему.
						//TODO:!! учитывать, что они могли оказывать в прошлом, а сейчас нет - проверять дату у interval.
						if(signupModel.is_service_type_selected()) {
							facilities_of_city_of_type = facilities_of_city_of_type.filter(function(facility) {
								var user_services_of_facility = user_services.filter(function(user_service) {
									return user_service.facility_id === facility.id;
								});
								var service_type_served = false;
								user_services_of_facility.forEach(function(user_service) {
									user_service.available_time.forEach(function(interval) {
										if(interval.service_type_ids.contains(signupModel.service_type_id)) {
											service_type_served = true;
										}
										if(service_type_served) { return; }
									});
									if(service_type_served) { return; }
								});
								return service_type_served;
							});
						}
						// Превращаем выбранные предприятия в блоки и строим из них панель.
						facilities_of_city_of_type.map(function(facility) {
							return {
									header : facility.name,
									text : shorten(facility.homepage_url, 27) + '<br/>' + shorten(facility.description, 53),
									facility_id: facility.id
							};
						}).forEach(function(block) {
							facilities_panel.addBlock(block, on_select_facility_button_pressed.bind(this, block.facility_id));
						});
						// Если ни одного подходящего предприятия нет.
						if(facilities_of_city_of_type.length) {
							facilities_panel.addContentBlock({
								text: g_locale.facility_list.there_is_no_facility_text
							});
						}
	                    /*for(var i = 0; i < facilities.length; ++i) {
							// Текущий тип предприятия (больницы/парикмахерские/ногтевой бизнес).
							var facility_type = signupModel.facility_type;
							// Если id города сходится и тип предприятия тот, тогда создаём пункт.
							if(parseInt(facilities[i].city_id, 10) === parseInt(city_id, 10) && facilities[i].type === facility_type) {
								// Для каждой больницы новый пункт.
								content_block = {
									header : facilities[i].name,
									text :   //'<a href="' + facilities[i].homepage_url + '" target="_blank">' +
									shorten(facilities[i].homepage_url, 27) + '<br/>' + shorten(facilities[i].description, 53)
								};
								facilities_panel.addBlock(content_block, on_select_facility_button_pressed.bind(this, facility_id));
							}
						}*/
	                });
                });
            }, parent);
        },
	/**
	 * Событие вызывем при выборе клиентом определённой услуги.
	 * Например:
	 *		Мед. учреждения >	Медкомиссии > Терапевт -->
	 * on_service_type_selected();
	 *
	 * @param parent_panel - панель на которой был выбран сервис, нужна в
	 * первую очередь для того,
	 *	чтобы вызвать следующую панель справа, а не очищать экран.
	 */
	on_service_type_selected: function(is_facility_selected, service_type_id, parent_panel) {
		service_type_id = parseInt(service_type_id, 10);
		assert(helper.is('Boolean', is_facility_selected), 'Invalid argument is_facility_selected in on_service_type_selected()');
		assert(isNumber(service_type_id), 'Invalid argument parent_panel in on_service_type_selected()');
		assert(parent_panel, 'Invalid argument parent_panel in on_service_type_selected()');
		
		// Чистим если старые данные о выборе.
		if(!is_facility_selected) {
			signupModel.facility_id = null;
		}
		signupModel.resource_id = null;
		signupModel.user_service_id = null;

		get_collection_from_base('service_types', function(service_types, service_types_by_id) {
			signupModel.service_type_id = service_type_id;//service_types_by_id[service_type_id];
		});
		if(signupModel.is_facility_selected()) {
			// Панель выбора ресурса перед выбором расписания.
			this.select_resource_menu_invoke(parent_panel, this.create_schedule_panel.bind(this));
		} else {
			// Выбрать больницу если ещё не выбрана.
			this.select_facility_menu_invoke(parent_panel, function(panel) {
				this.select_resource_menu_invoke(panel, this.create_schedule_panel.bind(this));
			}.bind(this));
		}
	},
	/**
	 * Вызываем меню выбора ресурса в текущей больнице, выполняющего определённый вид услуг.
	 * callback вызываем в конце, передавая туда текущую панель, после
	 * которой появится следующая.
	 * @param {Object} parent
	 * @param {Object} callback
	 */
	select_resource_menu_invoke: function(/** Panel */ parent_panel, /** Function */ callback) {
		assert(is_panel(parent_panel) && helper.is('Function', callback), 'Wrong arguments in select_resource_menu_invoke()');
		
		// Чистим если старые данные о выборе.
		signupModel.resource_id = null;
		signupModel.user_service_id = null;
		
		// Сотрудники организации
		createPanel('Сотрудники организации', function(resources_panel) {
			get_collection_from_base('resources', function(resources) {
				get_collection_from_base('user_services', function(user_services) {
					var city_id = signupModel.city_id, content_block = null;
					var on_select_resource_button_pressed = function(resource_id, parent_panel) {
						signupModel.resource_id = resource_id;
						callback(resources_panel);
					};
					// Отбираем те ресурсы, которые находятся на выбранном предприятии, занимающиеся определенным видом услуг.
					var selected_resources = resources.filter(function(resource) {
						var user_services_of_facility = user_services.filter(function(user_service) {
							return user_service.facility_id === signupModel.facility_id && user_service.resource_id === resource.id;
						});
						var service_type_served = false;
						user_services_of_facility.forEach(function(user_service) {
							user_service.available_time.forEach(function(interval) {
								if(interval.service_type_ids.contains(signupModel.service_type_id)) {
									service_type_served = true;
								}
								if(service_type_served) {
									return;
								}
							});
							if(service_type_served) {
								return;
							}
						});
						return service_type_served;
					});
					// Превращаем выбранные предприятия в блоки и строим из них панель.
					selected_resources.map(function(resource) {
						return {
							header : resource.name,
							text : shorten(resource.description, 53),
							resource_id: resource.id
						};
					}).forEach(function(block) {
						resources_panel.addBlock(block, on_select_resource_button_pressed.bind(this, block.resource_id));
					});
				});
			});
		}, parent_panel);
	},
	/**
	 * Создаёт панель на которой можно выбрать необходимый участок времени.
	 * @param {Object} parent_panel
	 */
	 create_schedule_panel: function(parent_panel) {
		// Панель записи - выбора времени.
		createPanel('Выбор времени: ', function(schedule_panel) {
			schedule_panel.loaderStart();

			var schedule_panel_info_block = schedule_panel.addContentBlock({
				text : '<div id="info_block"> </div>'
			});
			schedule_panel.addContentBlock({
				name : "canvas_container",
				text : '<div id="calendar_canvas"></div>'
			});
			var today = new Date();
			// Получаем выбранный тип услуг.
			var service_type_id = parseInt(signupModel.service_type_id, 10);
			// Находим соответствующий ресурс и пользовательскую услугу - по одной сейчас.
			//find_resource_and_user_service_by_service_type_id(service_type_id, facility.get_id(), function(resource, user_service) {
			signupModel.extract(function(ex) {
				var resource = ex.resource,
					user_service = ex.user_service,
					facility = ex.facility,
					service_type = ex.service_type;
				assert(null !== resource && null !== user_service, "При составлении календаря не найден ресурс или пользовательская услуга. create_schedule_panel()");
				assert(resource, 'Ресурс не был выбран в create_schedule_panel()');
				assert(user_service, 'Пользовательская услуга не была выбрана в create_schedule_panel()');

				/*facility.get(function(_facility) {
					// TODO фильтровать передаваемые ресурсы и другое.*/
					var scheduler = new Scheduler(service_type, resource, user_service, facility, function(interval_info) {
						// TODO info for debug here.
						console.log(JSON.stringify(interval_info));
						get_collection_from_base('user_services', function(user_services) {
							get_collection_from_base('cities', function(cities) {
								var fond = false;
								for(var i = 0; i < cities.length; ++i) {
									for(var j = 0; j < user_services.length; ++j) {
										if(cities[i].id == user_services[j].facility_id && user_services[j].resource_id == interval_info.resource.id) {
											//facility.set_id(cities[i].id);
											fond = true;
											break;
										}
									}
									// Найдено.
									if(fond) {
										break;
									}
								}

								// Создаём информацию о регистрации запроса пользователя.
								// thisView вместо this, так как bind слетает.
								this.selectedRegistrationInfo = new ScheduleModel.RegistrationInfo({
									interval_info : interval_info
								});

								// Удаляем кнопку "Записаться" если уже существует.
								schedule_panel.removeToolbarIcon(helper.where.right, 0);

								// Записаться
								var okBtn = createToolbarButton({
									text : 'Записаться',
									callback : function(okBtn) {
										// Передаём в callback то, что должно быть вызвано после всего, когда пользователь залогиниться.
										// В данном случае это подтверждение записи на услугу.
										this.user_login_or_register_sequence(schedule_panel, this.create_user_info_accept_panel.bind(this, facility, service_type, schedule_panel));
										// Удаляем ОК, чтобы нельзя было два раза его нажать.
										var ok2Btn = createToolbarButton({
											text : 'Записаться',
											callback : function() {
											},
											style_class : 'ok_toolbar_icon_disabled',
											panel : schedule_panel
										});
										okBtn.dispose();
										okBtn = null;
									}.bind(this),
									style_class : 'ok_toolbar_icon',
									panel : schedule_panel
								});
							}.bind(this));
						}.bind(this));
					}.bind(this), function(interval_info_string) {
						$('info_block').set('html', interval_info_string);
					}, function() {
						schedule_panel.loaderStop();
					}, today);
				//});
			}.bind(this));
			//});
		}.bind(this), parent_panel, true);
	},
	/**
         * Создаёт панель где пользователя просят ввести своё ФИО, телефон,
         * e-mail и
         * согласиться с тем что 'Я согласен, прийду в назначеное время.'.
         * @param {Object} parent_panel
         */
      create_user_info_accept_panel:  function (/** object */ facility, /** object */ service_type, /** object */ parent_panel, /** string */ phone_number) {
        	assert(parent_panel, 'Wrong 1st argument in create_user_info_accept_panel()');
        	assert(window.helper.is('String', phone_number), 'Wrong 2st argument in create_user_info_accept_panel()');
        	
            var registrationInfo = this.selectedRegistrationInfo;
            assert(registrationInfo, "Передана неверная информация о регистрации");
            createPanel('Подтверждение', function(user_info_panel) {
                user_info_panel.registrationInfo = registrationInfo;
                engine.showToolTip('Подтвердите информацию в правом окне.', g_locale.message.icons.info);
                user_info_panel.emailInput = null;
                // Информация.
                var date_match = /(\d+)\s\/\s(\d+)\s\/\s(\d+)/.exec(registrationInfo.interval_info.human_readable_date);
                var month = parseInt(date_match[2], 10);
                assert(month <= 12 && month > 0, 'Month is invalid! Month: ' + month);
                var date_string = date_match[1] + ' ' + g_locale.month_strings[month] + ' ' + date_match[3];
                
                user_info_panel.addContentBlock({
                    header: 'Вы выбрали услугу:',
                    text : 'Вы должны прийти <strong>' +
						date_string + ' в ' +
						(/(\d+:\d+)/.exec(registrationInfo.interval_info.human_readable_time)[1]) + '</strong>.</br>' +
							'Услугу оказывет <strong>' + registrationInfo.interval_info.resource.name + '</strong></br>'
                });
                // Ваш номер телефона:
                user_info_panel.addContentBlock({
                	header: g_locale.your_phone_number,
                    text: '+7' + phone_number
                });
                
				var registerNewUser = function() {
					// Преобразуем телефон к стандартному виду.
					var phone_number = get_standard_phone_number(user_info_panel.phoneInput.value);
					// Получаем уже зарегестрированных пользователей.
					get_collection_from_base('users', function(users, users_by_id) {
						var user_exist = false;
						for(var i = 0; i < users.length; ++i) {
							if(users[i].phone_number == phone_number) {
								user_exist = true;
								break;
							}
						}
						// Если телефон в базе уже есть.
						if(user_exist) {
							// Сообщаем, что ничего не получится.
							// Извините. Данный телефон уже зарегистрирован в базе. Введите пароль.
							engine.showToolTip(g_locale.user_phone_registered, g_locale.message.icons.warning);
						} else {
							// Если телефон нормальный.
							if(phone_number && phone_number !== '' && phone_number.length > 7) {
								// Генерируем пароль - случайный, но не полностью (для проверки).
								var generated_password = generate_user_password(phone_number);
								if(/u/.test(generated_password)) {
									engine.showToolTip('Введите верный номер телефона', g_locale.message.icons.error);
									return;
								}
								var user = {
									phone_number : phone_number,
									password : generated_password
								};
								/*engine.showToolTip('Должно приходить по смс: ваш пароль: ' + generated_password);*/
								insertDatabaseItem('users', user, function(user) {
									// Посылаем по смс сообщение о том, что человек был зарегестрирован.
									send_sms_message(user.phone_number, user.password, g_locale.you_had_been_registered_with_password + user.password, function() {
										// Пароль был доставлен на ваш номер телефона. Проверьте входящие сообщения.
										engine.showToolTip(g_locale.password_sent_by_sms, g_locale.message.icons.info);
									});
								}.bind(this, user));
							} else {
								engine.showToolTip('Введите верный номер телефона', g_locale.message.icons.error);
							}
						}
					});
				};

                // OK button.
				var okBtn = new ButtonBigEl({
					text: 'Записаться',
					title: 'Я согласен, прийду в назначеное время',
					panel: user_info_panel,
					onclick: function(parent_panel) {
	                    this.create_success_panel(facility, service_type, parent_panel, phone_number);
	                }.bind(this, user_info_panel)
				});
                /*
                 * Многим людям удобнее навести мышку, а потом, забыв нажать
                 * клавишу мыши, начать вводить текст.
                 * При этом, пусть мышь побудет наведённой ~(пол секунды)-750 мс
                 * до смены фокуса,
                 * для того, чтобы человека, который просто мимо input курсор
                 * проводил не раздражал захват ввода.
                 */
                var input_element = $$('input');
                makeInputUserFriendly(input_element);
            }.bind(this), parent_panel);
       },
		
		/**
		 * Финальная панель "Вы успешно записаны на приём".
		 * @param {Object} parent_panel
		 */
		 create_success_panel: function( /** object */ facility, /** object */ service_type, /** object */ parent_panel, /** string */ phone_number) {
			assert(parent_panel, 'Wrong 1st argument in create_success_panel()');
			assert(helper.is('String', phone_number) && ScheduleModel.userManager.getLoggedUserPhoneNumber(), 'Wrong 2nd argument in create_success_panel()');
			// Сохраняем данные пользователя в специальный объект.
			var userInfo = new ScheduleModel.UserInfo({
				phone_number : get_standard_phone_number(phone_number),
				registrationInfo : parent_panel.registrationInfo,
				password : ScheduleModel.userManager.getLoggedUserPassword(),
				facility_id : signupModel.facility_id,
				service_type_id : signupModel.service_type_id
			});
			// Если данные не верны сообщаем, в противном случае можно
			// продолжить.
			userInfo.isDataValid(function(is_data_valid) {
				if(!is_data_valid) {
					engine.showToolTip('Извините, вы неверно указали данные, попробуйте ещё раз.', g_locale.message.icons.error);
				} else {
					userInfo.saveToServer();

					engine.showToolTip('Готово', g_locale.message.icons.info);
					var success_panel = null;
					// Информация о записи и регистрационный номер.
					// "Вы успешно записаны на приём"
					createPanel(g_locale.success.header, function(_success_panel) {
						
						function format_service_string(userInfo) {
							/*
							*	Интервал = {
							*		to_complete_service_time: время в минутах для оказания услуги.
							*		work_start_time_minutes: число в минутах начиная с 00:00 этого дня, например 12:34 = 12*60+34 = 754,
							*		human_readable_date: например "12 июля",
							*		human_readable_time: например "12:30-12:35",
							*		resource: данные о ресурсе в это время.
							*	};
							*///TODO!!!!!!!
							return '<strong>' + service_type.name + '</strong>' + (service_type.description ? ': ' + service_type.description : '') + userInfo.registrationInfo.getHumanReadableString();
						}
						
						var _facility = facility;
						success_panel = _success_panel;
						success_panel.addContentBlock({
							text : '<strong>Название организации: </strong>' + _facility.name + '<br/>' + '<strong>Вы записаны к: </strong>' + format_service_string(userInfo) + '<br/>' + '<strong>Ваш регистрационный номер:</strong>'
						});
	
						success_panel.addBlock({
							header : '<strong id="registration_number_text">' + userInfo.registration_id + '</strong>',
							events : false
						});
						success_panel.addContentBlock({
							text : g_locale.success.caution_info
						});
	
						success_panel.addContentBlock({
							text : '<div class="for_printer_only"><small>ООО "ТН" / www.tncor.com / support@technovation.ru / 8(4212)41-31-55 </small></div>'
						});

					}, false, true);
					// Возможные действия после записи.
					createPanel('Действия', function(operations) {
						// Печать.
						operations.addBlock({
							icons : [g_locale.success.print.icon],
							header : g_locale.success.print.header,
							text : g_locale.success.print.text
						}, function() {
							success_panel.html_content.addClass('printable');
							window.print();
						});
						// TODO: вернуть "Послать на e-mail"
						/*// Послать на e-mail.
						operations.addBlock({
						icons: [g_locale.success.send_email.icon],
						header : g_locale.success.send_email.header,
						text : g_locale.success.send_email.text
						});*/
						// Послать по sms.
						operations.addBlock({
							icons : [g_locale.success.send_sms.icon],
							header : g_locale.success.send_sms.header,
							text : g_locale.success.send_sms.text
						});
						// Готово.
						operations.addBlock({
							icons : [g_locale.success.close.icon],
							header : g_locale.success.close.header,
							text : g_locale.success.close.text
						}, refreshMainScreen);
					}, success_panel);
				}
			});
		},
	// Сохраняем данные о регистрации пользовательского запроса здесь.
    selectedRegistrationInfo: null
};