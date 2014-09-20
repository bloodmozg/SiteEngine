Enums.ImageMode = {
	Default: 0,
	Loader : 1
};

function Imagedom (settings) {
	this.Mode = this.addProp("Mode", Enums.Types.Number, Enums.ImageMode.Default);
	this.Src = this.addProp("Src", Enums.Types.String);
	this.OnLoadImageFunction = this.addProp("OnLoadImageFunction", Enums.Types.Function, function () {
	});
	this.Context = this.addProp("Context", DomObject);

	this.Data = this.addProp("Data", Enums.Types.String);

	this.Name = this.addProp("Name", Enums.Types.String, "Imagedom");
	Imagedom.Parent.apply(this, arguments);
	return this;
}

Extend(Imagedom, DomObject);

var proto = Imagedom.prototype;

proto.initPrivateProps = function () {
	this.LoaderNode = this.addProp("LoaderNode", Enums.Types.Node);
	this.ImageNode = this.addProp("ImageNode", Enums.Types.Node);

	this.LoaderClassName = this.addProp("LoaderClassName", Enums.Types.String, "loader");
	this.Selectable = this.addProp("Selectable", Enums.Types.Boolean, false);

	this.ImageFolder = this.addProp("ImageFolder", Enums.Types.String, Engine.getServerSettings("ImageFolder"));
	this.SystemFolder = this.addProp("SystemFolder", Enums.Types.String, Engine.getServerSettings("SystemFolder"));
	this.NoImagePath = this.addProp("NoImagePath", Enums.Types.String, formatString("{0}/{1}/{2}", this.ImageFolder.get(), this.SystemFolder.get(), Engine.getServerSettings("NoImage")));
};

proto.initOverloadedGettersSetters = function () {
	Imagedom.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.LoaderNode.set = this.LoaderNode.extend("set", this.setLoaderNode, this);
	this.ImageNode.set = this.ImageNode.extend("set", this.setImageNode, this);
	this.Src.set = this.Src.extend("set", this.setSrc, this);
};

proto.init = function () {
	Imagedom.Parent.prototype.init.apply(this);
	this.loadImage();
};

proto.createNode = function () {
	var mode, node;

	mode = this.Mode.get();

	node = document.createElement("div");
	this.Node.set(node);
	if (mode == Enums.ImageMode.Loader) {
		this.Class.add(this.LoaderClassName.get());
	}
};

proto.setLoaderNode = function (oldNode, newNode) {
	var node;

	if (!isEmpty(newNode)) {
		node = this.Node.get();
		if (!isEmpty(oldNode)) {
			node.removeChild(oldNode);
		}
		node.appendChild(newNode);
	}
};

proto.setImageNode = function (oldNode, newNode) {
	var node;

	if (!isEmpty(newNode)) {
		node = this.Node.get();
		if (!isEmpty(oldNode)) {
			node.removeChild(oldNode);
		}
		node.appendChild(newNode);
	}
};

proto.setSrc = function (oldSrc, newSrc) {
	if (!isEmptyString(newSrc)) {
		this.loadImage();
	}
};

proto.setData = function (oldData, newData) {
	this.Src.set(newData);
};

proto.loadImage = function () {
	var src, self, image;

	self = this;
	image = new Image();
	image.className = "AbsoluteCenter";
	image.onload = function () {
		self.onImageLoad(this);
	};
	image.onerror = function () {
		self.onImageError(this);
	};
	src = this.Src.get();
	if (!isEmptyString(src)) {
		this.createLoaderNode();
		image.src = src;
	}
	else {
		this.onImageError(image);
	}
};

proto.createLoaderNode = function () {
	var loader;

	loader = document.createElement("div");
	loader.className = this.LoaderClassName.get();
	loader.style.opacity = 1;
	this.LoaderNode.set(loader);

	return loader;
};

proto.removeLoader = function (callback) {
	var loader;

	loader = this.LoaderNode.get();
	if (!isEmpty(loader)) {
		fadeOut(loader, function () {
			loader.parentNode.removeChild(loader);
			this.LoaderNode.set(null);
			callback.call(this);
		}, this);
	}
};

proto.loadNoImage = function () {
	var img;

	img = new Image();
	img.src = this.NoImagePath.get();
};

proto.calculateNewSize = function (newSize) {
	var newWidth, newHeight, width, height, coefficient;

	newWidth = newSize.w;
	newHeight = newSize.h;
	width = this.Width.get();
	height = this.Height.get();

	if (!isEmpty(newWidth) || !isEmpty(newHeight)) {
		if (isEmpty(newHeight)) {
			coefficient = newWidth / width;
			newHeight = height * coefficient;
			newSize.h = newHeight;
		}
		else if (isEmpty(newWidth)) {
			coefficient = newHeight / height;
			newWidth = width * coefficient;
			newSize.w = newWidth;
		}
		else {
			if (width > height) {
				coefficient = height / width;
				newSize.h = newWidth * coefficient;
				if (newSize.h > newHeight) {
					coefficient = width / height;
					newSize.w = newHeight * coefficient;
					newSize.h = newHeight;
				}
			}
			else {
				coefficient = width / height;
				newSize.w = newHeight * coefficient;
				if (newSize.w > newWidth) {
					coefficient = height / width;
					newSize.h = newWidth * coefficient;
					newSize.w = newWidth;
				}
			}
		}
	}
	else {
		newSize = {
			w: width,
			h: height
		};
	}

	return newSize;
};

proto.setImageSize = function (width, height, animate, speed) {
	var newSize, image;

	newSize = this.calculateNewSize({w: width, h: height});
	image = this.ImageNode.get();
	if (!isEmpty(image)) {
		if (!isEmpty(animate) && animate === true) {
			changeSize(image, newSize.w, newSize.h, speed);
		}
		else {
			if (image.width > newSize.w || image.height > newSize.h) {
				image.width = newSize.w;
				image.height = newSize.h;
			}
		}
		this.Width.set(newSize.w);
		this.Height.set(newSize.h);
	}
};

proto.normalizeSize = function () {
	var image, width, height;

	image = this.ImageNode.get();
	if (!isEmpty(image)) {
		width = this.Width.get();
		height = this.Height.get();
		this.Width.set(image.width);
		this.Height.set(image.height);
		if (!isEmpty(width) || !isEmpty(height)) {
			this.setImageSize(width, height);
		}
		else {
			this.setImageSize(image.width, image.height);
		}
	}
};

proto.onImageLoadAfterLoader = function (image) {
	var func;

	this.ImageNode.set(image);
	this.normalizeSize();
	func = this.OnLoadImageFunction.get();
	func.call(this.Context.get());
};

proto.onImageLoad = function (image) {
	image.onload = null;
	image.onerror = null;
	this.removeLoader(function () {
		this.onImageLoadAfterLoader(image);
	});
};

proto.onImageError = function (image) {
	var self;

	self = this;
	this.Class.add("NoContent");
	image.onerror = null;
	image.onload = function () {
		self.onImageLoadAfterLoader(image);
	};
	this.removeLoader(function () {
		image.src = this.NoImagePath.get();
		this.ImageNode.set(image);
	});
};
