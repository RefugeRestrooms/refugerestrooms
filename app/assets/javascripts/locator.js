(function(factory) {
	// temporarily export this locator to window, eventually export via AMD/require/etc

	window.locator = factory(jQuery);
}(function($) {

	var NOT_SUPPORTED = new Error('not supported by device');

	var locator = {
		support: !!navigator.geolocation,
		get: function() {
			var dfd = $.Deferred();
			if (!locator.support) {
				dfd.reject(NOT_SUPPORTED);
			} else {
				navigator.geolocation.getCurrentPosition(function(pos) {
					dfd.resolve(pos.coords);
				}, dfd.reject);
			}

			dfd.done(function(coords) {
				locator.error = null;
				locator.active = true;
				locator.coords = coords;
			});
			dfd.fail(function(error) {
				locator.error = error;
				locator.active = false;
			});

			return dfd.promise();
		},
		error: null
	};

	if (!locator.support) {
		locator.error = NOT_SUPPORTED;
	}

	return locator;
}))
