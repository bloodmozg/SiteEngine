function Input (settings) {
	this.NameSpace = this.addProp ("NameSpace", Enums.Types.String);
	this.Enabled = this.addProp ("Enabled", Enums.Types.Boolean, true);
	this.ReadOnly = this.addProp ("ReadOnly", Enums.Types.Boolean, false);
	this.Data = this.addProp ("Data", Enums.Types.String);
	this.Value = this.addProp ("Value", Enums.Types.String);
	this.TextLabel = this.addProp ("TextLabel", Enums.Types.String);
	this.Name = this.addProp ("Name", Enums.Types.String, "Input");
	Input.Parent.apply (this, arguments);
	return this;
}

Extend (Input, DomObject);

var proto = Input.prototype;

proto.init = function () {
	Input.Parent.prototype.init.apply (this);
	this.Class.add("Input");
	this.configurateInputNode ();
};

proto.initPrivateProps = function () {
	Input.Parent.prototype.initPrivateProps.apply (this);
	this.InputNode = this.addProp ("InputNode", Enums.Types.Node);
};

proto.initOverloadedGettersSetters = function () {
	Input.Parent.prototype.initOverloadedGettersSetters.apply (this);
	this.Value.set = this.Value.extend ("set", this.setValue, this);
	this.Value.init = this.Value.extend ("init", this.initValue, this);
	this.TextLabel.set = this.TextLabel.extend ("set", this.setTextLabel, this);
	this.TextLabel.init = this.TextLabel.extend ("init", this.initTextLabel, this);
};

proto.setValue = function (oldVal, newVal) {
	var node;

	node = this.InputNode.get ();
	if (!isEmpty (newVal) && !isEmptyString(newVal)) {
		node.value = newVal;
		this.Class.add("WithText");
	}
	else{
		node.value = "";
		this.Class.remove("WithText");
	}
};

proto.initValue = function () {
	this.Value.set (this.Value.get ());
};

proto.setTextLabel = function (oldVal, newVal) {
	var text, node;

	node = this.InputNode.get();
	if (!isEmpty (newVal)) {
		text = new Text ({
			Text : newVal,
			Selectable: false
		});
		text.Actions.add("click", function(){
			node.focus();
		}, this);
		this.Childs.add (text);
		this.Class.add("WithLabel");
	}
	else {
		this.Node.set (node);
	}
};

proto.initTextLabel = function () {
	this.TextLabel.set (this.TextLabel.get ());
};

proto.configurateInputNode = function () {
	var node, enabled, readOnly, namespace, self, funcContext;

	node = this.InputNode.get ();
	enabled = this.Enabled.get ();
	readOnly = this.ReadOnly.get ();
	namespace = this.NameSpace.get();
	this.Value.init ();
	if (enabled === false) {
		node.disabled = true;
	}
	if (readOnly === true) {
		node.readOnly = true;
	}
	if(!isEmpty(namespace)){
		node.name = namespace;
	}
	self = this;
	funcContext = function () {
		self.onChangeInput(this);
	};
	Event.add (node, "change", funcContext);
	Event.add(node, "focus", function(){
		self.Class.add("focused");
	});
	Event.add(node, "blur", function(){
		self.Class.remove("focused");
	});
	this.TextLabel.init ();
};

proto.onChangeInput = function (node) {
	this.Value.set (node.value);
};

proto.setData = function (oldData, newData) {
	this.Value.set (newData);
};

