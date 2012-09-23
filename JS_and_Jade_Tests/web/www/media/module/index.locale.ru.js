/*globals g_locale: false */
console.log('index.locale.ru.js');

function setup_locale_ru() {
	// Псевдолокализация.
	/*if(!g_locale.path) {
		g_locale.path = {icons: '', images: ''};
	}
	g_locale.path.icons = '../console/icons/';
	g_locale.path.images = '../console/';*/
		
	g_locale.homepage = {
		header: 'Краткая справка'
	};
	g_locale.mind_struct = {
		header: 'Специальные предложения от партнёров',
		slider: [
			'<a href="#"><img src="media/images/slider-offer1.jpg" alt="" title="Хотите выглядеть шикарно и прелестно?" height="400" width="555" /></a>',
			'<a href="#"><img src="media/images/slider-offer2.jpg" alt="" title="Уход за руками и ногами" height="400" width="555" /></a>'
		]
	};
	g_locale.region = {
		header: 'Выберите свой город',
		tooltip: 'Выбор текущего региона',
		custom: {
			header: 'Регион',
			city: {
				header: 'Город',
				timezone: 'Часовой пояс: '
			}
		}
	};
	
	g_locale.user_phone_registered = 'Извините. Данный телефон уже зарегистрирован в базе. Вернитесь на прошлую форму и введите пароль.';
	g_locale.password_sent_by_sms = 'Пароль был доставлен на ваш номер телефона. Проверьте входящие сообщения.';
	g_locale.you_had_been_registered_with_password = 'Вы успешно зарегистрированы в Япозаписи.ru! Ваш пароль: ';
	g_locale.select_one_cannot_save = 'Нужно выбрать как минимум один вид деятельности!';
	g_locale.invalid_phone_number_or_password = 'Извините, Вы неверно ввели номер телефона или пароль. Чтобы воспользоваться системой необходимо зарегистрироваться.';
	g_locale.new_password_generated = 'Изменён Ваш пароль в Япозаписи.ru. Новый пароль: ';
	g_locale.password_was_sended_today = 'Извините, не удалась изменить пароль, возможно мы уже выслали Вам пароль сегодня.';
	g_locale.you_are_not_registered = 'Извините, Вы не зарегистрированы. Нажмите кнопку Регистрация, чтобы зарегистрироваться.';
	g_locale.your_phone_number = "Ваш номер телефона:";
	g_locale.remind_no_number = "Введите свой телефон для напоминания пароля";
	g_locale.wrong_phone_number_format = "Укажите телефон в формате +7xxxxxxx (например так: +71234567890)";
	
	g_locale.success = {
		header: 'Вы успешно записаны на приём',
		caution_info: 'Будьте осторожны с номером, не теряйте его, иначе мы не сможем предоставить заказаные услуги в полном объёме. Не опоздывайте на приём.',
		print: {
			header: 'Печать',
			text: 'Распечатать информацию',
			icon: 'success_panel/icon-print.png'
		},
		send_email: {
			header: 'Послать на e-mail',
			text: 'Послать информацию о регистрации по e-mail',
			icon: 'success_panel/icon-email2.png'
		},
		send_sms: {
			header: 'Послать по sms',
			text: 'Послать информацию о регистрации по sms',
			icon: 'success_panel/icons-phone.png'
		},
		close: {
			header: 'Готово',
			text: 'Завершить сеанс',
			icon: 'success_panel/icon-ok-12.png'
		}
	};
	g_locale.help = {
		header: 'Справка',
		description: {
			icon: 'icon/book.png',
			header: 'Описание',
			text: 'Как работать с системой',
			info: {
				header: 'Описание системы "Япозаписи.рф"',
				text:	'С помощью сервиса «Я по записи» клиенты смогут ' +
						'записаться к Вам на прием через интернет и, ' +
						'при этом также смогут видеть свободное для посещений ' +
						'время и самостоятельно его спланировать. ' +
						'Вы же сможете легко контролировать ' +
						'загруженность сотрудников и поток посетителей.<br/>' +
						'Сервис позволяет реализовать прием звонков, ' +
						'силами наших диспетчеров. А занесенная в систему ' +
						'таким образом информация становится сразу доступна Вам для ознакомления.<br/>'+
						'Использование сервиса «Я по записи» ' +
						'позволит Вам сэкономить время на телефонных ' +
						'разговорах и уделить его непосредственно Вашим клиентам!' +

						'<div id="show-soft-rain"></div>' +
						'' +
						'<blockquote id="soft-rain-blockquote" class="templatequote info-block-centered">' +
						'<div>There will come soft rains and the smell of the ground,<br>' +
						'And swallows circling with their shimmering sound;' +
						'<p>And frogs in the pool singing at night,<br>' +
						'And wild plum trees in tremulous white;</p>' +
						'<p>Robins will wear their feathery fire,<br>' +
						'Whistling their whims on a low fence-wire;</p>' +
						'<p>And not one will know of the war, not one<br>' +
						'Will care at last when it is done.</p>' +
						'<p>Not one would mind, neither bird nor tree,<br>' +
						'If mankind perished utterly;</p>' +
						'<p>And Spring herself when she woke at dawn<br>' +
						'Would scarcely know that we were gone.</p>' +
						'</div>' +
						'</blockquote>' + ''
			}
		},
		order: {
			icon: 'icon/book.png',
			header: 'Заказ',
			text: 'Как заказать услуги',
			info: {
				header: 'Как осуществить заказ',
				text:	'Воспользоваться нашими услугами так же просто, как 2x2.<br/>' +
						'Для начала работы нажмите кнопку "Записаться" на левой панели. ' +
						'1) Выберете интересующую Вас сферу оказания услуг: ' +
						'медицинские услуги, парекмахерские, услуги ногтевых сервисов. ' +
						'2) После этого, для Вашего удобства, предоставлен выбор: ' +
						'сразу выбрать наиболее удобную ' +
						'для Вашего посещения больницу (для этого выберете раздел "Организации") ' +
						'или же сначала выбрать услугу, ' +
						'на которую Вы хотите записаться, ' +
						'после чего уже перейти к выбору больницы.<br/>' +
						'3) После того, как Вы выбрали тип услуги ' +
						'на который хотите записаться и организацию, ' +
						'которая может предоставить Вам возможность ' +
						'записаться на него, Вы можете ' +
						'перейти к выбору работник, ' +
						'который может Вам его предоставить.<br/>' +
						'4) Выберете свободный участок времени в ' +
						'календаре (зелёная область) и вводите ' +
						'свои данные.<br/>' +
						'Вот и всё, после нажатия на кнопку ' +
						'"Записаться" наши операторы получают ' +
						'информацию о Вашем запросе, ' +
						'а Вы можете прийти на приём, записав ' +
						'предварительно Ваш новый регистрационный ' +
						'номер записи (не забудьте это сделать, ' +
						'иначе операторы предприятий не смогут оказать' +
						'заказанную услугу полноценным образом в заданное время) ' +
						'или распечатать его, воспользовавшись ' +
						'кнопкой "Печать" на последней панели.'
			}
		},
		calendar: {
			icon: 'icon/book.png',
			header: 'Календарь',
			text: 'Как планировать услуги',
			info: {
				header: 'Как планировать услуги',
				text:	'Воспользоваться нашими услугами так же просто, как 2x2.<br/>' +
						'Для начала работы нажмите кнопку "Записаться" на левой панели. ' +
						'1) Выберете интересующую Вас сферу оказания услуг: ' +
						'медицинские услуги, парекмахерские, услуги ногтевых сервисов. ' +
						'2) После этого, для Вашего удобства, предоставлен выбор: ' +
						'сразу выбрать наиболее удобную ' +
						'для Вашего посещения больницу (для этого выберете раздел "Организации") ' +
						'или же сначала выбрать услугу, ' +
						'на которую Вы хотите записаться, ' +
						'после чего уже перейти к выбору больницы.<br/>' +
						'3) После того, как Вы выбрали тип услуги ' +
						'на который хотите записаться и организацию, ' +
						'которая может предоставить Вам возможность ' +
						'записаться на него, Вы можете ' +
						'перейти к выбору работник, ' +
						'который может Вам его предоставить.<br/>' +
						'4) Выберете свободный участок времени в ' +
						'календаре (зелёная область) и вводите ' +
						'свои данные.<br/>' +
						'Вот и всё, после нажатия на кнопку ' +
						'"Записаться" наши операторы получают ' +
						'информацию о Вашем запросе, ' +
						'а Вы можете прийти на приём, записав ' +
						'предварительно Ваш новый регистрационный ' +
						'номер записи (не забудьте это сделать, ' +
						'иначе операторы предприятий не смогут оказать' +
						'заказанную услугу полноценным образом в заданное время) ' +
						'или распечатать его, воспользовавшись ' +
						'кнопкой "Печать" на последней панели.'
				}
		},
		partners: {
			icon: 'icon/book.png',
			header: 'Партнёрам',
			text: 'Как стать нашим партнёром',
			info: {
				header: 'Как стать нашим партнёром',
				text: 'Мы рады знакомству с вами и возможному партнёрству. <br/><a href="http://tncor.com">ООО "Техновация"</a> предлагает выгодные условия сотрудничества, обеспечивающие динамичный рост вашего бизнеса и его стабильное развитие в долгосрочной перспективе.<br/>Необходимую информацию вы можете получить выбрав пункт <strong>"Организациям"</strong> на левой панели.'
			}
		}
	};
	g_locale.partners = {
		header: "Информация для партнёров",
		tooltip: "Информация для партнёров",
		// TODO:
		info: '<!-- TODO: !НЕТ! Мы рады знакомству с вами и возможному партнёрству.<br/>' +
				'<p><a href="http://tncor.com">ООО "Техновация"</a> предлагает выгодные условия сотрудничества, обеспечивающие динамичный рост вашего бизнеса и его стабильное развитие в долгосрочной перспективе.</p>' +
				'<p><strong>«Я по записи»</strong> - удобный сервис, с помощью которого вы можете сделать свою жизнь, так же как и жизнь вашего пользователя более простой и комфортной. Это удобно - зайти на один сайт и записаться к парикмахеру на следующий день, после чего запланировать поход к стоматологу через неделю и наконец купить билеты на новый концерт. Не нужно тратить время и деньги на бесполезные поездки, можно уделить больше времени важным вещам.</p>' +
				'<p>То что удобно вашим клиентам - удобно и вам. С помощью сервиса <strong>«Я по записи»</strong> Клиенты смогут записаться к Вам на прием через интернет и при этом также смогут видеть свободное для посещений время и самостоятельно его спланировать. Вы же сможете легко контролировать загруженность сотрудников и поток посетителей.</p>' +
				'<p>Сервис позволяет реализовать прием звонков, силами наших диспетчеров. А занесенная в систему таким образом информация становится сразу доступна Вам для ознакомления.</p>' +
				'<p>Использование сервиса «Я по записи» позволит Вам сэкономить время на телефонных разговорах и уделить его непосредственно Вашим клиентам!</p>' +
				'<p>В век информационных технологий, в организации которая использует в своей работе только передовые материалы и технологии, система ведения журнала записей на бумажных носителях не только неэффективна но и не показательна.</p>' +
				'<p><strong>«Я по записи»</strong> - это сервис для компаний, которые идут в ногу со временем!</p>' +
				'<p>Если вас заинтересовала информация вы можете:</p>-->' +
				
				'<p><a href="http://tncor.com">ООО "Техновация"</a> предлагает выгодные условия сотрудничества, обеспечивающие динамичный рост вашего бизнеса и его стабильное развитие в долгосрочной перспективе.</p>' +
				'<p>С помощью сервиса <strong>«Я по записи»</strong> Клиенты смогут записаться к Вам на прием через интернет и при этом также смогут видеть свободное для посещений время и самостоятельно его спланировать. Вы же сможете легко контролировать загруженность сотрудников и поток посетителей.</p>' +
				'<p>Сервис позволяет реализовать прием звонков, силами наших диспетчеров. А занесенная в систему таким образом информация становится сразу доступна Вам для ознакомления.</p>' +
				'<p>Использование сервиса «Я по записи» позволит Вам сэкономить время на телефонных разговорах и уделить его непосредственно Вашим клиентам!</p>' +
				'<p>Если вас заинтересовала информация вы можете:</p>',
		signup: {
			icon: 'icon/places.png',
			header: 'Подать заявку на партнёрский аккаунт',
			text: 'Мы ответим Вам в течение 7 рабочих дней',
			signup_panel: {
				header: 'Заявка',
				info: 'Вы можете подать заявку на получение партнёрского аккаунта. Это позволит Вам размещать на нашем сайте информацию о себе, а также воспользоваться удобной системой онлайн записи. <br/>Пожалуйста заполните следующие формы:',
				facility_name_input: 'Название организации:',
				contact_name_input: 'ФИО контактного лица:',
				contact_phone_number_input: 'Телефон контактного лица:',
				signup_button: 'Подать заявку'
			},
			congrats_panel: {
				header: 'Готово',
				info: 'Спасибо! Мы свяжемся с Вами по поводу Вашей заявки в течение 7 рабочих дней. <br/> Всего доброго и до новых встреч! Ваш <a href="http://tncor.com">tncor.com</a>'
			}
		}
	};
	g_locale.contacts = {
		header: "Наши контакты",
		info: {
			header: 'Вы можете связаться с нами:',
			text: 'Телефон: <a href="javascript:void(0);">+7 (4212) 41-31-55</a><br/>' +
					'E-mail: <a href="mailto:request@tncor.com">request@tncor.com</a><br/>' +
					'Поддержка: <a href="mailto:support@tncor.com">support@tncor.com</a><br/>' +
					'Адрес: Россия, 680030 г. Хабаровск<br/>' +
					'ул. Постышева 22а оф. 407<br/>' +
					'Бизнес центр "Хабаровск Сити" (<a href="javascript:void(0);">карта</a>)<br/>' +
					'<a href="javascript:void(0);">(TODO: Справа социальные кнопки разместить - facebook,twitter,digg...)</a>'
		}
	};
	
	g_locale.places_icon = 'icon/places.png';
	
	// g_locale.there_is_no_facility_of_such_type_in_the_city
	g_locale.there_is_no_facility_of_such_type_in_the_city = 'В Вашем городе пока не зарегистрировано организаций по выбранному профилю.';
	
	g_locale.signup = {
		header: 'Типы услуг',
		medical: {
			header: 'Медицинские услуги',
			text: 'Записаться на прием к врачу, получить справку, пройти комиссию',
			icon: 'icon/medical.png',
			submenu: [
				/*
				 * TODO: вернуть медкомиссии.
				 * {
					header: 'Медкомиссии',
					text: 'Получите нужные справки и другие документы',
					icon: 'icon/medical.png',
					service_type_ids: [10, 11, 12, 13, 14, 15]
				},*/
				{
					header: 'Специалисты',
					text: 'Запись на визит к определенному врачу',
					icon: 'icon/doctor.png',
					service_type_ids: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
				}
			]
		},
		haircut: {
			header: 'Парикмахерские',
			text: 'Стрижки, уход за волосами',
			icon: 'icon/hair.png',
			submenu: [
				{
					header: 'Извините, пока парикмахерских нет',
					text: 'Заходите на следующией неделе',
					icon: 'icon/hair.png'
				}
			]
		},
		nails: {
			header: 'Ногтевой сервис',
			text: 'Уход за ногтями, моделирование, наращивание и украшение',
			icon: 'icon/nails.png',
			submenu: [
				{
					header: 'Маникюр',
					text: '',
					icon: 'icon/nails.png',
					service_type_ids: [27, 28, 29, 30, 31]
				},
				{
					header: 'Педикюр',
					text: '',
					icon: 'icon/nails.png',
					service_type_ids: [32, 33, 34]
				}
			],
			service_type_ids: [17, 18, 19, 20, 35, 21, 22, 23, 24, 25]
		}
	};
	
	g_locale.facility_list = {
		header: 'Список организаций',
		there_is_no_facility_text: ''
	}
	
	// Названия типов организаций.
	g_locale.facility_type_names = {
		medical: 'мед. учреждение',
		haircut: 'парикмахерская',
		nails: 'ногтевой сервис'
	};
	
	g_locale.user_plans = {
		header: 'Планы',
		plan: {
			icon: 'icon/calendar.png'
		}
	};
	
	//g_locale.month_strings = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
	g_locale.month_strings = ['-', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
	
	g_locale.saved_successfully = 'Успешно сохранено.';
	g_locale.save_failed = 'Извините, не удалось сохранить.';
	g_locale.save_tip = 'Сохранить';
	
	g_locale.created_successfully = 'Успешно создано.';
	g_locale.create_tip = null;
	//g_locale.remove_tip = 'Удалить';
	
	//g_locale.back.icon = 'toolbar/icon-back.png';
	
	g_locale.administration = {
		tip:	'<div class="info-block-centered">Панель управления: ' +
				'если Вы являетесь владельцем предприятия и ' +
				'имеете партнёрский аккаунт в системе yapozapisi.ru, ' +
				'то Вам доступен этот раздел. ' +
				'В панели управления Вы можете составлять расписание' +
				'своих сотрудников и управлять учётной записью Вашего предприятия' +
				'</div>',
		login: {
			header: 'Вход',
			login_input: {
				header: 'Логин'
			},
			password_input: {
				header: 'Пароль'
			},
			button: {
				icon: 'something.png',
				text: 'Войти'
			},
			wrong_password: 'Извините, вы неверно ввели логин или пароль.'
		},
		facility: {
			header: 'Организация',
			workers: {
				icon: 'icon/employees.png',
				header: 'Сотрудники',
				text: 'Изменить информацию о сотрудниках'
			},
			services: {
				icon: 'icon/services.png',
				header: 'Услуги',
				text: 'Выбрать оказываемые организацией услуги и виды работ',
				panel: {
					 header: 'Услуги',
					 text: 'Выберете виды услуг, которые оказывает Ваша организация.'
				}
			},
			locations: {
				icon: 'icon/places.png',
				header: 'Помещения',
				text: 'Помещения, офисы, кабинеты - места где вы оказываете услуги',
				panel: {
					 header: 'Помещения',
					 text: 'Кабинеты',
					 add_tip: 'Добавить помещение'
				}
			},
			information: {
				icon: 'icon/statistic.png',
				header: 'Подробно',
				text: 'Показать подробную информацию о ситуации в организации',
				panel: {
					 header: 'Подробная информация об организации',
					 text: 'TODO: <br/>' +
							'сколько у каждого работника приёмов <br/>' +
							'сколько работал, сколько простоя <br/>' +
							'на какие услуги больше записываются <br/>' +
							'сколько это в денежном выражении <br/>' +
							'сколько времени на оказание каждой услуги - по организации и по работникам (абслютные величины и относительные). <br/>' +
							'<br/>' +
							'Расписание по работникам / повестка дня / новости'/* ( + приятная, ненавязчивая реклама)'*/
				}
			},
			contract: {
				icon: 'icon/book.png',
				header: 'Условия использования',
				text: 'Показать пользовательское соглашение',
				panel: {
					header: 'Пользовательское соглашение «А»'
				}
			},
			edit: {
				button_tip: 'Изменить информацию об организации',
				header: 'Изменить данные:',
				text: 'На этой панели вы можете изменить данные вашей организации. Пользователи доверяют тем организациям, о которых больше знают. Если пользователи доверяют организации, они делают больше заказов. Обязательно заполните поля "описание" и "домашняя страница".',
				name_input: 'Название',
				url_input: 'Домашняя страница',
				description_input: 'Описание'
			},
			logout: {
				button_tip: 'Выйти (чтобы зайти под другим паролем)'
			}
		},
		employee: {
			icon: 'icon/employee.png',
			header: 'Профиль',
			schedule: {
				icon: 'icon/calendar.png',
				header: 'График работ',
				text: 'Время работы, отпуска, отметки о болезнях'
			},
			services: {
				icon: 'icon/services.png',
				header: 'Услуги',
				text: 'Услуги оказываемые сотрудником, его обязанности',
				panel : {
					header: 'Услуги',
					text: 'Каждый работник обязан выполнять определённую работу. Некоторые специалисты могут изменять вид деятельности в течение дня, а иногда способны оказывать разные услуги в одно и то же время. <br/>' +
							'Выберете виды деятельности в которых участвуют работники организации.'
				}
			},
			edit: {
				header: 'Редактировать информацию:',
				text: 'Обязательно заполните информацию о ваших работниках. Именно её увидят ваши клиенты когда будут записываться на приём.',
				name: 'ФИО',
				description: 'Информация'
			},
			create: {
				header: 'Создание (регистрация) нового сотрудника',
				text: 'Обязательно заполните информацию о ваших работниках. Именно её увидят ваши клиенты когда будут записываться на приём.',
				name: 'ФИО',
				description: 'Информация'
			},
			
			edit_tip: 'Изменить информацию о сотруднике',
			remove_tip: 'Удалить сотрудника',
			add_tip: 'Добавить сотрудника',
			
			to_remove_message: 'Вы действительно хотите уничтожить данные о сотруднике?'
		},
		schedule: {
			save_confirm: 'Вы действительно хотите сохранить?'
		}
	};
	
	g_locale.user_cabinet = {
		tip1:	'<div class="info-block-centered">' +
				'Панель "Мои записи": ' +
				'после регистрации в системе Вы можете не ' +
				'только удалённо записываться на приём, ' +
				'но и просматривать все Ваши прошлые планы, ' +
				'воспользовавшись панелью пользовательских планов (записей). ' +
				'Просто введите Ваш номер телефона и пароль.<br/>' +
				'</div>',
		tip2:	'<div class="info-block-centered">' +
				'Для регистрации в системе нажмите кнопку "Регистрация". ' +
				'Если Вы забыли свой пароль,' +
				'нажмите кнопку "Я забыл свой пароль!"' +
				'и мы пришлём Вам по смс новый' +
				'(не чаще чем один раз в сутки).' +
				'</div>',
		login: {
			header: 'Личный кабинет',
			phone_input: {
				header: 'Телефонный номер:'
			},
			password_input: {
				header: 'Пароль:'
			},
			register_tip: 'Регистрация. Нажмите, если Вы новый пользователь.',
			login_button: {
				text: 'Войти',
				tip: 'Войти в свой личный кабинет'
			},
			remind_button: {
				text: 'Я забыл пароль!',
				tip: 'Если Вы забыли свой пароль, нажмите эту кнопку, чтобы мы напомнили его Вам'
			},
			register_button: {
				text: 'Регистрация',
				tip: 'Вы должны зарегистрироваться, чтобы воспользоваться сервисом Япозаписи.ru'
			}
		},
		register: {
			header: 'Регистрация',
			confirm_text: 'Я согласен с условиями пользовательского соглашения',
			show_contract_button: {
				icon: 'icon/book.png',
				header: 'Показать условия'
			},
			register_button: {
				icon: 'something.png',
				header: 'Регистрация'
			},
			you_should_confirm: 'Для регистрации необходимо подтвердить, что Вы согласны с условиями пользовательского соглашения',
			you_have_been_registered: 'Поздравляем, Вы успешно зарегистрированы в Япозаписи.ru',
			name_input: {
				header: 'ФИО (не обязательно):'
			}
		},
		contract: {
			header: 'Пользовательское соглашение (ЯПЗ-Б)'
		},
		plans: {
			logout_button: {
				tip: 'Выйти'
			}
		}
	};
	
	g_locale.toolbar_icon = {
		'edit_toolbar_icon': '../images/toolbar/icon-edit.png',
		'save_toolbar_icon': '../images/toolbar/icon-save.png',
		'add_toolbar_icon': '../images/toolbar/icon-add2.png',
		'create_toolbar_icon': '../images/toolbar/create.png',
		'remove_toolbar_icon': '../images/toolbar/icon-delete2.png',
		'logout_toolbar_icon': '../images/toolbar/icon-exit.png',
		'ok_toolbar_icon': '../images/toolbar/icon-ok2.png',
		'ok_small_toolbar_icon': '../images/toolbar/icon-ok.png',
		'print_toolbar_icon': '../images/toolbar/icon-print.png',
		'ok_toolbar_icon_disabled': '../images/toolbar/icon-ok2-disabled.png'
	};
	
	g_locale['switch'] = {
		'yes': 'Да',
		'no': 'Нет'
	};
}

console.log('index.locale.ru.js executed');