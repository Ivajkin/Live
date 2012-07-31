/*
 * Calculate md5 from string.
 */
var calcMD5 = (function() {
	/*
	 * Usefull string (for md5).
	 */
	var hex_chr = "0123456789abcdef";
	/**
	 * Convert a 32-bit number to a hex string with ls-byte first
	 * @nosideeffects
	 */
	function rhex(num) {
		var str = "", j;
		for (j = 0; j <= 3; j++) {
			str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
				hex_chr.charAt((num >> (j * 8)) & 0x0F);
		}
		return str;
	}
	
	/**
	 * Convert a string to a sequence of 16-word blocks, stored as an array.
	 * Append padding bits and the length, as described in the MD5 standard.
	 * @nosideeffects
	 */
	function str2blks_MD5(str) {
		var nblk = ((str.length + 8) >> 6) + 1,
			blks = new Array(nblk * 16),
			i;
		for (i = 0; i < nblk * 16; i++) 
			blks[i] = 0;
		for (i = 0; i < str.length; i++) 
			blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
		blks[i >> 2] |= 0x80 << ((i % 4) * 8);
		blks[nblk * 16 - 2] = str.length * 8;
		return blks;
	}
	
	/**
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 * @nosideeffects
	 */
	function add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}
	
	/**
	 * Bitwise rotate a 32-bit number to the left
	 * @nosideeffects
	 */
	function rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}
	
	/**
	 * These functions implement the basic operation for each round of the
	 * algorithm.
	 * @nosideeffects
	 */
	function cmn(q, a, b, x, s, t) {
		return add(rol(add(add(a, q), add(x, t)), s), b);
	}
	
	/** @nosideeffects */
	function ff(a, b, c, d, x, s, t) {
		return cmn((b & c) | ((~ b) & d), a, b, x, s, t);
	}
	
	/** @nosideeffects */
	function gg(a, b, c, d, x, s, t) {
		return cmn((b & d) | (c & (~ d)), a, b, x, s, t);
	}
	
	/** @nosideeffects */
	function hh(a, b, c, d, x, s, t) {
		return cmn(b ^ c ^ d, a, b, x, s, t);
	}
	
	/** @nosideeffects */
	function ii(a, b, c, d, x, s, t) {
		return cmn(c ^ (b | (~ d)), a, b, x, s, t);
	}
	
	/**
	 * Take a string and return the hex representation of its MD5.
	 * @nosideeffects
	 */
	function calcMD5(str) {
		var x = str2blks_MD5(str);
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		for (var i = 0; i < x.length; i += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			
			a = ff(a, b, c, d, x[i + 0], 7, -680876936);
			d = ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = ff(c, d, a, b, x[i + 10], 17, -42063);
			b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
			
			a = gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = gg(b, c, d, a, x[i + 0], 20, -373897302);
			a = gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
			
			a = hh(a, b, c, d, x[i + 5], 4, -378558);
			d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = hh(d, a, b, c, x[i + 0], 11, -358537222);
			c = hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = hh(b, c, d, a, x[i + 2], 23, -995338651);
			
			a = ii(a, b, c, d, x[i + 0], 6, -198630844);
			d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = ii(b, c, d, a, x[i + 9], 21, -343485551);
			
			a = add(a, olda);
			b = add(b, oldb);
			c = add(c, oldc);
			d = add(d, oldd);
		}
		return rhex(a) + rhex(b) + rhex(c) + rhex(d);
	}
	return calcMD5;
}) ();

