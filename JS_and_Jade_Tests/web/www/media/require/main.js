/*globals console: false, require: false */

require({
		baseUrl: "./",
		/*ordered: true, */
		paths: {
		    order: "core/media/require/order"
		}
	},
	[
	"order!core/media/js/mootools-core-1.3.1-full-compat",
	"order!core/media/js/mootools-more-1.3.1.1",
	"order!core/media/js/mooswitch",
	"order!core/media/js/meio.mask.js",
			"order!media/module/locale-ru",
			"order!media/module/index.locale.ru",
			"order!core/media/module/core/helper",
			"order!core/media/module/core/scrollcontrol",
			"order!core/media/module/core/io.elements",
			"order!core/media/module/core/io.blocks",
			"order!core/media/module/core/unit_tpl",
			"order!core/media/module/core/core",
			"order!core/media/module/core/engine_tn",
			"order!core/media/module/core/engine_sit",
			"order!media/module/unit.view",
			"order!media/js/raphael",
			"order!media/js/nivooslider",
			/*"order!tests/qunit",*/
			/*"order!tests/funcunit",*/
			"order!media/module/common",
			"order!media/module/schedule",
			"order!media/module/administration.resorce.schedule",
			"order!media/module/administration.model",
			"order!media/module/administration.view",
			"order!media/module/signup.model",
			"order!media/module/signup.view",
			"order!media/module/index.model",
			"order!media/module/index.view",
			"order!media/module/image.caching"
	], function() {
		console.log('All loaded! (require.js)');
		 var screenwidth = screen.width;
		 
		 if(screenwidth>1024)
		 	Asset.css('media/css/tpl_gt_1024.css');
		 else
		 	if(Browser.ie8)
		 		Asset.css('media/css/tpl_lte_1024_ie8.css');	
		 	else
		 		Asset.css('media/css/tpl_lte_1024.css');		
	}
);
