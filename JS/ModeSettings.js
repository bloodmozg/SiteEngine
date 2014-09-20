function Modesettings (settings) {
	this.Pattern = this.addProp ("Pattern", Enums.Types.Object, {
		global : null,
		element : null
	});
	this.Initialized = this.addProp ("Initialized", Enums.Types.Object, {
		page : false,
		global : false
	});
	this.Blocks = this.addProp ("Blocks", Enums.Types.Object, {
		global : null,
		page : null,
		temp : null
	});
	this.Targets = this.addProp ("Targets", Enums.Types.Object, {
		global : null,
		page : null
	});
	this.Events = this.addProp ("Events", Enums.Types.Object, {
		page : function () {},
		global : function () {}
	});
	this.Data = this.addProp ("Data", Enums.Types.Object, {
		page : null,
		global : null
	});
	this.Url = this.addProp ("Url", Enums.Types.Object, {
		page : null,
		global : null
	});
	this.Functions = this.addProp ("Functions", Enums.Types.Object, {
		SlideBlock : function () {},
		ConfigData : function () {},
		CustomData: function(){}
	});
	this.PageEnable = this.addProp ("PageEnable", Enums.Types.Boolean, true);
	this.Key = this.addProp ("Key", Enums.Types.String);
	this.Cache = this.addProp ("Cache", Enums.Types.Object, {});
	this.CountOnPage = this.addProp ("CountOnPage", Enums.Types.Number, 10);
	this.CurrentPage = this.addProp ("CurrentPage", Enums.Types.Number, 1);
	this.PreviousPage = this.addProp ("PreviousPage", Enums.Types.Number);
	this.Name = this.addProp ("Name", Enums.Types.String, "Modesettings");
	Modesettings.Parent.apply (this, arguments);
	return this;
}

Extend (Modesettings, SEngine);

var proto = Modesettings.prototype;

proto.init = function () {
	Modesettings.Parent.prototype.init.apply (this);
};

proto.initOverloadedGettersSetters = function () {
	Modesettings.Parent.prototype.initOverloadedGettersSetters.apply (this);
	this.Cache.add = this.Cache.extend ("add", this.addCache, this);
};