// Не писал, проверить нужно.
// TODO: на будущее - использовать как минимум sha1 вместо md5
var Sha1 = {
	/**
	 * Generates SHA-1 hash of string
	 *
	 * @param {String} msg                String to be hashed
	 * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
	 * @returns {String}                  Hash of msg as hex character string
	 */
	hash : function(msg, utf8encode) {
		utf8encode = ( typeof utf8encode == 'undefined') ? true : utf8encode;

		// convert string to UTF-8, as SHA only deals with byte-streams
		if(utf8encode)
			msg = Utf8.encode(msg);

		// constants [§4.2.1]
		var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

		// PREPROCESSING

		msg += String.fromCharCode(0x80);
		// add trailing '1' bit (+ 0's padding) to string [§5.1.1]

		// convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
		var l = msg.length / 4 + 2;
		// length (in 32-bit integers) of msg + ‘1’ + appended length
		var N = Math.ceil(l / 16);
		// number of 16-integer-blocks required to hold 'l' ints
		var M = new Array(N);

		for(var i = 0; i < N; i++) {
			M[i] = new Array(16);
			for(var j = 0; j < 16; j++) {// encode 4 chars per integer, big-endian encoding
				M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) | (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
			} // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
		}
		// add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
		// note: most significant word would be (len-1)*8 >>> 32, but since JS converts
		// bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
		M[N-1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
		M[N-1][14] = Math.floor(M[N-1][14])
		M[N-1][15] = ((msg.length - 1) * 8) & 0xffffffff;

		// set initial hash value [§5.3.1]
		var H0 = 0x67452301;
		var H1 = 0xefcdab89;
		var H2 = 0x98badcfe;
		var H3 = 0x10325476;
		var H4 = 0xc3d2e1f0;

		// HASH COMPUTATION [§6.1.2]

		var W = new Array(80);
		var a, b, c, d, e;
		for(var i = 0; i < N; i++) {

			// 1 - prepare message schedule 'W'
			for(var t = 0; t < 16; t++)
			W[t] = M[i][t];
			for(var t = 16; t < 80; t++)
			W[t] = Sha1.ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);

			// 2 - initialise five working variables a, b, c, d, e with previous hash value
			a = H0;
			b = H1;
			c = H2;
			d = H3;
			e = H4;

			// 3 - main loop
			for(var t = 0; t < 80; t++) {
				var s = Math.floor(t / 20);
				// seq for blocks of 'f' functions and 'K' constants
				var T = (Sha1.ROTL(a, 5) + Sha1.f(s, b, c, d) + e + K[s] + W[t]) & 0xffffffff;
				e = d;
				d = c;
				c = Sha1.ROTL(b, 30);
				b = a;
				a = T;
			}

			// 4 - compute the new intermediate hash value
			H0 = (H0 + a) & 0xffffffff;
			// note 'addition modulo 2^32'
			H1 = (H1 + b) & 0xffffffff;
			H2 = (H2 + c) & 0xffffffff;
			H3 = (H3 + d) & 0xffffffff;
			H4 = (H4 + e) & 0xffffffff;
		}

		return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
	},
	//
	// function 'f' [§4.1.1]
	//
	f : function(s, x, y, z) {
		switch (s) {
			case 0:
				return (x & y) ^ (~x & z);
			// Ch()
			case 1:
				return x ^ y ^ z;
			// Parity()
			case 2:
				return (x & y) ^ (x & z) ^ (y & z);
			// Maj()
			case 3:
				return x ^ y ^ z;
			// Parity()
		}
	},
	//
	// rotate left (circular left shift) value x by n positions [§3.2.5]
	//
	ROTL : function(x, n) {
		return (x << n) | (x >>> (32 - n));
	},
	//
	// hexadecimal representation of a number
	//   (note toString(16) is implementation-dependant, and
	//   in IE returns signed numbers when used on full words)
	//
	toHexStr : function(n) {
		var s = "", v;
		for(var i = 7; i >= 0; i--) {
			v = (n >>> (i * 4)) & 0xf;
			s += v.toString(16);
		}
		return s;
	}
};

var Utf8 = {

	/**
	 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
	 * (BMP / basic multilingual plane only)
	 *
	 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
	 *
	 * @param {String} strUni Unicode string to be encoded as UTF-8
	 * @returns {String} encoded string
	 */
	encode : function(strUni) {
		// use regular expressions & String.replace callback function for better efficiency
		// than procedural approaches
		var strUtf = strUni.replace(/[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
		function(c) {
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
		});
		strUtf = strUtf.replace(/[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
		function(c) {
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
		});
		return strUtf;
	},
	/**
	 * Decode utf-8 encoded string back into multi-byte Unicode characters
	 *
	 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
	 * @returns {String} decoded string
	 */
	decode : function(strUtf) {
		// note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
		var strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
		function(c) {// (note parentheses for precence)
			var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
			return String.fromCharCode(cc);
		});
		strUni = strUni.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
		function(c) {// (note parentheses for precence)
			var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
			return String.fromCharCode(cc);
		});
		return strUni;
	}
};
// Тестируем sha1: Sha1.hash('abc') === 'a9993e364706816aba3e25717850c26c9cd0d89d'
assert(Sha1.hash('abc') === 'a9993e364706816aba3e25717850c26c9cd0d89d', 'Sha1 не работает');

/**
 * Addittion to arrays to search items and give the result: exist element or not.
 */
Array.prototype.contains = function(element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == element) {
			return true;
		}
	}
	return false;
}
/**
 * Addittion to arrays to search items and give the result: exist element or not.
 */
Array.prototype.strict_contains = function(element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === element) {
			return true;
		}
	}
	return false;
}

/**
 * Make request and create cache by url for cache_rotten_time_sec in seconds, then kill it.
 */
/*function makeCachedRequest(url, callback, cache_rotten_time_sec) {
	if(!window.__ajaxRequestCacheByUrl) {
		window.__ajaxRequestCacheByUrl = {};
	}
	if(!window.__lastRequestTimers) {
		window.__lastRequestTimers = {};
	}
	
	
	if(window.__ajaxRequestCacheByUrl[url]) {
		callback(window.__ajaxRequestCacheByUrl[url]);
	} else if(window.__lastRequestTimers[url]) {
		setTimeout(function(url) {
			callback(window.__ajaxRequestCacheByUrl[url]);
		}, cache_rotten_time_sec*1100, url);
	} else {
		window.__lastRequestTimers[url] = setTimeout(function(url) {
			window.__ajaxRequestCacheByUrl[url] = null;
			window.__lastRequestTimers[url] = null;
		}, cache_rotten_time_sec*1000, url);
		makeRequest(url, function(result_data) {
			window.__ajaxRequestCacheByUrl[url] = result_data;
			callback(result_data);
		});
	}
		
	if(window.__lastRequestTimers[url]) {
		clearTimeout(window.__lastRequestTimers[url]);
	}
}*/

/**
 * Make request to retrive data from url. 
 */
