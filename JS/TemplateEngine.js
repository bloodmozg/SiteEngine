function TemplateEngine (settings) {
	this.PatternTagPrefix = this.addProp("PatternTagPrefix", Enums.Types.String, "Pattern_");
	this.Name = this.addProp("Name", Enums.Types.String, "TemplateEngine");
	TemplateEngine.Parent.apply(this, arguments);
	return this;
}

Extend(TemplateEngine, SEngine);

var proto = TemplateEngine.prototype;

proto.initTemplate = function (template) {
	var result;

	result = null;
	if (!isEmpty(template)) {
		if (isString(template)) {
			template = this.convertStringToDom(template);
			result = this.initNode(template);
		}
	}

	return result;
};

proto.convertStringToDom = function (str) {
	var div, elem, i;

	div = document.createElement("div");
	div.innerHTML = str;

	if (div.children.length > 1) {
		elem = document.createElement(formatString("{0}template", this.PatternTagPrefix.get()));
		for (i = 0; i < div.children.length; i++) {
			elem.appendChild(div.children[i]);
			i--;
		}
	}
	else {
		elem = div.firstElementChild;
	}
	return elem;
};

proto.initNode = function (node) {
	var result, constructor, settings, childs, child, childObject, i;

	constructor = this.getConstructorFromNode(node);
	settings = this.getSettingsFromNode(node);
	result = new constructor(settings);

	childs = node.children;
	for (i = 0; i < childs.length; i++) {
		child = childs[i];
		if (node.nodeType === 1) {
			childObject = this.initNode(child);
			if (!isEmpty(childObject)) {
				result.Childs.add(childObject);
			}
		}
	}

	return result;
};

proto.getConstructorFromNode = function (node) {
	var result, fullName, engineName, isPatternTag, constructor, prefix, name;

	result = null;
	if (node.nodeType === 1) {
		fullName = node.tagName;
		engineName = this.EngineName.get();
		isPatternTag = fullName.indexOf(this.PatternTagPrefix.get().toUpperCase()) >= 0;
		constructor = null;
		if (!isPatternTag) {
			prefix = formatString("{0}_", engineName);
			name = fullName.split(prefix)[1].toUpperCaseFirstLetter();
			constructor = window[name];
		}
		else {
			constructor = window["Panel"];
		}

		if (!isEmpty(constructor)) {
			result = constructor;
		}
	}

	return result;
};

proto.getSettingsFromNode = function (node) {
	var result, attributes, attribute, name, value, i;

	result = {};
	attributes = node.attributes;
	for (i = 0; i < attributes.length; i++) {
		attribute = attributes[i];
		name = attribute.name.toUpperCaseFirstLetter();
		value = attribute.value;
		if (name == "Width" || name == "Height") {
			value = getNumber(value);
		}
		if (name === "Class") {
			value = value.split(" ");
		}
		result[name] = value;
	}

	return result;

};
