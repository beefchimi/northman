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


	// selectDropdown: Pair each <select> element with its <ul> counter-part
	// ----------------------------------------------------------------------------
	function selectDropdown() {

		// search for a <form> with the class 'has_dropdown' (assumes only 1 form)
		var elDropdownForm = document.getElementsByClassName('has_dropdown')[0];

		// check if form.has-dropdown does not exist
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

				// add 'active_overlay' class on body to prevent scrolling
				// classie.add(elBody, 'active_overlay');

				// allow for class toggling on the clicked dropdown
				classie.toggle(thisDropdownWrap, 'toggled_dropdown');

				e.preventDefault();

			}, false);

			// need to consider the fact that this is a touch enabled device...
			// typically, the dropdowns should close on "click outside" of 'this'...
			// but user scrolling could trigger a dropdown close, which may not be ideal... REQUIRES TESTING!

			// click outside of element to close dropdown
			document.addEventListener('click', function(e) {

				// if this is not the currently toggled dropdown
				if (e.target != thisDropdownLabel) {

					// ignore this event if preventDefault has been called
					if (e.defaultPrevented) {
						return;
					}

					// remove active / toggled classes
					// classie.remove(elBody, 'active_overlay');
					classie.remove(thisDropdownWrap, 'toggled_dropdown');

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
						elParentWrap     = elParentUL.parentNode.parentNode,
						elSiblingLabel   = elParentUL.parentNode.previousElementSibling.childNodes[1], // first child is an empty text node
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
						// elPrevSelected.parentNode.classList.remove('selected');
						classie.remove(elPrevSelected.parentNode, 'selected');
					}

					// then add 'selected' class to parent <li> of newly chosen a[data-value]
					classie.add(elParentLI, 'selected');

					// remove active class form body to restore scrolling
					// classie.remove(elBody, 'active_overlay');

					// remove 'toggled' class from parent article
					elParentWrap.classList.remove('toggled');
					classie.remove(elParentWrap, 'toggled_dropdown');

					e.preventDefault();

				}, false);

			}

		}

		// does this load a new page or do we refresh the results with AJAX?
		// if AJAX, we will need to display the selected option as the label
		passSelectValue();

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	navToggle();
	secretEmail();

	selectDropdown();


}, false);