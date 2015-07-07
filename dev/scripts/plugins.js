// Avoid 'console' errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());


// classie v1.0.1
// copyright David DeSandro | class helper functions | from bonzo https://github.com/ded/bonzo | MIT license
// --------------------------------------------------------------------------------------------------------------------------------------------------------
(function(window) {

	'use strict';

	function classReg( className ) {
		return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
	}

	// classList support for class management
	// altho to be fair, the api sucks because it won't accept multiple classes at once
	var hasClass, addClass, removeClass;

	if ( 'classList' in document.documentElement ) {

		hasClass = function( elem, c ) {
			return elem.classList.contains( c );
		};
		addClass = function( elem, c ) {
			elem.classList.add( c );
		};
		removeClass = function( elem, c ) {
			elem.classList.remove( c );
		};

	} else {

		hasClass = function( elem, c ) {
			return classReg( c ).test( elem.className );
		};
		addClass = function( elem, c ) {
			if ( !hasClass( elem, c ) ) {
				elem.className = elem.className + ' ' + c;
			}
		};
		removeClass = function( elem, c ) {
			elem.className = elem.className.replace( classReg( c ), ' ' );
		};
	}

	function toggleClass( elem, c ) {
		var fn = hasClass( elem, c ) ? removeClass : addClass;
		fn( elem, c );
	}

	var classie = {
		// full names
		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,
		// short names
		has: hasClass,
		add: addClass,
		remove: removeClass,
		toggle: toggleClass
	};

	// transport
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( classie );
	} else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = classie;
	} else {
		// browser global
		window.classie = classie;
	}

})(window);


