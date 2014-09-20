function CS (settings) {
	this.EngineName = this.addProp ("EngineName", Enums.Types.String, "CS");
	this.Engine = this.addProp ("Engine", Enums.Types.Object);
	this.Modules = this.addProp ("Modules", Enums.Types.Object, {});
	this.ServerSettings = this.addProp ("ServerSettings", Enums.Types.Object, {});
	this.Objects = this.addProp ("Objects", Enums.Types.Array, []);
	this.Id = this.addProp ("Id", Enums.Types.Number, proto.IdCounter++);
	this.Name = this.addProp ("Name", Enums.Types.String, "Core");
	this.Inited = this.addProp ("Inited", Enums.Types.Boolean, false);
	this.getSettings (settings);
	this.initPrivateProps ();
	this.initOverloadedGettersSetters ();
	this.registerObject ();
	return this;
}

var proto = CS.prototype;

var date = new Date ();
proto.IdCounter = date.getTime ();

proto.initPrivateProps = function () {
};

proto.initOverloadedGettersSetters = function () {
	this.Id.generate = this.Id.extend ("generate", this.generateId, this);
};

proto.generateId = function () {
	return getRandomInt (100000, 999999);
};

proto.Init = function () {
	var className, modules, name, moduleConfig, constructor;

	className = this.Name.get ();
	if (className === "Core") {
		modules = this.Modules.get ();
		for (name in modules) {
			if (modules.hasOwnProperty (name)) {
				moduleConfig = modules[name];
				constructor = window[name];
				if (!isEmpty (constructor)) {
					this[name] = new constructor (moduleConfig);
				}
			}
		}
	}
	this.Inited.set (true);
	return this;
};

proto.getSettings = function (settings) {
	var param;

	for (param in settings) {
		if (settings.hasOwnProperty (param)) {
			if (!isEmpty (settings[param])) {
				if (isDeclared (this[param])) {
					this[param].set (settings[param]);
				}
				else {
					throw new ReferenceError (formatString ("Class: {0} \n Param: {1} was not found", this.Name.get (), param));
				}
			}
		}
	}
};

proto.getServerSettings = function (key) {
	var sett, result;

	result = null;

	if (!isEmpty (Engine)) {
		sett = Engine.ServerSettings.get ().settings;
		if (!isEmptyString (key)) {
			result = sett[key];
		}
		else {
			result = sett;
		}
	}
	return result;
};

proto.getServerLocalizations = function (key) {
	var localizations, result;

	result = null;

	if (!isEmpty (Engine)) {
		localizations = Engine.ServerSettings.get ().localization;
		if (!isEmptyString (key)) {
			result = localizations[key];
		}
		else {
			result = localizations;
		}
	}
	return result;
};

proto.registerObject = function () {
	var debug;

	debug = this.getServerSettings ("Debug");
	if (debug == true) {
		Engine.Objects.push (this);
	}
};

proto.createProp = function (name, type, defaultValue) {
	var property;

	property = {
		_type         : type,
		_defaultValue : defaultValue,
		_value        : defaultValue
	};
	if (isEmpty (defaultValue) || !is (type, defaultValue)) {
		if (checkValueInEnum ("Types", type)) {
			property._value = Enums.BasicValuesForTypes[type.toUpperCaseFirstLetter ()] ();
		}
		else {
			property._value = null;
		}
	}

	function checkValue (val, key) {
		var length, value, result;

		result = null;

		if (isEmpty (val) || is (type, val, true) || !isEmpty (key)) {
			length = 0;

			value = null;
			/*
			 //Get default value for type <type>
			 if (checkValueInEnum("Types", type)) {
			 value = Enums.BasicValuesForTypes[type.toUpperCaseFirstLetter()]();
			 }
			 else {
			 value = null;
			 }
			 */
			if (!isEmpty (val)) {
				if (!isEmpty (val.length)) {
					length = val.length;
				}
				value = val;
			}
			result = {
				value  : value,
				length : length
			};
		}
		else {
			throw new ReferenceError (formatString ("{0} is \"{1}\" but is not \"{2}\" (Property: {3})", val, getType (val), type, name));
		}
		return result;
	}

	function get (key) {
		var result;

		result = property._value;

		if (!isEmpty (key) && (type === Enums.Types.Array || type === Enums.Types.Object)) {
			if (isEmpty (property._value[key])) {
				result = null;
			}
			else {
				result = property._value[key];
			}
		}

		return result;
	}

	function set (val, key) {
		var newVal, result, value, length;

		newVal = checkValue (val, key);
		result = {
			oldValue : property._value,
			newValue : null
		};
		if (newVal) {
			value = newVal.value;
			length = newVal.length;
			if (type === Enums.Types.Array || type === Enums.Types.Object) {
				property.length = length;
				if (!isEmpty (key)) {
					property.push (value, key);
					result.oldValue = property._value[key];
				}
				else {
					property._value = value;
				}
			}
			else {
				property._value = value;
			}
			result.newValue = value;
		}
		return result;
	}

	property.get = get;
	property.set = set;

	property.extend = function (name, func, context) {
		var result;

		result = function () {
		};
		if (isString (name) && !isEmptyString (name)) {
			if (name !== "_value" && name !== "_defaultValue" && name !== "_type" && name !== "length") {
				if (name === "set") {
					property.set = function (val, key) {
						var result;

						result = set (val, key);
						func.call (context, result.oldValue, result.newValue);
					};
					result = property.set;
				}
				else {
					property[name] = function () {
						return func.apply (context, arguments);
					};
					result = property[name];
				}
			}
		}
		return result;
	};

	if (type === Enums.Types.Array) {
		property._value = [];
		property.length = 0;
		property.extend ("push", function (elem) {
			property._value.push (elem);
			property.length++;
		});
		property.extend ("splice", function (index, count) {
			property._value.splice (index, count);
			if (property.length > 0) {
				property.length--;
			}
		});
	}

	if (type === Enums.Types.Object) {
		property.extend ("push", function (elem, key) {
			property._value[key] = elem;
		});
		property.extend ("delete", function (key) {
			if (!isEmpty (key) && !isEmptyString (key) && isDeclared (property._value[key])) {
				property._value[key] = null;
				delete property._value[key];
			}
		});
	}

	return property;
};

proto.addProp = function (name, type, defaultValue) {
	if (!isDeclared (this[name])) {
		this[name] = this.createProp (name, type, defaultValue);
	}

	return this[name];
};

ЖОПА