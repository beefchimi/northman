document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elBody = document.body;


	// Gallery
	// ----------------------------------------------------------------------------
	function gallery() {

		var arrGalleryLinks         = document.querySelectorAll('.gallery_link'),
			numGalleryCount         = arrGalleryLinks.length,
			numGalleryCountAdjusted = numGalleryCount - 1,
			elGalleryOverlay        = document.getElementById('gallery'),
			elGalleryPrev           = document.getElementById('nav_prev'),
			elGalleryNext           = document.getElementById('nav_next'),
			elGalleryClose          = document.getElementById('nav_close'),
			elGalleryTitle          = document.getElementById('title_current'),
			elGalleryImage          = document.getElementById('gallery_image'),
			arrGallerySource        = [],
			arrGalleryTitle         = [],
			dataCurrent,
			dataSRC;

		for (var i = 0; i < numGalleryCount; i++) {
			launchGallery(arrGalleryLinks[i], i);
		}

		function launchGallery(thisGalleryLink, index) {

			arrGallerySource.push(thisGalleryLink.getAttribute('href'));
			arrGalleryTitle.push(thisGalleryLink.getAttribute('title'));

			thisGalleryLink.addEventListener('click', function(e) {

				dataCurrent = index;

				loadImage();

				elBody.setAttribute('data-gallery', 'active');

				e.preventDefault();

			});

		}

		elGalleryClose.addEventListener('click', function(e) {

			elBody.setAttribute('data-gallery', 'inactive');

			e.preventDefault();

		});

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	// gallery();


}, false);