function Form (settings) {
	this.InputElements = this.addProp("InputElements", Enums.Types.Array);
	this.Url = this.addProp("Url", Enums.Types.String);
	this.Files = this.addProp("Files", Enums.Types.Boolean, false);
	this.Name = this.addProp("Name", Enums.Types.String, "Form");
	this.Callback = this.addProp("Callback", Enums.Types.Function);
	this.Context = this.addProp("Context", CS);
	Form.Parent.apply(this, arguments);
	return this;
}

Extend(Form, DomObject);

var proto = Form.prototype;

proto.initPrivateProps = function () {
	Form.Parent.prototype.initPrivateProps.apply(this);
};

proto.init = function () {
	Form.Parent.prototype.init.apply(this);
	this.InputElements.init();
	//this.setWidthTextLabel ();
};

proto.initOverloadedGettersSetters = function () {
	Form.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.InputElements.add = this.InputElements.extend("add", this.addInputElements, this);
	this.InputElements.init = this.InputElements.extend("init", this.initInputElements, this);
};

proto.setEnctype = function (oldVal, newVal) {
	var node;

	node = this.Node.get();
	node.enctype = newVal;
};

proto.createNode = function () {
	var node;

	node = document.createElement("form");
	this.Node.set(node);
};

proto.addInputElements = function (Elements) {
	var Element, i;

	if (isArray(Elements)) {
		for (i = 0; i < Elements.length; i++) {
			Element = Elements[i];
			if (is(Input_file, Element) || is(Input_files, Element)) {
				this.Files.set(true);
			}
			this.InputElements.push(Element);
		}
	}
	else if (is(Input, Elements)) {
		Element = Elements;
		if (is(Input_file, Element) || is(Input_files, Element)) {
			this.Files.set(true);
		}
		this.InputElements.push(Element);
	}
};
proto.initInputElements = function () {
	var elements;

	elements = this.InputElements.get();
	this.InputElements.set([]);
	this.InputElements.add(elements);
};

proto.submit = function (sender) {
	var formData, inputs, data, input, files, file, i, j, namespace, value, config;

	formData = new FormData();
	inputs = sender.InputElements.get();
	data = {};
	for (i = 0; i < inputs.length; i++) {
		input = inputs[i];
		namespace = input.NameSpace.get();
		if (is(Input_file, input, true) || is(Input_files, input, true)) {
			files = input.Value.get();
			for (j = 0; j < files.length; j++) {
				file = files[j];
				namespace = formatString("{0}[]", namespace);
				formData.append(namespace, file, file.name);
			}
			data.fileNamespace = namespace;
		}
		else {
			value = input.Value.get();
			data[namespace] = value;
		}
	}

	config = {
		Url            : sender.Url.get(),
		Data           : data,
		FileData       : formData,
		Context        : sender.Context.get(),
		BeforeFunction : sender.beforeLoad,
		SuccessFunction: sender.Callback.get()
	};
	Engine.Connector.sendRequest(config);
};

proto.setWidthTextLabel = function () {
	var inputs, width, input, label, _width, i;

	inputs = this.InputElements.get();
	width = 0;
	for (i = 0; i < inputs.length; i++) {
		input = inputs[i];
		label = input.Childs.find({Name: "Text"}, true)[0];
		if (!isEmpty(label)) {
			_width = label.Node.get().clientWidth;
			if (width < _width) {
				width = _width;
			}
		}
	}
	for (i = 0; i < inputs.length; i++) {
		input = inputs[i];
		label = input.Childs.find({Name: "Text"}, true)[0];
		if (!isEmpty(label)) {
			label.Width.set(width);
		}
	}
};