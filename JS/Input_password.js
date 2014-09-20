function Input_password (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Input_password");
	this.LinkedInput = this.addProp("LinkedInput", Input_password);
	this.Mask = this.addProp("Mask", Enums.Types.String);
	Input_password.Parent.apply(this, arguments);
	return this;
}

Extend(Input_password, Input);

var proto = Input_password.prototype;

proto.initPrivateProps = function () {
	Input_password.Parent.prototype.initPrivateProps.apply(this);
};

proto.init = function () {
	Input_password.Parent.prototype.init.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	Input_password.Parent.prototype.initOverloadedGettersSetters.apply(this);
};

proto.createNode = function () {
	var node, passwordNode;

	node = document.createElement("div");
	passwordNode = document.createElement("input");
	passwordNode.type = "Password";
	node.appendChild(passwordNode);
	this.Node.set(node);
	this.InputNode.set(passwordNode);
};

proto.onChangeInput = function (node) {
	Input_password.Parent.prototype.onChangeInput.apply(this, arguments);
};

proto.checkPassword = function () {

};