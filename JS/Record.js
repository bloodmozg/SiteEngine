function Record (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Record");
	this.Idrecord = this.addProp("IdRecord", Enums.Types.Number);
	Record.Parent.apply(this, arguments);
	return this;
}

Extend(Record, DomObject);

var proto = Record.prototype;

proto.initPrivateProps = function () {
	Record.Parent.prototype.initPrivateProps.apply(this);
	this.IdRecord = this.addProp("IdRecord", Enums.Types.Number, "Record");
};

proto.initOverloadedGettersSetters = function () {
	Record.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.Data.set = this.Data.extend("set", this.setData, this);
};

proto.set = function (newData) {
	var values, func;

	if (!isEmpty(newData)) {
		if (isDeclared(newData.func)) {
			values = newData.values;
			func = newData.func;
			func.call(this, values);
			return true;
		}
	}
	this.Idrecord.set(getNumber(newData));
};
