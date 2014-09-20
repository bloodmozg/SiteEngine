function Domelement (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Domelement");
	Domelement.Parent.apply(this, arguments);
	return this;
}

Extend(Domelement, DomObject);

var proto = Domelement.prototype;

proto.initPrivateProps = function () {
	Domelement.Parent.prototype.initPrivateProps.apply(this);
	this.LeftNode = this.addProp("LeftNode", Enums.Types.Node);
};

proto.init = function () {
	Domelement.Parent.prototype.init.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	Domelement.Parent.prototype.initOverloadedGettersSetters.apply(this);
};