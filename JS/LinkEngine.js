function LinkEngine (settings) {
	this.ViewFolder = this.addProp ("ViewFolder", Enums.Types.String, Engine.getServerSettings ("ViewFolder"));
	this.DefaultView = this.addProp ("DefaultView", Enums.Types.String, Engine.getServerSettings ("DefaultView"));
	this.DefaultAction = this.addProp ("DefaultAction", Enums.Types.String, Engine.getServerSettings ("DefaultAction"));
	this.ContentContainer = this.addProp ("ContentContainer", Enums.Types.Node);
	this.MiddleContainer = this.addProp ("MiddleContainer", Enums.Types.Node);
	this.EnableAjaxLocating = this.addProp ("EnableAjaxLocating", Enums.Types.Boolean, true);

	this.Name = this.addProp ("Name", Enums.Types.String, "LinkEngine");
	LinkEngine.Parent.apply (this, arguments);

	this.init ();
	return this;
}

Extend (LinkEngine, SEngine);

var proto = LinkEngine.prototype;

proto.initPrivateProps = function () {
	LinkEngine.Parent.prototype.initPrivateProps.apply (this);
	this.ActiveView = this.addProp ("ActiveView", Enums.Types.String, this.DefaultView.get ());
	this.ActiveAction = this.addProp ("ActiveAction", Enums.Types.String, this.DefaultAction.get ());
	this.Params = this.addProp ("Params", Enums.Types.Object);
	this.LoaderBox = this.addProp ("LoaderBox", Panel);
};

proto.init = function () {
	var parsedHash;

	parsedHash = this.parseHash (Engine.HashEngine.Hash.get ());
	this.ActiveAction.set (parsedHash.action);
	this.ActiveView.set (parsedHash.view);
	this.Params.set (parsedHash.params);
};

proto.locateLink = function (eventData) {
	var result;

	result = true;
	if (eventData.which == 1) {
		Engine.LinkEngine.locate (this.pathname, this.search);
		result = false;
	}
	return result;
};

proto.initLinks = function () {
	var links, link, i;

	if (this.EnableAjaxLocating.get () == true) {
		links = document.getElementsByTagName ("a");
		for (i = 0; i < links.length; i++) {
			link = links[i];
			Event.remove (link, "click", this.locateLink);
			Event.add (link, "click", this.locateLink);
		}
	}
};

proto.validateViewAction = function (func, view, action) {
	var valid, _view, _action, container;

	if (isFunc (func)) {
		valid = true;

		if (isString (view)) {
			_view = this.ActiveView.get ();
			if (!isEmptyString (_view)) {
				if (view !== _view) {
					valid = false;
				}
			}
			else {
				this.ActiveView.set (view);
			}
		}
		if (isString (action)) {
			_action = this.ActiveAction.get ();
			if (!isEmptyString (_action)) {
				if (action !== _action) {
					valid = false;
				}
			}
			else {
				this.ActiveAction.set (action);
			}
		}
		if (valid === true) {
			func ();
		}
		else {
			container = this.ContentContainer.get ();
			container.style.display = "none";
			this.loadPage (_view, _action, this.Params.get ());
		}
	}
};

proto.loadPage = function (view, action, params) {
	var _params, key, settings;

	if (isEmptyString (view)) {
		view = Engine.ServerSettings.get ("state")["View"];
	}
	this.ActiveView.set (view);

	if (isEmptyString (action)) {
		action = Engine.ServerSettings.get ("state")["Action"];
	}
	this.ActiveAction.set (action);

	_params = Engine.ServerSettings.get ("state")["Params"];
	if (isEmpty (params)) {
		params = {};
	}
	for (key in _params) {
		if (_params.hasOwnProperty (key)) {
			params[key] = _params[key];
		}
	}

	this.Params.set (params);

	settings = {
		Url             : Engine.Connector.getUrl (Engine.getServerSettings ("ServerPath"), "Links", "openPageWithJs"),
		Data            : {
			v : view,
			a : action,
			p : params
		},
		Context         : this,
		SuccessFunction : this.onLoadPage,
		BeforeFunction  : this.beforeLoadPage
	};
	Engine.Connector.sendRequest (settings);
};

proto.locate = function (path, params) {
	var view, action, subdomen, routes, key, param, value, i;

	if (!isEmptyString (path)) {
		view = this.DefaultView.get ();
		action = this.DefaultAction.get ();
		if (path.indexOf ("/") >= 0) {
			subdomen = Engine.getServerSettings ("Subdomen");
			routes = path.split ("/");
			key = 1;
			if (subdomen) {
				key++;
			}
			if (!isEmptyString (routes[key])) {
				view = routes[key];
			}

			if (!isEmptyString (routes[key + 1])) {
				action = routes[key + 1];
			}
		}
		else {
			view = path;
		}
		this.ActiveView.set (view);
		this.ActiveAction.set (action);
		Engine.HashEngine.clearHash ();
		Engine.HashEngine.Hash.set (view, "v");
		Engine.HashEngine.Hash.set (action, "a");
		var validParams = {};
		if (isString (params) && !isEmptyString (params)) {
			params = params.substr (1, params.length - 1);
			params = params.split ('&');
			for (i = 0; i < params.length; i++) {
				param = params[i].split ('=');
				key = param[0];
				value = param[1];
				Engine.HashEngine.Hash.set (value, key);
				validParams[key] = value;
			}
		}

		Engine.HashEngine.setHashString ();
		this.loadPage (view, action, validParams);
	}
};

proto.onLoadPage = function (content) {
	var loaderBox, container;

	loaderBox = this.LoaderBox.get ();
	if (!isEmpty (loaderBox)) {
		fadeOut (loaderBox.Node.get (), function () {
			loaderBox.removeSelf ();
			this.LoaderBox.set (null);
		}, this);
	}

	container = this.ContentContainer.get ();
	fadeOut (container, function () {
		var tmp, height, scriptElements, i;

		tmp = document.createElement ("div");
		tmp.innerHTML = content;
		height = container.clientHeight;
		container.style.height = height + "px";
		container.innerHTML = "";
		container.appendChild (tmp);
		scriptElements = tmp.getElementsByTagName ("script");
		for (i = 0; i < scriptElements.length; i++) {
			eval (scriptElements[i].text);
		}
		Engine.LinkEngine.initLinks ();
		container.style.display = "block";
		container.style.height = "";
		fadeIn (container);
	}, this);
};

proto.beforeLoadPage = function () {
	var loaderBox, middle, panel, imageDom, loadingBox;

	loaderBox = this.LoaderBox.get ();
	middle = this.MiddleContainer.get ();
	if (!isEmpty (loaderBox)) {
		loaderBox.removeSelf ();
	}
	imageDom = new Imagedom ({
		Mode : 1
	});
	panel = new Panel ({
		ParentNode : middle,
		Width      : middle.clientWidth,
		Height     : middle.clientHeight,
		Class      : ["loadingBox"],
		Items      : [imageDom]
	});

	this.LoaderBox.set (panel);
};

proto.parseHash = function (hashObject) {
	var view, action, params, key;

	view = null;
	action = null;
	params = {};
	if (!isEmpty (hashObject["v"])) {
		view = hashObject["v"];
	}
	if (!isEmpty (hashObject["a"])) {
		action = hashObject["a"];
	}
	for (key in hashObject) {
		if (hashObject.hasOwnProperty (key)) {
			if (key != "v" && key != "a") {
				params[key] = hashObject[key];
			}
		}
	}
	return {
		view   : view,
		action : action,
		params : params
	};
};