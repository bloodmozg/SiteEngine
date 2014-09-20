function Dataloader (settings) {
	this.Modes = this.addProp ("Modes", Enums.Types.Object);
	this.Mode = this.addProp ("Mode", Enums.Types.String, "default");
	this.Name = this.addProp ("Name", Enums.Types.String, "Dataloader");
	Dataloader.Parent.apply (this, arguments);
	return this;
}

Extend (Dataloader, DomObject);

var proto = Dataloader.prototype;

proto.init = function () {
	Dataloader.Parent.prototype.init.apply (this);
};

proto.initPrivateProps = function () {
	Dataloader.Parent.prototype.initPrivateProps.apply (this);
	this.LoaderBox = this.addProp ("LoaderBox", Panel);
};

proto.initOverloadedGettersSetters = function () {
	Dataloader.Parent.prototype.initOverloadedGettersSetters.apply (this);
	this.Modes.load = this.Modes.extend ("load", this.loadMode, this);
};


proto.getCountPages = function (count, countOnPage) {
	var countPages;

	countPages = 0;
	if (!isEmpty (count) && isInt (count) && !isEmpty (countOnPage) && isInt (countOnPage)) {
		countPages = Math.ceil (count / countOnPage);
	}

	return countPages;
};


proto.loadMode = function () {
	var mode, settings;

	mode = this.Mode.get ();
	if (!isEmpty (mode)) {
		settings = this.Modes.get (mode);
		if (!isEmpty (settings)) {
			this.loadData ();
			this.loadPattern ();
		}
	}
};

proto.loadPattern = function () {
	var settings, init, gPattern, ePattern, node, gBlock, pBlock, searchParams;

	settings = this.Modes.get (this.Mode.get ());
	init = settings.Initialized.get ("page");
	gPattern = settings.Pattern.get ("global");
	ePattern = settings.Pattern.get ("element");
	node = Engine.TemplateEngine.initTemplate (gPattern.innerHTML);

	if (isEmpty (ePattern)) {
		gBlock = node;
	}
	else {
		searchParams = {
			Target : settings.Targets.get ("global"),
			Name   : "Datalist"
		};
		gBlock = node.Childs.find (searchParams, true)[0];
		if (!isEmpty (gBlock)) {
			gBlock.Pattern.set (ePattern.innerHTML);
		}
	}

	if (init) {
		settings.Blocks.set (gBlock, "temp");
	}
	else {
		if (settings.PageEnable.get ()) {
			searchParams = {
				Target : settings.Targets.get ("page"),
				Name   : "Pages"
			};
			pBlock = node.Childs.find (searchParams, true)[0];
			if (!isEmptyObject (pBlock)) {
				pBlock.Context.set (this);
			}

			settings.Blocks.set (pBlock, "page");
		}
		settings.Blocks.set (gBlock, "global");
		this.Childs.add (node);
	}
};

proto.loadData = function () {
	var settings, init;

	settings = this.Modes.get (this.Mode.get ());
	init = settings.Initialized.get ("page");
	if (!init && settings.PageEnable.get ()) {
		this.loadDataPages ();
	}
	this.loadDataMode ();
};

proto.loadDataPages = function () {
	var settings, config;

	settings = this.Modes.get (this.Mode.get ());

	config = {
		Url             : settings.Url.get ("page"),
		Data            : settings.Data.get ("page"),
		Context         : this,
		SuccessFunction : this.initPages
	};
	Engine.Connector.sendRequest (config);
};

proto.loadDataMode = function () {
	var settings, cacheData, config, self, event;

	settings = this.Modes.get (this.Mode.get ());
	cacheData = settings.Cache.get (settings.Key.get ());

	if (isEmpty (cacheData)) {
		config = {
			Url             : settings.Url.get ("global"),
			Data            : settings.Data.get ("global"),
			Context         : this,
			BeforeFunction  : this.beforeLoad,
			SuccessFunction : this.initData
		};
		Engine.Connector.sendRequest (config);
	}
	else {
		self = this;
		event = this.initData;
		setTimeout (function () {
			event.call (self, cacheData);
		}, 1);
	}
};

proto.initPages = function (count) {
	var settings, countPages, block, init;

	settings = this.Modes.get (this.Mode.get ());

	count *= 1;
	countPages = this.getCountPages (count, settings.CountOnPage.get ());
	block = settings.Blocks.get ("page");

	block.CountPages.set (countPages);
	block.CurrentPage.set (settings.CurrentPage.get ());
	init = settings.Initialized.get ("page");
	if (!init) {
		block.ReactionOnChangePage.set (settings.Events.get ("page"));
		settings.Initialized.set (true, "page");
	}

	return settings;
};

proto.initData = function (data) {
	var settings, pattern, dataSettings, i, d, func, sett, tempBlock, block, init, loaderBox, slideFunc, onLoadDataFunc;

	settings = this.Modes.get (this.Mode.get ());
	settings.Cache.set (data, settings.Key.get ());

	data = JSON.parse (data);

	pattern = settings.Pattern.get ("element");
	block = settings.Blocks.get ("global");
	func = settings.Functions.get ("ConfigData");
	if (!isEmpty (pattern)) {
		tempBlock = settings.Blocks.get ("temp");
		dataSettings = [];

		for (i = 0; i < data.length; i++) {
			d = data[i];
			sett = func.call (this, d);
			dataSettings.push (sett);
		}
		if (!isEmpty (tempBlock)) {
			tempBlock.Data.set (dataSettings);
		}
		else {
			block.Data.set (dataSettings);
		}
	}
	else {
		sett = func.call (this, data);
		block.Data.set (sett);
	}

	init = settings.Initialized.get ("global");
	loaderBox = this.LoaderBox.get ();
	if (!isEmpty (loaderBox)) {
		fadeOut (loaderBox.Node.get (), function () {
			loaderBox.removeSelf ();
			this.LoaderBox.set (null);
		}, this);
		if (isEmpty (tempBlock)) {
			fadeIn (this.Childs.get (0).Node.get ());
		}
	}
	if (init && !isEmpty (tempBlock)) {
		slideFunc = settings.Functions.get ("SlideBlock");
		slideFunc.call (this, block, tempBlock, settings);
		settings.Blocks.set (null, "temp");
	}
	else {
		onLoadDataFunc = settings.Functions.get ("OnLoadData");
		if (!isEmpty (onLoadDataFunc) && isFunc (onLoadDataFunc)) {
			onLoadDataFunc.call (this);
		}
	}

	settings.Initialized.set (true, "global");
};

proto.beforeLoad = function () {
	var settings, loaderBox, init, blockNode, panel, loadingBox;

	settings = this.Modes.get (this.Mode.get ());
	loaderBox = this.LoaderBox.get ();
	init = settings.Initialized.get ("global");
	blockNode = settings.Blocks.get ("global").ParentNode.get ();
	if (!isEmpty (loaderBox)) {
		loaderBox.removeSelf ();
	}
	if (init) {
		panel = new Panel ({
			ParentNode : blockNode,
			Width      : blockNode.clientWidth,
			Height     : blockNode.clientHeight,
			Class      : ["loadingBox"]
		});
		loadingBox = new Imagedom ({
			Mode   : 1,
			Parent : panel
		});
		this.LoaderBox.set (panel);
	}
};