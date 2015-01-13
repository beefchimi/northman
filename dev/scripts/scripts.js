document.addEventListener('DOMContentLoaded', function() {


/*
	MAJOR REVELATION!
	IOS8 CHOKES ON CLICK CLASS TOGGLES USING SELECTORS LIKE:
	a.this_selector.toggled + nav.to_transition
	INSTEAD, TOGGLE CLASS ON PARENT ELEMENT:
	body.toggled nav.to_transition
*/


	// Global Variables
	// ----------------------------------------------------------------------------
	var elBody = document.body;


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

		var mailLink    = document.getElementById('secret_email'),
			prefix      = 'mailto',
			local       = 'info',
			domain      = 'northman',
			suffix      = 'co';

		mailLink.setAttribute('href', prefix + ':' + local + '@' + domain + '.' + suffix);
		mailLink.innerHTML = local + '@' + domain + '.' + suffix;

	}


	// selectDropdown: Pair each <select> element with its <ul> sibling
	// ----------------------------------------------------------------------------
	function selectDropdown() {

		// search for a <form> with the class 'has_dropdown' (assumes only 1 form per page)
		var elDropdownForm = document.getElementsByClassName('has_dropdown')[0];

		// check if form.has_dropdown does not exist
		if (elDropdownForm == null) {
			return;
		}

		// form.has_dropdown DOES exist, so lets grab all of the div.wrap_select elements
		var arrDropdownWrap = elDropdownForm.getElementsByClassName('wrap_select');

		// assign the click event to each div.dropdown_label found in form.has_dropdown
		for (var i = 0; i < arrDropdownWrap.length; i++) {
			dropdownToggle(arrDropdownWrap[i]);
		}

		// function for toggling dropdowns
		function dropdownToggle(thisDropdownWrap) {

			var thisDropdownLabel = thisDropdownWrap.getElementsByClassName('dropdown_toggle')[0],
				thisParentArticle;

			thisDropdownLabel.addEventListener('click', function(e) {

				thisParentArticle = this.parentNode;

				// run through each dropdown article...
				for (var i = 0; i < arrDropdownWrap.length; i++) {

					// and if this is NOT the parent dropdown we have clicked on...
					if (arrDropdownWrap[i] != thisParentArticle) {
						classie.remove(arrDropdownWrap[i], 'toggled_dropdown'); // remove the 'toggled_dropdown' class
					}

				}

				if ( classie.has(thisDropdownWrap, 'toggle_show') ) {

					// dropdown is currently shown, so hide it
					classie.remove(thisDropdownWrap, 'toggle_show');
					classie.add(thisDropdownWrap, 'toggle_hide');

				} else {

					// dropdown is currently hidden, so show it
					classie.remove(thisDropdownWrap, 'toggle_hide');
					classie.add(thisDropdownWrap, 'toggle_show');

				}

				e.preventDefault();

			}, false);

			// click outside of element to close dropdown
			document.addEventListener('click', function(e) {

				// if this is not the currently toggled dropdown
				if (e.target != thisDropdownLabel) {

					// ignore this event if preventDefault has been called
					if (e.defaultPrevented) {
						return;
					}

					// hide dropdown
					classie.remove(thisDropdownWrap, 'toggle_show');
					classie.add(thisDropdownWrap, 'toggle_hide');

				}

			}, false);

		}

		// function for passing <ul> values to the corresponding <select>
		function passSelectValue() {

			var arrDropdownLinks = elDropdownForm.getElementsByClassName('dropdown_link');

			// assign the click event to each a.dropdown_link found in the form.has-dropdown
			for (var i = 0; i < arrDropdownLinks.length; i++) {
				optionChange(arrDropdownLinks[i]);
			}

			function optionChange(thisDropdownLink) {

				thisDropdownLink.addEventListener('click', function(e) {

					var dataValue        = this.getAttribute('data-value'),
						dataLabel        = this.innerHTML,
						elParentLI       = this.parentNode,
						elParentUL       = elParentLI.parentNode,
						elParentWrap     = elParentUL.parentNode.parentNode.parentNode,
						elSiblingLabel   = elParentUL.parentNode.parentNode.previousElementSibling.childNodes[1], // first child is an empty text node
						elMatchedOption  = elParentWrap.querySelector('option[value="' + dataValue + '"]'),
						dataPrevSelected = elParentWrap.getAttribute('data-selected'),
						elPrevSelected   = elParentUL.querySelector('a[data-value="' + dataPrevSelected + '"]');

					// define the correct <option> as :selected
					elMatchedOption.selected = true;

					// set 'data-selected' to new value
					elParentWrap.setAttribute('data-selected', dataValue);

					// replace h6.dropdown_label innerHTML with the selected option text
					elSiblingLabel.innerHTML = dataLabel;

					// remove 'selected' class from previous <li>, if it exists...
					if (elPrevSelected != null) {
						classie.remove(elPrevSelected.parentNode, 'selected');
					}

					// then add 'selected' class to parent <li> of newly chosen a[data-value]
					classie.add(elParentLI, 'selected');

					// hide the parent dropdown
					classie.remove(elParentWrap, 'toggle_show');
					classie.add(elParentWrap, 'toggle_hide');

					// confirm we have provided the correct selected value
					console.log( document.getElementById('select_location').value );

					e.preventDefault();

				}, false);

			}

		}

		passSelectValue();

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	navToggle();
	secretEmail();

	selectDropdown();


}, false);