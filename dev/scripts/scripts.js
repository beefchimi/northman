document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elHTML = document.documentElement,
		elBody = document.body;


	// Helper: Detmine which transition event to use
	// ----------------------------------------------------------------------------
	function whichTransitionEvent() {

		var trans,
			element     = document.createElement('fakeelement'),
			transitions = {
				'transition'       : 'transitionend',
				'OTransition'      : 'oTransitionEnd',
				'MozTransition'    : 'transitionend',
				'WebkitTransition' : 'webkitTransitionEnd'
			}

		for (trans in transitions) {
			if (element.style[trans] !== undefined) {
				return transitions[trans];
			}
		}

	}

	function whichAnimationEvent() {

		var anim,
			element    = document.createElement('fakeelement'),
			animations = {
				'animation'       : 'animationend',
				'OAnimation'      : 'oAnimationEnd',
				'MozAnimation'    : 'animationend',
				'WebkitAnimation' : 'webkitAnimationEnd'
			}

		for (anim in animations) {
			if (element.style[anim] !== undefined) {
				return animations[anim];
			}
		}

	}

	var transitionEvent = whichTransitionEvent(), // listen for a transition
		animationEvent  = whichAnimationEvent(); // listen for an animation


	// Helper: Find Parent Element by Class or Tag Name
	// ----------------------------------------------------------------------------
	function findParentClass(el, className) {

		while (el && !classie.has(el, className) ) {
			el = el.parentNode;
		}

		return el;

	}

	function findParentTag(el, tagName) {

		while (el && el.nodeName !== tagName) {
			el = el.parentNode;
		}

		return el;

	};


	// Helper: Get current date
	// ----------------------------------------------------------------------------
	function dateToday() {

		var today = new Date(),
			dd    = today.getDate(),
			mm    = today.getMonth() + 1, //January is 0!
			yyyy  = today.getFullYear();

		if (dd < 10) {
			dd = '0' + dd;
		}

		if (mm < 10) {
			mm = '0' + mm;
		}

		// today = yyyy + '-' + mm + '-' + dd;
		today = mm + '/' + dd + '/' + yyyy;

		return today;

	}


	// Helper: Case insensitive array value
	// ----------------------------------------------------------------------------

	// Test for String equality ignoring case
	// returns Boolean true if both string is equals ignoring case
	function equalsIgnoreCase(str1, str2) {
		return str1.toLowerCase() === str2.toLowerCase();
	}

	// Find the index of a string in an array of string
	// returns Number the index of the element in the array or -1 if not found
	function indexOfIgnoreCase(array, element) {

		var ret = -1;

		array.some(function(ele, index, array) {
			if ( equalsIgnoreCase(element, ele) ) {
				ret = index;
				return true;
			}
		});

		return ret;

	}

	// Test the existence of a string in an array of string
	// returns Boolean true if found and false if not found
	function existsIgnoreCase(array, element) {
		return -1 !== indexOfIgnoreCase(array, element);
	}

	// convenience method
	Array.prototype.indexOfIgnoreCase = function(input) {
		return indexOfIgnoreCase(this, input);
	};

	// convenience method
	Array.prototype.existsIgnoreCase = function(input) {
		return -1 !== this.indexOfIgnoreCase(input);
	}

	// With the above-mentioned convenience functions, we can do things like:
	// console.log( ["Apple", "bOy", "caR"].existsIgnoreCase('boy') ); // returns true
	// console.log( ["Apple", "bOy", "caR"].indexOfIgnoreCase('car') ); // returns 2


	// Helper: Create and Destroy [data-overlay] element
	// ----------------------------------------------------------------------------
	function createOverlay() {

		// first, create an empty <div>
		var elOverlay = document.createElement('div');

		// apply the attributes: id="overlay" & data-overlay="modal"
		elOverlay.id = 'overlay';
		elOverlay.setAttribute('data-overlay', 'modal'); // could maybe pass the attr value into the function?

		// append this <div> to the document <body>
		elBody.appendChild(elOverlay);

		// make the element fully transparent
		// (don't rely on a predefined CSS style... declare this with JS to getComputerStyle)
		elOverlay.style.opacity = 0;

		// make sure the initial state is applied
		window.getComputedStyle(elOverlay).opacity;

		// set opacity to 1 (predefined CSS transition will handle the fade)
		elOverlay.style.opacity = 1;

	}

	function destroyOverlay() {

		var elOverlay = document.getElementById('overlay');

		elOverlay.style.opacity = 0;

		transitionEvent && elOverlay.addEventListener(transitionEvent, function() {
			elBody.removeChild(elOverlay);
		});

	}


	// Navigation: Click to toggle navigation
	// ----------------------------------------------------------------------------
	function navToggle() {

		var elNavToggle = document.getElementById('nav_toggle');

		elNavToggle.addEventListener('click', function(e) {

			classie.toggle(elBody, 'toggled_mobile-nav');

			e.preventDefault();

		}, false);

	}


	// secretEmail: Add mailto link to footer
	// ----------------------------------------------------------------------------
	function secretEmail() {

		var mailLink = document.getElementById('secret_email'),
			prefix    = 'mailto',
			local    = 'info',
			domain   = 'northman',
			suffix    = 'co';

		mailLink.setAttribute('href', prefix + ':' + local + '@' + domain + '.' + suffix);
		mailLink.innerHTML = local + '@' + domain + '.' + suffix;

	}


	// toggleAccordian: Expand / Collapse accordian elements
	// ----------------------------------------------------------------------------
	function toggleAccordian() {

		var arrAccordianRows   = document.getElementsByClassName('accordian_row'),
			numAccordianLength = arrAccordianRows.length;

		// check if div.accordian_row exists and is not empty
		if (typeof arrAccordianRows !== 'undefined' && numAccordianLength > 0) {

			for (var i = 0; i < arrAccordianRows.length; i++) {
				accordianExpandCollapse(arrAccordianRows[i]);
			}

		} else {

			return; // array not found or empty... exit function

		}

		function accordianExpandCollapse(thisAccordianRow) {

			var elRowToggle = thisAccordianRow.getElementsByClassName('accordian_toggle')[0];

			elRowToggle.addEventListener('click', function(e) {

				classie.toggle(thisAccordianRow, 'toggle_row');

				e.preventDefault();

			});

		}

	}


	// toggleModal:
	// ----------------------------------------------------------------------------
	function toggleModal() {

		var arrModalOpen   = document.getElementsByClassName('modal_open'),
			arrModalClose  = document.getElementsByClassName('modal_close'),
			numModalLength = arrModalOpen.length,
			elTargetModal;

		// check if a.modal_open exists and is not empty
		if (typeof arrModalOpen !== 'undefined' && numModalLength > 0) {

			for (var i = 0; i < numModalLength; i++) {
				arrModalOpen[i].addEventListener('click', openModal, false);
				arrModalClose[i].addEventListener('click', closeModal, false);
			}

		} else {

			return; // array not found or empty... exit function

		}

		function openModal(e) {

			var dataTargetModal = this.getAttribute('href').substring(1); // capture the href of the clicked element, remove the # prefix
				elTargetModal   = document.getElementById(dataTargetModal); // get the modal we need to open

			classie.add(elHTML, 'overlay_active'); // lock <body> scrolling with 'overlay_active'
			classie.add(elTargetModal, 'loaded'); // visibility is initially set to "hidden", "loaded" class applied only once

			// create overlay element and fade in modal
			createOverlay();
			elTargetModal.setAttribute('data-modal', 'active');

			e.preventDefault();

			document.addEventListener('click', documentClick, false);

		}

		function closeModal(e) {

			var dataTargetModal = this.getAttribute('href').substring(1); // capture the href of the clicked element, remove the # prefix
				elTargetModal   = document.getElementById(dataTargetModal); // get the modal we need to open

			// once we have found the desired parent element, hide that modal
			classie.remove(elHTML, 'overlay_active');
			elTargetModal.setAttribute('data-modal', 'inactive');
			destroyOverlay();

			e.preventDefault();

			document.removeEventListener('click', documentClick, false);

		}

		function documentClick(e) {

			// if this is not the currently toggled dropdown
			if ( e.target === document.getElementById('overlay') ) {

				// ignore this event if preventDefault has been called
				if (e.defaultPrevented) {
					return;
				}

				// once we have found the desired parent element, hide that modal (copied from closeModal)
				classie.remove(elHTML, 'overlay_active');
				elTargetModal.setAttribute('data-modal', 'inactive');
				destroyOverlay();

				console.log('clicked on the overlay');

			} else {

				console.log('no, this is NOT the overlay');

			}

		}

	}

