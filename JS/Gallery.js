Enums.GalleryTargets = {
	AlbumsBlock: "AlbumsDataList",
	PageBlock  : "PagesListData",
	PhotosBlock: "PhotosDataList",
	ReadButton : "ReadButton",
	BackButton : "BackButton"
};

Enums.GalleryInitNames = {
	Pages : "Pages",
	Albums: "Records"
};

Enums.GalleryModes = {
	Albums: "albums",
	Photos: "photos",
	Photo : "photo"
};

function Gallery (settings) {
	this.CountAlbumOnPage = this.addProp("CountAlbumOnPage", Enums.Types.Number, 10);
	this.CountPhotoOnPage = this.addProp("CountPhotoOnPage", Enums.Types.Number, 10);
	this.CountPhotoInCarousel = this.addProp("CountPhotoInCarousel", Enums.Types.Number, 7);
	this.CurrentAlbumPage = this.addProp("CurrentAlbumPage", Enums.Types.Number, 1);
	this.CurrentPhotoPage = this.addProp("CurrentPhotoPage", Enums.Types.Number);
	this.CurrentAlbumId = this.addProp("CurrentAlbumId", Enums.Types.Number);
	this.CurrentPhotoId = this.addProp("CurrentPhotoId", Enums.Types.Number);
	this.Patterns = this.addProp("Patterns", Enums.Types.Object, {
		Albums         : null,
		Album          : null,
		Photos         : null,
		Photo          : null,
		PhotosSlideShow: null,
		PhotoSlideShow : null
	});
	this.Mode = this.addProp("Mode", Enums.Types.String, Enums.GalleryModes.Albums);
	this.Name = this.addProp("Name", Enums.Types.String, "Gallery");
	Gallery.Parent.apply(this, arguments);
	return this;
}

Extend(Gallery, Dataloader);

var proto = Gallery.prototype;

proto.init = function () {
	Gallery.Parent.prototype.init.apply(this);
	this.initAlbumsMode();
	this.initPhotosMode();
	this.Modes.load();
};

proto.initPrivateProps = function () {
	Gallery.Parent.prototype.initPrivateProps.apply(this);
};

proto.initAlbumsMode = function () {
	var self, countOnPage, settings;

	self = this;
	countOnPage = this.CountAlbumOnPage.get();
	settings = new Modesettings({
		Pattern    : {
			global : this.Patterns.get("Albums"),
			element: this.Patterns.get("Album")
		},
		Targets    : {
			global: Enums.GalleryTargets.AlbumsBlock,
			page  : Enums.GalleryTargets.PageBlock
		},
		PageEnable : true,
		Url        : {
			page  : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Gallery", "getAlbumsCount"),
			global: Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Gallery", "getAlbums")
		},
		Data       : {
			global: {
				count      : countOnPage,
				startRecord: 0
			}
		},
		Key        : "1",
		CurrentPage: 1,
		CountOnPage: countOnPage
	});
	settings.Functions.set(this.slideBlocks, "SlideBlock");
	settings.Functions.set(function (albData) {
		var self, settings;

		self = this;
		settings = {
			values: albData,
			func  : function (data) {
				var album, fullpath, findParams, cover, name, value, elements, element, i;

				album = this;

				//Cover
				fullpath = formatString("{0}/{1}/{2}", Engine.getServerSettings("ImageFolder"), data["Path"], data["Cover"]);
				findParams = {
					Target: "Cover"
				};
				cover = album.Childs.find(findParams, true)[0];
				cover.Src.set(fullpath);
				cover.Context.set(cover);
				cover.OnLoadImageFunction.set(function () {
					var nameBlock, node, width, imageWidth, height, imageHeight;

					findParams = {
						Target: "Name"
					};
					nameBlock = album.Childs.find(findParams, true)[0];
					node = nameBlock.Node.get();
					width = this.Width.get();
					imageWidth = this.ImageWidth.get();
					height = this.Height.get();
					imageHeight = this.ImageHeight.get();
					nameBlock.Width.set(imageWidth);
					node.style.marginLeft = formatString("{0}px", (width - imageWidth) / 2);
					node.style.marginRight = formatString("{0}px", (width - imageWidth) / 2);
					node.style.marginBottom = formatString("{0}px", (height - imageHeight) / 2);
				});

				//Other params
				for (name in data) {
					if (data.hasOwnProperty(name)) {
						value = data[name];
						findParams = {
							Target: name
						};
						elements = album.Childs.find(findParams, true);
						if (!isEmpty(elements)) {
							for (i = 0; i < elements.length; i++) {
								element = elements[i];
								element.Data.set(value);
							}
						}
						if (album.Target.get() === name) {
							album.Data.set(value);
						}
					}
				}

				album.Data.set(data);

				album.Actions.add("click", self.onAlbumClick, self);
			}
		};
		return settings;
	}, "ConfigData");
	settings.Events.set(function (pageData) {
		settings.Data.set({
			count      : countOnPage,
			startRecord: countOnPage * (pageData.CurrentPage - 1)
		}, "global");
		settings.Key.set(pageData.CurrentPage.toString());
		settings.CurrentPage.set(pageData.CurrentPage);
		settings.PreviousPage.set(pageData.PreviousPage);
		self.Modes.load();
	}, "page");
	this.Modes.set(settings, Enums.GalleryModes.Albums);
};

