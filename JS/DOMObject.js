function DomObject (settings) {
	this.Parent = this.addProp("Parent", DomObject);
	this.Access = this.addProp("Access", Enums.Types.Object, {});
	this.Width = this.addProp("Width", Enums.Types.Number);
	this.Height = this.addProp("Height", Enums.Types.Number);
	this.ParentNode = this.addProp("ParentNode", Enums.Types.Node);
	this.Node = this.addProp("Node", Enums.Types.Node);
	this.Items = this.addProp("Items", Enums.Types.Array, []);
	this.Childs = this.addProp("Childs", Enums.Types.Array, []);
	this.Class = this.addProp("Class", Enums.Types.Array, []);
	this.Actions = this.addProp("Actions", Enums.Types.Array, []);
	this.Visibility = this.addProp("Visibility", Enums.Types.Boolean, true);
	this.Clickable = this.addProp("Clickable", Enums.Types.Boolean, false);
	this.Selectable = this.addProp("Selectable", Enums.Types.Boolean, true);
	this.Name = this.addProp("Name", Enums.Types.String, "DomObject");
	this.Target = this.addProp("Target", Enums.Types.String);
	this.Data = this.addProp("Data", Enums.Types.Object);
	this.Label = this.addProp("Label", Enums.Types.String);
	DomObject.Parent.apply(this, arguments);
	this.init();
	return this;
}

Extend(DomObject, SEngine);

var proto = DomObject.prototype;

proto.initPrivateProps = function () {
	DomObject.Parent.prototype.initPrivateProps.apply(this);
};

proto.initOverloadedGettersSetters = function () {
	DomObject.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.Width.set = this.Width.extend("set", this.setWidth, this);
	this.Width.init = this.Width.extend("init", this.initWidth, this);
	this.Height.set = this.Height.extend("set", this.setHeight, this);
	this.Height.init = this.Height.extend("init", this.initHeight, this);
	this.ParentNode.set = this.ParentNode.extend("set", this.setParentNode, this);
	this.ParentNode.remove = this.ParentNode.extend("remove", this.removeParentNode, this);
	this.ParentNode.init = this.ParentNode.extend("init", this.initParentNode, this);
	this.Parent.set = this.Parent.extend("set", this.setParent, this);
	this.Parent.remove = this.Parent.extend("remove", this.removeParent, this);
	this.Parent.init = this.Parent.extend("init", this.initParent, this);
	this.Items.add = this.Items.extend("add", this.addItem, this);
	this.Items.remove = this.Items.extend("remove", this.removeItem, this);
	this.Items.find = this.Items.extend("find", this.findItem, this);
	this.Childs.get = this.Childs.extend("get", this.getChilds, this);
	this.Childs.add = this.Childs.extend("add", this.addChilds, this);
	this.Childs.remove = this.Childs.extend("remove", this.removeChilds, this);
	this.Childs.removeAll = this.Childs.extend("removeAll", this.removeAllChilds, this);
	/*
	 Find childs

	 */
	this.Childs.find = this.Childs.extend("find", this.findChilds, this);
	this.Childs.init = this.Childs.extend("init", this.initChilds, this);
	this.Class.getString = this.Class.extend("getString", this.getClassString, this);
	this.Class.find = this.Class.extend("find", this.findClass, this);
	this.Class.add = this.Class.extend("add", this.addClass, this);
	this.Class.remove = this.Class.extend("remove", this.removeClass, this);
	this.Class.init = this.Class.extend("init", this.initClass, this);
	this.Visibility.set = this.Visibility.extend("set", this.setVisibility, this);
	this.Visibility.init = this.Visibility.extend("init", this.initVisibility, this);
	this.Clickable.set = this.Clickable.extend("set", this.setClickable, this);
	this.Clickable.init = this.Clickable.extend("init", this.initClickable, this);
	this.Selectable.set = this.Selectable.extend("set", this.setSelectable, this);
	this.Selectable.init = this.Selectable.extend("init", this.initSelectable, this);
	this.Label.set = this.Label.extend("set", this.setLabel, this);
	this.Label.init = this.Label.extend("init", this.initLabel, this);
	this.Actions.add = this.Actions.extend("add", this.addAction, this);
	this.Actions.remove = this.Actions.extend("remove", this.removeAction, this);
	this.Actions.find = this.Actions.extend("find", this.findAction, this);
	this.Actions.enable = this.Actions.extend("enable", this.enableActions, this);
	this.Actions.disable = this.Actions.extend("disable", this.disableActions, this);
	this.Node.createNode = this.Node.extend("createNode", this.createNode, this);
	this.Data.set = this.Data.extend("set", this.setData, this);
};