// smooth-scroll v5.3.3
// copyright Chris Ferdinandi | http://github.com/cferdinandi/smooth-scroll | Licensed under MIT: http://gomakethings.com/mit/
// --------------------------------------------------------------------------------------------------------------------------------------------------------
(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('smoothScroll', factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.smoothScroll = factory(root);
	}
})(window || this, function (root) {

	'use strict';

	//
	// Variables
	//

	var smoothScroll = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings, eventTimeout, fixedHeader;

	// Default settings
	var defaults = {
		speed: 500,
		easing: 'easeInOutCubic',
		offset: 0,
		updateURL: true,
		callbackBefore: function () {},
		callbackAfter: function () {}
	};


	//
	// Methods
	//

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function ( defaults, options ) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	/**
	 * Get the closest matching element up the DOM tree
	 * @param {Element} elem Starting element
	 * @param {String} selector Selector to match against (class, ID, or data attribute)
	 * @return {Boolean|Element} Returns false if not match found
	 */
	var getClosest = function (elem, selector) {
		var firstChar = selector.charAt(0);
		for ( ; elem && elem !== document; elem = elem.parentNode ) {
			if ( firstChar === '.' ) {
				if ( elem.classList.contains( selector.substr(1) ) ) {
					return elem;
				}
			} else if ( firstChar === '#' ) {
				if ( elem.id === selector.substr(1) ) {
					return elem;
				}
			} else if ( firstChar === '[' ) {
				if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
					return elem;
				}
			}
		}
		return false;
	};

	/**
	 * Get the height of an element
	 * @private
	 * @param  {Node]} elem The element
	 * @return {Number}     The element's height
	 */
	var getHeight = function (elem) {
		return Math.max( elem.scrollHeight, elem.offsetHeight, elem.clientHeight );
	};

	/**
	 * Escape special characters for use with querySelector
	 * @private
	 * @param {String} id The anchor ID to escape
	 * @author Mathias Bynens
	 * @link https://github.com/mathiasbynens/CSS.escape
	 */
	var escapeCharacters = function ( id ) {
		var string = String(id);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then throw an
			// `InvalidCharacterError` exception and terminate these steps.
			if (codeUnit === 0x0000) {
				throw new InvalidCharacterError(
					'Invalid character: the input contains U+0000.'
				);
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index === 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit === 0x002D
				)
			) {
				// http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit === 0x002D ||
				codeUnit === 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// http://dev.w3.org/csswg/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	/**
	 * Calculate the easing pattern
	 * @private
	 * @link https://gist.github.com/gre/1650294
	 * @param {String} type Easing pattern
	 * @param {Number} time Time animation should take to complete
	 * @returns {Number}
	 */
	var easingPattern = function ( type, time ) {
		var pattern;
		if ( type === 'easeInQuad' ) pattern = time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuad' ) pattern = time * (2 - time); // decelerating to zero velocity
		if ( type === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
		if ( type === 'easeInCubic' ) pattern = time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutCubic' ) pattern = (--time) * time * time + 1; // decelerating to zero velocity
		if ( type === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
		if ( type === 'easeInQuart' ) pattern = time * time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
		if ( type === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
		if ( type === 'easeInQuint' ) pattern = time * time * time * time * time; // accelerating from zero velocity
		if ( type === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
		if ( type === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration
		return pattern || time; // no easing, no acceleration
	};

	/**
	 * Calculate how far to scroll
	 * @private
	 * @param {Element} anchor The anchor element to scroll to
	 * @param {Number} headerHeight Height of a fixed header, if any
	 * @param {Number} offset Number of pixels by which to offset scroll
	 * @returns {Number}
	 */
	var getEndLocation = function ( anchor, headerHeight, offset ) {
		var location = 0;
		if (anchor.offsetParent) {
			do {
				location += anchor.offsetTop;
				anchor = anchor.offsetParent;
			} while (anchor);
		}
		location = location - headerHeight - offset;
		return location >= 0 ? location : 0;
	};

	/**
	 * Determine the document's height
	 * @private
	 * @returns {Number}
	 */
	var getDocumentHeight = function () {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};

	/**
	 * Convert data-options attribute into an object of key/value pairs
	 * @private
	 * @param {String} options Link-specific options as a data attribute string
	 * @returns {Object}
	 */
	var getDataOptions = function ( options ) {
		return !options || !(typeof JSON === 'object' && typeof JSON.parse === 'function') ? {} : JSON.parse( options );
	};

	/**
	 * Update the URL
	 * @private
	 * @param {Element} anchor The element to scroll to
	 * @param {Boolean} url Whether or not to update the URL history
	 */
	var updateUrl = function ( anchor, url ) {
		if ( history.pushState && (url || url === 'true') ) {
			history.pushState( null, null, [root.location.protocol, '//', root.location.host, root.location.pathname, root.location.search, anchor].join('') );
		}
	};

	/**
	 * Start/stop the scrolling animation
	 * @public
	 * @param {Element} toggle The element that toggled the scroll event
	 * @param {Element} anchor The element to scroll to
	 * @param {Object} options
	 */
	smoothScroll.animateScroll = function ( toggle, anchor, options ) {

		// Options and overrides
		var settings = extend( settings || defaults, options || {} );  // Merge user options with defaults
		var overrides = getDataOptions( toggle ? toggle.getAttribute('data-options') : null );
		settings = extend( settings, overrides );
		anchor = '#' + escapeCharacters(anchor.substr(1)); // Escape special characters and leading numbers

		// Selectors and variables
		var anchorElem = anchor === '#' ? document.documentElement : document.querySelector(anchor);
		var startLocation = root.pageYOffset; // Current location on the page
		if ( !fixedHeader ) { fixedHeader = document.querySelector('[data-scroll-header]'); }  // Get the fixed header if not already set
		var headerHeight = fixedHeader === null ? 0 : ( getHeight( fixedHeader ) + fixedHeader.offsetTop ); // Get the height of a fixed header if one exists
		var endLocation = getEndLocation( anchorElem, headerHeight, parseInt(settings.offset, 10) ); // Scroll to location
		var animationInterval; // interval timer
		var distance = endLocation - startLocation; // distance to travel
		var documentHeight = getDocumentHeight();
		var timeLapsed = 0;
		var percentage, position;

		// Update URL
		updateUrl(anchor, settings.updateURL);

		/**
		 * Stop the scroll animation when it reaches its target (or the bottom/top of page)
		 * @private
		 * @param {Number} position Current position on the page
		 * @param {Number} endLocation Scroll to location
		 * @param {Number} animationInterval How much to scroll on this loop
		 */
		var stopAnimateScroll = function (position, endLocation, animationInterval) {
			var currentLocation = root.pageYOffset;
			if ( position == endLocation || currentLocation == endLocation || ( (root.innerHeight + currentLocation) >= documentHeight ) ) {
				clearInterval(animationInterval);
				anchorElem.focus();
				settings.callbackAfter( toggle, anchor ); // Run callbacks after animation complete
			}
		};

		/**
		 * Loop scrolling animation
		 * @private
		 */
		var loopAnimateScroll = function () {
			timeLapsed += 16;
			percentage = ( timeLapsed / parseInt(settings.speed, 10) );
			percentage = ( percentage > 1 ) ? 1 : percentage;
			position = startLocation + ( distance * easingPattern(settings.easing, percentage) );
			root.scrollTo( 0, Math.floor(position) );
			stopAnimateScroll(position, endLocation, animationInterval);
		};

		/**
		 * Set interval timer
		 * @private
		 */
		var startAnimateScroll = function () {
			settings.callbackBefore( toggle, anchor ); // Run callbacks before animating scroll
			animationInterval = setInterval(loopAnimateScroll, 16);
		};

		/**
		 * Reset position to fix weird iOS bug
		 * @link https://github.com/cferdinandi/smooth-scroll/issues/45
		 */
		if ( root.pageYOffset === 0 ) {
			root.scrollTo( 0, 0 );
		}

		// Start scrolling animation
		startAnimateScroll();

	};

	/**
	 * If smooth scroll element clicked, animate scroll
	 * @private
	 */
	var eventHandler = function (event) {
		var toggle = getClosest(event.target, '[data-scroll]');
		if ( toggle && toggle.tagName.toLowerCase() === 'a' ) {
			event.preventDefault(); // Prevent default click event
			smoothScroll.animateScroll( toggle, toggle.hash, settings); // Animate scroll
		}
	};

	/**
	 * On window scroll and resize, only run events at a rate of 15fps for better performance
	 * @private
	 * @param  {Function} eventTimeout Timeout function
	 * @param  {Object} settings
	 */
	var eventThrottler = function (event) {
		if ( !eventTimeout ) {
			eventTimeout = setTimeout(function() {
				eventTimeout = null; // Reset timeout
				headerHeight = fixedHeader === null ? 0 : ( getHeight( fixedHeader ) + fixedHeader.offsetTop ); // Get the height of a fixed header if one exists
			}, 66);
		}
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	smoothScroll.destroy = function () {

		// If plugin isn't already initialized, stop
		if ( !settings ) return;

		// Remove event listeners
		document.removeEventListener( 'click', eventHandler, false );
		root.removeEventListener( 'resize', eventThrottler, false );

		// Reset varaibles
		settings = null;
		eventTimeout = null;
		fixedHeader = null;
	};

	/**
	 * Initialize Smooth Scroll
	 * @public
	 * @param {Object} options User settings
	 */
	smoothScroll.init = function ( options ) {

		// feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		smoothScroll.destroy();

		// Selectors and variables
		settings = extend( defaults, options || {} ); // Merge user options with defaults
		fixedHeader = document.querySelector('[data-scroll-header]'); // Get the fixed header

		// When a toggle is clicked, run the click handler
		document.addEventListener('click', eventHandler, false );
		if ( fixedHeader ) { root.addEventListener( 'resize', eventThrottler, false ); }

	};


	//
	// Public APIs
	//

	return smoothScroll;

});


// bootstrap-datepicker.js
// Started by Stefan Petre; improvements by Andrew Rowls + contributors | Licensed under the Apache License, Version 2.0
// --------------------------------------------------------------------------------------------------------------------------------------------------------
(function($, undefined){

	var $window = $(window);

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}
	function alias(method){
		return function(){
			return this[method].apply(this, arguments);
		};
	}

	var DateArray = (function(){
		var extras = {
			get: function(i){
				return this.slice(i)[0];
			},
			contains: function(d){
				// Array.indexOf is not cross-browser;
				// $.inArray doesn't work with Dates
				var val = d && d.valueOf();
				for (var i=0, l=this.length; i < l; i++)
					if (this[i].valueOf() === val)
						return i;
				return -1;
			},
			remove: function(i){
				this.splice(i,1);
			},
			replace: function(new_array){
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function(){
				this.length = 0;
			},
			copy: function(){
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function(){
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		};
	})();


	// Picker object

	var Datepicker = function(element, options){
		this.dates = new DateArray();
		this.viewDate = UTCToday();
		this.focusDate = null;

		this._process_options(options);

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if (this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);
		this._buildEvents();
		this._attachEvents();

		if (this.isInline){
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		}
		else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl){
			this.picker.addClass('datepicker-rtl');
		}

		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot th.today, tfoot th.clear')
						.attr('colspan', function(i, val){
							return parseInt(val) + 1;
						});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if (this.isInline){
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts){
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]){
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			switch (o.startView){
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode){
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			// true, false, or Number > 0
			if (o.multidate !== true){
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
				else
					o.multidate = 1;
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity){
				if (!!o.startDate){
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				}
				else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity){
				if (!!o.endDate){
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				}
				else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d){
				return parseInt(d, 10);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word){
				return (/^auto|left|right|top|bottom$/).test(word);
			});
			o.orientation = {x: 'auto', y: 'auto'};
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1){
				switch (plc[0]){
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function(word){
					return (/^left|right$/).test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word){
					return (/^top|bottom$/).test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs){
			for (var i=0, el, ch, ev; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function(evs){
			for (var i=0, el, ev, ch; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function(){
			if (this.isInput){ // single input
				this._events = [
					[this.element, {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			else if (this.component && this.hasInput){ // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			else if (this.element.is('div')){  // inline datepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}]
			);

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function(e){
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)){
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function(){
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function(){
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function(){
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function(){
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function(event, altdate){
			var date = altdate || this.dates.get(-1),
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				dates: $.map(this.dates, this._utc_to_local),
				format: $.proxy(function(ix, format){
					if (arguments.length === 0){
						ix = this.dates.length - 1;
						format = this.o.format;
					}
					else if (typeof ix === 'string'){
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function(){
			if (!this.isInline)
				this.picker.appendTo('body');
			this.picker.show();
			this.place();
			this._attachSecondaryEvents();
			this._trigger('show');
		},

		hide: function(){
			if (this.isInline)
				return;
			if (!this.picker.is(':visible'))
				return;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			this._trigger('hide');
		},

		remove: function(){
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput){
				delete this.element.data().date;
			}
		},

		_utc_to_local: function(utc){
			return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
		},
		_local_to_utc: function(local){
			return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
		},
		_zero_time: function(local){
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc){
			return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDates: function(){
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function(){
			return $.map(this.dates, function(d){
				return new Date(d);
			});
		},

		getDate: function(){
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function(){
			return new Date(this.dates.get(-1));
		},

		setDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, args);
			this._trigger('changeDate');
			this.setValue();
		},

		setUTCDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, $.map(args, this._utc_to_local));
			this._trigger('changeDate');
			this.setValue();
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),

		setValue: function(){
			var formatted = this.getFormattedDate();
			if (!this.isInput){
				if (this.component){
					this.element.find('input').val(formatted).change();
				}
			}
			else {
				this.element.val(formatted).change();
			}
		},

		getFormattedDate: function(format){
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			return $.map(this.dates, function(d){
				return DPGlobal.formatDate(d, format, lang);
			}).join(this.o.multidateSeparator);
		},

		setStartDate: function(startDate){
			this._process_options({startDate: startDate});
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate){
			this._process_options({endDate: endDate});
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled){
			this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
			this.update();
			this.updateNavArrows();
		},

		place: function(){
			if (this.isInline)
				return;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				scrollTop = $window.scrollTop();

			var parentsZindex = [];
			this.element.parents().each(function() {
				var itemZIndex = $(this).css('z-index');
				if ( itemZIndex !== 'auto' && itemZIndex !== 0 ) parentsZindex.push( parseInt( itemZIndex ) );
			});
			var zIndex = Math.max.apply( Math, parentsZindex ) + 10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left,
				top = offset.top;

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom '+
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto'){
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				// Default to left
				this.picker.addClass('datepicker-orient-left');
				if (offset.left < 0)
					left -= offset.left - visualPadding;
				else if (offset.left + calendarWidth > windowWidth)
					left = windowWidth - calendarWidth - visualPadding;
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto'){
				top_overflow = -scrollTop + offset.top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));

			this.picker.css({
				top: top,
				left: left,
				zIndex: zIndex
			});
		},

		_allow_update: true,
		update: function(){
			if (!this._allow_update)
				return;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if (arguments.length){
				$.each(arguments, $.proxy(function(i, date){
					if (date instanceof Date)
						date = this._local_to_utc(date);
					dates.push(date);
				}, this));
				fromArgs = true;
			}
			else {
				dates = this.isInput
						? this.element.val()
						: this.element.data('date') || this.element.find('input').val();
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function(date){
				return DPGlobal.parseDate(date, this.o.format, this.o.language);
			}, this));
			dates = $.grep(dates, $.proxy(function(date){
				return (
					date < this.o.startDate ||
					date > this.o.endDate ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);

			if (this.dates.length)
				this.viewDate = new Date(this.dates.get(-1));
			else if (this.viewDate < this.o.startDate)
				this.viewDate = new Date(this.o.startDate);
			else if (this.viewDate > this.o.endDate)
				this.viewDate = new Date(this.o.endDate);

			if (fromArgs){
				// setting date by clicking
				this.setValue();
			}
			else if (dates.length){
				// setting date by typing
				if (String(oldDates) !== String(this.dates))
					this._trigger('changeDate');
			}
			if (!this.dates.length && oldDates.length)
				this._trigger('clearDate');

			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.o.weekStart,
				html = '<tr>';
			if (this.o.calendarWeeks){
				var cell = '<th class="cw">&nbsp;</th>';
				html += cell;
				this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
			}
			while (dowCnt < this.o.weekStart + 7){
				html += '<th class="dow">'+dates[this.o.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '',
			i = 0;
			while (i < 12){
				html += '<span class="month">'+dates[this.o.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function(range){
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d){
					return d.valueOf();
				});
			this.fill();
		},

		getClassNames: function(date){
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)){
				cls.push('old');
			}
			else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)){
				cls.push('new');
			}
			if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
				cls.push('focused');
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() === today.getFullYear() &&
				date.getUTCMonth() === today.getMonth() &&
				date.getUTCDate() === today.getDate()){
				cls.push('today');
			}
			if (this.dates.contains(date) !== -1)
				cls.push('active');
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1){
				cls.push('disabled');
			}
			if (this.range){
				if (date > this.range[0] && date < this.range[this.range.length-1]){
					cls.push('range');
				}
				if ($.inArray(date.valueOf(), this.range) !== -1){
					cls.push('selected');
				}
			}
			return cls;
		},

		fill: function(){
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				todaytxt = dates[this.o.language].today || dates['en'].today || '',
				cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
				tooltip;
			if (isNaN(year) || isNaN(month)) return;
			this.picker.find('.datepicker-days thead th.datepicker-switch')
						.text(dates[this.o.language].months[month]+' '+year);
			this.picker.find('tfoot th.today')
						.text(todaytxt)
						.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot th.clear')
						.text(cleartxt)
						.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth){
				if (prevMonth.getUTCDay() === this.o.weekStart){
					html.push('<tr>');
					if (this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">'+ calWeek +'</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('day');

				if (this.o.beforeShowDay !== $.noop){
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {enabled: before};
					else if (typeof(before) === 'string')
						before = {classes: before};
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				tooltip = null;
				if (prevMonth.getUTCDay() === this.o.weekEnd){
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');

			$.each(this.dates, function(i, d){
				if (d.getUTCFullYear() === year)
					months.eq(d.getUTCMonth()).addClass('active');
			});

			if (year < startYear || year > endYear){
				months.addClass('disabled');
			}
			if (year === startYear){
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year === endYear){
				months.slice(endMonth+1).addClass('disabled');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			var years = $.map(this.dates, function(d){
					return d.getUTCFullYear();
				}),
				classes;
			for (var i = -1; i < 11; i++){
				classes = ['year'];
				if (i === -1)
					classes.push('old');
				else if (i === 10)
					classes.push('new');
				if ($.inArray(year, years) !== -1)
					classes.push('active');
				if (year < startYear || year > endYear)
					classes.push('disabled');
				html += '<span class="' + classes.join(' ') + '">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function(){
			if (!this._allow_update)
				return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode){
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e){
			e.preventDefault();
			var target = $(e.target).closest('span, td, th'),
				year, month, day;
			if (target.length === 1){
				switch (target[0].nodeName.toLowerCase()){
					case 'th':
						switch (target[0].className){
							case 'datepicker-switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
								switch (this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn === 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'clear':
								var element;
								if (this.isInput)
									element = this.element;
								else if (this.component)
									element = this.element.find('input');
								if (element)
									element.val("").change();
								this.update();
								this._trigger('changeDate');
								if (this.o.autoclose)
									this.hide();
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled')){
							this.viewDate.setUTCDate(1);
							if (target.is('.month')){
								day = 1;
								month = target.parent().find('span').index(target);
								year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1){
									this._setDate(UTCDate(year, month, day));
								}
							}
							else {
								day = 1;
								month = 0;
								year = parseInt(target.text(), 10)||0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2){
									this._setDate(UTCDate(year, month, day));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')){
							day = parseInt(target.text(), 10)||1;
							year = this.viewDate.getUTCFullYear();
							month = this.viewDate.getUTCMonth();
							if (target.is('.old')){
								if (month === 0){
									month = 11;
									year -= 1;
								}
								else {
									month -= 1;
								}
							}
							else if (target.is('.new')){
								if (month === 11){
									month = 0;
									year += 1;
								}
								else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day));
						}
						break;
				}
			}
			if (this.picker.is(':visible') && this._focused_from){
				$(this._focused_from).focus();
			}
			delete this._focused_from;
		},

		_toggle_multidate: function(date){
			var ix = this.dates.contains(date);
			if (!date){
				this.dates.clear();
			}
			if (this.o.multidate === 1 && ix === 0){
                // single datepicker, don't remove selected date
            }
			else if (ix !== -1){
				this.dates.remove(ix);
			}
			else {
				this.dates.push(date);
			}
			if (typeof this.o.multidate === 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function(date, which){
			if (!which || which === 'date')
				this._toggle_multidate(date && new Date(date));
			if (!which || which  === 'view')
				this.viewDate = date && new Date(date);

			this.fill();
			this.setValue();
			this._trigger('changeDate');
			var element;
			if (this.isInput){
				element = this.element;
			}
			else if (this.component){
				element = this.element.find('input');
			}
			if (element){
				element.change();
			}
			if (this.o.autoclose && (!which || which === 'date')){
				this.hide();
			}
		},

		moveMonth: function(date, dir){
			if (!date)
				return undefined;
			if (!dir)
				return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag === 1){
				test = dir === -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){
						return new_date.getUTCMonth() === month;
					}
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){
						return new_date.getUTCMonth() !== new_month;
					};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			}
			else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i < mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){
					return new_month !== new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir){
			return this.moveMonth(date, dir*12);
		},

		dateWithinRange: function(date){
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e){
			if (this.picker.is(':not(:visible)')){
				if (e.keyCode === 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, newDate, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch (e.keyCode){
				case 27: // escape
					if (this.focusDate){
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					}
					else
						this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 32: // spacebar
					// Spacebar is used in manually typing dates in some formats.
					// As such, its behavior should not be hijacked.
					break;
				case 13: // enter
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					if (this.o.keyboardNavigation) {
						this._toggle_multidate(focusDate);
						dateChanged = true;
					}
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')){
						e.preventDefault();
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged){
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
				var element;
				if (this.isInput){
					element = this.element;
				}
				else if (this.component){
					element = this.element.find('input');
				}
				if (element){
					element.change();
				}
			}
		},

		showMode: function(dir){
			if (dir){
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker
				.find('>div')
				.hide()
				.filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName)
					.css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options){
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i){
			return i.jquery ? i[0] : i;
		});
		delete options.inputs;

		$(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i){
			return $(i).data('datepicker');
		});
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function(){
			this.dates = $.map(this.pickers, function(i){
				return i.getUTCDate();
			});
			this.updateRanges();
		},
		updateRanges: function(){
			var range = $.map(this.dates, function(d){
				return d.valueOf();
			});
			$.each(this.pickers, function(i, p){
				p.setRange(range);
			});
		},
		dateUpdated: function(e){
			// `this.updating` is a workaround for preventing infinite recursion
			// between `changeDate` triggering and `setUTCDate` calling.  Until
			// there is a better mechanism.
			if (this.updating)
				return;
			this.updating = true;

			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
			if (i === -1)
				return;

			$.each(this.pickers, function(i, p){
				if (!p.getUTCDate())
					p.setUTCDate(new_date);
			});

			if (new_date < this.dates[i]){
				// Date being moved earlier/left
				while (i >= 0 && new_date < this.dates[i]){
					this.pickers[i--].setUTCDate(new_date);
				}
			}
			else if (new_date > this.dates[i]){
				// Date being moved later/right
				while (i < l && new_date > this.dates[i]){
					this.pickers[i++].setUTCDate(new_date);
				}
			}
			this.updateDates();

			delete this.updating;
		},
		remove: function(){
			$.map(this.pickers, function(p){ p.remove(); });
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix){
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
		prefix = new RegExp('^' + prefix.toLowerCase());
		function re_lower(_,a){
			return a.toLowerCase();
		}
		for (var key in data)
			if (prefix.test(key)){
				inkey = key.replace(replace, re_lower);
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang){
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]){
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i,k){
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	$.fn.datepicker = function(option){
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function(){
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data){
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.is('.input-daterange') || opts.inputs){
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				}
				else {
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option === 'string' && typeof data[option] === 'function'){
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};

	var defaults = $.fn.datepicker.defaults = {
		autoclose: false,
		beforeShowDay: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		daysOfWeekDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'mm/dd/yyyy',
		keyboardNavigation: true,
		language: 'en',
		minViewMode: 0,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: false,
		weekStart: 0
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		}
	};

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function(year){
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function(year, month){
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language){
			if (!date)
				return undefined;
			if (date instanceof Date)
				return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var part_re = /([\-+]\d+)([dmwy])/,
				parts = date.match(/([\-+]\d+)([dmwy])/g),
				part, dir, i;
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)){
				date = new Date();
				for (i=0; i < parts.length; i++){
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch (part[2]){
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			parts = date && date.match(this.nonpunctuation) || [];
			date = new Date();
			var parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d,v){
						return d.setUTCFullYear(v);
					},
					yy: function(d,v){
						return d.setUTCFullYear(2000+v);
					},
					m: function(d,v){
						if (isNaN(d))
							return d;
						v -= 1;
						while (v < 0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() !== v)
							d.setUTCDate(d.getUTCDate()-1);
						return d;
					},
					d: function(d,v){
						return d.setUTCDate(v);
					}
				},
				val, filtered;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length !== fparts.length){
				fparts = $(fparts).filter(function(i,p){
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			function match_part(){
				var m = this.slice(0, parts[i].length),
					p = parts[i].slice(0, m.length);
				return m === p;
			}
			if (parts.length === fparts.length){
				var cnt;
				for (i=0, cnt = fparts.length; i < cnt; i++){
					val = parseInt(parts[i], 10);
					part = fparts[i];
					if (isNaN(val)){
						switch (part){
							case 'MM':
								filtered = $(dates[language].months).filter(match_part);
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(match_part);
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				var _date, s;
				for (i=0; i < setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])){
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			for (var i=0, cnt = format.parts.length; i <= cnt; i++){
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev">&laquo;</th>'+
								'<th colspan="5" class="datepicker-switch"></th>'+
								'<th class="next">&raquo;</th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot>'+
							'<tr>'+
								'<th colspan="7" class="today"></th>'+
							'</tr>'+
							'<tr>'+
								'<th colspan="7" class="clear"></th>'+
							'</tr>'+
						'</tfoot>'
	};
	DPGlobal.template = '<div class="datepicker">'+
							'<div class="datepicker-days">'+
								'<table class=" table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	* =================== */

	$.fn.datepicker.noConflict = function(){
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function(e){
			var $this = $(this);
			if ($this.data('datepicker'))
				return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datepicker('show');
		}
	);
	$(function(){
		$('[data-provide="datepicker-inline"]').datepicker();
	});

}(window.jQuery));


// typeahead.js v0.10.5
// https://github.com/twitter/typeahead.js | Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
// --------------------------------------------------------------------------------------------------------------------------------------------------------
(function($) {
	var _ = function() {
		"use strict";
		return {
			isMsie: function() {
				return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
			},
			isBlankString: function(str) {
				return !str || /^\s*$/.test(str);
			},
			escapeRegExChars: function(str) {
				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			},
			isString: function(obj) {
				return typeof obj === "string";
			},
			isNumber: function(obj) {
				return typeof obj === "number";
			},
			isArray: $.isArray,
			isFunction: $.isFunction,
			isObject: $.isPlainObject,
			isUndefined: function(obj) {
				return typeof obj === "undefined";
			},
			toStr: function toStr(s) {
				return _.isUndefined(s) || s === null ? "" : s + "";
			},
			bind: $.proxy,
			each: function(collection, cb) {
				$.each(collection, reverseArgs);
				function reverseArgs(index, value) {
					return cb(value, index);
				}
			},
			map: $.map,
			filter: $.grep,
			every: function(obj, test) {
				var result = true;
				if (!obj) {
					return result;
				}
				$.each(obj, function(key, val) {
					if (!(result = test.call(null, val, key, obj))) {
						return false;
					}
				});
				return !!result;
			},
			some: function(obj, test) {
				var result = false;
				if (!obj) {
					return result;
				}
				$.each(obj, function(key, val) {
					if (result = test.call(null, val, key, obj)) {
						return false;
					}
				});
				return !!result;
			},
			mixin: $.extend,
			getUniqueId: function() {
				var counter = 0;
				return function() {
					return counter++;
				};
			}(),
			templatify: function templatify(obj) {
				return $.isFunction(obj) ? obj : template;
				function template() {
					return String(obj);
				}
			},
			defer: function(fn) {
				setTimeout(fn, 0);
			},
			debounce: function(func, wait, immediate) {
				var timeout, result;
				return function() {
					var context = this, args = arguments, later, callNow;
					later = function() {
						timeout = null;
						if (!immediate) {
							result = func.apply(context, args);
						}
					};
					callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) {
						result = func.apply(context, args);
					}
					return result;
				};
			},
			throttle: function(func, wait) {
				var context, args, timeout, result, previous, later;
				previous = 0;
				later = function() {
					previous = new Date();
					timeout = null;
					result = func.apply(context, args);
				};
				return function() {
					var now = new Date(), remaining = wait - (now - previous);
					context = this;
					args = arguments;
					if (remaining <= 0) {
						clearTimeout(timeout);
						timeout = null;
						previous = now;
						result = func.apply(context, args);
					} else if (!timeout) {
						timeout = setTimeout(later, remaining);
					}
					return result;
				};
			},
			noop: function() {}
		};
	}();
	var html = function() {
		return {
			wrapper: '<span class="twitter-typeahead"></span>',
			dropdown: '<span class="tt-dropdown-menu"></span>',
			dataset: '<div class="tt-dataset-%CLASS%"></div>',
			suggestions: '<span class="tt-suggestions"></span>',
			suggestion: '<div class="tt-suggestion"></div>'
		};
	}();
	var css = function() {
		"use strict";
		var css = {
			wrapper: {
				position: "relative",
				display: "inline-block"
			},
			hint: {
				position: "absolute",
				top: "0",
				left: "0",
				borderColor: "transparent",
				boxShadow: "none",
				opacity: "1"
			},
			input: {
				position: "relative",
				verticalAlign: "top",
				backgroundColor: "transparent"
			},
			inputWithNoHint: {
				position: "relative",
				verticalAlign: "top"
			},
			dropdown: {
				position: "absolute",
				top: "100%",
				left: "0",
				zIndex: "100",
				display: "none"
			},
			suggestions: {
				display: "block"
			},
			suggestion: {
				whiteSpace: "nowrap",
				cursor: "pointer"
			},
			suggestionChild: {
				whiteSpace: "normal"
			},
			ltr: {
				left: "0",
				right: "auto"
			},
			rtl: {
				left: "auto",
				right: " 0"
			}
		};
		if (_.isMsie()) {
			_.mixin(css.input, {
				backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
			});
		}
		if (_.isMsie() && _.isMsie() <= 7) {
			_.mixin(css.input, {
				marginTop: "-1px"
			});
		}
		return css;
	}();
	var EventBus = function() {
		"use strict";
		var namespace = "typeahead:";
		function EventBus(o) {
			if (!o || !o.el) {
				$.error("EventBus initialized without el");
			}
			this.$el = $(o.el);
		}
		_.mixin(EventBus.prototype, {
			trigger: function(type) {
				var args = [].slice.call(arguments, 1);
				this.$el.trigger(namespace + type, args);
			}
		});
		return EventBus;
	}();
	var EventEmitter = function() {
		"use strict";
		var splitter = /\s+/, nextTick = getNextTick();
		return {
			onSync: onSync,
			onAsync: onAsync,
			off: off,
			trigger: trigger
		};
		function on(method, types, cb, context) {
			var type;
			if (!cb) {
				return this;
			}
			types = types.split(splitter);
			cb = context ? bindContext(cb, context) : cb;
			this._callbacks = this._callbacks || {};
			while (type = types.shift()) {
				this._callbacks[type] = this._callbacks[type] || {
					sync: [],
					async: []
				};
				this._callbacks[type][method].push(cb);
			}
			return this;
		}
		function onAsync(types, cb, context) {
			return on.call(this, "async", types, cb, context);
		}
		function onSync(types, cb, context) {
			return on.call(this, "sync", types, cb, context);
		}
		function off(types) {
			var type;
			if (!this._callbacks) {
				return this;
			}
			types = types.split(splitter);
			while (type = types.shift()) {
				delete this._callbacks[type];
			}
			return this;
		}
		function trigger(types) {
			var type, callbacks, args, syncFlush, asyncFlush;
			if (!this._callbacks) {
				return this;
			}
			types = types.split(splitter);
			args = [].slice.call(arguments, 1);
			while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
				syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
				asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
				syncFlush() && nextTick(asyncFlush);
			}
			return this;
		}
		function getFlush(callbacks, context, args) {
			return flush;
			function flush() {
				var cancelled;
				for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
					cancelled = callbacks[i].apply(context, args) === false;
				}
				return !cancelled;
			}
		}
		function getNextTick() {
			var nextTickFn;
			if (window.setImmediate) {
				nextTickFn = function nextTickSetImmediate(fn) {
					setImmediate(function() {
						fn();
					});
				};
			} else {
				nextTickFn = function nextTickSetTimeout(fn) {
					setTimeout(function() {
						fn();
					}, 0);
				};
			}
			return nextTickFn;
		}
		function bindContext(fn, context) {
			return fn.bind ? fn.bind(context) : function() {
				fn.apply(context, [].slice.call(arguments, 0));
			};
		}
	}();
	var highlight = function(doc) {
		"use strict";
		var defaults = {
			node: null,
			pattern: null,
			tagName: "strong",
			className: null,
			wordsOnly: false,
			caseSensitive: false
		};
		return function hightlight(o) {
			var regex;
			o = _.mixin({}, defaults, o);
			if (!o.node || !o.pattern) {
				return;
			}
			o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
			regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
			traverse(o.node, hightlightTextNode);
			function hightlightTextNode(textNode) {
				var match, patternNode, wrapperNode;
				if (match = regex.exec(textNode.data)) {
					wrapperNode = doc.createElement(o.tagName);
					o.className && (wrapperNode.className = o.className);
					patternNode = textNode.splitText(match.index);
					patternNode.splitText(match[0].length);
					wrapperNode.appendChild(patternNode.cloneNode(true));
					textNode.parentNode.replaceChild(wrapperNode, patternNode);
				}
				return !!match;
			}
			function traverse(el, hightlightTextNode) {
				var childNode, TEXT_NODE_TYPE = 3;
				for (var i = 0; i < el.childNodes.length; i++) {
					childNode = el.childNodes[i];
					if (childNode.nodeType === TEXT_NODE_TYPE) {
						i += hightlightTextNode(childNode) ? 1 : 0;
					} else {
						traverse(childNode, hightlightTextNode);
					}
				}
			}
		};
		function getRegex(patterns, caseSensitive, wordsOnly) {
			var escapedPatterns = [], regexStr;
			for (var i = 0, len = patterns.length; i < len; i++) {
				escapedPatterns.push(_.escapeRegExChars(patterns[i]));
			}
			regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
			return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
		}
	}(window.document);
	var Input = function() {
		"use strict";
		var specialKeyCodeMap;
		specialKeyCodeMap = {
			9: "tab",
			27: "esc",
			37: "left",
			39: "right",
			13: "enter",
			38: "up",
			40: "down"
		};
		function Input(o) {
			var that = this, onBlur, onFocus, onKeydown, onInput;
			o = o || {};
			if (!o.input) {
				$.error("input is missing");
			}
			onBlur = _.bind(this._onBlur, this);
			onFocus = _.bind(this._onFocus, this);
			onKeydown = _.bind(this._onKeydown, this);
			onInput = _.bind(this._onInput, this);
			this.$hint = $(o.hint);
			this.$input = $(o.input).on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
			if (this.$hint.length === 0) {
				this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
			}
			if (!_.isMsie()) {
				this.$input.on("input.tt", onInput);
			} else {
				this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
					if (specialKeyCodeMap[$e.which || $e.keyCode]) {
						return;
					}
					_.defer(_.bind(that._onInput, that, $e));
				});
			}
			this.query = this.$input.val();
			this.$overflowHelper = buildOverflowHelper(this.$input);
		}
		Input.normalizeQuery = function(str) {
			return (str || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
		};
		_.mixin(Input.prototype, EventEmitter, {
			_onBlur: function onBlur() {
				this.resetInputValue();
				this.trigger("blurred");
			},
			_onFocus: function onFocus() {
				this.trigger("focused");
			},
			_onKeydown: function onKeydown($e) {
				var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
				this._managePreventDefault(keyName, $e);
				if (keyName && this._shouldTrigger(keyName, $e)) {
					this.trigger(keyName + "Keyed", $e);
				}
			},
			_onInput: function onInput() {
				this._checkInputValue();
			},
			_managePreventDefault: function managePreventDefault(keyName, $e) {
				var preventDefault, hintValue, inputValue;
				switch (keyName) {
				  case "tab":
					hintValue = this.getHint();
					inputValue = this.getInputValue();
					preventDefault = hintValue && hintValue !== inputValue && !withModifier($e);
					break;

				  case "up":
				  case "down":
					preventDefault = !withModifier($e);
					break;

				  default:
					preventDefault = false;
				}
				preventDefault && $e.preventDefault();
			},
			_shouldTrigger: function shouldTrigger(keyName, $e) {
				var trigger;
				switch (keyName) {
				  case "tab":
					trigger = !withModifier($e);
					break;

				  default:
					trigger = true;
				}
				return trigger;
			},
			_checkInputValue: function checkInputValue() {
				var inputValue, areEquivalent, hasDifferentWhitespace;
				inputValue = this.getInputValue();
				areEquivalent = areQueriesEquivalent(inputValue, this.query);
				hasDifferentWhitespace = areEquivalent ? this.query.length !== inputValue.length : false;
				this.query = inputValue;
				if (!areEquivalent) {
					this.trigger("queryChanged", this.query);
				} else if (hasDifferentWhitespace) {
					this.trigger("whitespaceChanged", this.query);
				}
			},
			focus: function focus() {
				this.$input.focus();
			},
			blur: function blur() {
				this.$input.blur();
			},
			getQuery: function getQuery() {
				return this.query;
			},
			setQuery: function setQuery(query) {
				this.query = query;
			},
			getInputValue: function getInputValue() {
				return this.$input.val();
			},
			setInputValue: function setInputValue(value, silent) {
				this.$input.val(value);
				silent ? this.clearHint() : this._checkInputValue();
			},
			resetInputValue: function resetInputValue() {
				this.setInputValue(this.query, true);
			},
			getHint: function getHint() {
				return this.$hint.val();
			},
			setHint: function setHint(value) {
				this.$hint.val(value);
			},
			clearHint: function clearHint() {
				this.setHint("");
			},
			clearHintIfInvalid: function clearHintIfInvalid() {
				var val, hint, valIsPrefixOfHint, isValid;
				val = this.getInputValue();
				hint = this.getHint();
				valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
				isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
				!isValid && this.clearHint();
			},
			getLanguageDirection: function getLanguageDirection() {
				return (this.$input.css("direction") || "ltr").toLowerCase();
			},
			hasOverflow: function hasOverflow() {
				var constraint = this.$input.width() - 2;
				this.$overflowHelper.text(this.getInputValue());
				return this.$overflowHelper.width() >= constraint;
			},
			isCursorAtEnd: function() {
				var valueLength, selectionStart, range;
				valueLength = this.$input.val().length;
				selectionStart = this.$input[0].selectionStart;
				if (_.isNumber(selectionStart)) {
					return selectionStart === valueLength;
				} else if (document.selection) {
					range = document.selection.createRange();
					range.moveStart("character", -valueLength);
					return valueLength === range.text.length;
				}
				return true;
			},
			destroy: function destroy() {
				this.$hint.off(".tt");
				this.$input.off(".tt");
				this.$hint = this.$input = this.$overflowHelper = null;
			}
		});
		return Input;
		function buildOverflowHelper($input) {
			return $('<pre aria-hidden="true"></pre>').css({
				position: "absolute",
				visibility: "hidden",
				whiteSpace: "pre",
				fontFamily: $input.css("font-family"),
				fontSize: $input.css("font-size"),
				fontStyle: $input.css("font-style"),
				fontVariant: $input.css("font-variant"),
				fontWeight: $input.css("font-weight"),
				wordSpacing: $input.css("word-spacing"),
				letterSpacing: $input.css("letter-spacing"),
				textIndent: $input.css("text-indent"),
				textRendering: $input.css("text-rendering"),
				textTransform: $input.css("text-transform")
			}).insertAfter($input);
		}
		function areQueriesEquivalent(a, b) {
			return Input.normalizeQuery(a) === Input.normalizeQuery(b);
		}
		function withModifier($e) {
			return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
		}
	}();
	var Dataset = function() {
		"use strict";
		var datasetKey = "ttDataset", valueKey = "ttValue", datumKey = "ttDatum";
		function Dataset(o) {
			o = o || {};
			o.templates = o.templates || {};
			if (!o.source) {
				$.error("missing source");
			}
			if (o.name && !isValidName(o.name)) {
				$.error("invalid dataset name: " + o.name);
			}
			this.query = null;
			this.highlight = !!o.highlight;
			this.name = o.name || _.getUniqueId();
			this.source = o.source;
			this.displayFn = getDisplayFn(o.display || o.displayKey);
			this.templates = getTemplates(o.templates, this.displayFn);
			this.$el = $(html.dataset.replace("%CLASS%", this.name));
		}
		Dataset.extractDatasetName = function extractDatasetName(el) {
			return $(el).data(datasetKey);
		};
		Dataset.extractValue = function extractDatum(el) {
			return $(el).data(valueKey);
		};
		Dataset.extractDatum = function extractDatum(el) {
			return $(el).data(datumKey);
		};
		_.mixin(Dataset.prototype, EventEmitter, {
			_render: function render(query, suggestions) {
				if (!this.$el) {
					return;
				}
				var that = this, hasSuggestions;
				this.$el.empty();
				hasSuggestions = suggestions && suggestions.length;
				if (!hasSuggestions && this.templates.empty) {
					this.$el.html(getEmptyHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
				} else if (hasSuggestions) {
					this.$el.html(getSuggestionsHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
				}
				this.trigger("rendered");
				function getEmptyHtml() {
					return that.templates.empty({
						query: query,
						isEmpty: true
					});
				}
				function getSuggestionsHtml() {
					var $suggestions, nodes;
					$suggestions = $(html.suggestions).css(css.suggestions);
					nodes = _.map(suggestions, getSuggestionNode);
					$suggestions.append.apply($suggestions, nodes);
					that.highlight && highlight({
						className: "tt-highlight",
						node: $suggestions[0],
						pattern: query
					});
					return $suggestions;
					function getSuggestionNode(suggestion) {
						var $el;
						$el = $(html.suggestion).append(that.templates.suggestion(suggestion)).data(datasetKey, that.name).data(valueKey, that.displayFn(suggestion)).data(datumKey, suggestion);
						$el.children().each(function() {
							$(this).css(css.suggestionChild);
						});
						return $el;
					}
				}
				function getHeaderHtml() {
					return that.templates.header({
						query: query,
						isEmpty: !hasSuggestions
					});
				}
				function getFooterHtml() {
					return that.templates.footer({
						query: query,
						isEmpty: !hasSuggestions
					});
				}
			},
			getRoot: function getRoot() {
				return this.$el;
			},
			update: function update(query) {
				var that = this;
				this.query = query;
				this.canceled = false;
				this.source(query, render);
				function render(suggestions) {
					if (!that.canceled && query === that.query) {
						that._render(query, suggestions);
					}
				}
			},
			cancel: function cancel() {
				this.canceled = true;
			},
			clear: function clear() {
				this.cancel();
				this.$el.empty();
				this.trigger("rendered");
			},
			isEmpty: function isEmpty() {
				return this.$el.is(":empty");
			},
			destroy: function destroy() {
				this.$el = null;
			}
		});
		return Dataset;
		function getDisplayFn(display) {
			display = display || "value";
			return _.isFunction(display) ? display : displayFn;
			function displayFn(obj) {
				return obj[display];
			}
		}
		function getTemplates(templates, displayFn) {
			return {
				empty: templates.empty && _.templatify(templates.empty),
				header: templates.header && _.templatify(templates.header),
				footer: templates.footer && _.templatify(templates.footer),
				suggestion: templates.suggestion || suggestionTemplate
			};
			function suggestionTemplate(context) {
				return "<p>" + displayFn(context) + "</p>";
			}
		}
		function isValidName(str) {
			return /^[_a-zA-Z0-9-]+$/.test(str);
		}
	}();
	var Dropdown = function() {
		"use strict";
		function Dropdown(o) {
			var that = this, onSuggestionClick, onSuggestionMouseEnter, onSuggestionMouseLeave;
			o = o || {};
			if (!o.menu) {
				$.error("menu is required");
			}
			this.isOpen = false;
			this.isEmpty = true;
			this.datasets = _.map(o.datasets, initializeDataset);
			onSuggestionClick = _.bind(this._onSuggestionClick, this);
			onSuggestionMouseEnter = _.bind(this._onSuggestionMouseEnter, this);
			onSuggestionMouseLeave = _.bind(this._onSuggestionMouseLeave, this);
			this.$menu = $(o.menu).on("click.tt", ".tt-suggestion", onSuggestionClick).on("mouseenter.tt", ".tt-suggestion", onSuggestionMouseEnter).on("mouseleave.tt", ".tt-suggestion", onSuggestionMouseLeave);
			_.each(this.datasets, function(dataset) {
				that.$menu.append(dataset.getRoot());
				dataset.onSync("rendered", that._onRendered, that);
			});
		}
		_.mixin(Dropdown.prototype, EventEmitter, {
			_onSuggestionClick: function onSuggestionClick($e) {
				this.trigger("suggestionClicked", $($e.currentTarget));
			},
			_onSuggestionMouseEnter: function onSuggestionMouseEnter($e) {
				this._removeCursor();
				this._setCursor($($e.currentTarget), true);
			},
			_onSuggestionMouseLeave: function onSuggestionMouseLeave() {
				this._removeCursor();
			},
			_onRendered: function onRendered() {
				this.isEmpty = _.every(this.datasets, isDatasetEmpty);
				this.isEmpty ? this._hide() : this.isOpen && this._show();
				this.trigger("datasetRendered");
				function isDatasetEmpty(dataset) {
					return dataset.isEmpty();
				}
			},
			_hide: function() {
				this.$menu.hide();
			},
			_show: function() {
				this.$menu.css("display", "block");
			},
			_getSuggestions: function getSuggestions() {
				return this.$menu.find(".tt-suggestion");
			},
			_getCursor: function getCursor() {
				return this.$menu.find(".tt-cursor").first();
			},
			_setCursor: function setCursor($el, silent) {
				$el.first().addClass("tt-cursor");
				!silent && this.trigger("cursorMoved");
			},
			_removeCursor: function removeCursor() {
				this._getCursor().removeClass("tt-cursor");
			},
			_moveCursor: function moveCursor(increment) {
				var $suggestions, $oldCursor, newCursorIndex, $newCursor;
				if (!this.isOpen) {
					return;
				}
				$oldCursor = this._getCursor();
				$suggestions = this._getSuggestions();
				this._removeCursor();
				newCursorIndex = $suggestions.index($oldCursor) + increment;
				newCursorIndex = (newCursorIndex + 1) % ($suggestions.length + 1) - 1;
				if (newCursorIndex === -1) {
					this.trigger("cursorRemoved");
					return;
				} else if (newCursorIndex < -1) {
					newCursorIndex = $suggestions.length - 1;
				}
				this._setCursor($newCursor = $suggestions.eq(newCursorIndex));
				this._ensureVisible($newCursor);
			},
			_ensureVisible: function ensureVisible($el) {
				var elTop, elBottom, menuScrollTop, menuHeight;
				elTop = $el.position().top;
				elBottom = elTop + $el.outerHeight(true);
				menuScrollTop = this.$menu.scrollTop();
				menuHeight = this.$menu.height() + parseInt(this.$menu.css("paddingTop"), 10) + parseInt(this.$menu.css("paddingBottom"), 10);
				if (elTop < 0) {
					this.$menu.scrollTop(menuScrollTop + elTop);
				} else if (menuHeight < elBottom) {
					this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
				}
			},
			close: function close() {
				if (this.isOpen) {
					this.isOpen = false;
					this._removeCursor();
					this._hide();
					this.trigger("closed");
				}
			},
			open: function open() {
				if (!this.isOpen) {
					this.isOpen = true;
					!this.isEmpty && this._show();
					this.trigger("opened");
				}
			},
			setLanguageDirection: function setLanguageDirection(dir) {
				this.$menu.css(dir === "ltr" ? css.ltr : css.rtl);
			},
			moveCursorUp: function moveCursorUp() {
				this._moveCursor(-1);
			},
			moveCursorDown: function moveCursorDown() {
				this._moveCursor(+1);
			},
			getDatumForSuggestion: function getDatumForSuggestion($el) {
				var datum = null;
				if ($el.length) {
					datum = {
						raw: Dataset.extractDatum($el),
						value: Dataset.extractValue($el),
						datasetName: Dataset.extractDatasetName($el)
					};
				}
				return datum;
			},
			getDatumForCursor: function getDatumForCursor() {
				return this.getDatumForSuggestion(this._getCursor().first());
			},
			getDatumForTopSuggestion: function getDatumForTopSuggestion() {
				return this.getDatumForSuggestion(this._getSuggestions().first());
			},
			update: function update(query) {
				_.each(this.datasets, updateDataset);
				function updateDataset(dataset) {
					dataset.update(query);
				}
			},
			empty: function empty() {
				_.each(this.datasets, clearDataset);
				this.isEmpty = true;
				function clearDataset(dataset) {
					dataset.clear();
				}
			},
			isVisible: function isVisible() {
				return this.isOpen && !this.isEmpty;
			},
			destroy: function destroy() {
				this.$menu.off(".tt");
				this.$menu = null;
				_.each(this.datasets, destroyDataset);
				function destroyDataset(dataset) {
					dataset.destroy();
				}
			}
		});
		return Dropdown;
		function initializeDataset(oDataset) {
			return new Dataset(oDataset);
		}
	}();
	var Typeahead = function() {
		"use strict";
		var attrsKey = "ttAttrs";
		function Typeahead(o) {
			var $menu, $input, $hint;
			o = o || {};
			if (!o.input) {
				$.error("missing input");
			}
			this.isActivated = false;
			this.autoselect = !!o.autoselect;
			this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
			this.$node = buildDom(o.input, o.withHint);
			$menu = this.$node.find(".tt-dropdown-menu");
			$input = this.$node.find(".tt-input");
			$hint = this.$node.find(".tt-hint");
			$input.on("blur.tt", function($e) {
				var active, isActive, hasActive;
				active = document.activeElement;
				isActive = $menu.is(active);
				hasActive = $menu.has(active).length > 0;
				if (_.isMsie() && (isActive || hasActive)) {
					$e.preventDefault();
					$e.stopImmediatePropagation();
					_.defer(function() {
						$input.focus();
					});
				}
			});
			$menu.on("mousedown.tt", function($e) {
				$e.preventDefault();
			});
			this.eventBus = o.eventBus || new EventBus({
				el: $input
			});
			this.dropdown = new Dropdown({
				menu: $menu,
				datasets: o.datasets
			}).onSync("suggestionClicked", this._onSuggestionClicked, this).onSync("cursorMoved", this._onCursorMoved, this).onSync("cursorRemoved", this._onCursorRemoved, this).onSync("opened", this._onOpened, this).onSync("closed", this._onClosed, this).onAsync("datasetRendered", this._onDatasetRendered, this);
			this.input = new Input({
				input: $input,
				hint: $hint
			}).onSync("focused", this._onFocused, this).onSync("blurred", this._onBlurred, this).onSync("enterKeyed", this._onEnterKeyed, this).onSync("tabKeyed", this._onTabKeyed, this).onSync("escKeyed", this._onEscKeyed, this).onSync("upKeyed", this._onUpKeyed, this).onSync("downKeyed", this._onDownKeyed, this).onSync("leftKeyed", this._onLeftKeyed, this).onSync("rightKeyed", this._onRightKeyed, this).onSync("queryChanged", this._onQueryChanged, this).onSync("whitespaceChanged", this._onWhitespaceChanged, this);
			this._setLanguageDirection();
		}
		_.mixin(Typeahead.prototype, {
			_onSuggestionClicked: function onSuggestionClicked(type, $el) {
				var datum;
				if (datum = this.dropdown.getDatumForSuggestion($el)) {
					this._select(datum);
				}
			},
			_onCursorMoved: function onCursorMoved() {
				var datum = this.dropdown.getDatumForCursor();
				this.input.setInputValue(datum.value, true);
				this.eventBus.trigger("cursorchanged", datum.raw, datum.datasetName);
			},
			_onCursorRemoved: function onCursorRemoved() {
				this.input.resetInputValue();
				this._updateHint();
			},
			_onDatasetRendered: function onDatasetRendered() {
				this._updateHint();
			},
			_onOpened: function onOpened() {
				this._updateHint();
				this.eventBus.trigger("opened");
			},
			_onClosed: function onClosed() {
				this.input.clearHint();
				this.eventBus.trigger("closed");
			},
			_onFocused: function onFocused() {
				this.isActivated = true;
				this.dropdown.open();
			},
			_onBlurred: function onBlurred() {
				this.isActivated = false;
				this.dropdown.empty();
				this.dropdown.close();
			},
			_onEnterKeyed: function onEnterKeyed(type, $e) {
				var cursorDatum, topSuggestionDatum;
				cursorDatum = this.dropdown.getDatumForCursor();
				topSuggestionDatum = this.dropdown.getDatumForTopSuggestion();
				if (cursorDatum) {
					this._select(cursorDatum);
					$e.preventDefault();
				} else if (this.autoselect && topSuggestionDatum) {
					this._select(topSuggestionDatum);
					$e.preventDefault();
				}
			},
			_onTabKeyed: function onTabKeyed(type, $e) {
				var datum;
				if (datum = this.dropdown.getDatumForCursor()) {
					this._select(datum);
					$e.preventDefault();
				} else {
					this._autocomplete(true);
				}
			},
			_onEscKeyed: function onEscKeyed() {
				this.dropdown.close();
				this.input.resetInputValue();
			},
			_onUpKeyed: function onUpKeyed() {
				var query = this.input.getQuery();
				this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorUp();
				this.dropdown.open();
			},
			_onDownKeyed: function onDownKeyed() {
				var query = this.input.getQuery();
				this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorDown();
				this.dropdown.open();
			},
			_onLeftKeyed: function onLeftKeyed() {
				this.dir === "rtl" && this._autocomplete();
			},
			_onRightKeyed: function onRightKeyed() {
				this.dir === "ltr" && this._autocomplete();
			},
			_onQueryChanged: function onQueryChanged(e, query) {
				this.input.clearHintIfInvalid();
				query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.empty();
				this.dropdown.open();
				this._setLanguageDirection();
			},
			_onWhitespaceChanged: function onWhitespaceChanged() {
				this._updateHint();
				this.dropdown.open();
			},
			_setLanguageDirection: function setLanguageDirection() {
				var dir;
				if (this.dir !== (dir = this.input.getLanguageDirection())) {
					this.dir = dir;
					this.$node.css("direction", dir);
					this.dropdown.setLanguageDirection(dir);
				}
			},
			_updateHint: function updateHint() {
				var datum, val, query, escapedQuery, frontMatchRegEx, match;
				datum = this.dropdown.getDatumForTopSuggestion();
				if (datum && this.dropdown.isVisible() && !this.input.hasOverflow()) {
					val = this.input.getInputValue();
					query = Input.normalizeQuery(val);
					escapedQuery = _.escapeRegExChars(query);
					frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
					match = frontMatchRegEx.exec(datum.value);
					match ? this.input.setHint(val + match[1]) : this.input.clearHint();
				} else {
					this.input.clearHint();
				}
			},
			_autocomplete: function autocomplete(laxCursor) {
				var hint, query, isCursorAtEnd, datum;
				hint = this.input.getHint();
				query = this.input.getQuery();
				isCursorAtEnd = laxCursor || this.input.isCursorAtEnd();
				if (hint && query !== hint && isCursorAtEnd) {
					datum = this.dropdown.getDatumForTopSuggestion();
					datum && this.input.setInputValue(datum.value);
					this.eventBus.trigger("autocompleted", datum.raw, datum.datasetName);
				}
			},
			_select: function select(datum) {
				this.input.setQuery(datum.value);
				this.input.setInputValue(datum.value, true);
				this._setLanguageDirection();
				this.eventBus.trigger("selected", datum.raw, datum.datasetName);
				this.dropdown.close();
				_.defer(_.bind(this.dropdown.empty, this.dropdown));
			},
			open: function open() {
				this.dropdown.open();
			},
			close: function close() {
				this.dropdown.close();
			},
			setVal: function setVal(val) {
				val = _.toStr(val);
				if (this.isActivated) {
					this.input.setInputValue(val);
				} else {
					this.input.setQuery(val);
					this.input.setInputValue(val, true);
				}
				this._setLanguageDirection();
			},
			getVal: function getVal() {
				return this.input.getQuery();
			},
			destroy: function destroy() {
				this.input.destroy();
				this.dropdown.destroy();
				destroyDomStructure(this.$node);
				this.$node = null;
			}
		});
		return Typeahead;
		function buildDom(input, withHint) {
			var $input, $wrapper, $dropdown, $hint;
			$input = $(input);
			$wrapper = $(html.wrapper).css(css.wrapper);
			$dropdown = $(html.dropdown).css(css.dropdown);
			$hint = $input.clone().css(css.hint).css(getBackgroundStyles($input));
			$hint.val("").removeData().addClass("tt-hint").removeAttr("id name placeholder required").prop("readonly", true).attr({
				autocomplete: "off",
				spellcheck: "false",
				tabindex: -1
			});
			$input.data(attrsKey, {
				dir: $input.attr("dir"),
				autocomplete: $input.attr("autocomplete"),
				spellcheck: $input.attr("spellcheck"),
				style: $input.attr("style")
			});
			$input.addClass("tt-input").attr({
				autocomplete: "off",
				spellcheck: false
			}).css(withHint ? css.input : css.inputWithNoHint);
			try {
				!$input.attr("dir") && $input.attr("dir", "auto");
			} catch (e) {}
			return $input.wrap($wrapper).parent().prepend(withHint ? $hint : null).append($dropdown);
		}
		function getBackgroundStyles($el) {
			return {
				backgroundAttachment: $el.css("background-attachment"),
				backgroundClip: $el.css("background-clip"),
				backgroundColor: $el.css("background-color"),
				backgroundImage: $el.css("background-image"),
				backgroundOrigin: $el.css("background-origin"),
				backgroundPosition: $el.css("background-position"),
				backgroundRepeat: $el.css("background-repeat"),
				backgroundSize: $el.css("background-size")
			};
		}
		function destroyDomStructure($node) {
			var $input = $node.find(".tt-input");
			_.each($input.data(attrsKey), function(val, key) {
				_.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
			});
			$input.detach().removeData(attrsKey).removeClass("tt-input").insertAfter($node);
			$node.remove();
		}
	}();
	(function() {
		"use strict";
		var old, typeaheadKey, methods;
		old = $.fn.typeahead;
		typeaheadKey = "ttTypeahead";
		methods = {
			initialize: function initialize(o, datasets) {
				datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
				o = o || {};
				return this.each(attach);
				function attach() {
					var $input = $(this), eventBus, typeahead;
					_.each(datasets, function(d) {
						d.highlight = !!o.highlight;
					});
					typeahead = new Typeahead({
						input: $input,
						eventBus: eventBus = new EventBus({
							el: $input
						}),
						withHint: _.isUndefined(o.hint) ? true : !!o.hint,
						minLength: o.minLength,
						autoselect: o.autoselect,
						datasets: datasets
					});
					$input.data(typeaheadKey, typeahead);
				}
			},
			open: function open() {
				return this.each(openTypeahead);
				function openTypeahead() {
					var $input = $(this), typeahead;
					if (typeahead = $input.data(typeaheadKey)) {
						typeahead.open();
					}
				}
			},
			close: function close() {
				return this.each(closeTypeahead);
				function closeTypeahead() {
					var $input = $(this), typeahead;
					if (typeahead = $input.data(typeaheadKey)) {
						typeahead.close();
					}
				}
			},
			val: function val(newVal) {
				return !arguments.length ? getVal(this.first()) : this.each(setVal);
				function setVal() {
					var $input = $(this), typeahead;
					if (typeahead = $input.data(typeaheadKey)) {
						typeahead.setVal(newVal);
					}
				}
				function getVal($input) {
					var typeahead, query;
					if (typeahead = $input.data(typeaheadKey)) {
						query = typeahead.getVal();
					}
					return query;
				}
			},
			destroy: function destroy() {
				return this.each(unattach);
				function unattach() {
					var $input = $(this), typeahead;
					if (typeahead = $input.data(typeaheadKey)) {
						typeahead.destroy();
						$input.removeData(typeaheadKey);
					}
				}
			}
		};
		$.fn.typeahead = function(method) {
			var tts;
			if (methods[method] && method !== "initialize") {
				tts = this.filter(function() {
					return !!$(this).data(typeaheadKey);
				});
				return methods[method].apply(tts, [].slice.call(arguments, 1));
			} else {
				return methods.initialize.apply(this, arguments);
			}
		};
		$.fn.typeahead.noConflict = function noConflict() {
			$.fn.typeahead = old;
			return this;
		};
	})();
})(window.jQuery);


// placeholder.js
// copyright 2012 James Allardice | http://jamesallardice.github.io/Placeholders.js/ | Licensed under MIT
// --------------------------------------------------------------------------------------------------------------------------------------------------------
(function(global) {

	'use strict';

	//
	// Test for support. We do this as early as possible to optimise for browsers
	// that have native support for the attribute.
	//

	var test = document.createElement('input');
	var nativeSupport = test.placeholder !== void 0;

	global.Placeholders = {
		nativeSupport: nativeSupport,
		disable: nativeSupport ? noop : disablePlaceholders,
		enable: nativeSupport ? noop : enablePlaceholders
	};

	if ( nativeSupport ) {
		return;
	}

	//
	// If we reach this point then the browser does not have native support for
	// the attribute.
	//

	// The list of input element types that support the placeholder attribute.
	var validTypes = [
		'text',
		'search',
		'url',
		'tel',
		'email',
		'password',
		'number',
		'textarea'
	];

	// The list of keycodes that are not allowed when the polyfill is configured
	// to hide-on-input.
	var badKeys = [

		// The following keys all cause the caret to jump to the end of the input
		// value.

		27, // Escape
		33, // Page up
		34, // Page down
		35, // End
		36, // Home

		// Arrow keys allow you to move the caret manually, which should be
		// prevented when the placeholder is visible.

		37, // Left
		38, // Up
		39, // Right
		40, // Down

		// The following keys allow you to modify the placeholder text by removing
		// characters, which should be prevented when the placeholder is visible.

		8, // Backspace
		46 // Delete
	];

	// Styling variables.
	var placeholderStyleColor = '#ccc';
	var placeholderClassName = 'placeholdersjs';
	var classNameRegExp = new RegExp('(?:^|\\s)' + placeholderClassName + '(?!\\S)');

	// The various data-* attributes used by the polyfill.
	var ATTR_CURRENT_VAL = 'data-placeholder-value';
	var ATTR_ACTIVE = 'data-placeholder-active';
	var ATTR_INPUT_TYPE = 'data-placeholder-type';
	var ATTR_FORM_HANDLED = 'data-placeholder-submit';
	var ATTR_EVENTS_BOUND = 'data-placeholder-bound';
	var ATTR_OPTION_FOCUS = 'data-placeholder-focus';
	var ATTR_OPTION_LIVE = 'data-placeholder-live';
	var ATTR_MAXLENGTH = 'data-placeholder-maxlength';

	// Various other variables used throughout the rest of the script.
	var UPDATE_INTERVAL = 100;
	var head = document.getElementsByTagName('head')[ 0 ];
	var root = document.documentElement;
	var Placeholders = global.Placeholders;
	var keydownVal;

	// Get references to all the input and textarea elements currently in the DOM
	// (live NodeList objects to we only need to do this once).
	var inputs = document.getElementsByTagName('input');
	var textareas = document.getElementsByTagName('textarea');

	// Get any settings declared as data-* attributes on the root element.
	// Currently the only options are whether to hide the placeholder on focus
	// or input and whether to auto-update.
	var hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === 'false';
	var liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== 'false';

	// Create style element for placeholder styles (instead of directly setting
	// style properties on elements - allows for better flexibility alongside
	// user-defined styles).
	var styleElem = document.createElement('style');
	styleElem.type = 'text/css';

	// Create style rules as text node.
	var styleRules = document.createTextNode(
		'.' + placeholderClassName + ' {' +
			'color:' + placeholderStyleColor + ';' +
		'}'
	);

	// Append style rules to newly created stylesheet.
	if ( styleElem.styleSheet ) {
		styleElem.styleSheet.cssText = styleRules.nodeValue;
	} else {
		styleElem.appendChild(styleRules);
	}

	// Prepend new style element to the head (before any existing stylesheets,
	// so user-defined rules take precedence).
	head.insertBefore(styleElem, head.firstChild);

	// Set up the placeholders.
	var placeholder;
	var elem;

	for ( var i = 0, len = inputs.length + textareas.length; i < len; i++ ) {

		// Find the next element. If we've already done all the inputs we move on
		// to the textareas.
		elem = i < inputs.length ? inputs[ i ] : textareas[ i - inputs.length ];

		// Get the value of the placeholder attribute, if any. IE10 emulating IE7
		// fails with getAttribute, hence the use of the attributes node.
		placeholder = elem.attributes.placeholder;

		// If the element has a placeholder attribute we need to modify it.
		if ( placeholder ) {

			// IE returns an empty object instead of undefined if the attribute is
			// not present.
			placeholder = placeholder.nodeValue;

			// Only apply the polyfill if this element is of a type that supports
			// placeholders and has a placeholder attribute with a non-empty value.
			if ( placeholder && inArray(validTypes, elem.type) ) {
				newElement(elem);
			}
		}
	}

	// If enabled, the polyfill will repeatedly check for changed/added elements
	// and apply to those as well.
	var timer = setInterval(function () {
		for ( var i = 0, len = inputs.length + textareas.length; i < len; i++ ) {
			elem = i < inputs.length ? inputs[ i ] : textareas[ i - inputs.length ];

			// Only apply the polyfill if this element is of a type that supports
			// placeholders, and has a placeholder attribute with a non-empty value.
			placeholder = elem.attributes.placeholder;

			if ( placeholder ) {

				placeholder = placeholder.nodeValue;

				if ( placeholder && inArray(validTypes, elem.type) ) {

					// If the element hasn't had event handlers bound to it then add
					// them.
					if ( !elem.getAttribute(ATTR_EVENTS_BOUND) ) {
						newElement(elem);
					}

					// If the placeholder value has changed or not been initialised yet
					// we need to update the display.
					if (
						placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) ||
						( elem.type === 'password' && !elem.getAttribute(ATTR_INPUT_TYPE) )
					) {

						// Attempt to change the type of password inputs (fails in IE < 9).
						if (
							elem.type === 'password' &&
							!elem.getAttribute(ATTR_INPUT_TYPE) &&
							changeType(elem, 'text')
						) {
							elem.setAttribute(ATTR_INPUT_TYPE, 'password');
						}

						// If the placeholder value has changed and the placeholder is
						// currently on display we need to change it.
						if ( elem.value === elem.getAttribute(ATTR_CURRENT_VAL) ) {
							elem.value = placeholder;
						}

						// Keep a reference to the current placeholder value in case it
						// changes via another script.
						elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
					}
				}
			} else if ( elem.getAttribute(ATTR_ACTIVE) ) {
				hidePlaceholder(elem);
				elem.removeAttribute(ATTR_CURRENT_VAL);
			}
		}

		// If live updates are not enabled cancel the timer.
		if ( !liveUpdates ) {
			clearInterval(timer);
		}
	}, UPDATE_INTERVAL);

	// Disabling placeholders before unloading the page prevents flash of
	// unstyled placeholders on load if the page was refreshed.
	addEventListener(global, 'beforeunload', function () {
		Placeholders.disable();
	});

	//
	// Utility functions
	//

	// No-op (used in place of public methods when native support is detected).
	function noop() {}

	// Avoid IE9 activeElement of death when an iframe is used.
	//
	// More info:
	//	- http://bugs.jquery.com/ticket/13393
	//	- https://github.com/jquery/jquery/commit/85fc5878b3c6af73f42d61eedf73013e7faae408
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) {}
	}

	// Check whether an item is in an array. We don't use Array.prototype.indexOf
	// so we don't clobber any existing polyfills. This is a really simple
	// alternative.
	function inArray( arr, item ) {
		for ( var i = 0, len = arr.length; i < len; i++ ) {
			if ( arr[ i ] === item ) {
				return true;
			}
		}
		return false;
	}

	// Cross-browser DOM event binding
	function addEventListener( elem, event, fn ) {
		if ( elem.addEventListener ) {
			return elem.addEventListener(event, fn, false);
		}
		if ( elem.attachEvent ) {
			return elem.attachEvent('on' + event, fn);
		}
	}

	// Move the caret to the index position specified. Assumes that the element
	// has focus.
	function moveCaret( elem, index ) {
		var range;
		if ( elem.createTextRange ) {
			range = elem.createTextRange();
			range.move('character', index);
			range.select();
		} else if ( elem.selectionStart ) {
			elem.focus();
			elem.setSelectionRange(index, index);
		}
	}

	// Attempt to change the type property of an input element.
	function changeType( elem, type ) {
		try {
			elem.type = type;
			return true;
		} catch ( e ) {
			// You can't change input type in IE8 and below.
			return false;
		}
	}

	function handleElem( node, callback ) {

		// Check if the passed in node is an input/textarea (in which case it can't
		// have any affected descendants).
		if ( node && node.getAttribute(ATTR_CURRENT_VAL) ) {
			callback(node);
		} else {

			// If an element was passed in, get all affected descendants. Otherwise,
			// get all affected elements in document.
			var handleInputs = node ? node.getElementsByTagName('input') : inputs;
			var handleTextareas = node ? node.getElementsByTagName('textarea') : textareas;

			var handleInputsLength = handleInputs ? handleInputs.length : 0;
			var handleTextareasLength = handleTextareas ? handleTextareas.length : 0;

			// Run the callback for each element.
			var len = handleInputsLength + handleTextareasLength;
			var elem;
			for ( var i = 0; i < len; i++ ) {

				elem = i < handleInputsLength ?
					handleInputs[ i ] :
					handleTextareas[ i - handleInputsLength ];

				callback(elem);
			}
		}
	}

	// Return all affected elements to their normal state (remove placeholder
	// value if present).
	function disablePlaceholders( node ) {
		handleElem(node, hidePlaceholder);
	}

	// Show the placeholder value on all appropriate elements.
	function enablePlaceholders( node ) {
		handleElem(node, showPlaceholder);
	}

	// Hide the placeholder value on a single element. Returns true if the
	// placeholder was hidden and false if it was not (because it wasn't visible
	// in the first place).
	function hidePlaceholder( elem, keydownValue ) {

		var valueChanged = !!keydownValue && elem.value !== keydownValue;
		var isPlaceholderValue = elem.value === elem.getAttribute(ATTR_CURRENT_VAL);

		if (
			( valueChanged || isPlaceholderValue ) &&
			elem.getAttribute(ATTR_ACTIVE) === 'true'
		) {

			elem.removeAttribute(ATTR_ACTIVE);
			elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), '');
			elem.className = elem.className.replace(classNameRegExp, '');

			// Restore the maxlength value. Old FF returns -1 if attribute not set.
			// See GH-56.
			var maxLength = elem.getAttribute(ATTR_MAXLENGTH);
			if ( parseInt(maxLength, 10) >= 0 ) {
				elem.setAttribute('maxLength', maxLength);
				elem.removeAttribute(ATTR_MAXLENGTH);
			}

			// If the polyfill has changed the type of the element we need to change
			// it back.
			var type = elem.getAttribute(ATTR_INPUT_TYPE);
			if ( type ) {
				elem.type = type;
			}

			return true;
		}

		return false;
	}

	// Show the placeholder value on a single element. Returns true if the
	// placeholder was shown and false if it was not (because it was already
	// visible).
	function showPlaceholder( elem ) {

		var val = elem.getAttribute(ATTR_CURRENT_VAL);

		if ( elem.value === '' && val ) {

			elem.setAttribute(ATTR_ACTIVE, 'true');
			elem.value = val;
			elem.className += ' ' + placeholderClassName;

			// Store and remove the maxlength value.
			var maxLength = elem.getAttribute(ATTR_MAXLENGTH);
			if ( !maxLength ) {
				elem.setAttribute(ATTR_MAXLENGTH, elem.maxLength);
				elem.removeAttribute('maxLength');
			}

			// If the type of element needs to change, change it (e.g. password
			// inputs).
			var type = elem.getAttribute(ATTR_INPUT_TYPE);
			if ( type ) {
				elem.type = 'text';
			} else if ( elem.type === 'password' && changeType(elem, 'text') ) {
				elem.setAttribute(ATTR_INPUT_TYPE, 'password');
			}

			return true;
		}

		return false;
	}

	// Returns a function that is used as a focus event handler.
	function makeFocusHandler( elem ) {
		return function () {

			// Only hide the placeholder value if the (default) hide-on-focus
			// behaviour is enabled.
			if (
				hideOnInput &&
				elem.value === elem.getAttribute(ATTR_CURRENT_VAL) &&
				elem.getAttribute(ATTR_ACTIVE) === 'true'
			) {

				// Move the caret to the start of the input (this mimics the behaviour
				// of all browsers that do not hide the placeholder on focus).
				moveCaret(elem, 0);
			} else {

				// Remove the placeholder.
				hidePlaceholder(elem);
			}
		};
	}

	// Returns a function that is used as a blur event handler.
	function makeBlurHandler( elem ) {
		return function () {
			showPlaceholder(elem);
		};
	}

	// Returns a function that is used as a submit event handler on form elements
	// that have children affected by this polyfill.
	function makeSubmitHandler( form ) {
		return function () {

				// Turn off placeholders on all appropriate descendant elements.
				disablePlaceholders(form);
		};
	}

	// Functions that are used as a event handlers when the hide-on-input
	// behaviour has been activated - very basic implementation of the 'input'
	// event.
	function makeKeydownHandler( elem ) {
		return function ( e ) {
			keydownVal = elem.value;

			// Prevent the use of the arrow keys (try to keep the cursor before the
			// placeholder).
			if (
				elem.getAttribute(ATTR_ACTIVE) === 'true' &&
				keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) &&
				inArray(badKeys, e.keyCode)
			) {
				if ( e.preventDefault ) {
						e.preventDefault();
				}
				return false;
			}
		};
	}

	function makeKeyupHandler(elem) {
		return function () {
			hidePlaceholder(elem, keydownVal);

			// If the element is now empty we need to show the placeholder
			if ( elem.value === '' ) {
				elem.blur();
				moveCaret(elem, 0);
			}
		};
	}

	function makeClickHandler(elem) {
		return function () {
			if (
				elem === safeActiveElement() &&
				elem.value === elem.getAttribute(ATTR_CURRENT_VAL) &&
				elem.getAttribute(ATTR_ACTIVE) === 'true'
			) {
				moveCaret(elem, 0);
			}
		};
	}

	// Bind event handlers to an element that we need to affect with the
	// polyfill.
	function newElement( elem ) {

		// If the element is part of a form, make sure the placeholder string is
		// not submitted as a value.
		var form = elem.form;
		if ( form && typeof form === 'string' ) {

			// Get the real form.
			form = document.getElementById(form);

			// Set a flag on the form so we know it's been handled (forms can contain
			// multiple inputs).
			if ( !form.getAttribute(ATTR_FORM_HANDLED) ) {
				addEventListener(form, 'submit', makeSubmitHandler(form));
				form.setAttribute(ATTR_FORM_HANDLED, 'true');
			}
		}

		// Bind event handlers to the element so we can hide/show the placeholder
		// as appropriate.
		addEventListener(elem, 'focus', makeFocusHandler(elem));
		addEventListener(elem, 'blur', makeBlurHandler(elem));

		// If the placeholder should hide on input rather than on focus we need
		// additional event handlers
		if (hideOnInput) {
			addEventListener(elem, 'keydown', makeKeydownHandler(elem));
			addEventListener(elem, 'keyup', makeKeyupHandler(elem));
			addEventListener(elem, 'click', makeClickHandler(elem));
		}

		// Remember that we've bound event handlers to this element.
		elem.setAttribute(ATTR_EVENTS_BOUND, 'true');
		elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

		// If the element doesn't have a value and is not focussed, set it to the
		// placeholder string.
		if ( hideOnInput || elem !== safeActiveElement() ) {
			showPlaceholder(elem);
		}
	}

}(this) );


// JavaScript Cookie v2.0.2
// 2006, 2015 Klaus Hartl | https://github.com/js-cookie/js-cookie | Licensed under MIT
// --------------------------------------------------------------------------------------------------------------------------------------------------------
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory(window.jQuery);
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

				if (this.json) {
					try {
						cookie = JSON.parse(cookie);
					} catch (e) {}
				}

				if (key === name) {
					result = cookie;
					break;
				}

				if (!key) {
					result[name] = cookie;
				}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));