var parseHttpRequest;
function makeRequest(url, callback) {
	assert(window.helper.is('String', url), 'url должна быть строкой: ' + JSON.stringify(url));
	assert(!/undefined/.test(url), 'url не должен содержать подстроку "undefined"');
	
	/*var url = url.split('?');
	var request = new Request( url[0], {
		method: 'get',
		onSuccess: callback,
		onFailure: function(x) {
			assert(false, x);
		},
		onException: function(x) {
			assert(false, x);
		},
		onTimeout: function(x) {
			assert(false, x);
		}
	}).send(url[1]);*/
	var httpRequest;
	
	if (window.XMLHttpRequest) { // Mozilla, Safari, ...
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType) {
			// See note below about this line
			httpRequest.overrideMimeType('text/xml');
		}
	} else if (window.ActiveXObject) { // IE
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e2) {
			}
		}
	}
	
	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	httpRequest.onreadystatechange = function() {
		parseHttpRequest(httpRequest, callback);
	};
	httpRequest.open('GET', url, true);
	httpRequest.send('');
}

parseHttpRequest = function(httpRequest, callback) {
	if (httpRequest.readyState == 4) {
		if (httpRequest.status == 200) {
			callback(httpRequest.responseText);
		} else {
			//alert('There was a problem with the request.');
			console.log('There was a problem with the request.');
		}
	}
}

/*
 * Get cookie by specified offset.
 */
function getValue(offset) {
	var strEnd = document.cookie.indexOf(";", offset);
	if (strEnd == -1) strEnd = document.cookie.length;
	return unescape(document.cookie.substring(offset, strEnd));
}

/*
 * Get cookie by name.
 */
function getCookie(name) {
	var key = name + "=";
	var i = 0;
	while (i < document.cookie.length) {
		var j = i + key.length;
		if (document.cookie.substring(i, j) == key) return getValue(j);
		i = document.cookie.indexOf(" ", i) + 1;
		if (i === 0) break;
	}
	return null;
}

/*
 * Test if cookie enabled.
 * Return type: boolean.
 */
function areCookiesEnabled() {
	// id - наше тестовое значение.
	var id = new Date().getTime();
	
	// создаём файл cookie для проверки доступа к таким файлам.
	document.cookie = '__cookieprobe=' + id + ';path=/';
	
	// если файл cookie создан, значит, всё в порядке.
	return (document.cookie.indexOf(id) !== -1);
}

/*
 * Set cookie by name.
 */
function setCookie(name, value) {
	var cookiesEnabled = areCookiesEnabled();
	if (!cookiesEnabled) {
		alert('Cookie is disabled!');
	}
	
	var argv = setCookie.arguments;
	var argc = setCookie.arguments.length;
	var expires = (argc > 2) ? argv[2] : null;
	var path = (argc > 3) ? argv[3] : null;
	var domain = (argc > 4) ? argv[4] : null;
	var secure = (argc > 5) ? argv[5] : false;
	document.cookie = name + "=" + escape(value) +
	((expires == null) ? "" : ("; expires=" +
	expires.toGMTString())) +
	((path == null) ? "" : ("; path=" + path)) +
	((domain == null) ? "" : ("; domain=" + domain)) +
	((secure == true) ? "; secure" : "");
}

/*
 * Delete one cookie.
 */
// TODO удаление cookies не работает!!
/*function deleteCookie(strName) {
	document.cookie = strName + "=0; expires=" + (new Date()).toGMTString();
}*/

/* ==============================+
 * ===== Database accessors =====+
 * ==============================+
 */
var g_cached = {
	// Регионы.
	regions: [],
	// Города.
	cities: [],
	// Пользовательские услуги.
	user_services: [],
	// Типы услуг ("Терапевт", "Кардиолог", "На оружие", "В бассейн").
	service_types: [],
	// Поликлиники, больницы etc.
	facilities: [],
	// Ресурсы - работники в своей должности ("Медсестра 1", "Баркан как терапевт", "Баркан как администратор").
	resources: [],
	// Расписания ресурсов - промежутки времени доступности ресурсов.
	schedules: [],
	// Записи о предоставлении услуг пользователям в назначенное время.
	user_requests: [],
	// Помещения, кабинеты, офисы организаций.
	locations: [],
	// Пользователи, зарегистрированые по номеру телефона и случайному паролю.
	users: []
};
var g_cached_by_id = {
	// Регионы.
	regions: null,
	// Города.
	cities: null,
	// Пользовательские услуги.
	user_services: null,
	// Типы услуг ("Терапевт", "Кардиолог", "На оружие", "В бассейн").
	service_types: null,
	// Поликлиники, больницы etc.
	facilities: null,
	// Ресурсы - работники в своей должности ("Медсестра 1", "Баркан как терапевт", "Баркан как администратор").
	resources: null,
	// Расписания ресурсов - промежутки времени доступности ресурсов.
	schedules: null,
	// Записи о предоставлении услуг пользователям в назначенное время.
	user_requests: null,
	// Помещения, кабинеты, офисы организаций.
	locations: null,
	// Пользователи, зарегистрированые по номеру телефона и случайному паролю.
	users: null
};

