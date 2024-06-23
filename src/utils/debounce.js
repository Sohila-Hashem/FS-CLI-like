const debounce = (fn, delay, options = { callNow: false }) => {
	if (typeof fn !== "function") {
		throw new TypeError("Expected a function, got " + typeof fn);
	}

	let { callNow } = options;
	let callTimer;
	let resetCallNowTimer;

	return (...args) => {
		if (callTimer) clearTimeout(callTimer);
		if (resetCallNowTimer) clearTimeout(resetCallNowTimer);

		// execute the function on the first call normally
		if (!callTimer && callNow) {
			fn(...args);
			callNow = null;
			return;
		}

		// on subsequent calls debounce the function
		callTimer = setTimeout(() => {
			fn(...args);
			callTimer = null;
		}, delay);

		// reset the callNow functionality after a specified duration
		if (callNow) {
			resetCallNowTimer = setTimeout(() => {
				resetCallNowTimer = null;
				callNow = true;
			}, delay + 1000);
		}
	};
};

export default debounce;
