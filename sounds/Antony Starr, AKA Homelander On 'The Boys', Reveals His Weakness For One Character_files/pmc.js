(function(w, d) {
	'use strict';
	var s1 = d.getElementsByTagName('script')[0],
		s = d.createElement('script'),
		onReady;

	s.src = '//tru.am/scripts/ta-pagesocial-sdk.js';

	onReady = function() {
		var l = document.location,
			h = l.hostname.toLowerCase(),
			cid;
		if (h.indexOf('bgr.com') > -1) {
			cid = '1945';
		}
		else if (h.indexOf('hollywoodreporter.com') > -1) {
			cid = '2280';
		}
		else if (h.indexOf('variety.com') > -1) {
			cid = '2281';
		}
		else if (h.indexOf('vibe.com') > -1) {
			cid = '2283';
		}
		else if (h.indexOf('sportico.com') > -1) {
			cid = '2286';
		}
		else if (h.indexOf('deadline.com') > -1) {
			cid = '2282';
		}
		else if (h.indexOf('tvline.com') > -1) {
			cid = '2284';
		}
		else if (h.indexOf('robbreport.com') > -1) {
			cid = '2285';
		}
		if (cid) {
			w.TRUE_ANTHEM.configure(cid);
		}
	};
	if (s.addEventListener) {
		s.addEventListener('load', onReady, false);
	} else {
		s.onreadystatechange = function() {
			if (s.readyState in {
					loaded: 1,
					complete: 1
				}) {
				s.onreadystatechange = null;
				onReady();
			}
		};
	}
	s1.parentNode.insertBefore(s, s1);
}(window, document));