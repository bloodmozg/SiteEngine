function Input_string (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Input_string");
	Input_string.Parent.apply(this, arguments);
	return this;
}

Extend(Input_string, Input);

var proto = Input_string.prototype;

proto.initPrivateProps = function () {
	Input_string.Parent.prototype.initPrivateProps.apply(this);
};

proto.init = function () {
	Input_string.Parent.prototype.init.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	Input_string.Parent.prototype.initOverloadedGettersSetters.apply(this);
};

proto.createNode = function () {
	var node, stringNode;

	node = document.createElement("div");
	stringNode = document.createElement("input");
	stringNode.type = "Text";
	node.appendChild(stringNode);
	this.Node.set(node);
	this.InputNode.set(stringNode);
};