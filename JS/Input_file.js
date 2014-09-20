function Input_file (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Input_file");
	this.Data = this.addProp("Data", Enums.Types.Object);
	this.Value = this.addProp("Value", Enums.Types.Object);
	Input_file.Parent.apply(this, arguments);
	return this;
}

Extend(Input_file, Input);

var proto = Input_file.prototype;

proto.initPrivateProps = function () {
	Input_file.Parent.prototype.initPrivateProps.apply(this);
};

proto.init = function () {
	Input_file.Parent.prototype.init.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	Input_file.Parent.prototype.initOverloadedGettersSetters.apply(this);
};

proto.createNode = function () {
	var node, fileNode;

	node = document.createElement("div");
	fileNode = document.createElement("input");
	fileNode.type = "file";
	node.appendChild(fileNode);
	this.Node.set(node);
	this.InputNode.set(fileNode);
};

proto.onChangeInput = function (node) {
	this.Value.set(node.files);
};