function dropGCache() {
	
	g_cached = {
		// Регионы.
		regions: [],
		// Города.
		cities: [],
		// Пользовательские услуги.
		user_services: [],
		// Типы услуг ("Терапевт", "Кардиолог", "На оружие", "В бассейн").
		service_types: [],
		// Поликлиники, больницы etc.
		facilities: [],
		// Ресурсы - работники в своей должности ("Медсестра 1", "Баркан как терапевт", "Баркан как администратор").
		resources: [],
		// Расписания ресурсов - промежутки времени доступности ресурсов.
		schedules: [],
		// Записи о предоставлении услуг пользователям в назначенное время.
		user_requests: [],
		// Помещения, кабинеты, офисы организаций.
		locations: [],
		// Пользователи, зарегистрированые по номеру телефона и случайному паролю.
		users: []
	};
	g_cached_by_id = {
		// Регионы.
		regions: null,
		// Города.
		cities: null,
		// Пользовательские услуги.
		user_services: null,
		// Типы услуг ("Терапевт", "Кардиолог", "На оружие", "В бассейн").
		service_types: null,
		// Поликлиники, больницы etc.
		facilities: null,
		// Ресурсы - работники в своей должности ("Медсестра 1", "Баркан как терапевт", "Баркан как администратор").
		resources: null,
		// Расписания ресурсов - промежутки времени доступности ресурсов.
		schedules: null,
		// Записи о предоставлении услуг пользователям в назначенное время.
		user_requests: null,
		// Помещения, кабинеты, офисы организаций.
		locations: null,
		// Пользователи, зарегистрированые по номеру телефона и случайному паролю.
		users: null
	};
}

/**
 * Получаем данные из коллекции из базы.
 */
function get_collection_from_base(collection, callback) {
	// Проверяем существование коллекции.
	assert(g_cached[collection], 'Invalid collection name: ' + collection);
	
	// Если кеш не создан.
	if (g_cached[collection].length === 0 || !g_cached_by_id[collection]) {
		//Получаем из базы список.
		makeRequest('/cmd/get_json_database?database=' + collection + '.json', function(data) {
			g_cached[collection] = JSON.parse(data);
			g_cached_by_id[collection] = {};
			g_cached[collection].forEach(function(item) {
				g_cached_by_id[collection][item.id] = item;
			});
			callback(g_cached[collection], g_cached_by_id[collection]);
		});
	} else {
		//Передаём существующий кеш.
		callback(g_cached[collection], g_cached_by_id[collection]);
	}
}
/*
 * Gets cities from 'database/cities.json', sends it JSONed to callback.
 */
function get_cities_from_base(callback) {
	get_collection_from_base('cities', callback);
}
/*
 * Gets locations from 'database/locations.json', sends it JSONed to callback.
 */
function get_locations_from_base(callback) {
	get_collection_from_base('locations', callback);
}
/*
 * Gets regions from 'database/regions.json', sends it JSONed to callback.
 */
function get_regions_from_base(callback) {
	get_collection_from_base('regions', callback);
}


/*
 * Gets user services from 'database/user_services.json', sends it JSONed to callback.
 */
function get_user_services_from_base(callback) {
	get_collection_from_base('user_services', callback);
}

/*
 * Gets service types from 'database/service_types.json', sends it JSONed to callback.
 */
function get_service_types_from_base(callback, facility_id) {
	var filter = (facility_id ? function(service_types, result_callback) {
			get_user_services_from_base(function(user_services) {
				// id must be unique.
				var ids_selected = [];
				var filtered = [];
				for(var i = 0; i < user_services.length; ++i) {
					var id1 = parseInt(user_services[i].facility_id, 10),
						id2 = parseInt(facility_id, 10);
					if(id1 === id2) {
						for(var j = 0; j < service_types.length; ++j) {
							if(user_services[i].service_type_id == service_types[j].id && !ids_selected[service_types[j].id]) {
								filtered.push(service_types[j]);
								ids_selected[service_types[j].id] = true;
							}
						}
					}
				}
				result_callback(filtered);
			});
		} : function(service_types, result_callback) {
			result_callback(service_types);
		});

	// Если кеш не создан.
	if (g_cached.service_types.length === 0) {
		//Получаем из базы список пользовательских услуг.
		makeRequest('/cmd/get_json_database?database=service_types.json', function(service_types_data) {
			g_cached.service_types = JSON.parse(service_types_data);
			filter(g_cached.service_types, function(filtered) {
				callback(filtered);
			});
		});
	} else {
		//Передаём существующий кеш.
		filter(g_cached.service_types, function(filtered) {
			callback(filtered);
		});
	}
}

/**
 * Gets facilities from 'database/facilities.json', sends it JSONed to callback.
 */
function get_facilities_from_base(callback) {
	get_collection_from_base('facilities', callback);
}

/**
 * Gets resources from 'database/resources.json', send it JSONed to callback.
 */
function get_resources_from_base(callback, facility_id) {
	if(typeof facility_id !== 'undefined' && facility_id !== null) {
		get_collection_from_base('resources', function(resources, resources_by_id) {
			get_collection_from_base('user_services', function(user_services, user_services_by_id) {
				var filtered = [];
				var filtered_by_id = {};
				for(var i = 0; i < user_services.length; ++i) {
					if(!filtered_by_id[user_services[i].resource_id]) {
						if(parseInt(user_services[i].facility_id) === parseInt(facility_id)) {
							var resource = resources_by_id[user_services[i].resource_id];
							filtered.push(resource);
							filtered_by_id[resource.id] = resource;
						}
					}
				}
				callback(filtered, filtered_by_id);
			});
		});
	} else {
		get_collection_from_base('resources', function(resources, resources_by_id) {
			callback(resources, resources_by_id);
		});
	}
}

/**
 * Для ресурса выдаёт его пользовательскую услугу.
 */
function get_user_service_pair(resource, callback) {
	assert(resource, 'Invalid argument in get_user_service_pair()');
	assert(window.helper.is('Function', callback), 'Invalid argument in get_user_service_pair()');
	var resource_id = parseInt(resource.id, 10);
	
	get_user_services_from_base(function(user_services) {
		var user_service = null;
		for(var i = 0; i < user_services.length; ++i) {
			if(parseInt(user_services[i].resource_id, 10) === resource_id) {
				user_service = user_services[i];
				break;
			}
		}
		assert(user_service, 'Error in get_user_service_pair. Not found user_service');
		callback(user_service);
	});
}

