function Datalist (settings) {
	this.Data = this.addProp("Data", Enums.Types.Array, []);
	this.Pattern = this.addProp("Pattern", Enums.Types.String);

	this.Name = this.addProp("Name", Enums.Types.String, "Datalist");
	Datalist.Parent.apply(this, arguments);
}

Extend(Datalist, DomObject);

var proto = Datalist.prototype;

proto.init = function () {
	Datalist.Parent.prototype.init.apply(this);
	this.Pattern.init();
};

proto.initOverloadedGettersSetters = function () {
	Datalist.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.Pattern.set = this.Pattern.extend("set", this.setPattern, this);
	this.Pattern.init = this.Pattern.extend("init", this.initPattern, this);
};

proto.setData = function () {
	this.Pattern.init();
};

proto.setPattern = function () {
	this.Pattern.init();
};

proto.initPattern = function () {
	var data, pattern, i, element;

	data = this.Data.get();
	pattern = this.Pattern.get();
	this.Childs.removeAll();
	if (data.length > 0 && !isEmpty(pattern)) {
		for (i in data) {
			if (data.hasOwnProperty(i)) {
				element = Engine.TemplateEngine.initTemplate(pattern);
				element.Data.set(data[i]);
				this.Childs.add(element);
			}
		}
	}
};
