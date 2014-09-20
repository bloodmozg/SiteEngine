window.Enums = {};

function isEmpty (value) {
	return !(value !== undefined && value !== null);
}

function isEmptyObject (value) {
	var result;

	result = false;
	if (!isEmpty(value) && typeof value === "object") {
		if (Object.keys(value).length == 0) {
			result = true;
		}
	}
	return result;
}

function isDeclared (value) {
	return value !== undefined;
}

function isInt (value) {
	return !isEmpty(value) && typeof value === "number";
}

function isString (value) {
	return !isEmpty(value) && typeof value === "string";
}

function isEmptyString (value) {
	return (isString(value) && value === "") || isEmpty(value);
}

function isArray (value) {
	return !isEmpty(value) && Object.prototype.toString.call(value) === '[object Array]';
}

function isBool (value) {
	return value === true || value === false;
}

function isFunc (value) {
	return !isEmpty(value) && typeof value == "function";
}

function formatString (format) {
	var args, result;

	args = Array.prototype.slice.call(arguments, 1);
	result = format.replace(/\{(\d+)\}/g, function (match, number) {
		var result;

		result = !isEmpty(args[number])
			? args[number]
			: match;
		return result;
	});
	return result;
}

String.prototype.toUpperCaseFirstLetter = function () {
	return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

function Extend (Child, Parent) {
	Child.prototype = Inherit(Parent.prototype);
	Child.prototype.constructor = Child;
	Child.Parent = Parent;
	Parent[Child.name] = Child;
}

function Inherit (proto) {
	function F () {
	}

	F.prototype = proto;
	return new F();
}

function onLoadDocument (func) {
	var called, topLevel;

	called = false;

	function ready () {
		if (called === false) {
			called = true;
			func();
		}
	}

	function tryScroll () {
		if (called === false && !isEmpty(document)) {
			try {
				document.documentElement.doScroll("left");
				ready();
			}
			catch (e) {
				setTimeout(tryScroll, 0);
			}
		}
	}

	if (document.readyState === "complete") {
		setTimeout(ready, 1);
	}
	else {
		if (document.addEventListener) {
			window.addEventListener("load", ready, false);
		}
		else if (document.attachEvent) {
			document.attachEvent("onreadystatechange", DOMContentLoaded);
			window.attachEvent("onload", jQuery.ready);
			topLevel = false;
			try {
				topLevel = window.frameElement == null;
			}
			catch (e) {
			}
			if (document.documentElement.doScroll && topLevel) {
				tryScroll();
			}
		}
	}
}

/*
 String.prototype.shorten = function (minLength) {
 var newText;

 if (isEmpty(minLength)) {
 minLength = 80;
 }

 if (this.length <= minLength) {
 newText = this;
 }
 else {
 newText = formatString("{0}...", this.slice(0, minLength));
 }

 return  newText;
 };

 String.prototype.escape = function () {
 var tagsToReplace = {
 '&': '&amp;',
 '<': '&lt;',
 '>': '&gt;'
 };
 return this.replace(/[&<>]/g, function (tag) {
 return tagsToReplace[tag] || tag;
 });
 };
 */

function checkRequestAnimationFrame (func) {
	/*
	if (!(window.requestAnimationFrame && requestAnimationFrame(func))) {
		setTimeout(func, 16);
	}
	*/
	(window.requestAnimationFrame && requestAnimationFrame (func)) || setTimeout (func, 16);
}

function slideBlocks (oldBlock, newBlock, direction, time, callback, context) {
	var oldNode, newNode, parent, parentNode, last, tick;

	if (!isEmpty(oldBlock) && !isEmpty(newBlock) && !isEmpty(oldBlock.Parent.get())) {
		if (isEmpty(direction) || !isString(direction) || isEmptyString(direction)) {
			direction = "left";
		}
		oldNode = oldBlock.Node.get();
		newNode = newBlock.Node.get();
		parent = oldBlock.Parent.get();
		parentNode = oldBlock.ParentNode.get();
		parentNode.style.overflow = "hidden";
		parentNode.style.position = "relative";
		parentNode.style.height = oldNode.clientHeight + "px";
		parentNode.style.width = oldNode.clientWidth + "px";
		oldNode.style.position = "absolute";
		newNode.style.position = "absolute";
		newNode.style.top = "0px";
		newNode.style.width = oldNode.clientWidth + "px";
		newNode.style[direction] = formatString("{0}px", oldNode.clientWidth);
		oldNode.style[direction] = "0px";

		parent.Childs.add(newBlock);

		last = +new Date();

		tick = function () {
			oldNode.style[direction] = formatString("{0}px", getNumber(oldNode.style[direction]) - (new Date() - last) * 500 / time);
			newNode.style[direction] = formatString("{0}px", getNumber(newNode.style[direction]) - (new Date() - last) * 500 / time);

			last = +new Date();

			if (getNumber(newNode.style[direction]) > 0) {
				if (!(window.requestAnimationFrame && requestAnimationFrame(tick))) {
					setTimeout(tick, 16);
				}
			}
			else {
				oldBlock.Parent.remove();
				newNode.style[direction] = "";
				newNode.style.position = "";
				parentNode.style.overflow = "";
				parentNode.style.position = "";
				changeSize(parentNode, newNode.clientWidth, newNode.clientHeight, 300);
				if (!isEmpty(callback)) {
					callback.call(context);
				}
			}
		};
		tick();
	}
}
/*
 function slideElements (oldNode, newNode, direction, time, callback, context) {
 var last, tick;

 if (!isEmpty(oldNode) && !isEmpty(newNode) && !isEmpty(oldNode.parentNode)) {
 if (isEmpty(direction) || !isString(direction) || isEmptyString(direction)) {
 direction = "left";
 }
 oldNode.parentNode.style.overflow = "hidden";
 oldNode.parentNode.style.position = "relative";
 oldNode.style.position = "absolute";
 newNode.style.position = "absolute";
 newNode.style.top = "0px";
 newNode.style[direction] = formatString("{0}px", oldNode.clientWidth);
 oldNode.style[direction] = "0px";

 oldNode.parentNode.appendChild(newNode);
 last = +new Date();

 tick = function () {
 oldNode.style[direction] = formatString("{0}px", getNumber(oldNode.style[direction]) - (new Date() - last) * 500 / time);
 newNode.style[direction] = formatString("{0}px", getNumber(newNode.style[direction]) - (new Date() - last) * 500 / time);

 last = +new Date();

 if (getNumber(newNode.style[direction]) > 0) {
 checkRequestAnimationFrame(tick);
 }
 else {
 newNode.style[direction] = "0px";
 if (!isEmpty(callback)) {
 callback.call(context);
 }
 }
 };
 tick();
 }
 }
 */
function fadeIn (el, callback, context, speed) {
	var last, tick;

	if (isEmpty(speed)) {
		speed = 400;
	}
	el.style.opacity = 0;

	last = +new Date();
	tick = function () {
		el.style.opacity = +el.style.opacity + (new Date() - last) / speed;
		last = +new Date();

		if (+el.style.opacity < 1) {
			checkRequestAnimationFrame(tick);
		}
		else {
			if (!isEmpty(callback)) {
				callback.call(context);
			}
		}
	};
	tick();
}

function fadeOut (el, callback, context, speed) {
	var last, tick;

	if (isEmpty(speed)) {
		speed = 400;
	}
	el.style.opacity = 1;

	last = +new Date();
	tick = function () {
		el.style.opacity = +el.style.opacity - (new Date() - last) / speed;
		last = +new Date();

		if (+el.style.opacity > 0) {
			checkRequestAnimationFrame(tick);
		}
		else {
			if (!isEmpty(callback)) {
				callback.call(context);
			}
		}
	};
	tick();
}

function changeSize (el, width, height, speed) {
	var currentWidth, currentHeight;

	currentWidth = el.clientWidth;
	currentHeight = el.clientHeight;
	el.style.width = formatString("{0}px", currentWidth);
	el.style.height = formatString("{0}px", currentHeight);
	changeWidth(el, width, speed);
	changeHeight(el, height, speed);
}

function changeWidth (el, width, speed) {
	var currentWidth, increasing, decreasing, last, tick;

	if (isEmpty(speed)) {
		speed = 250;
	}
	currentWidth = el.clientWidth;
	increasing = currentWidth < width;
	decreasing = currentWidth > width;
	last = +new Date();
	tick = function () {
		if (decreasing) {
			el.style.width = formatString("{0}px", getNumber(el.style.width) - (new Date() - last) * (speed / 100));
		}
		if (increasing) {
			el.style.width = formatString("{0}px", getNumber(el.style.width) + (new Date() - last) * (speed / 100));
		}
		currentWidth = getNumber(el.style.width);
		last = +new Date();

		if ((!increasing && currentWidth <= width) || (increasing && currentWidth >= width)) {
			el.style.width = formatString("{0}px", width);
		}
		else {
			checkRequestAnimationFrame(tick);
		}
	};
	tick();
}

function changeHeight (el, height, speed) {
	var currentHeight, increasing, decreasing, last, tick;

	if (isEmpty(speed)) {
		speed = 250;
	}
	currentHeight = el.clientHeight;
	increasing = currentHeight < height;
	decreasing = currentHeight > height;
	last = +new Date();
	tick = function () {
		if (decreasing) {
			el.style.height = formatString("{0}px", getNumber(el.style.height) - (new Date() - last) * (speed / 100));
		}
		if (increasing) {
			el.style.height = formatString("{0}px", getNumber(el.style.height) + (new Date() - last) * (speed / 100));
		}
		currentHeight = getNumber(el.style.height);
		last = +new Date();
		if ((!increasing && currentHeight <= height) || (increasing && currentHeight >= height)) {
			el.style.height = formatString("{0}px", height);
		}
		else {
			checkRequestAnimationFrame(tick);
		}
	};

	tick();
}

function getNumber (number) {
	var pattern, result;

	result = null;

	if (!isEmptyString(number) && isString(number)) {
		pattern = /[\-]?\d*[\.]?\d*/g;
		result = parseInt(number.match(pattern).join(""), 10);
	}
	else if (isInt(number)) {
		result = number;
	}
	return result;
}
/*
 function getBoolFromString (str) {
 var result;

 result = null;

 if (isString(str)) {
 str = str.toLowerCase();
 if (str === "true") {
 result = true;
 }
 else if (str === "false") {
 result = false;
 }
 }
 return result;
 }
 */
function checkValueInEnum (name, val) {
	var result, key;

	result = false;
	if (!isEmpty(Enums[name])) {
		for (key in Enums[name]) {
			if (Enums[name].hasOwnProperty(key)) {
				if (val === Enums[name][key]) {
					result = true;
				}
			}
		}
	}
	return result;
}

Enums.Types = {
	String  : "String",
	Number  : "Number",
	Boolean : "Boolean",
	Array   : "array",
	Object  : "object",
	Node    : "node",
	Function: "function"
};

Enums.BasicValuesForTypes = {
	String  : function () {
		return "";
	},
	Number  : function () {
		return null;
	},
	Boolean : function () {
		return false;
	},
	Array   : function () {
		return [];
	},
	Object  : function () {
		return {};
	},
	Node    : function () {
		return null;
	},
	Function: function () {
		return function () {
		};
	}
};

function getType (obj) {
	var result = null;

	if (!isEmpty(obj)) {
		if (!isEmpty(obj.Name) && !isEmpty(obj.Name.get)) {
			if (obj instanceof SEngine) {
				result = obj.Name.get();
			}
		}
		else {
			if (isString(obj)) {
				result = Enums.Types.String;
			}
			else if (isBool(obj)) {
				result = Enums.Types.Boolean;
			}
			else if (isInt(obj)) {
				result = Enums.Types.Number;
			}
			else if (isArray(obj)) {
				result = Enums.Types.Array;
			}
			else if (isFunc(obj)) {
				result = Enums.Types.Function;
			}
			else if (!isEmpty(obj.nodeType)) {
				result = Enums.Types.Node;
			}
			else {
				result = Enums.Types.Object;
			}
		}
	}
	return result;
}

function is (type, obj, relatives) {
	var _type, result;

	result = false;
	_type = getType(obj);

	if (_type === type) {
		result = true;
	}
	else if (relatives === true) {
		if (!isString(type) && obj instanceof type) {
			result = true;
		}
	}
	return result;
}

function getRandomInt (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