/*
			var elDesiredParent = this.parentNode;

			// cycle upwards from the closest parent of the clicked element,
			// until we find an element with the attr 'data-modal'
			while ( !elDesiredParent.getAttribute('data-modal') ) {
				elDesiredParent = elDesiredParent.parentNode;
			}
*/


	// selectDropdown: Pair each <select> element with its <ul> sibling
	// ----------------------------------------------------------------------------
	function selectDropdown() {

		// search for any div.wrap_select elements
		var arrSelectWrap   = document.getElementsByClassName('wrap_select'),
			numSelectLength = arrSelectWrap.length;

		// check if div.wrap_select exists and is not empty
		if (typeof arrSelectWrap !== 'undefined' && numSelectLength > 0) {

			for (var i = 0; i < numSelectLength; i++) {
				dropdownToggle(arrSelectWrap[i]);
			}

			passSelectValue();

		} else {

			return; // array not found or empty... exit function

		}

		// function for toggling dropdowns
		function dropdownToggle(thisSelectWrap) {

			var thisDropdownToggle = thisSelectWrap.getElementsByClassName('dropdown_toggle')[0];

			thisDropdownToggle.addEventListener('click', function(e) {

				// run through each div.wrap_select...
				for (var i = 0; i < numSelectLength; i++) {

					// and if this is NOT the parent div.wrap_select we have clicked on...
					if (arrSelectWrap[i] != thisSelectWrap) {
						classie.remove(arrSelectWrap[i], 'toggle_show');
					}

				}

				classie.toggle(thisSelectWrap, 'toggle_show');

				e.preventDefault(); // requires the event.preventDefault for the document listener to work

			}, false);

			// click outside of element to close dropdown
			document.addEventListener('click', function(e) {

				// if this is not the currently toggled dropdown
				if (e.target != thisDropdownToggle) {

					// ignore this event if preventDefault has been called
					if (e.defaultPrevented) {
						return;
					}

					// hide dropdown
					classie.remove(thisSelectWrap, 'toggle_show');

				}

			}, false);

		}

		// function for passing <ul> values to the corresponding <select>
		function passSelectValue() {

			var arrDropdownLinks = document.getElementsByClassName('dropdown_link');

			// assign the click event to each a.dropdown_link found in the document
			for (var i = 0; i < arrDropdownLinks.length; i++) {
				optionChange(arrDropdownLinks[i]);
			}

			function optionChange(thisDropdownLink) {

				thisDropdownLink.addEventListener('click', function(e) {

					var dataValue        = this.getAttribute('data-value'),
						dataLabel        = this.innerHTML,
						elParentLI       = this.parentNode,
						elParentUL       = elParentLI.parentNode,
						elParentWrap     = findParentClass(elParentUL, 'wrap_select'),
						elSiblingLabel   = findParentClass(elParentUL, 'wrap_dropdown').previousElementSibling.childNodes[1], // 1st child = empty textNode
						elMatchedOption  = elParentWrap.querySelector('option[value="' + dataValue + '"]'),
						dataPrevSelected = elParentWrap.getAttribute('data-selected'),
						elPrevSelected   = elParentUL.querySelector('a[data-value="' + dataPrevSelected + '"]');

					// define the correct <option> as :selected
					elMatchedOption.selected = true;

					// set 'data-selected' to new value
					elParentWrap.setAttribute('data-selected', dataValue);

					// replace div.dropdown_label innerHTML with the selected option text
					elSiblingLabel.innerHTML = dataLabel;

					// remove 'selected' class from previous <li>, if it exists...
					if (elPrevSelected != null) {
						classie.remove(elPrevSelected.parentNode, 'selected');
					}

					// then add 'selected' class to parent <li> of newly chosen a[data-value]
					classie.add(elParentLI, 'selected');

					// hide the parent dropdown
					classie.remove(elParentWrap, 'toggle_show');

					e.preventDefault();

				}, false);

			}

		}

	}


	// Typeahead: code to execute only on pages using typeahead.js
	// ----------------------------------------------------------------------------
	if ( classie.has(elBody, 'page_home') ) {

		var strPlaceholder1 = 'Enter your destination',
			strPlaceholder2 = 'Could not load covered Countries',
			strPlaceholder3 = 'Retreiving countries...',
			strPlaceholder4 = 'Unrecognized country',
			strJSONPath     = 'assets/js/datalist_countries.json',
			elFormQuote     = document.getElementById('form_quote'),
			elHiddenInput   = document.getElementById('hidden_destination'),
			scrollOptions   = { // should have a mobile conditional: offset set to 0
				speed: 1000,
				easing: 'easeInOutQuint',
				updateURL: false,
				offset: 88
			};

		function homeSuccess(psd_valIndex) {

			// pass destination value to hidden form field
			elHiddenInput.value = psd_valIndex;
			elHiddenInput.setAttribute('value', psd_valIndex);

			// reveal and scroll to form_quote
			classie.add(elFormQuote, 'reveal');
			smoothScroll.animateScroll(null, '#form_quote', scrollOptions);

			// allow overflow-y so dropdowns are not cutoff
			setTimeout(function() {
				classie.add(elFormQuote, 'allow-overflow');
			}, 1200);

		}

		populateCountries(homeSuccess);

	}

