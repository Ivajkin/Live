/*global makeRequest: false, get_user_services_from_base: false, Class: false, window: false, assert: false, Raphael: false, $: false, get_facilities_from_base: false, getDaysInMonthCount: false, sort: false */

var Interval = new Class({
	initialize: function(work_start_time_minutes, to_complete_service_time, date, resource, service_cost) {
		
		this.work_start_time_minutes = work_start_time_minutes;
		this.to_complete_service_time = to_complete_service_time;
		this.resource = resource;
		this.sevice_cost = service_cost;
		
		this.human_readable_time = (function() {
			var hour = Math.floor(this.work_start_time_minutes / 60);
			var minutes = Math.round(this.work_start_time_minutes - hour * 60);
			var end_minutes = Math.round(minutes + this.to_complete_service_time);
			var end_hour = hour;
			while(end_minutes >= 60) {
				end_minutes -= 60;
				end_hour++;
			}
			return "" + hour + ":" + (minutes < 10 ? '0' : '') + minutes + "-" + end_hour + ":" + (end_minutes < 10 ? '0' : '') + end_minutes;
		}.bind(this)) ();					
		this.human_readable_date = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear();
	},
	work_start_time_minutes: null,
	to_complete_service_time: null,
	human_readable_time : null,
	human_readable_date : null,
	resource : null,
	sevice_cost: null,
	getHumanReadableString : function() {
		return '<br/><strong>Когда:</strong> ' + this.human_readable_date + '<br/>' + '<strong>Время приёма:</strong> ' + this.human_readable_time + '.<br/>' + '<strong>Специалист:</strong> ' + this.resource.name;
	},
	getHumanReadableTableString : function() {
		return '<br/>' +
				'<table style="width: 100%">' +
					'<tr>' +
						'<td style="margin-right: 50px;">' + '<strong>Когда:</strong> ' + this.human_readable_date + '</td>' +
						'<td style="margin-right: 50px;">' + '<strong>Время приёма:</strong> ' + this.human_readable_time + '.</td>' +
						'<td style="margin-right: 50px;">' + '<strong>Специалист:</strong> ' + this.resource.name + '</td>' +
					'</tr>' + 
				'</table>';
	}
});

// Создаём прямоугольники доступного времени.
var is_after = function(interval1, interval2) {
	return interval1.work_start_time_minutes > interval2.work_start_time_minutes;
};