proto.initPhotosMode = function () {
	var self, countOnPage, settings;

	self = this;
	countOnPage = this.CountPhotoOnPage.get();
	settings = new Modesettings({
		Pattern    : {
			global : this.Patterns.get("Photos"),
			element: this.Patterns.get("Photo")
		},
		Targets    : {
			global: Enums.GalleryTargets.PhotosBlock,
			page  : Enums.GalleryTargets.PageBlock
		},
		Url        : {
			page  : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Gallery", "getPhotosCount"),
			global: Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Gallery", "getPhotos")
		},
		Data       : {
			page  : {
				albumId: -1
			},
			global: {
				count      : countOnPage,
				startRecord: 0,
				albumId    : -1
			}
		},
		PageEnable : true,
		Key        : "1",
		CurrentPage: 1,
		CountOnPage: countOnPage
	});
	settings.Functions.set(this.slideBlocks, "SlideBlock");
	settings.Functions.set(function (photoData) {
		var self, settings;

		self = this;
		settings = {
			values: photoData,
			func  : function (data) {
				var photo, settings, fullPath, findParams, cover, name, value, elements, element, i;

				photo = this;
				settings = self.Modes.get(Enums.GalleryModes.Photos);
				//Cover
				fullPath = formatString("{0}/{1}/{2}", Engine.getServerSettings("ImageFolder"), settings.albumPath, data["Path"]);
				findParams = {
					Target: "Cover"
				};
				cover = photo.Childs.find(findParams, true)[0];
				cover.Src.set(fullPath);

				//Other params
				for (name in data) {
					if (data.hasOwnProperty(name)) {
						value = data[name];
						findParams = {
							Target: name
						};
						elements = photo.Childs.find(findParams, true);
						if (!isEmpty(elements)) {
							for (i = 0; i < elements.length; i++) {
								element = elements[i];
								element.Data.set(value);
							}
						}
						if (photo.Target.get() === name) {
							photo.Data.set(value);
						}
					}
				}
			}
		};
		return settings;
	}, "ConfigData");
	settings.Events.set(function (pageData) {
		settings.Data.set({
			count      : countOnPage,
			startRecord: countOnPage * (pageData.CurrentPage - 1),
			albumId    : settings.Data.get("global").albumId
		}, "global");
		settings.Key.set(pageData.CurrentPage.toString());
		settings.CurrentPage.set(pageData.CurrentPage);
		settings.PreviousPage.set(pageData.PreviousPage);
		self.Modes.load();
	}, "page");
	this.Modes.set(settings, Enums.GalleryModes.Photos);
};

proto.slideBlocks = function (oldBlock, newBlock, settings) {
	var currentPage, previousPage, direction;

	currentPage = settings.CurrentPage.get();
	previousPage = settings.PreviousPage.get();
	direction = currentPage > previousPage
		? "left"
		: "right";
	slideBlocks(oldBlock, newBlock, direction, 200);
	settings.Blocks.set(newBlock, "global");
};

proto.onAlbumClick = function (self) {
	var album, settingsPhoto, id, path, searchParams, block, node;

	album = this;
	settingsPhoto = self.Modes.get("photos");
	id = album.Data.get("Id");
	path = album.Data.get("Path");
	settingsPhoto.Data.set({
		albumId: id
	}, "page");
	settingsPhoto.Data.set({
		count      : self.CountPhotoOnPage.get(),
		startRecord: 0,
		albumId    : id
	}, "global");
	settingsPhoto.albumPath = path;
	settingsPhoto.Key.set(formatString("{0}-{1}", id, 1));
	searchParams = {
		Name: "Panel"
	};
	block = self.Childs.find(searchParams)[0];
	node = block.Node.get();
	node.style.position = "absolute";
	fadeOut(node, function () {
		this.removeSelf();
	}, block);

	self.Mode.set(Enums.GalleryModes.Photos);
	self.Modes.load();
};

// </editor-fold>