/*
	if ( classie.has(elBody, 'page_coverage') ) {

		var strPlaceholder1 = 'Enter a sport or activity',
			strPlaceholder2 = 'Could not load covered activities',
			strPlaceholder3 = 'Retreiving activities...',
			strPlaceholder4 = 'Unrecognized activity',
			strJSONPath     = 'assets/js/datalist_activities.json';

		populateCountries();

	}
*/


	// populateCountries: Load datalist JSON and populate autocomplete options
	// ----------------------------------------------------------------------------
	function populateCountries(successFunction) {

		var elInputDestination  = document.getElementsByClassName('input_typeahead')[0], // assumes 1 per page
			dataRequest         = new XMLHttpRequest(),
			jsonOptions;

		// Handle state changes for the request.
		dataRequest.onreadystatechange = function(response) {

			if (dataRequest.readyState === 4) {

				if (dataRequest.status === 200) {

					// Parse the JSON
					jsonOptions = JSON.parse(dataRequest.responseText);

					// Update the placeholder text.
					elInputDestination.placeholder = strPlaceholder1;

					// should be safe to run our toggle click function
					revealForm();

				} else {

					// An error occured :(
					elInputDestination.placeholder = strPlaceholder2;

				}

			}

		};

		// Update the placeholder text.
		elInputDestination.placeholder = strPlaceholder3;

		// Set up and make the request.
		dataRequest.open('GET', strJSONPath, true);
		dataRequest.send();

		// reveal the fieldset.form_quote
		function revealForm() {

			var elFormToggle    = document.getElementById('form_toggle'),
				elFormTypeahead = document.getElementsByClassName('has_typeahead')[0],
				elTypeaheadWrap = document.getElementsByClassName('wrap_input-typeahead')[0],
				valTypeahead,
				valIndex;

			// attached event for form submissions and toggle click
			elFormTypeahead.addEventListener('submit', validateDestination);
			elFormToggle.addEventListener('click', validateDestination);

			var substringMatcher = function(strs) {

				return function findMatches(q, cb) {

					var matches,
						substrRegex;

					// an array that will be populated with substring matches
					matches = [];

					// SyntaxError: unterminated parenthetical
					// regex used to determine if a string contains the substring 'q'
					substrRegex = new RegExp(q, 'i');

					// iterate through the pool of strings and for any string that contains the substring 'q',
					// add it to the 'matches' array
					$.each(strs, function(i, str) {

						if (substrRegex.test(str)) {
							// the typeahead jQuery plugin expects suggestions to a JavaScript object,
							// refer to typeahead docs for more info
							matches.push({ value: str });
						}

					});

					cb(matches);

				};

			};

			var $elTypeahead = $('input.input_typeahead'); // pass js variable here

			$elTypeahead.typeahead({
				highlight: true
			},
			{
				name: 'countries',
				displayKey: 'value',
				source: substringMatcher(jsonOptions)
			});

			function validateDestination(e) {

				e.preventDefault();

				// assign entered destination value
				valTypeahead = elInputDestination.value.toLowerCase();
				valIndex = jsonOptions.indexOfIgnoreCase(valTypeahead) + 1;

				if ( jsonOptions.existsIgnoreCase(valTypeahead) ) {

/*
					if covered:
						yes!
					else
						no!
*/

					successFunction(valIndex);


				} else {

					elInputDestination.value = '';
					elInputDestination.placeholder = strPlaceholder4;
					classie.add(elTypeaheadWrap, 'animate_shake');

					// not sure if this is working properly... console.logs +1 each time
					animationEvent && elTypeaheadWrap.addEventListener(animationEvent, function() {
						classie.remove(elTypeaheadWrap, 'animate_shake');
					});

				}

				return false;

			}

		}

	}


	// Plugin: Bootstrap Datepicker
	// ----------------------------------------------------------------------------
	function inputDatepicker() {

		// CURRENTLY BUGGED!
		// if you select a start date in the semi-future (45 days from current date?),
		// end date will no longer allow you to select a date, or paginate between years / months

		var $dateStart = $('#date_start'),
			$dateEnd   = $('#date_end'),
			valStart,
			valEnd;

		$('#datepicker').datepicker({
			autoclose: true,
			todayHighlight: true,
			startDate: dateToday(),
			format: 'M d, yyyy'
		});

		// $dateStart.on('hide', function() {
		$dateStart.on('changeDate', function() {

			// changeDate seems to fire 3 times...
			// but is more accurate to listen for 'changeDate' than 'hide'

			valStart = $dateStart.datepicker('getDate');
			valEnd   = new Date();

			// calculate date 45 days from dateStart
			valEnd.setDate(valStart.getDate() + 45);

			// set min-max date range for dateEnd
			$dateEnd.datepicker('setStartDate', valStart);
			$dateEnd.datepicker('setEndDate', valEnd);

			// this should be handled with a conditional:
			// if greater than 45 days: reset / else: do nothing
			$dateEnd.datepicker('setDate', false);
			$dateEnd.datepicker('show');

			// $('#helpDate').html('Northman insures trips of up to 45 days.');
			console.log('Northman insures trips of up to 45 days.');

		});

		$dateEnd.on('hide', function () {
			// $('#helpDate').html(' &nbsp; ');
			console.log('dateEnd hide');
		});

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	navToggle();
	secretEmail();
	toggleAccordian();
	toggleModal();

	selectDropdown();
	inputDatepicker(); // should I specify the pages this is required on?


}, false);