/**
 * Находим соответствующий service_type_id ресурс и пользовательскую услугу - по одной единственной сейчас.
 */
function find_resource_and_user_service_by_service_type_id( /** number */ service_type_id, /** number */facility_id, /** function */callback) {
	assert(window.helper.is('Number', service_type_id), 'Invalid 1st argument in find_resource_and_user_service_by_service_type_id()');
	assert(window.helper.is('Number', facility_id), 'Invalid 2nd argument in find_resource_and_user_service_by_service_type_id()');
	assert(window.helper.is('Function', callback), 'Invalid 3rd argument in find_resource_and_user_service_by_service_type_id()');
	
	get_resources_from_base(function(resources) {
		resources.forEach(function(resource) {
			if(resource.service_type_ids.contains(service_type_id)) {
				get_user_service_pair(resource, function(user_service) {
					user_service.available_time.forEach(function(interval) {
						if(interval.service_type_ids.contains(service_type_id)) {
							callback(resource, user_service);
							// Нужно потому что нам нужен только один выхлоп из функции, а return ничего не дал бы.
							callback = doNothing;
						}
					});
				});
			}
		});
		callback(null, null);
	}, facility_id);
};

/**
 * Gets schedules from 'database/schedules.json', send it JSONed to callback.
 */
/*function get_schedules_from_base(callback) {
	// Если кеш не создан.
	if (g_cached.schedules.length === 0) {
		//Получаем из базы список больниц.
		makeRequest('/cmd/get_json_database?database=schedules.json', function(schedules_data) {
			g_cached.schedules = JSON.parse(schedules_data);
			callback(g_cached.schedules);
		});
	} else {
		//Передаём существующий кеш.
		callback(g_cached.schedules);
	}
}*/
/* ==============================+
 * ====== Filters ===============+
 * ==============================+
 */
/**
 * Gets resources from 'database/resources.json' and send ONLY which have acceptable service_type_id JSONed to callback.
 * Gets resources of service type.
 * @param {Object} service_type_id
 * @param {Object} callback
 */
/*function get_resources_for_service_type(service_type_id, callback) {
	get_resources_from_base(function(resources) {
		var match = [];
		for(var i = 0; i < resources.length; ++i) {
			if(resources[i].service_type_id == service_type_id) {
				match.push(resources[i]);
			}
		}
		callback(match);
	});
}*/

/**
 * Add this site to favorites.
 */
function add_to_favorites() {

	var title = 'Больница онлайн';
	var url = 'http://web.scheduler.tncor.com:15081/';
	
	if (window.sidebar) {
		// Mozilla Firefox Bookmark
		window.sidebar.addPanel(title, url, "");
	} else if (window.external) {
		// IE Favorite
		window.external.AddFavorite(url, title);
	} else if (window.opera && window.print) {
		// Opera Hotlist
	}
}

/*
 * Searches for city, then sends it to callback (JSONed).
 */
function get_city_by_geolocation(callback) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var coords = position.coords;
			//showMap(coords.latitude, coords.longitude, coords.accuracy);
			get_cities_from_base(function(cities) {
				// Я знаю что это неправильно, но это временное решение.
				var x = coords.latitude;
				var y = coords.longitude;
				var current_city = {
					"index": -1,
					"distance_sqr": 10000000
				};
				for (var i = 0; i < cities.length; ++i) {
					var x2 = cities[i].latitude;
					var y2 = cities[i].longitude;
					var dx = x - x2;
					var dy = y - y2;
					var dist = dx * dx + dy * dy;
					if (current_city.distance_sqr > dist) {
						current_city.index = i;
						current_city.distance_sqr = dist;
					}
				}
				var selected_city = cities[current_city.index];
				
				callback(selected_city);
			});
		}, function(error) {
			var errorTypes = {
				1: 'Доступ запрещён',
				2: 'Координаты недоступны',
				3: 'Время ожидания истекло'
			};
			alert(errorTypes[error.code] + ": невозможно определить ваше месторасположение");
			callback(null, errorTypes[error.code]);
		}, {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 100000
		});
	}
}

/**
 * Не нужно больше.
 */
/*function save_user_request(request_info) {
}*/


/*
 * Returns true if login and password is correct.
 * callback(Boolean).
 */
function check_login(login, password, callback) {
	if(login === null || password === null) {
		callback(null);
	} else {
		assert(window.helper.is('String', login) || login === null, 'Wrong 1st argument in check_login()');
		assert(window.helper.is('String', password) || password === null, 'Wrong 2nd argument in check_login()');
		assert(window.helper.is('Function', callback), 'Wrong 3rd argument in check_login()');
		
		makeRequest('/cmd/authenticate?login=' + login + '&password_md5=' + calcMD5(password), function(admin_data) {
			var isValid = (admin_data && admin_data !== '' && admin_data != '!BAD!');
			callback( isValid ? JSON.parse(admin_data) : null);
		});
	}
}

/*
 * Creates the user service item by id .
 * Example: create_user_service_item(0) leads to 'Хирург: общий осмотр'.
 * Only leads to save id-s, not exports the objects.
 * @
function create_user_service_item(id) {
	setCookie();
}
 */

/**
 * Makes string shorter if it is too long.
 * shorten('Longstring',5) -> 'Longs...' 
 */
