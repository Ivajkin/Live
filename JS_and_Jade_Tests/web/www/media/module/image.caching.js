/*globals window: false */
"media/images/use strict";

(function() {
	// Начинаем после загрузки DOM.
	window.addEvent('domready', function() {
		// Делаем отсрочку, чтобы всё не тормозило.
		setTimeout(function() {
			
			// Кешируем изображения для быстрого появления при открытии панелей.
			var images = [
					"media/images/top-custom-logo-doctor.png",
					"media/images/top-custom-logo-hair.png",
					"media/images/top-custom-logo-nails.png",
					"media/images/controls/edit-left.png",
					"media/images/controls/edit-right.png",
					"media/images/controls/edit-center.png",
					"media/images/success_panel/icon-print.png",
					"media/images/success_panel/icon-email2.png",
					"media/images/success_panel/icons-phone.png",
					"media/images/success_panel/icon-ok-12.png",
					"media/images/icon/medical.png",
					"media/images/icon/doctor.png",
					"media/images/icon/hair.png",
					"media/images/icon/nails.png",
					"media/images/toolbar/icon-back.png",
					"media/images/icon/places.png",
					"media/images/icon/statistic.png",
					"media/images/icon/employees.png",
					"media/images/icon/services.png",
					"media/images/icon/book.png",
					"media/images/something.png",
					"media/images/toolbar/icon-edit.png",
					"media/images/toolbar/icon-save.png",
					"media/images/toolbar/icon-add2.png",
					"media/images/toolbar/icon-delete2.png",
					"media/images/toolbar/icon-exit.png",
					"media/images/toolbar/icon-ok2.png",
					"media/images/toolbar/icon-print.png",
					"media/images/toolbar/icon-ok2-disabled.png"
				].map(function(url) {
				var image = new Image(1,1);
				image.src = url;
				return image;
			});
		}, 300);
	});
	
}) ();

