function Imageslider (settings) {
	this._Album = null;
	this._SlideTimeSeconds = 3;
	this._Photos = [];
	this.Name = this.addProp ("Name", Enums.Types.String, "Panel");
	Imageslider.Parent.apply (this, arguments);
	return this;
}


Extend (Imageslider, DomObject);


var proto = Imageslider.prototype;

proto.initPrivateProps = function () {
	this._Name = "Imageslider";
	this._CurrentPhoto = 0;
	this._CountPhotos = null;
	this._Interval = null;
};

proto.init = function () {
	Imageslider.Parent.prototype.init.apply (this);
	this.loadAlbum();
};

proto.getAlbum = function () {
	return this._Album;
};

proto.getCurrentPhoto = function(){
	return this._CurrentPhoto;
};
proto.setCurrentPhoto = function(number){
	if(isInt(number) && number >= 0 && number < this.getCountPhotos()){
		this._CurrentPhoto = number;
	}
};

proto.getCountPhotos = function () {
	return this._CountPhotos;
};
proto.setCountPhotos = function (countPhotos) {
	if (!isEmpty (countPhotos) && isInt (countPhotos)) {
		this._CountPhotos = countPhotos;
	}
};

proto.getPhotos = function(){
	return this._Photos;
};
proto.addPhoto = function(photoDom){
	if(!isEmptyObject(photoDom) && isDeclared(photoDom.getName()) && photoDom.getName() === "Image"){
		this._Photos.push(photoDom);
	}
};

proto.getSlideTimeSeconds = function(){
	return this._SlideTimeSeconds;
};

proto.getInterval = function(){
	return this._Interval;
};
proto.setInterval = function(interval){
	this._Interval = interval;
};

proto.loadAlbum = function () {
	var data = {
		album : this.getAlbum ()
	}
	var config = {
		Url             : Engine.Connector.getUrl (Engine.getServerSettings("ServerPath"), "Slider", "getPhotos"),
		Data            : data,
		Context         : this,
		SuccessFunction : this.initAlbum
	};
	Engine.Connector.sendRequest (config);
};

proto.initAlbum = function (photos) {
	photos = JSON.parse (photos);
	var countPhotos = photos.length;
	this.setCountPhotos (countPhotos);
	this.loadPhotos (photos);
	this.loadControls (countPhotos);
};

proto.loadPhotos = function (photos) {
	for (var i in photos) {
		var photo = photos[i];
		var photoDom = new Imagedom({
			Src: formatString("{0}/{1}", Engine.getServerSettings('ImageFolder'), photo.Path),
			Width: this.getWidth(),
			Height: this.getHeight()
		});
		this.addPhoto(photoDom);
	}
	var firstPhoto = this.getPhotos()[0];
	firstPhoto.setParent(this);
	firstPhoto.setContext(this);
	firstPhoto.setOnLoadImageFunction(this.startSlide);
};

proto.loadControls = function (countPhotos) {

};

proto.startSlide = function(){
	var time = this.getSlideTimeSeconds();
	var interval = this.getInterval();
	var self = this;
	if(!isEmpty(interval)){
		clearInterval(interval);
		this.setInterval(null);
	}

	this.setInterval(setInterval(function(){
		self.slidePhoto.call(self);
	}, time * 1000));

	//this.slidePhoto();
};
proto.stopSlide = function(){
	var interval = this.getInterval();
	if(!isEmpty(interval)){
		clearInterval(interval);
		this.setInterval(null);
	}
};

proto.slidePhoto = function(){
	var currentPhoto = this.getCurrentPhoto();
	this.setPhoto(currentPhoto + 1);
};

proto.setPhoto = function(number){
	if(isInt(number)){
		var count =this.getCountPhotos();
		if(number === -1){
			number = count - 1;
		}
		number %= count;
		var currentPhoto = this.getCurrentPhoto();
		var direction = number >= currentPhoto ? "left" : "right";
		if(number == count - 1 && currentPhoto == 0){
			direction = "right";
		}
		if(currentPhoto == count - 1 && number == 0){
			direction = "left";
		}
		this.setCurrentPhoto(number);
		slideBlocks(this.getPhotos()[currentPhoto], this.getPhotos()[number], direction, 500);
	}
};