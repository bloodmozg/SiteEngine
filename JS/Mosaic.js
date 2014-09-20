function Mosaic (settings) {
	this.Size = this.addProp("Size", Enums.Types.Number, 2);
	this.Album = this.addProp("Album", Enums.Types.String);
	this.Photos = this.addProp("Photos", Enums.Types.Array, []);
	this.CountPhotosSlide = this.addProp("CountPhotosSlide", Enums.Types.Number, 2);
	this.Name = this.addProp("Name", Enums.Types.String, "Mosaic");
	Mosaic.Parent.apply(this, arguments);
	return this;
}

Extend(Mosaic, DomObject);

var proto = Mosaic.prototype;

proto.init = function () {
	Mosaic.Parent.prototype.init.apply(this);
	this.Album.load();
	this.Blocks.init();
};

proto.initPrivateProps = function () {
	Mosaic.Parent.prototype.initPrivateProps.apply(this);
	this.Blocks = this.addProp("Blocks", Enums.Types.Array, []);
	this.Timers = this.addProp("Timers", Enums.Types.Array, []);
	this.GlobalSet = this.addProp("GlobalSet", Enums.Types.Array, []);
	this.LastChangedPhoto = this.addProp("LastChangedPhoto", Enums.Types.Number, -1);
	this.LastChangedBlock = this.addProp("LastChangedBlock", Enums.Types.Number);
	this.PhotoDoms = this.addProp("PhotoDoms", Enums.Types.Array, []);
};

proto.initOverloadedGettersSetters = function () {
	Mosaic.Parent.prototype.initOverloadedGettersSetters.apply(this);
	this.PhotoDoms.add = this.PhotoDoms.extend("add", this.addPhotoDom, this);
	this.Blocks.add = this.Blocks.extend("add", this.addBlock, this);
	this.Blocks.createBlockAndAdd = this.Blocks.extend("createBlockAndAdd", this.createBlock, this);
	this.Blocks.load = this.Blocks.extend("load", this.loadBlocks, this);
	this.Blocks.init = this.Blocks.extend("init", this.initBlocks, this);
	this.Album.load = this.Album.extend("load", this.loadAlbum, this);
	this.Album.init = this.Album.extend("init", this.initAlbum, this);
	this.GlobalSet.createGlobalSet = this.GlobalSet.extend("createGlobalSet", this.createGlobalSet, this);
	this.Timers.add = this.Timers.extend("add", this.addTimer, this);
};

proto.getCountBlocks = function () {
	var size;

	size = this.Size.get();
	return size * size;
};

proto.addPhotoDom = function (dom) {
	if (!isEmpty(dom) && is("Imagedom", dom)) {
		this.PhotoDoms.push(dom);
	}
};

proto.addBlock = function (block) {
	if (!isEmpty(block) && is("Panel", block)) {
		this.Blocks.push(block);
	}
};

proto.addTimer = function (timer) {
	if (!isEmpty(timer)) {
		this.Timers.push(timer);
	}
};

proto.loadAlbum = function () {
	var data, config;

	data = {
		album: this.Album.get()
	};
	config = {
		Url            : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Mosaic", "getPhotos"),
		Data           : data,
		Context        : this,
		SuccessFunction: this.Album.init
	};
	Engine.Connector.sendRequest(config);
};

proto.initAlbum = function (photos) {
	photos = JSON.parse(photos);
	this.Photos.set(photos);
	this.Blocks.load();
};

proto.initBlocks = function () {
	var count, i;

	count = this.getCountBlocks();
	for (i = 0; i < count; i++) {
		this.Blocks.createBlockAndAdd();
	}
};

proto.createBlock = function () {
	var size, block;

	size = this.Size.get();
	block = new Panel({
		Parent: this,
		Width : this.Width.get() / size,
		Height: this.Height.get() / size,
		Class : ["MosaicPanel"]
	});
	this.Blocks.add(block);

	return block;
};

proto.loadBlocks = function () {
	var globalSet, i, block, number, photo;

	globalSet = this.GlobalSet.createGlobalSet();
	for (i = 0; i < globalSet.length; i++) {
		block = this.Blocks.get(globalSet[i]);
		number = (this.LastChangedPhoto.get() + 1) % this.Photos.length;
		this.LastChangedPhoto.set(number);
		photo = this.PhotoDoms.get(number);
		if (isEmpty(photo)) {
			photo = new Imagedom({
				Src         : this.Photos.get(number).Path,
				Width       : block.Width.get(),
				Height      : block.Height.get(),
				OptimizeSize: false
			});
			this.PhotoDoms.add(photo);
		}
		block.Childs.add(photo);
	}
	this.startMosaicSliding();
};

proto.createGlobalSet = function () {
	var count, globalSet, rand, number, exist, j;

	count = this.Blocks.length;
	globalSet = [];
	while (globalSet.length != count) {
		rand = Math.ceil(Math.random() * 10);
		number = rand % count;
		exist = false;
		j = 0;
		while (j < globalSet.length && !exist) {
			if (globalSet[j] === number) {
				exist = true;
			}
			j++;
		}
		if (!exist) {
			globalSet.push(number);
		}
	}
	this.GlobalSet.set(globalSet);
	return globalSet;
};

proto.startMosaicSliding = function () {
	var self, countPhotoSliding, i, adding;

	this.stopMosaicSliding();
	self = this;
	countPhotoSliding = this.CountPhotosSlide.get();
	i = 0;
	adding = setInterval(function () {
		var timer;

		if (i < countPhotoSliding) {
			timer = setInterval(function () {
				self.slideMosaicPhoto();
			}, 3000);
			self.Timers.add(timer);
		}
		else {
			clearInterval(adding);
		}
		i++;
	}, 700);
};

proto.slideMosaicPhoto = function () {
	var lastBlock, nextBlock, i;

	lastBlock = this.LastChangedBlock.get();
	nextBlock = null;
	if (isEmpty(lastBlock) || lastBlock === this.GlobalSet.get(this.GlobalSet.length - 1)) {
		nextBlock = this.GlobalSet.get(0);
	}
	else {
		i = 0;
		while (isEmpty(nextBlock) && i < this.GlobalSet.length) {
			if (this.GlobalSet.get(i) === lastBlock) {
				nextBlock = this.GlobalSet.get(i + 1);
			}
			i++;
		}
	}
	this.changePhoto(nextBlock);
	this.LastChangedBlock.set(nextBlock);
};

proto.changePhoto = function (blockNumber) {
	var block, numberPhoto, photo;

	block = this.Blocks.get(blockNumber);
	numberPhoto = (this.LastChangedPhoto.get() + 1) % this.Photos.length;
	this.LastChangedPhoto.set(numberPhoto);
	photo = this.PhotoDoms.get(numberPhoto);
	if (isEmpty(photo)) {
		photo = new Imagedom({
			Src         : this.Photos.get(numberPhoto).Path,
			Width       : block.Width.get(),
			Height      : block.Height.get(),
			OptimizeSize: false
		});
		this.PhotoDoms.add(photo);
	}
	fadeOut(block.Node.get(), function () {
		block.Childs.removeAll();
		block.Childs.add(photo);
		fadeIn(block.Node.get());
	}, this);
};

proto.stopMosaicSliding = function () {
	var timers, i;

	timers = this.Timers.get();
	if (!isEmpty(timers)) {
		for (i = 0; i < timers.length; i++) {
			clearInterval(timers[i]);
		}
		this.Timers.set(null);
	}
};

