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
			'transition' : 'transitionend',
			'OTransition' : 'oTransitionEnd',
			'MozTransition' : 'transitionend',
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
					// classie.add(thisSelectWrap, 'toggle_hide');

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

					// confirm we have provided the correct selected value
					// console.log( document.getElementById('select_destination').value );

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
					jsonOptions.forEach(function(item) {

						// Create a new <option> element.
						var elOption = document.createElement('option');

						// Set the value using the item in the JSON array.
						elOption.value = item;
						elOption.innerHTML = item;

						// Add the <option> element to the <datalist>.
						elDatalistCountries.appendChild(elOption);

					});

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

			var elFormToggle = document.getElementById('form_toggle'),
				elFormPrice  = document.getElementById('form_quote'),
				valDestination;

			var scrollOptions = { speed: 1000, easing: 'easeInOutQuint', updateURL: false };

			elFormToggle.addEventListener('click', function(e) {

				valDestination  = elInputDestination.value;

				if (jsonOptions.indexOf(valDestination) > -1) {

					classie.add(elFormPrice, 'reveal');
					smoothScroll.animateScroll(null, '#form_quote', scrollOptions);

					// allow overflow-y so dropdowns are not cutoff
					setTimeout(function() {
						classie.add(elFormPrice, 'allow-overflow');
					}, 1200);

/*
					transitionEvent && elFormPrice.addEventListener(transitionEvent, function() {
						classie.add(elFormPrice, 'allow-overflow');
						console.log('Transition complete! This is the callback, no library needed!');
					});
*/

				} else {

					console.log('You have not provided a valid Country.');

				}

				e.preventDefault();

			});

		}

	}


	// formGetPrice: Reveal the fieldset.form_quote
	// ----------------------------------------------------------------------------










	// Plugin: Pikaday Calendar / Datepicker
	// ----------------------------------------------------------------------------
	function initPikaday() {

		// https://github.com/dbushell/Pikaday

		var arrPikadayInputs = document.getElementsByClassName('pikaday_input'),
			numPikadayInputs = arrPikadayInputs.length;

		// check if arrPikadayInputs exists and is not empty
		if (typeof arrPikadayInputs !== 'undefined' && numPikadayInputs > 0) {

			for (var i = 0; i < numPikadayInputs; i++) {

				new Pikaday({
					field: arrPikadayInputs[i],
/*
					minDate: new Date('2000-01-01'),
					maxDate: new Date('2020-12-31'),
					yearRange: [2000,2020],
					onSelect: function() {
						var date = document.createTextNode(this.getMoment().format('Do MMMM YYYY') + ' ');
						document.getElementById('selected').appendChild(date);
					}
*/
					format: 'MMM D, YYYY'
				});

			}

		}

	}


/*

	$('.input-daterange').datepicker({
		autoclose: true,
		todayHighlight: true,
		startDate: '2015-01-22',
		format: 'yyyy-mm-dd'
	});

	$('#start-date').datepicker('show');

	$('#start-date').on('hide', function() {

		var start = $('#start-date').datepicker('getDate');
		var end = new Date();

		end.setDate(start.getDate() + 45);

		$('#end-date').datepicker('setEndDate', end);
		$('#end-date').datepicker('show');

		$('#helpDate').html('Northman insures trips of up to 45 days.');

	});

	$('#end-date').on('hide', function () {
		$('#helpDate').html(' &nbsp; ');
	});

*/


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	navToggle();
	secretEmail();
	selectDropdown();
	initPikaday();

	// only run on home page
	populateCountries();


}, false);