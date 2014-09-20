function Input_files (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Input_files");
	this.Data = this.addProp("Data", Enums.Types.Object);
	this.Value = this.addProp("Value", Enums.Types.Object);
	Input_files.Parent.apply(this, arguments);
	return this;
}

Extend(Input_files, Input);

var proto = Input_files.prototype;

proto.initPrivateProps = function () {
	Input_files.Parent.prototype.initPrivateProps.apply(this);
};

proto.init = function () {
	Input_files.Parent.prototype.init.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	Input_files.Parent.prototype.initOverloadedGettersSetters.apply(this);
};

proto.createNode = function () {
	var node, filesNode;

	node = document.createElement("div");
	filesNode = document.createElement("input");
	filesNode.type = "file";
	filesNode.multiple = true;
	node.appendChild(filesNode);
	this.Node.set(node);
	this.InputNode.set(filesNode);
};

proto.onChangeInput = function (node) {
	this.Value.set(node.files);
};