proto.getNumberSize = function (val) {
	var _val, result;

	result = null;
	if (!isEmpty(val)) {
		_val = val;
		if (isInt(val)) {
			_val = formatString("{0}px", val);
		}
		if (val === "max") {
			_val = "100%";
		}
		if (val === "auto") {
			_val = "auto";
		}
		result = _val;
	}
	return result;
};

proto.setWidth = function (oldValue, newValue) {
	var value, node;

	if (!isEmpty(newValue)) {
		value = this.getNumberSize(newValue);
		node = this.Node.get();
		if (!isEmpty(node)) {
			node.style.width = value;
		}
	}
};
proto.initWidth = function () {
	this.Width.set(this.Width.get());
};

proto.setHeight = function (oldValue, newValue) {
	var value, node;

	if (!isEmpty(newValue)) {
		value = this.getNumberSize(newValue);
		node = this.Node.get();
		if (!isEmpty(node)) {
			node.style.height = value;
		}
	}
};
proto.initHeight = function () {
	this.Height.set(this.Height.get());
};

proto.setSize = function (w, h) {
	if (isEmpty(h)) {
		h = w;
	}
	if (isEmpty(w)) {
		w = h;
	}
	this.Width.set(w);
	this.Height.set(h);
};

proto.setParentNode = function (oldPN, newPN) {
	var childNode;

	childNode = this.Node.get();
	if (!isEmpty(childNode)) {
		if (!isEmpty(oldPN) && this.Inited.get() === true) {
			oldPN.removeChild(childNode);
		}
		if (!isEmpty(newPN)) {
			newPN.appendChild(childNode);
		}
	}
};
proto.removeParentNode = function () {
	this.ParentNode.set(null);
};
proto.initParentNode = function () {
	this.ParentNode.set(this.ParentNode.get());
};

proto.setParent = function (oldParent, newParent) {
	if (!isEmpty(oldParent)) {
		oldParent.Items.remove(this);
		this.ParentNode.remove();
	}
	if (!isEmpty(newParent)) {
		newParent.Items.add(this);
		this.ParentNode.set(newParent.Node.get());
	}
};
proto.removeParent = function () {
	this.Parent.set(null);
	this.ParentNode.set(null);
};
proto.initParent = function () {
	this.Parent.set(this.Parent.get());
};

proto.findItem = function (id) {
	var item, items, index, child, childId;

	item = null;
	items = this.Items.get();
	for (index in items) {
		if (items.hasOwnProperty(index)) {
			if (isEmpty(item)) {
				child = items[index];
				childId = child.Id.get();
				if (childId === id) {
					item = {
						item : child,
						index: index
					};
				}
			}
		}
	}
	return item;
};
proto.addItem = function (item) {
	var id, exist;

	if (item instanceof DomObject) {
		id = item.Id.get();
		exist = this.Items.find(id);
		if (!exist) {
			this.Items.push(item);
		}
	}
};
proto.removeItem = function (item) {
	var id;

	if (item instanceof DomObject) {
		id = item.Id.get();
		item = this.Items.find(id);
		if (item) {
			this.Items.splice(item.index, 1);
		}
	}

};

