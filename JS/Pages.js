function Pages (settings) {
	this.CountPages = this.addProp("CountPages", Enums.Types.Number, 0);
	this.CurrentPage = this.addProp("CurrentPage", Enums.Types.Number, 1);
	this.ButtonTemplate = this.addProp("ButtonTemplate", Enums.Types.String);
	this.ReactionOnChangePage = this.addProp("ReactionOnChangePage", Enums.Types.Function);
	this.Context = this.addProp("Context", DomObject);
	this.Name = this.addProp("Name", Enums.Types.String, "Pages");
	Pages.Parent.apply(this, arguments);
	return this;
}

Extend(Pages, DomObject);

var proto = Pages.prototype;

proto.init = function () {
	Pages.Parent.prototype.init.apply(this);
	this.createPages();
};

proto.initPrivateProps = function () {
	this.PreviousPage = this.addProp("PreviousPage", Enums.Types.Number);
	this.ButtonNodes = this.addProp("ButtonNodes", Enums.Types.Array);
};

proto.initOverloadedGettersSetters = function () {
	Pages.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.CurrentPage.set = this.CurrentPage.extend("set", this.setCurrentPage, this);
	this.ButtonNodes.add = this.ButtonNodes.extend("add", this.addButtonNodes, this);
	this.CountPages.set = this.CountPages.extend("set", this.setCountPages, this);
};

proto.createNode = function () {
	var node;

	node = document.createElement("div");
	this.Node.set(node);
};

proto.setCurrentPage = function (oldPage, newPage) {
	this.PreviousPage.set(oldPage);
	this.changePage(newPage);
};

proto.setCountPages = function () {
	this.createPages();
};

proto.addButtonNodes = function (button) {
	if (!isEmpty(button) && is("Button", button)) {
		this.ButtonNodes.push(button);
	}
};

proto.getResultForSender = function () {
	return {
		CurrentPage : this.CurrentPage.get(),
		PreviousPage: this.PreviousPage.get()
	};
};

proto.createPages = function () {
	var count, i, button;

	count = this.CountPages.get();
	if (count > 1) {
		this.show();
		for (i = 0; i < count; i++) {
			button = this.createPageButton(i + 1);
			this.ButtonNodes.add(button);
			this.Childs.add(button);
		}
	}
	else {
		this.hide();
	}
};

proto.createPageButton = function (numberOfPage) {
	var temp, element, curPage;

	temp = this.ButtonTemplate.get();
	if (!isEmptyString(temp)) {
		element = Engine.TemplateEngine.initTemplate(temp);
	}
	else {
		element = new Button();
	}
	element.Text.set(numberOfPage.toString());
	element.Clickable.set(true);
	element.Actions.add("click", this.onPageClick, this);
	curPage = this.CurrentPage.get();
	if (curPage === numberOfPage) {
		element.Selected.set(true);
	}
	return element;
};

proto.changePage = function (page) {
	var findParams, activeButton, newActiveButton;

	findParams = {
		Selected: true,
		Name    : "Button"
	};
	activeButton = this.Childs.find(findParams)[0];
	if (!isEmpty(activeButton)) {
		activeButton.Selected.set(false);
	}

	findParams = {
		Text: page.toString(),
		Name: "Button"
	};
	newActiveButton = this.findChilds(findParams)[0];
	if (!isEmpty(newActiveButton)) {
		newActiveButton.Selected.set(true);
	}
	if (!isEmptyObject(activeButton)) {
		var callback = this.ReactionOnChangePage.get();
		callback.call(this.Context.get(), this.getResultForSender());
	}
};

proto.reloadPages = function () {
	this.createPages();
};

proto.onPageClick = function (sender) {
	var button, page;

	button = this;
	page = getNumber(button.Text.get());
	sender.CurrentPage.set(page);
};
