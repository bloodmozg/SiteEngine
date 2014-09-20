function Text (settings) {
	this.Text = this.addProp("Text", Enums.Types.String);
	this.Data = this.addProp("Data", Enums.Types.String);
	this.Name = this.addProp("Name", Enums.Types.String, "Text");
	this.Pattern = this.addProp("Pattern", Enums.Types.String, "{0}");
	Text.Parent.apply(this, arguments);
	return this;
}

Extend(Text, DomObject);

var proto = Text.prototype;

proto.initPrivateProps = function () {
	Text.Parent.prototype.initPrivateProps.apply(this);
	this.TextNode = this.addProp("TextNode", Enums.Types.Node);
};

proto.init = function () {
	Text.Parent.prototype.init.apply(this);
	this.Text.init();
};

proto.initOverloadedGettersSetters = function () {
	Text.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.Text.set = this.Text.extend("set", this.setText, this);
	this.Text.init = this.Text.extend("init", this.initText, this);
};

proto.createNode = function () {
	var textNode;

	textNode = document.createElement("div");
	this.Node.set(textNode);
	this.TextNode.set(textNode);
};

proto.setText = function (oldText, newText) {
	var textNode;

	textNode = this.TextNode.get();
	textNode.innerHTML = formatString(this.Pattern.get(), newText);
};
proto.initText = function () {
	this.Text.set(this.Text.get());
};

proto.setData = function (oldSettings, newSettings) {
	this.Text.set(newSettings, true);
};

