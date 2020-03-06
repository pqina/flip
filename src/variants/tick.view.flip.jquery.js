(function($) {
	'use strict';

	if (!$) { return; }

	// only create tick extensions queue if not already available
	if (!$.tick) {
		$.tick = [];
	}

	// add this extension
	$.tick.push(['__TYPE__', '__NAME__', (__LIB__())]);

}(window.jQuery));