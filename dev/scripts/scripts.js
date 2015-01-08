document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elBody = document.body;


	// Navigation: Click to toggle navigation
	// ----------------------------------------------------------------------------
	function navToggle() {

		var elNavToggle = document.getElementById('nav_toggle');

		elNavToggle.addEventListener('click', function(e) {

			// classie.toggle(elBody, 'nav-active');

			if (elBody.getAttribute('data-nav') == 'active') {
				elBody.setAttribute('data-nav', 'inactive');
			} else {
				elBody.setAttribute('data-nav', 'active');
			}

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