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


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	navToggle();
	secretEmail();


}, false);