proto.getChilds = function (key) {
	var result;

	result = this.Items.get();
	if (!isEmpty(key)) {
		return this.Items.get(key);
	}
	return result;
};
proto.addChilds = function (childs) {
	var key, child;

	child = childs;
	if (isArray(childs)) {
		for (key in childs) {
			if (childs.hasOwnProperty(key)) {
				child = childs[key];
				child.Parent.set(this);
			}
		}
	}
	else {
		child.Parent.set(this);
	}
};
proto.removeChilds = function (childs) {
	var key, child;

	child = childs;
	if (isArray(childs)) {
		for (key = 0; key < childs.length; key++) {
			child = childs[key];
			child.Parent.remove();
			key--;
		}
	}
	else {
		if (is(child, DomObject)) {
			child.Parent.remove();
		}
	}
};
proto.removeAllChilds = function () {
	this.Childs.remove(this.Childs.get());
};
proto.findChilds = function (params, recursive) {
	var result, childs, i , goodChild, child, name, resultFromChild, j;

	result = [];
	childs = this.Childs.get();
	if (!isEmpty(params) && !isEmpty(childs)) {
		for (i = 0; i < childs.length; i++) {
			goodChild = true;
			child = childs[i];
			for (name in params) {
				if (params.hasOwnProperty(name)) {
					if (child[name].get() !== params[name]) {
						goodChild = false;
					}
				}
			}
			if (goodChild) {
				result.push(child);
			}
			if (isBool(recursive) && recursive === true) {
				resultFromChild = child.Childs.find(params, recursive);
				if (!isEmpty(resultFromChild)) {
					for (j in resultFromChild) {
						if (resultFromChild.hasOwnProperty(j)) {
							result.push(resultFromChild[j]);
						}
					}
				}
			}
		}
	}
	return result;
};
proto.initChilds = function () {
	var childs;

	childs = this.Childs.get();
	this.Childs.set([]);
	this.Childs.add(childs);
};

proto.getClassString = function () {
	var classes, string, i;
	classes = this.Class.get();
	string = "";
	for (i = 0; i < classes.length; i++) {
		string += classes[i];
		if (i !== classes.length - 1) {
			string += " ";
		}
	}
	return string;
};
proto.findClass = function (cls) {
	var index, classes, i;

	index = null;
	classes = this.Class.get();
	if (isString(cls)) {
		for (i = 0; i < classes.length; i++) {
			if (isEmpty(index)) {
				if (classes[i] === cls) {
					index = i;
				}
			}
		}
	}
	return index;
};
proto.addClass = function (str) {
	var classes, i, className, indexClass, node;

	if (isString(str)) {
		classes = str.split(" ");
		for (i = 0; i < classes.length; i++) {
			className = classes[i];
			indexClass = this.Class.find(className);
			if (isEmpty(indexClass)) {
				this.Class.push(className);
			}
		}
		node = this.Node.get();
		node.className = this.Class.getString();
	}
};
proto.removeClass = function (str) {
	var classes, className, indexClass, i, node;

	if (isString(str)) {
		classes = str.split(" ");
		for (i = 0; i < classes.length; i++) {
			className = classes[i];
			indexClass = this.Class.find(className);
			if (!isEmpty(indexClass)) {
				this.Class.splice(indexClass, 1);
			}
		}
		node = this.Node.get();
		node.className = this.Class.getString();
	}
};
proto.initClass = function () {
	var classes;

	classes = this.Class.getString();
	this.Class.set([]);
	this.Class.add(classes);
};

proto.setVisibility = function (oldValue, newValue) {
	if (oldValue !== newValue) {
		if (newValue === true) {
			this.show();
		}
		else {
			this.hide();
		}
	}
};
proto.initVisibility = function () {
	this.Visibility.set(this.Visibility.get());
};

proto.show = function () {
	this.Class.remove("CSHide");
};
proto.hide = function () {
	this.Class.add("CSHide");
};

proto.setClickable = function (oldValue, newValue) {
	if (newValue === true) {
		this.Class.add("Clickable");
		this.Actions.enable("click");
	}
	else {
		this.Class.remove("Clickable");
		this.Actions.disable("click");
	}
};
proto.initClickable = function () {
	this.Clickable.set(this.Clickable.get());
};

