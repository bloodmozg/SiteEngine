function Admin (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Admin");
	this.ParentNode = this.addProp("ParentNode", Enums.Types.Node);
	this.Login = this.addProp("Login", Enums.Types.String);
	this.Hash = this.addProp("Hash", Enums.Types.String);
	this.MainNode = this.addProp("MainNode", DomObject);
	Admin.Parent.apply(this, arguments);
	this.init();
	return this;
}

Extend(Admin, SEngine);

var proto = Admin.prototype;

proto.init = function () {
	this.checkLoginHash();
};

proto.initPrivateProps = function () {
	Admin.Parent.prototype.initPrivateProps.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	Admin.Parent.prototype.initOverloadedGettersSetters.apply(this);
};

proto.getDaysInSeconds = function (days) {
	if (isInt(days) && days > 0) {
		return 3600 * 24 * days;
	}
	return 0;
};

proto.checkLoginHash = function () {
	var login, hash, data, config, result;

	login = Engine.Cookies.Cookie.get("login");
	hash = Engine.Cookies.Cookie.get("hash");
	if (!isEmpty(login) && !isEmpty(hash)) {
		data = {
			login: login,
			hash : hash
		};
		config = {
			Url            : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Access", "checkLoginHash"),
			Data           : data,
			Context        : this,
			SuccessFunction: this.createPanel
		};
		Engine.Connector.sendRequest(config);
		result = true;
	}
	else{
		result = false;
		this.createLoginPanel();
	}

	return result;
};

proto.createPanel = function (data) {
	data = $.secureEvalJSON(data);
	if (data['auth'] === true) {
		this.Login.set(data['login']);
		this.Hash.set(data['hash']);
		Engine.Cookies.Cookie.add("hash", data['hash'], this.getDaysInSeconds(10));
		this.createInfoPanel();
	}
	else {
		Engine.Cookies.Cookie.remove("hash");
		Engine.Cookies.Cookie.remove("login");
		this.Login.set(null);
		this.Hash.set(null);
		this.createLoginPanel();
	}
};

proto.createLoginPanel = function () {
	var mainNode = this.MainNode.get();
	if (!isEmpty(mainNode)) {
		mainNode.removeSelf();
	}
	var panel = new Panel({
		ParentNode: this.ParentNode.get(),
		Class     : ["AdminPanel"]
	});
	var loginInput = new Input_string({
		NameSpace: "login",
		TextLabel: formatString("{0} ", Engine.getServerLocalizations("loginInput"))
	});
	var passInput = new Input_password({
		NameSpace: "password",
		TextLabel: formatString("{0} ", Engine.getServerLocalizations("passwordInput"))
	});
	var form = new Form({
		Parent       : panel,
		Url          : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Access", "authorization"),
		InputElements: [loginInput, passInput],
		Items        : [loginInput, passInput],
		Callback     : this.onAuth,
		Context      : this
	});
	var button = new Button({
		Text  : Engine.getServerLocalizations("buttonLogin"),
		Parent: form
	});
	button.Actions.add("click", form.submit, form);
	this.MainNode.set(panel);
};

proto.createInfoPanel = function () {
	var mainNode = this.MainNode.get();
	if (!isEmpty(mainNode)) {
		mainNode.removeSelf();
	}
	var panel = new Panel({
		ParentNode: this.ParentNode.get(),
		Class     : ['AdminPanel']
	});

	var buttonLogout = new Button({
		Text  : "Выйти",
		Parent: panel
	});
	buttonLogout.Actions.add("click", function (context) {
		var data = {
			login: context.Login.get(),
			hash : context.Hash.get()
		};
		var config = {
			Url            : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Access", "logout"),
			Data           : data,
			Context        : context,
			SuccessFunction: context.onLogout
		};
		Engine.Connector.sendRequest(config);
	}, this);
	this.MainNode.set(panel);
};

proto.onAuth = function (data) {
	data = $.secureEvalJSON(data);
	this.Login.set(data.login);
	this.Hash.set(data.hash);
	Engine.Cookies.Cookie.add("login", this.Login.get(), this.getDaysInSeconds(10));
	Engine.Cookies.Cookie.add("hash", this.Hash.get(), this.getDaysInSeconds(10));

	this.createInfoPanel();
};

proto.onLogout = function () {
	var mainNode = this.MainNode.get();
	if (!isEmpty(mainNode)) {
		mainNode.removeSelf();
	}
	this.createLoginPanel();
};