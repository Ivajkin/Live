/*global get_user_services_from_base: false, Class: false, window: false, assert: false, Raphael: false, $: false, get_facilities_from_base: false, getDaysInMonthCount: false, isNumber: false, is_valid_date: false, sort: false, get_standard_date: false, parse_standard_date: false, console: false */

// Raphaёl objects styles.
var styles = {
	/*interval_pie: {
	 color : '#fff',
	 opacity : 0.902,
	 'border-color' : '#000',
	 'border-opacity' : 0.77
	 },*/
	usable_space_rect : {
		select : {
			color : "#68b881",
			opacity : 0.78,
			time : 300
		},
		select2x : {
			color : "#62b2a5",
			opacity : 1.0,
			time : 300
		},
		hover : {
			color : "#D89841",
			opacity : 0.47,
			time : 500
		},
		normal : {
			color : "#68b841",
			opacity : 0.27,
			time : 200
		}
	}
};


/**
 * service_type - тип услуги, для которой строится расписание.
 * resources - список ресурсов, для которых строится расписание
 *		(набор ресурсов выбранной больницы, способных оказать эту услугу или конкретный выбранный).
 * callback - туда посылаются данные об выбраном интервале.
 */
function ResourceScheduler(/** Object */ resource,  /** Function */ on_setup_selection, /** Date */ current_date, /** Function */ on_set_date) {
	assert(window.helper.is('Function', on_setup_selection), 'Wrong 2nd argument in ResourceScheduler()');
	assert(current_date && current_date.getDate, 'Wrong 3rd argument in ResourceScheduler()');
	assert(window.helper.is('Function', on_set_date), 'Wrong 4th argument in ResourceScheduler()');
	
	/*
	 * Raphael paper - main class to draw everything.
	 */
	var paper;
	/*
	 * Width, height of the usable canvas area.
	 */
	var width = 520, height = 440;
	var cellPX = 50, cellPY = 45;
	/*
	 * Cell sizes (day, half an hour).
	 */
	var dx = Math.ceil((width - cellPX) / 7), dy = Math.ceil((height - cellPY) / 24);
	var margin = 3;
	

	// dy : 60 min
	// ? : n min
	var time_marg = 5;
	function day2x(day) {
		return cellPX + day * dx;
	}

	function min2y(minutes) {
		return time_marg + cellPY + 2 * dy * (minutes / 60 - 8);
	}

	function x2day(x) {
		return Math.floor((x - cellPX) / dx);
	}

	function y2min(y) {
		return Math.round((((y - cellPY - time_marg) / dy) / 2 + 8) * 60);
	}
	
	/**
	 * Текущий выбранный интервал.
	 */
	var selected_interval = null;
	
	/**
	 * Первый выбранный кусок при выборе интервала.
	 */
	var IntervalStartSelected = new Class({
		interval: null,
		select: function(interval) {
			this.interval = interval;
		},
		clear: function() {
			this.interval = null;
		},
		is_selected: function() /** boolean */ {
			return !!this.interval;
		},
		get_start: function() /** number */ {
			return this.interval.start;
		},
		get_finish: function() /** number */ {
			return this.interval.finish;
		},
		get_day: function() /** number */ {
			return this.interval.day_number;
		}
	});
		
	var editModeEnabled = false;
	
	assert(resource && window.helper.is('Function', on_setup_selection), 'Invalid arguments: ResourceScheduler(' + [resource, on_setup_selection].join(', ') + ')');
	
	var today = new Date();
	
	var intervals_info = {
		days: [
			[], [], [], [], [], [], []
		]
	};
	var len = 15;
	var count = Math.floor(12*60 / len);
	for(var day = 0; day < 7; ++day) {
		var start = 8 * 60;
		for(var inter_num = 0; inter_num < count; ++inter_num) {
			var interval_data = {
						work_start_time_minutes: start,
						time_to_complete_service: len
			};
			var interval = new Interval(interval_data.work_start_time_minutes, interval_data.time_to_complete_service, today, null, null);
			intervals_info.days[day].push(interval);
			start += len;
		}
	}
	
	var IntervalPie = null;
	
	// TODO комментарии.
	
	var SelectionManager = new Class({
		// По датам
		selections: [],
		get: function() /** array */ {
			var previus_length = this.selections.length;
			this.selections = this.selections.filter(function(selection) {
				return selection.start && selection.finish;
			});
			if(this.selections.length !== previus_length) {
				if(console) {
					console.log('Some intervals of selections in SelectionManager was removed. Delta = ' + (previus_length - this.selections.length));
				}
			}
			return this.selections;
		},
		/**
		 * Создаём выделение.
		 * date - дата, строка в формате "14.11.2011"
		 * Создаём если даже не на этой неделе.
		 */
		create: function(/* string */date_string, /** number, 8*60 = 8:00 */ minutes_start, /** number */ minutes_finish, /** array */ service_type_ids) {
			var params_stringified = [JSON.stringify(date_string), JSON.stringify(minutes_start), JSON.stringify(minutes_finish), JSON.stringify(service_type_ids)].join(', ');
			assert(is_valid_date(date_string), 'Invalid parameter date_string in selectionManager.create(' + params_stringified + ')');
			assert(isNumber(minutes_start), 'Invalid parameter minutes_start in selectionManager.create(' + params_stringified + ')');
			assert(isNumber(minutes_finish), 'Invalid parameter minutes_finish in selectionManager.create(' + params_stringified + ')');
			assert(service_type_ids, 'Invalid parameter service_type_ids in selectionManager.create(' + params_stringified + ')');
			
			var interval = new IntervalPie(minutes_start, minutes_finish, date_string, service_type_ids);

			this.selections.push(interval);
			
			// День находится на этой неделе, значит можно его отрисовать.
			var is_date_on_week = false;
			var date = parse_standard_date(date_string);
			for(var d = new Date(current_date), i = 0; i<7; d.setDate(d.getDate()+1), ++i) {
				if(d.toDateString() === date.toDateString()) {
					is_date_on_week = true;
					break;
				}
			}
			
			if(is_date_on_week) {
				interval.makeVisible();
				// Опять особенности javascript дат приходится нивелировать.
				var day_number = (date.getDay() + 6) % 7;
				var rects = UsableSpaceRectangle.s_rects;
				for(var i = 0; i < rects.length; ++i) {
					if(rects[i].day_number === day_number && rects[i].start >= minutes_start - 3 && rects[i].start <= minutes_finish && rects[i].finish >= minutes_start && rects[i].finish <= minutes_finish + 3 ) {
						rects[i].fadeUp(interval);
						interval.visual.bars.push(rects[i]);
					}
				}
			}
		},
		remove: function(selection) {
			var day = selection.day;
			for(var key in this.selections[day]) {
				if(this.selections[day][key] === selection) {
					this.selections[day][key] = null;
					delete this.selections[day][key];
					break;
				}
			}
		}
	});
	var selectionManager = new SelectionManager();
	
	/*
	 * Кусок времени.
	 */
	IntervalPie = new Class({
		initialize: function(/** Number */ minutes_start, /** Number */ minutes_finish, /** String */ date_string, /** Array of Number */ service_type_ids) {
			assert(isNumber(minutes_start) && isNumber(minutes_finish) && is_valid_date(date_string) && service_type_ids, 'Error creating interval: invalid arguments');
			this.start = minutes_start;
			this.finish = minutes_finish;
			this.date = date_string;
			this.service_type_ids = service_type_ids;
		},
		makeVisible: function() {
			var date_numbers = this.date.split('.');
			var daten = parseInt(date_numbers[0], 10),
				monthn = parseInt(date_numbers[1], 10),
				yearn = parseInt(date_numbers[2], 10);
			var pieDate = new Date(yearn, monthn - 1, daten);
			var day = pieDate.getDay() - 1;
			// Формат даты в javascript
			// Если был 0, значит было воскресенье.
			if(day === -1) {
				day = 6;
			}
			
			var date_range = dateRange(current_date, pieDate);
			this.visual.border = paper.rect(day2x(day) + margin, min2y(this.start), dx - 2 * margin, min2y(this.finish) - min2y(this.start))
			/*.attr({
			 color : styles.interval_pie.color,
			 opacity : styles.interval_pie.opacity,
			 'border-color' : styles.interval_pie['border-color'],
			 'border-opacity' : styles.interval_pie['border-opacity']
			 })*/;
			try {
				this.visual.border.node.className += "interval_pie";
			} catch(e) {
				if(console) {
					console.log(e);
				}
			}
		},
		/**
		 * Копируем этот интервал на следующие недели.
		 */
		clone_weeks_forward: function(/** Number */ week_count) {
			assert(window.helper.is('Number', week_count), 'Wrong argument in IntervalPie.clone_weeks_forward()');
			
			var date = parse_standard_date(this.date);
			for(var i = 0; i < week_count; ++i) {
				date.setDate(date.getDate() + 7);
				var date_string = get_standard_date(date);
				selectionManager.create(date_string, this.start, this.finish, this.service_type_ids);
			}
		},
		id : Math.random(),
		date : null,
		start : null,
		finish : null,
		service_type_ids : null,
		visual : {
			border : null,
			bars : []
		},
		select : function() {
			this.visual.bars.forEach(function(bar) {
				bar.animate.select2x(bar.visual);
			});
			if(selected_interval) {
				selected_interval.unselect();
			}
			selected_interval = this;
		},
		unselect : function() {
			this.visual.bars.forEach(function(bar) {
				bar.animate.select(bar.visual);
			});
			selected_interval = null;
		},
		dispose : function() {
			selectionManager.remove(this);
			
			this.visual.border.remove();

			this.visual.bars.forEach(function(bar) {
				bar.fadeDown();
			});
			var day = this.day;
			delete this.id;
			delete this.day;
			delete this.start;
			delete this.finish;
			delete this.visual;
		}
	});
	
	
	// Меняем для текущего выделения услуги, которые можем оказывать.
	this.set_selected_interval_service_type_ids = function( /** Array */service_type_ids) {
		assert(selected_interval, 'Нет selected_interval в set_selected_interval_service_type_ids()');
		assert(service_type_ids.length, 'Неверный аргумент в set_selected_interval_service_type_ids()');
		service_type_ids.forEach(function(service_type_id) {
			assert(isNumber(service_type_id), 'Неверный аргумент в set_selected_interval_service_type_ids()');
		});
		
		selected_interval.service_type_ids = service_type_ids;
	};
	
	/**
	 * Parse daytime to string. Ex: [8, 30] -> '8:30'
	 */
	function time2string( /**Array */ daytime) {
		assert(isNumber(daytime[0]) && isNumber(daytime[1]), 'Invalid arguments in time2string()');
		return daytime[0] + ':' + (daytime[1] < 10 ? '0' : '') + daytime[1];
	}
	assert(time2string([8, 30]) === '8:30', 'time2string() wont work');
	assert(time2string([12, 25]) === '12:25', 'time2string() wont work');
	assert(time2string([8, 5]) === '8:05', 'time2string() wont work');



	var hover_mouse_set = function() {
		document.body.style.cursor = "pointer";
	};
	var normal_mouse_set = function() {
		document.body.style.cursor = "default";
	};
	
	// Первый выбранный кусок при выборе интервала.
	var interval_start_selected = new IntervalStartSelected();
	
	var UsableSpaceRectangle = new Class({
		initialize : function(start, finish) {
			this.start = start;
			this.finish = finish;
			// Добавляем к общему списку этих элементов.
			UsableSpaceRectangle.s_rects.push(this);

			this.finish = this.start + Math.max(/*Scroller.height*/dy, this.finish - this.start);
		},
		make_visible : function(day_number) {
			this.day_number = day_number;
			//var length = this.finish - this.start;
			var x = day2x(day_number), y = min2y(this.start), height = min2y(this.finish) - y, width_margin = 5;
			this.visual = paper.rect(x + width_margin, y, dx - margin - width_margin, height - margin);
			this.visual.parent = this;
			this.animate.normal(this.visual, true);
			
			this.visual.hover(function() {
					if(editModeEnabled) {
						hover_mouse_set();
						if(!this.parent.connected_interval) {
							this.parent.animate.hover(this);
						}
					}
				}, function() {
					if(editModeEnabled) {
						normal_mouse_set();
						if(!this.parent.connected_interval) {
							var is_this_selected = interval_start_selected.is_selected() && interval_start_selected.get_day() === this.parent.day_number && interval_start_selected.get_start() === this.parent.start && interval_start_selected.get_finish() === this.parent.finish;
							if(!is_this_selected) {
								this.parent.animate.normal(this);
							}
						}
						
					}
				});
			this.visual.click(function() {
				if(editModeEnabled) {
					this.parent.onclick();
				}
			});
		},
		// Attaches interval if it start is in, returns true, else returns false.
		attach : function(interval) {
			var time_intervals_are_splitted = true;
			if(time_intervals_are_splitted) {
				return false;
			} else {
				if(interval.work_start_time_minutes <= this.finish + 3) {
					this.finish = Math.max(interval.work_start_time_minutes + interval.to_complete_service_time, this.finish);
					return true;
				} else {
					return false;
				}
			}
		},
		// Событие по нажатию на кусок. 
		onclick: function() {
			if(interval_start_selected.is_selected()) {
				// Если выбран правильный интервал, начало и конец в одни день, начало до конца и нажатый кусок не относится к какому-то интервалу уже, то вызываем событие.
				if(this.day_number === interval_start_selected.get_day() && interval_start_selected.get_start() !== this.finish && !this.connected_interval) {
					// TODO: Но если, всё таки, промежуточные куски относятся к другим интервалам, то отменяем выделение.
					var dayNum = this.day_number;
					var date_string = (function() {
						var date_count = 0;
						for(var date = new Date(current_date); (date.getDay() ? date.getDay() : 7) !== dayNum + 1; date.setDate(date.getDate() + 1)) {
							assert(date_count > -1 && date_count < 364, 'При поиске дня вышли за пределы UsableSpaceRectangle.onclick()');
							date_count++;
						}
						return get_standard_date(date);
					}) ();
					var start_minutes = null,
						finish_minutes = null;
					// Если старт и финиш перепутаны меняем их местами.
					if(interval_start_selected.get_start() > this.finish) {
						start_minutes = this.start;
						finish_minutes = interval_start_selected.get_finish();
					} // Иначе распологаем обычным образом.
					else {
						start_minutes = interval_start_selected.get_start();
						finish_minutes = this.finish;
					}
					selectionManager.create(date_string, start_minutes, finish_minutes, resource.service_type_ids);
					interval_start_selected.clear();
				}// Иначе чистим выборку.
				else {
					interval_start_selected.clear();
				}
			} else {
				// Если не принадлежит чужому интервалу.
				if(!this.connected_interval) {
					interval_start_selected.select(this);
				}
			}
			
			/**
			 * Подсвечиваем выделенный блок - если на один из соседних, связанных нажали.
			 */
			if(this.connected_interval) {
				on_setup_selection(this.connected_interval);
				this.connected_interval.select();
			}
		},
		connected_interval: null,
		/**
		 * Подсвечиваем и связывем при нажатии.
		 */
		fadeUp : function(interval_to_connect) {
			var id = interval_to_connect.id;
			assert(isNumber(id), 'interval_to_connect must have id in UsableSpaceRectangle.fadeUp()');
			this.connected_interval = interval_to_connect;
			this.animate.select(this.visual);
		},
		/**
		 * Гасим при unbind.
		 */
		fadeDown : function() {
			this.connected_interval = null;
			this.animate.normal(this.visual);
		},
		// In minutes
		start : null,
		finish : null,
		previous: null,
		day_number: null,
		animate: {
			animate: function(visual, color, opacity, time) {
				var param_string = [visual, color, opacity, time].join(', ');
				assert(visual && window.helper.is('String', color) && isNumber(opacity) && isNumber(time), 'Invalid parameters UsableSpaceRectangle.animate.animate(' + param_string + ')');
				visual.stop().animate({
					fill : color,
					opacity : opacity,
					"stroke-opacity" : 0
				}, time);
			},
			select: function(visual, special_color) {
				var style = styles.usable_space_rect.select;
				assert(visual, 'Invalid parameters UsableSpaceRectangle.animate');
				var color = (special_color ? special_color : style.color), opacity = style.opacity, time = style.time;
				this.animate(visual, color, opacity, time);
			},
			select2x: function(visual) {
				var style = styles.usable_space_rect.select2x;
				assert(visual, 'Invalid parameters UsableSpaceRectangle.animate');
				var color = style.color, opacity = style.opacity, time = style.time;
				this.animate(visual, color, opacity, time);
			},
			hover: function(visual) {
				var style = styles.usable_space_rect.hover;
				assert(visual, 'Invalid parameters UsableSpaceRectangle.animate');
				var color = style.color, opacity = style.opacity, time = style.time;
				this.animate(visual, color, opacity, time);
			},
			normal: function(visual, init) {
				var style = styles.usable_space_rect.normal;
				assert(visual, 'Invalid parameters UsableSpaceRectangle.animate');
				var color = style.color, opacity = style.opacity, time = (init ? 0 : style.time);
				this.animate(visual, color, opacity, time);
			}
		}
	});
	UsableSpaceRectangle.s_rects = [];


	// Управляет выделением цветом целого дня если есть хоть один интервал для выбора,
	// выделением красным если нет, надписями о дате и времени.
	var Background = {
		day_fillers : [],
		setDayFiller : function(index, day_filler) {
			this.day_fillers[index] = day_filler;
		},
		setDayFillerInvalid : function(index) {
			this.day_fillers[index].attr({
				fill : '#f9a0a0',
				opacity : 0.25
			});
		}
	};
	function drawCalendarBackground() {
		// Creating cells (for week).
		var rects = [];
		// Header
		var weekDays = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
		var months = ["декабря", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября"];

		var activate_header_animation = function(event) {
			document.body.style.cursor = "pointer";
			this.brother.attr({
				fill : "#fb7"
			});
		};
		var normal_header_animation = function(event) {
			this.brother.attr({
				fill : "#fff"
			});
			document.body.style.cursor = "default";
		};
		var date = new Date(current_date);
		// Days. Dates + white day filler.
		for(var i = 0; i < 7; i++) {
			var where = [i * dx + cellPX, -2 * dy + cellPY];
			// Creating rectangle (day label).
			var r = paper.rect(where[0] + margin, where[1] - margin * 2, dx - margin * 2, 30).attr("fill", "90-#fff-#f9ea86").attr("stroke", "#bbb").attr("opacity", 0.5);
			r.week_day_number = i;
			
			// Сегодня ли.
			var is_date_today = (date.toDateString() === today.toDateString());
			
			var label = weekDays[(i + 1) % 7] + (is_date_today ? '\n(сегодня)' : '\n' + date.getDate() + '.' + (date.getMonth() + 1));

			assert(label, 'Надпись с днём выбрана неправильно.');
			date.setDate(date.getDate() + 1);
			// Текст (напр: ПН 16.09).
			var header_text = paper.text(where[0] + dx / 2, where[1] + dy / 2, label).attr({
				font : "Comic Sans MS",
				"font-size" : 11,
				fill : (is_date_today ? "#9d252c" : "#255b94")
			});
			header_text.week_day_number = i;

			var day_filler = paper.rect(where[0] + margin, where[1] + dy * 2 - margin, dx - margin - 1, dy * 28 - margin).attr({
				fill : '#fff',
				opacity : 0.25,
				'stroke-opacity' : 0
			});
			Background.setDayFiller(i, day_filler);
		}

		for(var j = 0; j < 13; j++) {
			var y = min2y((j + 8) * 60);
			var time_label = '' + (j + 8) + ':00';
			paper.text(cellPX - 20, y, time_label).attr({
				"font-size" : 11,
				fill : "#fff"
			});
			/*var small_label_y = min2y((j + 8)*60 + 30);
			 time_label = '' + (j + 8) + ':30';
			 paper.text(cellPX - 20, small_label_y, time_label)
			 .attr({
			 "font-size", 9,
			 fill: "#444"
			 });*/
		}
		// Отрисовываем легенду расписания.
		var drawLegendItem = function( /* string */ color, /* number/real */ opacity, /* string */ text, /* number/integer */ position) {
			assert(window.helper.is('String', color), 'Wrong 1st argument in drawLegendItem()');
			assert(window.helper.is('Number', opacity), 'Wrong 2nd argument in drawLegendItem()');
			assert(window.helper.is('String', text), 'Wrong 3rd argument in drawLegendItem()');
			assert(window.helper.is('Number', position), 'Wrong 4th argument in drawLegendItem()');
			
			var x = day2x(7) + 10,
				y = min2y((position*2 + 7) * 60);
			var rect_width = 10;
			paper.rect(x, y - rect_width/2.0, rect_width, rect_width).attr({
				fill: color,
				opacity: opacity,
				'border-color': '#000',
				'border-opacity': 1.0
			});
			paper.text(x, y + 25, text).attr({
				"font-size" : 11,
				fill : "#fff",
				'text-anchor':'start'
			});
		};
		drawLegendItem(styles.usable_space_rect.normal.color,
						styles.usable_space_rect.normal.opacity, 'свободное\nвремя', 1);
		drawLegendItem(styles.usable_space_rect.select.color,
						styles.usable_space_rect.select.opacity, 'рабочее\nвремя', 2);
		drawLegendItem(styles.usable_space_rect.select2x.color,
						styles.usable_space_rect.select2x.opacity, 'выбранное\nрабочее\nвремя', 3);
		

		function UnitTest2Day() {
			for(var i = 0; i < 20; ++i) {
				var day = Math.floor(Math.random() * 7);
				if(x2day(day2x(day)) !== day) {
					return false;
				}
			}
			return true;
		}

		function UnitTest2Time() {
			for(var i = 0; i < 20; ++i) {
				var time = Math.floor(Math.random() * 14 * 60 + 8 * 60);
				var time2 = Math.round(y2min(min2y(time)));
				if(time2 !== time) {
					return false;
				}
			}
			return true;
		}

		assert(UnitTest2Day(), "Day to coordinates convertion is invalid!");
		assert(UnitTest2Time(), "Time to coordinates convertion is invalid!");

		var day_filled = {};
		for(var day_num = 0; day_num < intervals_info.days.length; day_num++) {
			if(intervals_info.days[day_num]) {
				intervals_info.days[day_num] = sort(intervals_info.days[day_num], is_after);
				// Если есть хоть один итервал для выбора.
				if(intervals_info.days[day_num].length) {
					var current_rect = new UsableSpaceRectangle(intervals_info.days[day_num][0].work_start_time_minutes, intervals_info.days[day_num][0].work_start_time_minutes + intervals_info.days[day_num][0].time_to_complete_service);
					for(var int_num = 0; int_num < intervals_info.days[day_num].length; int_num++) {
						//var
						if(!current_rect.attach(intervals_info.days[day_num][int_num])) {
							current_rect.make_visible(day_num);
							current_rect = new UsableSpaceRectangle(intervals_info.days[day_num][int_num].work_start_time_minutes, intervals_info.days[day_num][int_num].work_start_time_minutes + intervals_info.days[day_num][int_num].to_complete_service_time);
						}
					}
					current_rect.make_visible(day_num);
					day_filled[day_num] = true;
				} else {
					// Иначе красим филлер в красный цвет.
					Background.setDayFillerInvalid(day_num);
				}
			}
		}
		// Те дни, в которые услуга не оказывается вообще красим в красный цвет.
		for(var i = 0; i < 7; ++i) {
			if(!day_filled[i]) {
				Background.setDayFillerInvalid(i);
			}
		}

		paper.canvas.onmousemove = function(e) {
			var event = e || window.event;

			var day = x2day(event.offsetX);
			var day_intervals = intervals_info.days[day];
			var time = y2min(event.offsetY);
			var closest_length = 999999;
			var selected_interval = null;
			var interval_for_easy_selection = intervals_info.average_interval_duration / 2;
			for(var i = 0; day_intervals && i < day_intervals.length; ++i) {
				var len = Math.abs(time - interval_for_easy_selection - day_intervals[i].work_start_time_minutes);
				if(len < closest_length) {
					closest_length = len;
					selected_interval = day_intervals[i];
				}
			}
			/*if(selected_interval && UsableSpaceRectangle.s_rects.interval !== selected_interval) {
				if(!Scroller.s_singleton || !Scroller.s_singleton.selected) {
					var s = new Scroller(selected_interval, day);
					readable_info_callback(s.interval.getHumanReadableString());
				}
			}*/
		};

		paper.canvas.onmousedown = function(event) {
			if(Scroller.s_singleton && Scroller.s_singleton.selected) {
				Scroller.s_singleton.selected = false;
			}
		};
	}

	/**
	 * Disable dragging for element
	 */
	function disableDraggingFor(element) {
		// this works for FireFox and WebKit in future according to http://help.dottoro.com/lhqsqbtn.php
		element.draggable = false;
		// this works for older web layout engines
		element.onmousedown = function(event) {
			event.preventDefault();
			return false;
		};
	}
	
	
	/*
	 * Draw the calendar (once).
	 */
	function drawCalendar() {
		try {
		paper = new Raphael("calendar_canvas", '100%', '100%');
		} catch(e) {
			if(console) {
				console.log(e);
			}
		}
		drawCalendarBackground();

		disableDraggingFor(document.getElementById('calendar_canvas'));
		$(document.body).addEvent("dragstart", function() {
			return false;
		});
		

		var DayNavigationArrows = new Class({
			initialize : function() {
				this.left = new Arrow(paper, 'left', day2x(-0.35), 15, this.move_left_date);
				this.right = new Arrow(paper, 'right', day2x(7.35), 15, this.move_right_date);

				this.left.setBrother(this.right);
				this.right.setBrother(this.left);
				
				var that_monday = new Date(today);
				that_monday.setDay(1);

				if(dateRange(current_date, that_monday) < 7) {
					this.left.disable();
				}
			},
			move_left_date : function() {
				if(!this.parent.is_disabled) {
					/*var changed_date = new Date(current_date);
					changed_date.setDate(changed_date.getDate() - 7);
					paper.clear();
					//drawCalendar();
					paper.remove();
					var rs = new ResourceScheduler(resource, on_setup_selection, changed_date);*/
					/*current_date.setDate(current_date.getDate() - 7);
					drawCalendarBackground();
					drawCalendar();
					createExistingSchedule(resource);*/
					var changed_date = new Date(current_date);
					changed_date.setDate(changed_date.getDate() - 7);
					on_set_date(changed_date);
				}
			},
			move_right_date : function() {
				if(!this.parent.is_disabled) {
					/*var changed_date = new Date(current_date);
					changed_date.setDate(changed_date.getDate() + 7);
					paper.clear();
					//drawCalendar();
					paper.remove();
					var rs = new ResourceScheduler(resource, on_setup_selection, changed_date);*/
					/*current_date.setDate(current_date.getDate() + 7);
					drawCalendarBackground();
					drawCalendar();
					createExistingSchedule(resource);*/
					var changed_date = new Date(current_date);
					changed_date.setDate(changed_date.getDate() + 7);
					on_set_date(changed_date);
				}
			},
			left : null,
			right : null
		});
		var nav = new DayNavigationArrows();
	}

	/*
	 * Call at document load.
	 */
	drawCalendar();
	
	
	// Общий для createExistingSchedule() и getState(), остальные не имеют право использовать.
	// Что-то вроде private(createExistingSchedule, getState) Object user_service = null;
	// Текущая пользовательская услуга, для которой мы меняем расписание.
	var user_service = null;
	// Создаём расписание для текущего ресурса (работника).
	function createExistingSchedule(resource) {
		get_user_services_from_base(function(user_services) {
			assert(resource, 'Invalid argument resource while createExistingSchedule(' + resource + ')');
			for(var i = 0; i < user_services.length; ++i) {
				if(parseInt(user_services[i].resource_id, 10) == parseInt(resource.id, 10)) {
					user_service = user_services[i];
					break;
				}
			}
			user_service.available_time.forEach(function(interval) {
				var time_reg = /(\d+)[^\d]*:[^\d]*(\d+)/;
				var start_match = time_reg.exec(interval.start),
					finish_match = time_reg.exec(interval.finish);
				assert(
					isNumber(start_match[1]) &&
					isNumber(start_match[2]) &&
					isNumber(finish_match[1]) &&
					isNumber(finish_match[2]),
					'Time not parsed successfull');
				var start_minutes = parseInt(start_match[1], 10)*60 + parseInt(start_match[2], 10),
					finish_minutes = parseInt(finish_match[1], 10)*60 + parseInt(finish_match[2], 10);
					
				var service_type_ids = interval.service_type_ids;
				assert(service_type_ids, 'Не существует service_type_ids у интервала в createExistingSchedule()');
				var date = interval.date;
				assert(date, 'Не существует date у интервала в createExistingSchedule()');
				
				selectionManager.create(date, start_minutes, finish_minutes, service_type_ids);
			});
		});
	}
	createExistingSchedule(resource);
	
	
	// Получаем данные о текущем состоянии расписания для пользовательской услуги для ресурса и посылаем их в callback с остальными данными user_service, которые мы не меняли.
	this.getState = function( /** Function */ callback) {
		assert(window.helper.is('Function', callback), 'callback не является функцией при вызове getState(' + callback + ')');
		assert(user_service, 'user_service не существует при вызове getState(' + callback + ')');
		// TODO: менять данные перед отправкой.
		var user_service_available_time = [];
		selectionManager.get().forEach(function(selection) {
			assert(selection && window.helper.is('String', selection.date) && isNumber(selection.start) && isNumber(selection.finish) && selection.service_type_ids, 'selection неправильно сформирован! getState() для составления расписания. selection: ' + selection);
			var start_hour = Math.floor(selection.start / 60),
				finish_hour = Math.floor(selection.finish / 60);
			var start_minutes = Math.floor(selection.start - start_hour*60),
				finish_minutes = Math.floor(selection.finish - finish_hour*60);
				
			var time = [time2string([start_hour, start_minutes]), time2string([finish_hour, finish_minutes])];
			assert(window.helper.is('String', time[0]) && window.helper.is('String', time[1]), 'Timestring must be a string in getState()');
			user_service_available_time.push({
				start: time[0],
				finish: time[1],
				service_type_ids: selection.service_type_ids,
				date: selection.date
			});
		});
		user_service.available_time = user_service_available_time;
		//alert(JSON.stringify(user_service));
		//throw -1;
		// Если данные правдоподобные - можно отсылать.
		callback(user_service);
	};
	
	/**
	 * Начинаем изменять календарь.
	 */
	this.startEdit = function( /** Function */ callback) {
		editModeEnabled = true;
		callback();
	};
}