function shorten(string, length) {
	assert(window.helper.is('String', string), 'Wrong 1st argument in shorten()');
	assert(window.helper.is('Number', length), 'Wrong 2nd argument in shorten()');
	
	if(string.length <= length) {
		return string;
	} else {
		return string.substring(0, length) + '...';
	}
}

/**
 * Get the html element offset.
 * @param {Object} el
 */
function getDomOffset(el) {
	var _x = 0;
	var _y = 0;
	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		_x += el.offsetLeft - el.scrollLeft;
		_y += el.offsetTop - el.scrollTop;
		el = el.parentNode;
	}
	return {
		top: _y,
		left: _x
	};
}

/**
 * Returns the day count in month of the year.
 */
function getDaysInMonthCount(year, month) {
	assert(window.helper.is('Number', year), 'Wrong 1st argument in getDaysInMonthCount()');
	assert(window.helper.is('Number', month), 'Wrong 2nd argument in getDaysInMonthCount()');
	
	return new Date(year, month, 0).getDate();
}

/**
 * Assert expression is true.
 * If not alerts error_message.
 * @param {Object} expression
 * @param {Object} error_message
 */
function assert(expression, error_message) {
	if(!expression) {
		//alert(error_message);
		throw error_message;
	}
}

// TODO:
//function assertArguments(arguments, types, error_message) {
//	if(arguments.lenght != types.length) {
//		throw "assertArguments() length";
//	}
//	...
//}

/**
 * Array filter().
 */
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

/**
 * Calculates range in days between dates.
 */
function dateRange(_date_a, _date_b) {
	var date_a = new Date(_date_a);
	var date_b = new Date(_date_b);
	
	var yearA = date_a.getFullYear(),
		yearB = date_b.getFullYear(),
		monthA = date_a.getMonth(),
		monthB = date_b.getMonth(),
		dayA = date_a.getDate(),
		dayB = date_b.getDate();
	
	// Сделал всё проще и понятней, чтобы меньше ошибок было и промежуточные значения можно было смотреть.
	if((yearA > yearB) ||
		(yearA === yearB && monthA > monthB) ||
		(yearA === yearB && monthA === monthB && dayA > dayB)) {
			var tmp = date_a;
			date_a = date_b;
			date_b = tmp;
	}
		
	var range = 0;
	for(;;) {
		yearA = date_a.getFullYear();
		yearB = date_b.getFullYear();
		monthA = date_a.getMonth();
		monthB = date_b.getMonth();
		dayA = date_a.getDate();
		dayB = date_b.getDate();
		
		if(yearA === yearB && monthA === monthB && dayA === dayB) {
			break;
		}
		
		date_a.setDate(date_a.getDate() + 1);
		++range;
		// Прим: всегда нужно вводить ограничения. В реальном мире математические абстракции часто дают утечки (протекают), потому верхнюю и нижнюю границы применимости приходиться отсекать.
		assert(range > -1 && range < 365, 'Вышли за предел позможного времени, не известно почему. Время А = ' + date_a + ', время Б = ' + date_b + ', дошли до времени О = ' + _date_a);
	}
	return range;
};

/**
 * Sort array elements by predicate.
 */
function sort(array, greater_pred) {
	if(!array || !array.length) {
		console.log('Not an array?');
		return array;
	}
	
	for(var i = 0; i < array.length; ++i) {
		for(var j = i + 1; j < array.length; ++j) {
			if(greater_pred(array[i], array[j])) {
				var tmp = array[i];
				array[i] = array[j];
				array[j] = tmp;
				i = 0;
			}
		}
	}
	return array;
}

// If there is no Prototype.
// Implement bind function (for facility dialog).
//if(!Function.prototype.bind) {
	if(Function.prototype.bind) {
		Function.prototype.moobind = Function.prototype.bind;
	}
	Function.prototype.bind = function(context) {
	    if (arguments.length < 2 && undefined === arguments[0]) { return this; }
		var __method = this;
		var args = Array.prototype.slice.call(arguments, 1);
	    return function() {
			var args2 = Array.prototype.slice.call(arguments);
	        var a = args.concat(args2);
	        return __method.apply(context, a);
	    };
	};
//}
/**
 * Returns if is n a number (-1, 0.1, 92 etc)
 * Passed all the tests.
 */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// TODO: comments (deadline)
function get_standard_phone_number(phone_number) {
	/*if(!window.helper.is('String', phone_number)) {
		phone_number = phone_number.toString();
	}*/
	assert(window.helper.is('String', phone_number), 'phone_number is not string while get_standard_phone_number(' + phone_number + ')');
	
	// Разные форматы номера телефона, например +7-924-2005-039.
	var reg = /\+?\s?[7|8]?-?\(?\)?\s?([\d]+)-?\(?\)?\s?([\d]*)-?\(?\)?\s?([\d]*)-?\(?\)?\s?([\d]*)-?\(?\)?\s?([\d]*)-?\(?\)?\s?/;
	if(reg.test(phone_number)) {
		// Извлекаем номер в нужном формате (9242005039).
		var res = reg.exec(phone_number);
		var new_phone_number = '';
		for(var i = 1; i < res.length; ++i) {
			new_phone_number += res[i];
		}
		assert(new_phone_number, 'Не удалось привести номер ' + phone_number + ' к стандартному виду');
		return new_phone_number;
	}
}

/**
 * Преобразуем javascript дату к строки с видом "14.11.2011".
 */
