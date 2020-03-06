(function(root, undefined) {
	'use strict';

	// only create tick extensions queue if not already available
	if (!root.Tick) {
		root.Tick = [];
	}

	// add this extension
	root.Tick.push(['__TYPE__', '__NAME__', (__LIB__())]);

}(window));