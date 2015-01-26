document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elBody = document.body;


	// Helper: Detmine which transition event to use
	// ----------------------------------------------------------------------------
/*
	function whichTransitionEvent() {

		var t,
			el          = document.createElement('fakeelement'),
			transitions = {
				'transition'       : 'transitionend',
				'OTransition'      : 'oTransitionEnd',
				'MozTransition'    : 'transitionend',
				'WebkitTransition' : 'webkitTransitionEnd'
			}

		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}

	}

	// listen for a transition
	var transitionEvent = whichTransitionEvent();
*/

	function whichAnimationEvent() {

		var anim,
			el         = document.createElement('fakeelement'),
			animations = {
				'animation'       : 'animationend',
				'OAnimation'      : 'oAnimationEnd',
				'MozAnimation'    : 'animationend',
				'WebkitAnimation' : 'webkitAnimationEnd'
			}

		for (anim in animations) {
			if (el.style[anim] !== undefined) {
				return animations[anim];
			}
		}

	}

	// listen for an animation
	var animationEvent = whichAnimationEvent();



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


	// populateCountries: Load datalist JSON and populate autocomplete options
	// ----------------------------------------------------------------------------
	function populateCountries() {

		var elInputDestination  = document.getElementById('input_destination'),
			elDatalistCountries = document.getElementById('datalist_countries'),
			dataRequest         = new XMLHttpRequest(),
			jsonOptions;

		// Handle state changes for the request.
		dataRequest.onreadystatechange = function(response) {

			if (dataRequest.readyState === 4) {

				if (dataRequest.status === 200) {

					// Parse the JSON
					jsonOptions = JSON.parse(dataRequest.responseText);

					// Loop over the JSON array.
					for (var i = 0; i < jsonOptions.length; i++) {

						// Create a new <option> element.
						var elOption = document.createElement('option');

						// Set the value using the item in the JSON array.
						elOption.value = i + 1;
						elOption.innerHTML = jsonOptions[i];

						// Add the <option> element to the <datalist>.
						elDatalistCountries.appendChild(elOption);

					}

					// Update the placeholder text.
					elInputDestination.placeholder = 'Enter your destination';

					// should be safe to run our toggle click function
					revealForm();

				} else {

					// An error occured :(
					elInputDestination.placeholder = 'Couldn\'t load covered Countries';

				}

			}

		};

		// Update the placeholder text.
		elInputDestination.placeholder = 'Retreiving countries...';

		// Set up and make the request.
		dataRequest.open('GET', 'assets/js/datalist_countries.json', true);
		dataRequest.send();

		// reveal the fieldset.form_quote
		function revealForm() {

			var elFormToggle  = document.getElementById('form_toggle'),
				elFormQuote   = document.getElementById('form_quote'),
				elHiddenInput = document.getElementById('hidden_destination'),
				valDestination,
				valIndex;

			var scrollOptions = { speed: 1000, easing: 'easeInOutQuint', updateURL: false };

			var elFormDestination = document.getElementById('form_destination');

			// only temporary!
			var elDestinationWrap = document.getElementById('destination_wrap');

			// attached event for form submissions and toggle click
			elFormDestination.addEventListener('submit', validateDestination);
			elFormToggle.addEventListener('click', validateDestination);

			function validateDestination(e) {

				e.preventDefault();

				// assign entered destination value
				valDestination = elInputDestination.value.toLowerCase();
				valIndex = jsonOptions.indexOf(valDestination);

				if (valIndex > -1) {

					// pass destination value to hidden form field
					elHiddenInput.value = valIndex;
					elHiddenInput.setAttribute('value', valIndex);

					// reveal and scroll to form_quote
					classie.add(elFormQuote, 'reveal');
					smoothScroll.animateScroll(null, '#form_quote', scrollOptions);

					// allow overflow-y so dropdowns are not cutoff
					setTimeout(function() {
						classie.add(elFormQuote, 'allow-overflow');
					}, 1200);

/*
					transitionEvent && elFormQuote.addEventListener(transitionEvent, function() {
						classie.add(elFormQuote, 'allow-overflow');
						console.log('Transition complete! This is the callback, no library needed!');
					});
*/

				} else {

					console.log('You have not provided a valid Country.');
					elInputDestination.placeholder = 'invalid country';
					classie.add(elDestinationWrap, 'animate_shake');

					// not sure if this is working properly... console.logs +1 each time
					animationEvent && elDestinationWrap.addEventListener(animationEvent, function() {
						classie.remove(elDestinationWrap, 'animate_shake');
						console.log('Animation complete! "animate_shake" class removed.');
					});

				}

				return false;

			}

		}

	}


	// Plugin: Bootstrap Datepicker
	// ----------------------------------------------------------------------------
	function inputDatepicker() {

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

			var valStart = $dateStart.datepicker('getDate'),
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
	selectDropdown();
	inputDatepicker();

	// only run on home page
	populateCountries();


}, false);