proto.setSelectable = function (oldValue, newValue) {
	if (newValue == true) {
		this.Class.remove("Unselectable");
	}
	else {
		this.Class.add("Unselectable");
	}
};
proto.initSelectable = function () {
	this.Selectable.set(this.Selectable.get());
};

proto.setLabel = function (oldValue, newValue) {
	var node;

	if (!isEmpty(newValue)) {
		node = this.Node.get();
		node.id = newValue;
	}
};
proto.initLabel = function () {
	this.Label.set(this.Label.get());
};

proto.addAction = function (event, func, contx) {
	var context, funcContext, action, node;

	context = this;
	funcContext = function () {
		func.call(context, contx);
	};
	action = {
		event  : event,
		func   : funcContext,
		context: this,
		id     : this.Id.generate()
	};
	this.Actions.push(action);
	node = this.Node.get();
	Event.add(node, event, funcContext);
	return action;
};
proto.removeAction = function (action) {
	var node, event, actions, i, _action;

	if (!isEmpty(action)) {
		node = this.Node.get();
		if (isString(action)) {
			event = action;
			actions = this.Actions.get();
			for (i = 0; i < actions.length; i++) {
				_action = actions[i];

				if (_action.event === event) {
					Event.remove(node, _action.event, _action.func);
					this.Actions.splice(i, 1);
					actions.splice(i, 1);
					i--;
				}
			}
		}
		else if (!isEmptyObject(action)) {
			actions = this.Actions.get();
			for (i = 0; i < actions.length; i++) {
				_action = actions[i];
				if (_action.id === action.id) {
					Event.remove(node, _action.event, _action.func);
					this.Actions.splice(i, 1);
					actions.splice(i, 1);
					i--;
				}
			}
		}
	}
};
proto.findAction = function (action) {
	var id, actions, i, _action, result;

	result = null;

	if (!isEmptyObject(action)) {
		id = action.id;
		actions = this.Actions.get();
		for (i = 0; i < actions.length; i++) {
			_action = actions[i];
			if (_action.id === id) {
				result = i;
				i = actions.length;
			}
		}
	}
	return result;
};
proto.disableActions = function (event) {
	var node, actions, i, _action;

	if (isString(event)) {
		node = this.Node.get();
		actions = this.Actions.get();
		for (i = 0; i < actions.length; i++) {
			_action = actions[i];
			if (_action.event === event) {
				Event.remove(node, _action.event, _action.func);
			}
		}
	}
};
proto.enableActions = function (event) {
	var node, actions, i, _action;

	if (isString(event)) {
		node = this.Node.get();
		actions = this.Actions.get();
		for (i = 0; i < actions.length; i++) {
			_action = actions[i];
			if (_action.event === event) {
				Event.add(node, _action.event, _action.func);
			}
		}
	}
};

proto.removeSelf = function () {
	this.Parent.remove();
	this.Childs.removeAll();
	this.Node.set(null);
};

proto.createNode = function () {
	this.Node.set(document.createElement("div"));
};

proto.setData = function (oldSettings, newSettings) {
	var values, func;

	if (!isEmpty(newSettings)) {
		if (isDeclared(newSettings.func)) {
			values = newSettings.values;
			func = newSettings.func;
			func.call(this, values);
		}
	}
};

proto.init = function () {
	var engineName, componentName;

	engineName = this.EngineName.get();
	componentName = formatString("{0}{1}", engineName, this.Name.get());

	this.Node.createNode();
	this.Parent.init();
	this.ParentNode.init();
	this.Childs.init();
	this.Class.init();
	this.Label.init();
	this.Width.init();
	this.Height.init();
	this.Clickable.init();
	this.Selectable.init();
	this.Visibility.init();

	this.Class.add(engineName.toString());
	this.Class.add(componentName.toString());
	this.Inited.set(true);
};