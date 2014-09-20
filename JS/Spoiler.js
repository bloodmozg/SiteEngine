function Spoiler (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Spoiler");
	this.Title = this.addProp("Title", Enums.Types.String);
	this.Content = this.addProp("Content", DomObject);
	this.Open = this.addProp("Open", Enums.Types.Boolean, false);
	Spoiler.Parent.apply(this, arguments);
	return this;
}

Extend(Spoiler, DomObject);

var proto = Spoiler.prototype;

proto.initPrivateProps = function () {
	Spoiler.Parent.prototype.initPrivateProps.apply(this);
	this.TitleNode = this.addProp("TitleNode", Enums.Types.Node);
	this.ContentNode = this.addProp("ContentNode", Enums.Types.Node);
};

proto.init = function () {
	Spoiler.Parent.prototype.init.apply(this);
	this.Title.init();
	this.Content.init();
	this.Open.init();
};

proto.initOverloadedGettersSetters = function () {
	Spoiler.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.Title.set = this.Title.extend("set", this.setTitle, this);
	this.Title.init = this.Title.extend("init", this.initTitle, this);
	this.Content.set = this.Content.extend("set", this.setContent, this);
	this.Content.init = this.Content.extend("init", this.initContent, this);
	this.Open.set = this.Open.extend("set", this.setOpen, this);
	this.Open.init = this.Open.extend("init", this.initOpen, this);
};

proto.createNode = function () {
	var panel, titlePanel, contentPanel;

	panel = document.createElement("div");
	titlePanel = document.createElement("div");
	contentPanel = document.createElement("div");

	titlePanel.className = "Title Unselectable Clickable";
	contentPanel.className = "Content";

	panel.appendChild(titlePanel);
	panel.appendChild(contentPanel);
	this.TitleNode.set(titlePanel);
	this.ContentNode.set(contentPanel);
	this.Node.set(panel);
};

proto.setTitle = function (oldTitle, newTitle) {
	var titleNode;

	titleNode = this.TitleNode.get();
	titleNode.innerHTML = newTitle;
};

proto.initTitle = function () {
	this.Title.set(this.Title.get());
	this.initTitleEvents();
};

proto.initTitleEvents = function () {
	var titleNode, self;

	titleNode = this.TitleNode.get();
	self = this;
	Event.add(titleNode, "click", function () {
		self.Open.set(!self.Open.get());
	});
};

proto.setContent = function (oldContent, newContent) {
	var contentNode;

	contentNode = this.ContentNode.get();
	newContent.ParentNode.set(contentNode);
};

proto.initContent = function () {
	this.Content.set(this.Content.get());
};

proto.setOpen = function (oldValue, newValue) {
	var contentNode;

	contentNode = this.ContentNode.get();
	if (newValue == true) {
		contentNode.style.display = "";
		this.Class.add("Opened");
		this.Class.remove("Closed");
	}
	else {
		contentNode.style.display = "none";
		this.Class.remove("Opened");
		this.Class.add("Closed");
	}
};

proto.initOpen = function () {
	this.Open.set(this.Open.get());
};