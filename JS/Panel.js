function Panel (settings) {
	this.Name = this.addProp ("Name", Enums.Types.String, "Panel");
	Panel.Parent.apply (this, arguments);
	return this;
}

Extend (Panel, DomObject);

var proto = Panel.prototype;