function get_standard_date(/** Date */ date) /** String */ {
	return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
}
/**
 * Преобразуем строки вида "14.11.2011" в javascript дату.
 */
function parse_standard_date(/** String */ date_string) /** Date */ {
	var date_strings = date_string.split('.');
	return new Date(date_strings[2],date_strings[1] - 1, date_strings[0]);
}


/**
 * Преобразуем время в минутах с 00:00 к строке с видом "10:30" или "9:05".
 */
function get_readable_time(/** Numer */ time_minutes) /** String */ {
	if(window.helper) {
		assert(window.helper.is('Number', time_minutes), 'time_minutes is not number while get_standard_time(' + time_minutes + ')');
	}
	var hours = Math.floor(time_minutes/60);
	var minutes = time_minutes - hours*60;
	if(minutes < 10) {
		minutes = '0' + minutes;
	}
	return hours + ":" + minutes;
}
// 10*60+30 --get_readable_time--> '10:30'
assert(get_readable_time(10*60+30) === '10:30', 'get_readable_time() won\'t work! (1)' );
// 9*60+5 --get_readable_time--> '9:05'
assert(get_readable_time(9*60+5) === '9:05', 'get_readable_time() won\'t work! (2)' );

// Обновляем информацию об объекте в базе данных.
var insertDatabaseItem = function(collection, item, callback) {
	assert( typeof collection == 'string', 'collection not a string in removeDatabaseItem()');
	assert( typeof item == 'object', 'item not an object in removeDatabaseItem()');

	var request = '/cmd/db/insert?collection=' + collection;
	// Собираем информацию о изменяемом объекте.
	for(var key in item) {
		if(key != '_id') {
			request += '&' + key + '=' + JSON.stringify(item[key]);
		}
	}
	// Посылаем запрос, слушаем результат.
	makeRequest(request, function(result) {
		assert(result === 'OK', 'Не удалось изменить информацию о ' + collection + ' предприятия. Объект: ' + JSON.stringify(item));
		dropGCache();
		if(callback) {
			assert(window.helper.is('Function', callback), 'callback is not a Function while insertDatabaseItem(' + [collection, item, callback].join(', ') + ')');
			callback();
		}
	});
};
// Обновляем информацию об объекте в базе данных.
var refreshDatabaseItemInfo = function(collection, item, callback) {
	assert( typeof collection === 'string', 'collection not a string in refreshDatabaseItemInfo()');
	assert( typeof item === 'object', 'item not an object in refreshDatabaseItemInfo()');

	var request = '/cmd/set_object_data?collection=' + collection;
	// Собираем информацию о изменяемом объекте.
	for(var key in item) {
		request += '&' + key + '=' + JSON.stringify(item[key]);
	}
	// Посылаем запрос, слушаем результат.
	makeRequest(request, function(result) {
		assert(result === 'OK', 'Не удалось изменить информацию о ' + collection + ' предприятия. Объект: ' + JSON.stringify(item));
		dropGCache();
		callback();
	});
};

// Удаляем объект из базы данных.
var removeDatabaseItem = function(collection, item_id) {
	assert( typeof collection === 'string', 'collection not a string in removeDatabaseItem()');
	item_id = parseInt(item_id, 10);
	assert(isNumber(item_id), 'item.id is not a number in removeDatabaseItem()');

	var request = '/cmd/db/remove?collection=' + collection + '&id=' + item_id;
	// Посылаем запрос, слушаем результат.
	makeRequest(request, function(result) {
		assert(result === 'OK', 'Не удалось удалить объект из ' + collection + ' предприятия. Id объекта: ' + JSON.stringify(item_id));
		dropGCache();
	});
};

// Меняем пароль пользователя.
var setUserPassword = function(item, callback) {
	var possible_results = {
		'OK': 'OK',
		'CHANGED_TODAY': 'CHANGED_TODAY'
	};
	var collection = 'users';
	assert( typeof item === 'object', 'item not an object in setUserPassword()');
	assert( typeof callback === 'function', 'item not an object in setUserPassword()');

	var request = '/cmd/set_user_password?';
	var first = true;
	// Собираем информацию о изменяемом объекте.
	for(var key in item) {
		if(key != '_id') {
			request += (first ? '' : '&') + key + '=' + JSON.stringify(item[key]);
			first = false;
		}
	}
	// Посылаем запрос, слушаем результат.
	makeRequest(request, function(result) {
		//assert(result === possible_results['OK'] || result === possible_results['CHANGED_TODAY'], 'Не удалось изменить информацию о ' + collection + ' предприятия. Объект: ' + JSON.stringify(item));
		dropGCache();
		if(callback) {
			assert(window.helper.is('Function', callback), 'callback is not a Function while setUserPassword(' + [collection, item, callback].join(', ') + ')');
			if(result === 'OK') {
				callback(possible_results['OK']);
			} else {
				callback(possible_results['CHANGED_TODAY']);
			}
		}
	});
};

/*
 * Многим людям удобнее навести мышку, а потом, забыв нажать
 * клавишу мыши, начать вводить текст.
 * При этом, пусть мышь побудет наведённой ~(пол секунды)-750 мс
 * до смены фокуса,
 * для того, чтобы человека, который просто мимо input курсор
 * проводил не раздражал захват ввода.
 */
function makeInputUserFriendly(input_element) {
	input_element.addEvent('mouseenter', function(e) {
		this.isMouseIn = true;
		setTimeout(function(_this) {
			if(_this.isMouseIn) {
				_this.focus();
			}
		}, 750, this);
	});
	input_element.addEvent('mouseleave', function(e) {
		this.isMouseIn = false;
	});
}

