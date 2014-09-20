function Input_text (settings) {
	this.Name = this.addProp ("Name", Enums.Types.String, "Input_text");
	Input_text.Parent.apply (this, arguments);
	return this;
}

Extend (Input_text, Input);

var proto = Input_text.prototype;

proto.initPrivateProps = function () {
	Input_text.Parent.prototype.initPrivateProps.apply (this);
};

proto.init = function () {
	Input_text.Parent.prototype.init.apply (this);
};

proto.initOverloadedGettersSetters = function () {
	Input_text.Parent.prototype.initOverloadedGettersSetters.apply (this);
};

proto.createNode = function () {
	var node, textNode;

	node = document.createElement ("div");
	textNode = document.createElement ("textarea");
	node.appendChild (textNode);
	this.Node.set (node);
	this.InputNode.set (textNode);
};