// Week days.
Interval.dayName = function(date) {
	return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
};
// 10:35 -> 10*60+35
Interval.convert_timestring_to_minutes = function (timestring) {
	var reg = /(\d+):(\d+)/;
	var match = reg.exec(timestring);
	return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

var hover_mouse_set = function() {
	document.body.style.cursor = "pointer";
};
var normal_mouse_set = function() {
	document.body.style.cursor = "default";
};

var Arrow = new Class({
	initialize : function(paper, direction, x, y, onclick) {
		if(direction === 'left') {
			this.visual = paper.image("media/images/calendar/prev.png", x - 10, y - 6, 24, 24);
		} else if(direction === 'right') {
			this.visual = paper.image("media/images/calendar/next.png", x - 10, y - 6, 24, 24);
		} else {
			throw 'Wrong direction: ' + direction;
		}
		this.visual.parent = this;

		this.visual.hover(function() {
			if(!this.parent.is_disabled) {
				this.stop().animate({
					opacity : Arrow.active_opacity
				}, 200);
				hover_mouse_set();
			}
		}, function() {
			if(!this.parent.is_disabled) {
				this.stop().animate({
					opacity : Arrow.normal_opacity
				}, 200);
				normal_mouse_set();
			}
		});
		this.click_event = onclick;

		this.enable();
	},
	disable : function() {
		this.visual.attr({
			opacity : Arrow.disabled_opacity
		});
		this.visual.unclick();
		this.is_disabled = true;
	},
	enable : function() {
		this.visual.attr({
			opacity : Arrow.normal_opacity
		});
		this.visual.click(this.click_event);
		this.is_disabled = false;
	},
	setBrother : function(brother) {
		this.brother = brother;
	},
	is_disabled : false,
	visual : null,
	click_event : null,
	brother : null
});
Arrow.disabled_opacity = 0.4;
Arrow.normal_opacity = 0.7;
Arrow.active_opacity = 1;


/**
 * service_type - тип услуги, для которой строится расписание.
 * resource - ресурс, для которого строится расписание
 *		(набор ресурсов выбранной больницы, способных оказать эту услугу или конкретный выбранный).
 * callback - туда посылаются данные об выбраном интервале.
 */
function Scheduler(service_type, resource, user_service, selected_facility, callback, readable_info_callback, onload_callback, today_date) {
	var _arguments = [service_type, resource, selected_facility, callback, readable_info_callback, today_date];
	for(var i = 0; i < _arguments.length; ++i) {
		_arguments[i] = JSON.stringify(_arguments[i]);
	}
	var params_stringified = _arguments.join(', ');
	
	assert(service_type && resource && selected_facility && today_date, 'Invalid arguments: Scheduler(' + params_stringified + ')');
	assert(window.helper.is('Function', callback), 'Invalid arguments: Scheduler(' + params_stringified + ')');
	assert(window.helper.is('Function', readable_info_callback), 'Invalid arguments: Scheduler(' + params_stringified + ')');
	//assert(selected_facilities.length === 1, 'На данный момент всё рассчитано на то, что в selected_facilities будет 1 единственный элемент - показываем данные по одной больнице за раз.');
	
	var today = today_date || new Date();
	var currentDay = today.getDay();

	function prologise(user_services, resource, start_day, day_count, callback) {
		//TODO
		/*
		* Формируем рассписание начиная с текущего дня (start_day).
		* Возвращает: {
		*	max_interval_in_day_count: максимальное количество интервалов по выбранным дням.
		*	average_interval_duration: средняя длина промежутка времени.
		*	interval_count: кол-во интервалов всего.
		*	days: [список Дней начиная от start_day, всего day_count Дней]
		* };
		* День = [список Интервалов в этот день].
		*	Интервал = {
		*		to_complete_service_time: время в минутах для оказания услуги.
		*		work_start_time_minutes: число в минутах начиная с 00:00 этого дня, например 12:34 = 12*60+34 = 754,
		*		work_start_date: дата приёма, например 19/10/2011
		*		human_readable_date: например "12 июля",
		*		human_readable_time: например "12:30-12:35",
		*		sevice_cost: цена в рублях (строкой), например 1200 или 1289.50
		*		resource: данные о ресурсе в это время.
		*	};
		*/
		// TODO: со временем окуратнее, особенно под новый год.
		var days = [];
		var average_interval_duration = 0;
		var interval_count = 0;
		
		//TODO
		var on_schedule_info_get = function(schedule_info) {
			// schedule_info ~ [ schedule(servicename0,usr3,time(19,8,2011,8,45),time(19,8,2011,12,0)) ...
			var time_regex = /\(([^,]+),([^,]+),time\((\d+,\d+,\d+,\d+,\d+)\),time\((\d+,\d+,\d+,\d+,\d+)\)/g;
			for(; ; ) {
				var time_info = time_regex.exec(schedule_info);
				if(!time_info) {
					break;
				}
				var resource_id = parseInt(time_info[2], 10);
				//assert(resource_id === parseInt(resource.id, 10), 'Что-то случилось с resource в on_schedule_info_get()');
				/*var resource = null;
				for(var ri = 0; ri < resources.length; ++ri) {
					if(resource_id === parseInt(resources[ri].id, 10)) {
						resource = resources[ri];
						break;
					}
				}
				var user_service = null;
				for(var usi = 0; usi < user_services.length; ++usi) {
					if(parseInt(resource.id, 10) === parseInt(user_services[usi].resource_id, 10)) {
						user_service = user_services[usi];
					}
				}*/
				if(resource_id === parseInt(resource.id, 10)) {
					if(time_info[1] === 'servicename' + user_service.id/*service_type.id*/) {
	
						var regex = /(\d+),(\d+),(\d+),(\d+),(\d+)/;
						var match = [regex.exec(time_info[3]), regex.exec(time_info[4])];
						var date = [parseInt(match[0][1], 10), parseInt(match[1][1], 10)];
						var month = [parseInt(match[0][2], 10), parseInt(match[1][2], 10)];
						var year = [parseInt(match[0][3], 10), parseInt(match[1][3], 10)];
						var hour = [parseInt(match[0][4], 10), parseInt(match[1][4], 10)];
						var min = [parseInt(match[0][5], 10), parseInt(match[1][5], 10)];
						/*_date.setDate(date);
						_date.setMonth(month);
						_date.setYear(year);*/
						var _date = new Date(year[0], month[0]-1, date[0]);
						var day_number = dateRange(today, _date);
						if(!days[ day_number ]) {
							days[ day_number ] = [];
						}
						var start = Interval.convert_timestring_to_minutes(hour[0] + ':' + min[0]);
						var finish = Interval.convert_timestring_to_minutes(hour[1] + ':' + min[1]);
						
						// TODO!!!
						var deltaT = user_service.to_complete_service_time;
						if(( finish - start) > deltaT) {
							for(var time = start; time + deltaT <= finish; time += deltaT) {
								var interval = new Interval(time, deltaT, _date, resource, 12345);
								days[ day_number ].push(interval);
								average_interval_duration += deltaT;
								interval_count++;
							}
						} else {
							var interval = new Interval(start, finish - start, _date, resource, 12345);
							days[ day_number ].push(interval);
							average_interval_duration += deltaT;
							interval_count++;
						}
					}
				}
			}
			
		
			var max_interval_in_day_count = function() {
				var max = 0;
				days.forEach(function(max, day) {
					max = Math.max(days[day].length, max);
				}.bind(max));
				return max;
			} ();
			callback({
				max_interval_in_day_count: max_interval_in_day_count,
				average_interval_duration: average_interval_duration / interval_count,
				days: days
			});
		};
		var services = [user_service.id];
		/*user_services.forEach(function(user_service) {
			services.push(user_service.id);
		});*/
		
		var request = '/cmd/ask_schedule?service_type_ids=';
		request += JSON.stringify(services);
		request += '&facility_id=';
		request += selected_facility.id;
		request += '&intime=500000';
		
		makeRequest(request, function(result) {
			// TODO Запрос настоящий!!!
			var full_schedule_string = result;
			on_schedule_info_get(full_schedule_string);
			
			onload_callback();
		});
	}
	
	var createCalendar = function(user_services) {
		prologise(user_services, resource, today, 7, function(intervals_info) {

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
			var dx = Math.ceil(( width - cellPX) / 7), dy = Math.ceil(( height - cellPY) / 24);
			var margin = 3;
			
			var g_scale = [1,1];
			
				
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
	            return Math.floor(( x - cellPX) / dx);
	        }
	
	        function y2min(y) {
	            return Math.round(((( y - cellPY - time_marg) / dy) / 2 + 8) * 60);
	        }
			/*
			 * Converts time screen coordinates into index coordinates.
			 */
			/*function screen2index(screen_coord) {
				assert(screen_coord.length === 2, "Coordinates are invalid! function screen2index(screen_coord).");
	
				return [Math.floor((screen_coord[0] - cellPX) / dx / g_scale[0]), Math.floor((screen_coord[1] - cellPY) / dy / g_scale[1])];
			}*/
	
			/*
			 * Converts time index coordinates into screen coordinates.
			 */
			/*function index2screen(ij) {
				assert(ij.length === 2, "Coordinates are invalid! function index2screen(ij).");
	
				return [g_scale[0] * ij[0] * dx + cellPX, g_scale[1] * ij[1] * dy + cellPY];
			}*/
			
			/**
			 * Каретка выбора времени, двигающаяся за курсором мыши.
			 */
			var Scroller = new Class({
		        initialize : function(interval, day_number) {
		            if(Scroller.s_singleton) {
		                if(Scroller.s_singleton.selected) {
		                    return;
		                } else {
		                    Scroller.s_singleton.remove();
		                }
		            }
		            this.interval = interval;
		            
		            // y is above.
		            var start_time_y = min2y(interval.work_start_time_minutes);
		            var finish_time_y = min2y(interval.work_start_time_minutes + interval.to_complete_service_time);
		            var length_time_y = finish_time_y - start_time_y;
		            window.assert(length_time_y > 0, "Height is below 0");
		
		            var interval_y = start_time_y, interval_h = Math.max(length_time_y, margin*2);
		
		            var w = dx - margin - 5;
		            var x = day2x(day_number) + margin + 2,
		            // Если интервал слишком мал снапаемся к его концу а не началу.
		            // Но если очень рано этот приём (например в 8:00), тогда всё таки к
		            // началу.
		            y = start_time_y;
		
		            var interval_rect = paper.rect(x, interval_y, w, interval_h, 1);
		            function get_time_str(string) {
						return (/(\d+:\d+)-/).exec(string)[1];
		            }
		            assert(get_time_str('15:05-16:50') === '15:05', 'get_time_str() don\'t work');
		            assert(get_time_str('9:19-13:25') === '9:19', 'get_time_str() don\'t work');
		            var time_text = get_time_str(interval.human_readable_time);
		            this.visual = [
		            				paper.rect(day2x(0) - 50, y - 10, 40, 20),
		            				paper.text(x + 30, y + 5, interval.human_readable_time),
		            				paper.text(day2x(0) - dx/2, y, time_text),
		            				interval_rect
		            ];
					
					// Курсор с началом времени (пока красный).
					this.visual[0].attr({
						fill : "#e21",
						opacity : 0.75
					});
					
					// Текст - время выбранное, напр: 15:00-15:30
					this.visual[1].attr({
						fill : "#fff",
						"font-size": 10,
						// Пока невидимый.
						opacity: 0
					});
					
					// Текст на курсоре - начальное время оказания улуги, напр: 15:00
					this.visual[2].attr({
						fill : "#fff",
						"font-size": 12
					});
					
					
					// Само выделение (прямоугольник выбранного времени).
		            this.visual[3].attr({
		                fill : "#275a90",
		                opacity : 0.94,
		                "stroke-opacity": 0,
						// Пока невидимый.
						opacity: 0
		            });
		            var onclick = function() {
		                this.parent.selected =  /*!this.parent.selected*/true;
		                if(this.parent.selected) {
		                    callback(this.parent.interval);
		                }
		                
		                // Делаем видимым выделение времени и текст на нём.
		                this.parent.visual[1].attr({opacity: 1});
		                this.parent.visual[3].attr({opacity: 1});
		            };
		            
					for(var i = 0; i < this.visual.length; ++i) {
						this.visual[i].parent = this;
						this.visual[i].click(onclick);
						this.visual[i].hover(hover_mouse_set, normal_mouse_set);
					}
					//---------------------------------------------+
		            Scroller.s_singleton = this;
		        },
		        remove : function() {
					try {
			            this.visual[0].remove();
			            this.visual[1].remove();
			            this.visual[2].remove();
			            this.visual[3].remove();
					} catch(e) {
						// Возможно обновляли paper целиком.
						if(console) {
							console.log('Возможно обновляли paper целиком');
						}
						//console.log(e);
					}
		        },
		        interval : null
		    });
		    //Scroller.height = 1.2 * dy - margin;
		    
			/*
			 * Unit test!
			 * if screen2index( index2screen([2,2]) ) != [2,2]
			 * then fails.
			 */
			/*function UnitTest1() {
				function fails(op) {
					var res = screen2index(index2screen(op));
					var ret = op[0] != res[0] || op[1] != res[1];
					if(ret) {
						//alert('op == ' + JSON.stringify(op));
						//alert('res == ' + JSON.stringify(res));
					}
					return ret;
				}
	
				var failed = false;
				for(var i = 0; i < 7; ++i) {
					for(var j = 0; j < 12; ++j) {
						failed = failed || fails([i, j]);
					}
				}
				assert(!failed, "Something wrong! Unit test fails.");
				
				assert(getDaysInMonthCount(2011, 8) == 31, "Cannot get days in month count. Incorrect values.");
			}*/
	
			// Управляет выделением цветом целого дня если есть хоть один интервал для выбора,
			// выделением красным если нет, надписями о дате и времени.
			var Background = {
				day_fillers: [],
				setDayFiller: function(index, day_filler) {
					this.day_fillers[index] = day_filler;
				},
				setDayFillerInvalid: function(index) {
					this.day_fillers[index].attr({fill: '#f9a0a0', opacity: 0.25});
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
						fill: "#fb7"
					});
				};
				var normal_header_animation = function(event) {
					this.brother.attr({
						fill: "#fff"
					});
					document.body.style.cursor = "default";
				};
				var date = new Date(today);
				// Days. Dates + white day filler.
				for(var i = 0; i < 7; i++) {
					var where = [i * dx + cellPX, -2 * dy + cellPY];//index2screen([i, -2]);
					// Creating rectangle (day label).
					var r = paper.rect(where[0] + margin, where[1] - margin * 2, dx - margin * 2, 30)
						.attr("fill", "90-#fff-#f9ea86")
						.attr("stroke", "#bbb")
						.attr("opacity", 0.5);
					r.week_day_number = i;
	
					var label = weekDays[(i + currentDay) % 7] + (0 === i ? '\n(сегодня)' : '\n' + date.getDate() + '.' + (date.getMonth() + 1));
					
					date.setDate(date.getDate() + 1);
					// Текст (напр: ПН 16.09).
					var header_text = paper.text(where[0] + dx / 2, where[1] + dy / 2, label)
						.attr({
								font: "Comic Sans MS",
								"font-size": 11,
								fill: (0 === i ? "#9d252c": "#255b94")
							});
					header_text.week_day_number = i;
					
					var day_filler = paper.rect(where[0] + margin, where[1] + dy*2 - margin, dx - margin - 1, dy * 28 - margin)
						.attr({
								fill: '#fff',
								opacity: 0.25,
								'stroke-opacity': 0
						});
					Background.setDayFiller(i, day_filler);
				}
	
				for(var j = 0; j < 13; j++) {
					var y = min2y((j + 8)*60);
					var time_label = '' + (j + 8) + ':00';
					paper.text(cellPX - 20, y, time_label)
						.attr({
								"font-size": 11,
								fill: "#fff"
						});
					/*var small_label_y = min2y((j + 8)*60 + 30);
					time_label = '' + (j + 8) + ':30';
					paper.text(cellPX - 20, small_label_y, time_label)
						.attr({
								"font-size", 9,
								fill: "#444"
						});*/
				}
				
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
						var time = Math.floor(Math.random() * 14*60 + 8*60);
						var time2 = Math.round(y2min(min2y(time)));
						if(time2 !== time) {
							return false;
						}
					}
					return true;
				}
				assert(UnitTest2Day(), "Day to coordinates convertion is invalid!");
				assert(UnitTest2Time(), "Time to coordinates convertion is invalid!");
				
				var UsableSpaceRectangle = new Class({
					initialize: function(start, finish) {
						this.start = start;
						this.finish = finish;
						// Добавляем к общему списку этих элементов.
						UsableSpaceRectangle.s_rects.push(this);
						
						this.finish = this.start + Math.max( /*Scroller.height*/dy, this.finish - this.start);
					},
					make_visible: function(day_number) {
						//var length = this.finish - this.start;
						var x = day2x(day_number),
							y = min2y(this.start),
							height = min2y(this.finish) - y,
							width_margin = 5;
						this.visual = paper.rect(x + width_margin, y, dx-margin - width_margin, height - margin);
						this.visual.attr({fill: "#68b841", opacity: 0.58, "stroke-opacity": 0});
					},
					// Attaches interval if it start is in, returns true, else returns false.
					attach: function(interval) {
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
					// In minutes
					start: null,
					finish: null
				});
				UsableSpaceRectangle.s_rects = [];
				
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
					event.offsetX = event.offsetX || event.layerX  || event.clientX;
					event.offsetY = event.offsetY || event.layerY  || event.clientY;
					
					var day = x2day(event.offsetX);
					var day_intervals = intervals_info.days[day];
					var time = y2min(event.offsetY);
					// Большое начальное число.
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
					if(selected_interval && UsableSpaceRectangle.s_rects.interval !== selected_interval) {
						if(!Scroller.s_singleton || !Scroller.s_singleton.selected) {
							var s = new Scroller(selected_interval, day);
							readable_info_callback(s.interval.getHumanReadableTableString());
						}
					}
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
				paper = new Raphael("calendar_canvas", '100%', '100%');
				drawCalendarBackground();
	
				//UnitTest1();
	
				disableDraggingFor(document.getElementById('calendar_canvas'));
				$(document.body).addEvent("dragstart", function() {
					return false;
				});
				
				//DEBUG TODO show prolog intervals
				
				// 
				var VisitRect = new Class({
	                initialize : function(time_arguments_string1, time_arguments_string2) {
	                    var regex = /(\d+),(\d+),(\d+),(\d+),(\d+)/;
	                    var match = [regex.exec(time_arguments_string1), regex.exec(time_arguments_string2)];
	                    this.date = [parseInt(match[0][1], 10), parseInt(match[1][1], 10)];
	                    this.month = [parseInt(match[0][2], 10), parseInt(match[1][2], 10)];
	                    this.year = [parseInt(match[0][3], 10), parseInt(match[1][3], 10)];
	                    this.hour = [parseInt(match[0][4], 10), parseInt(match[1][4], 10)];
	                    this.min = [parseInt(match[0][5], 10), parseInt(match[1][5], 10)];
	
	                    this.make_visible();
	                },
	                make_visible : function() {
	                    var start_time_minutes = this.hour[0] * 60 + this.min[0];
	                    var finish_time_minutes = this.hour[1] * 60 + this.min[1];
	
	                    var day = (this.date[0] -  today.getDate());
	                    if((today.getMonth() + 1) < this.month[0]) {
	                        day += getDaysInMonthCount(this.year[0], this.month[0]);
	                    }
	                    var x = day2x(day);
	                    var start_time_y = min2y(start_time_minutes);
	                    var finish_time_y = min2y(finish_time_minutes);
	
	                    paper.rect(x, start_time_y, dx-margin, Math.max(finish_time_y - start_time_y/* - margin*/, margin)).attr({
	                        opacity : 0.8,
	                        fill : "#fb5"
	                    });
	                },
	                match : null,
	                date : null,
	                month : null,
	                year : null,
	                hour : null,
	                min : null
	            });
	
				var PLAN = false;
				
				/*var on_facility_plan_info_get = function(info) {
					// time(11,8,2011,14,2)
					var time_regex = ( PLAN ? /([^,]+),time\((\d+,\d+,\d+,\d+,\d+)\),time\((\d+,\d+,\d+,\d+,\d+)\)/g : /\(([^,]+),[^,]+,time\((\d+,\d+,\d+,\d+,\d+)\),time\((\d+,\d+,\d+,\d+,\d+)\)/g);
					for(; ; ) {
						var time_info = time_regex.exec(info);
						if(!time_info) {
							break;
						}
						if(time_info[1] === 'servicename' + service_type.id) {
							var vr = new VisitRect(time_info[2], time_info[3]);
						}
					}
				};
				var services = null;
				user_services.forEach(function(user_service) {
					var add = 'servicename' + user_service.service_type_id;
					if(services) {
						services += ' , ' + add;
					} else {
						services = add;
					}
				});
				makeRequest('/cmd/prolog/execute?cmd=ask plan for facility {< ' + selected_facility.prolog_name + ' >} intime 500000 min', on_facility_plan_info_get);*/


				
				var DayNavigationArrows = new Class({
					initialize: function() {
						this.left = new Arrow(paper, 'left', day2x(-0.35), 15, this.move_left_date);
						this.right = new Arrow(paper, 'right', day2x(7.35), 15, this.move_right_date);
						
						this.left.setBrother(this.right);
						this.right.setBrother(this.left);
						
						if(today.getDate() === (new Date()).getDate() && today.getMonth() === (new Date()).getMonth()) {
							this.left.disable();
						}
					},
					move_left_date: function() {
	                    if(!this.parent.is_disabled) {
							today.setDate(today.getDate() - 7);
							paper.clear();
							//drawCalendar();
							paper.remove();
							var s = new Scheduler(service_type, resource, user_service, selected_facility, callback, readable_info_callback, onload_callback, today);
						}
					},
					move_right_date: function() {
	                    if(!this.parent.is_disabled) {
							today.setDate(today.getDate() + 7);
							paper.clear();
							//drawCalendar();
							paper.remove();
							var s = new Scheduler(service_type, resource, user_service, selected_facility, callback, readable_info_callback, onload_callback, today);
						}
					},
					left: null,
					right: null
				});
				var nav = new DayNavigationArrows();
			}
	
			/*
			 * Call at document load.
			 */
			drawCalendar();
				
		});
	};
	get_user_services_from_base(createCalendar, selected_facility.id);
}
