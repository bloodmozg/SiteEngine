function HashEngine (settings) {
	this.Hash = this.addProp("Hash", Enums.Types.Object);
	this.HashHandlerFunction = this.addProp("HashHandlerFunction", Enums.Types.Function);
	this.Context = this.addProp("Context", CS, this);
	this.EnableHandle = this.addProp("EnableHandle", Enums.Types.Boolean, true);
	this.Name = this.addProp("Name", Enums.Types.String, "HashEngine");
	HashEngine.Parent.apply(this, arguments);
	this.init();
	return this;
}

Extend(HashEngine, CS);

var proto = HashEngine.prototype;

proto.init = function () {
	var string, hashObject;

	this.setHashEngineHandler();
	string = this.getHashStringInBrowser();
	hashObject = this.parseHashString(string);
	this.Hash.set(hashObject);
};

proto.initOverloadedGettersSetters = function () {
	HashEngine.Parent.prototype.initOverloadedGettersSetters.apply(this);
};

proto.setHashEngineHandler = function () {
	var self;

	self = this;
	$(window).hashchange(function () {
		var handleEnable, func, newString, hashObject, context;

		handleEnable = self.EnableHandle.get();
		if (handleEnable === true) {
			func = self.HashHandlerFunction.get();
			newString = self.getHashStringInBrowser();
			hashObject = self.parseHashString(newString);
			context = self.Context.get();
			self.clearHash();
			self.Hash.set(hashObject);
			func.call(context, hashObject);
		}
		else {
			self.EnableHandle.set(true);
		}
	});
};

proto.getHashStringInBrowser = function () {
	var hashString;

	hashString = window.location.hash;
	return hashString.substr(1, hashString.length - 1);
};

proto.setHashStringInBrowser = function (string) {
	window.location.hash = string;
};

//Sample: attr1=value1&attr2=value2&attr3=value3...
proto.parseHashString = function (hashString) {
	var hashObject, values, i, attrValue, key, value;

	hashObject = {};
	if (!isEmptyString(hashString)) {
		values = hashString.split("&");
		for (i = 0; i < values.length; i++) {
			attrValue = values[i];
			key = attrValue.split("=")[0];
			value = attrValue.split("=")[1];
			hashObject[key] = value;
		}
	}
	return hashObject;
};

proto.buildHashString = function (hash) {
	var string, key;

	string = "";
	for (key in hash) {
		if (hash.hasOwnProperty(key)) {
			if (!isEmptyString(string)) {
				string += "&";
			}
			if (isString(hash[key])) {
				string += formatString("{0}={1}", key, hash[key]);
			}
		}
	}
	return string;
};

proto.setHashString = function () {
	var hash, string;

	hash = this.Hash.get();
	string = this.buildHashString(hash);
	this.setHashStringInBrowser(string);
	this.EnableHandle.set(false);
};

proto.clearHash = function () {
	var hash, key;

	hash = this.Hash.get();
	for (key in hash) {
		if (hash.hasOwnProperty(key)) {
			this.Hash.delete(key);
		}
	}
};