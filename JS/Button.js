function Button (settings) {
	this.Text = this.addProp ("Text", Enums.Types.String, Engine.getServerLocalizations("buttonText"));
	this.Clickable = this.addProp ("Clickable", Enums.Types.Boolean, true);
	this.Selected = this.addProp ("Selected", Enums.Types.Boolean, false);
	this.Selectable = this.addProp ("Selectable", Enums.Types.Boolean, false);
	this.Resizeble = this.addProp ("Resizeble", Enums.Types.Boolean, false);
	this.Data = this.addProp ("Data", Enums.Types.String);
	this.Name = this.addProp ("Name", Enums.Types.String, "Button");
	Button.Parent.apply (this, arguments);
	return this;
}

Extend (Button, DomObject);

var proto = Button.prototype;

proto.initPrivateProps = function () {
	Button.Parent.prototype.initPrivateProps.apply (this);
	this.LeftNode = this.addProp ("LeftNode", Enums.Types.Node);
	this.RightNode = this.addProp ("RightNode", Enums.Types.Node);
	this.TextNode = this.addProp ("TextNode", Enums.Types.Node);
};

proto.init = function () {
	Button.Parent.prototype.init.apply (this);
	this.Text.init ();
	this.Class.add ("leftNode");
	this.Selected.init();
};

proto.initOverloadedGettersSetters = function () {
	Button.Parent.prototype.initOverloadedGettersSetters.apply (this);
	this.Selected.set = this.Selected.extend ("set", this.setSelected, this);
	this.Selected.init = this.Selected.extend ("init", this.initSelected, this);
	this.Text.set = this.Text.extend ("set", this.setText, this);
	this.Text.init = this.Text.extend ("init", this.initText, this);
};

proto.createNode = function () {
	var leftNode, rightNode, textNode;

	leftNode = document.createElement ("div");
	rightNode = document.createElement ("div");
	textNode = document.createElement ("span");

	rightNode.className = "rightNode";
	textNode.className = "textNode";

	leftNode.appendChild (rightNode);
	rightNode.appendChild (textNode);
	this.LeftNode.set(leftNode);
	this.RightNode.set(rightNode);
	this.TextNode.set(textNode);
	this.Node.set (leftNode);
};

proto.setSelected = function (oldValue, newValue) {
	if (newValue === true) {
		this.Class.add ("Selected");
	}
	else {
		this.Class.remove ("Selected");
	}
	this.Clickable.set (!newValue);
};

proto.initSelected = function(){
	this.Selected.set(this.Selected.get());
};

proto.setText = function (oldText, newText) {
	var textNode;

	textNode = this.TextNode.get ();
	textNode.innerHTML = newText;
};
proto.initText = function () {
	this.Text.set(this.Text.get());
};

proto.setData = function (oldData, newData) {
	this.Text.set (newData, true);
};