/*
 * Генерируем пароль на основе номера телефона пользователя.
 */
function generate_user_password(deprecated_phone_number) {
	if(deprecated_phone_number) {
		console.log('Что за безобразие, больше не нужно этой функции передавать аргумент, пароль больше не зависит от номера телефона');
	}
	// Таблица со случайными символами.
	// Специально выбраны удобочитаемые символы, которые нельзя перепутать с кириллическими.
	// http://en.wikipedia.org/wiki/File:Venn_diagram_gr_la_ru.svg
	var rctable = ['7', 'g', 's', '6', 'h', 'f', 'j', 'q', '4', 'd', 'l', 'u', 'v', 'w', 'r', '5', '3', '2', '1', '0', '8', '9'];
	var generated_password = '';
	for(var i = 0; i < 5; ++i) {
		generated_password += rctable[Math.floor(Math.random()*rctable.length)];
	}
	
	return generated_password;
}

/**
 * Проверка, является ли объект панелью на основе уточной типизации.
 */
function is_panel( /** object */ panel ) /** boolean */ {
	// Если он ходит как утка, крякает как утка, может быть это и утка.
	return panel && !window.helper.is('Function', panel) && !window.helper.is('String', panel) && panel.html_content;
}

/*
 * Посылаем сообщение пользователю с определённым номером телефона и паролем.
 */
function send_sms_message(user_phone_number, user_password, message, callback) {
	assert(window.helper.is('String', user_phone_number), 'user_phone_number is not a String while send_sms_message(' + [user_phone_number, user_password, message, callback].join(', ') + ')');
	assert(window.helper.is('String', user_password), 'user_password is not a String while send_sms_message(' + [user_phone_number, user_password, message, callback].join(', ') + ')');
	assert(window.helper.is('String', message), 'message is not a String while send_sms_message(' + [user_phone_number, user_password, message, callback].join(', ') + ')');
	assert(window.helper.is('Function', callback), 'callback is not a Function while send_sms_message(' + [user_phone_number, user_password, message, callback].join(', ') + ')');
	user_phone_number = get_standard_phone_number(user_phone_number);
	makeRequest('/cmd/send_sms_to_user?phone_number=' + user_phone_number + '&password=' + user_password + '&message=' + message, function(result) {
		assert(result === 'OK', 'Something wrong during send_sms_message(' + [user_phone_number, user_password, message, callback].join(', ') + '). The result must be "OK"');
		callback();
	});
}

/**
 * Возвращает сформирован ли номер телефона правильно.
 */
function is_phone_number_valid(phone_number) {
	return phone_number && phone_number !== '' && phone_number.length > 7 && !/\D/.test(phone_number);
}

/**
 * Проверяем дату на соответствие шаблону 14.11.2011
 */
function is_valid_date( /** string */ date_string) /** boolean */ {
	return (/\d+\s*.\s*\d+.\s*\d+/).test(date_string);
}

/**
 * Returns intersection of array a and array b.
 */
if(!Array.prototype.intersect) {
	Array.prototype.intersect = function(array) {
		var a = this, b = array;
		var res = [];
		for(var i = 0; i < a.length; ++i) {
			if(b.strict_contains(a[i])) {
				res.push(a[i]);
			}
		}
		return res;
	};
}

/**
 *	Description:
 *		Javascript array map() method creates a new array with the results of calling a provided function on every element in this array.
 *	Syntax:
 *		array.map(callback[, thisObject]);
 *	Here is the detail of parameters:
 *		callback : Function that produces an element of the new Array from an element of the current one.
 *		thisObject : Object to use as this when executing callback.
 *	Return Value:
 *		Returns created array.
 *	Example:
 *		var numbers = [1, 4, 9];
 *		var roots = numbers.map(Math.sqrt);
 *		document.write("roots is : " + roots );
 *		// This will produce following result:
 *		// roots is : 1,2,3
 */
if(!Array.prototype.map) {
	Array.prototype.map = function(fun /*, thisp*/) {
		var len = this.length;
		if( typeof fun != "function") {
			throw new TypeError();
		}
		var res = new Array(len);
		var thisp = arguments[1];
		for(var i = 0; i < len; i++) {
			if( i in this)
				res[i] = fun.call(thisp, this[i], i, this);
		}

		return res;
	};
}

/**
 * Return new array with duplicate values removed.
 */
if(!Array.prototype.unique) {
	Array.prototype.unique = function() {
		var a = [];
		var l = this.length;
		for(var i = 0; i < l; i++) {
			for(var j = i + 1; j < l; j++) {
				// If this[i] is found later in the array
				if(this[i] === this[j])
					j = ++i;
			}
			a.push(this[i]);
		}
		return a;
	};
}
/**
 * Creates a new array with all elements that pass the test implemented by the provided function.
 */
if(!Array.prototype.filter) {
	Array.prototype.filter = function(fun /*, thisp */) {"use strict";

		if(this ===
			void 0 || this === null)
			throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if( typeof fun !== "function")
			throw new TypeError();

		var res = [];
		var thisp = arguments[1];
		for(var i = 0; i < len; i++) {
			if( i in t) {
				var val = t[i];
				// in case fun mutates this
				if(fun.call(thisp, val, i, t))
					res.push(val);
			}
		}

		return res;
	};
}


/**
 * Функция - заглушка.
 */
var doNothing = function() {};


