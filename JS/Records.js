Enums.RecordsMode = {
	Default: "default",
	Read   : "read"
};

function Records (settings) {
	this.BlockName = this.addProp("BlockName", Enums.Types.String, "Records");
	this.CountRecordsOnPage = this.addProp("CountRecordsOnPage", Enums.Types.Number, 10);
	this.CurrentPage = this.addProp("CurrentPage", Enums.Types.Number, 1);
	this.Patterns = this.addProp("Patterns", Enums.Types.Object, {
		Records   : null,
		Record    : null,
		RecordRead: null
	});
	this.TableName = this.addProp("TableName", Enums.Types.String);
	this.Mode = this.addProp("Mode", Enums.Types.String, Enums.RecordsMode.Default);
	this.CurrentId = this.addProp("CurrentId", Enums.Types.Number, -1);
	this.Sorting = this.addProp("Sorting", Enums.Types.String, "DESC");
	this.Name = this.addProp("Name", Enums.Types.String, "Records");
	Records.Parent.apply(this, arguments);
	return this;
}

Extend(Records, Dataloader);

var proto = Records.prototype;

proto.init = function () {
	Records.Parent.prototype.init.apply(this);
	this.initDefaultMode();
	this.initReadMode();
	this.Modes.load();
};

proto.initDefaultMode = function () {
	var self, countRecordsOnPage, settings;

	self = this;
	countRecordsOnPage = this.CountRecordsOnPage.get();
	settings = new Modesettings({
		Pattern    : {
			global : this.Patterns.get("Records"),
			element: this.Patterns.get("Record")
		},
		Targets    : {
			global: "RecordsListData",
			page  : "PagesListData"
		},
		Url        : {
			page  : Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Records", "getCountRecords"),
			global: Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Records", "getRecords")
		},
		Data       : {
			page  : {
				table: this.TableName.get()
			},
			global: {
				table      : this.TableName.get(),
				count      : countRecordsOnPage,
				sorting    : this.Sorting.get(),
				startRecord: (this.CurrentPage.get() - 1) * countRecordsOnPage
			}
		},
		PageEnable : true,
		Key        : this.CurrentPage.get().toString(),
		CurrentPage: this.CurrentPage.get(),
		CountOnPage: countRecordsOnPage
	});

	settings.Functions.set(this.slideBlocks, "SlideBlock");

	settings.Functions.set(function (dataRecord) {
		var self, settings;

		self = this;
		settings = {
			values: dataRecord,
			func  : function (data) {
				var name, value, findParams, elements, element, i, record, readButtons, readButton, id, settings;
				for (name in data) {
					if (data.hasOwnProperty(name)) {
						value = data[name];
						findParams = {
							Target: name
						};
						elements = this.Childs.find(findParams, true);
						if (!isEmpty(elements)) {
							for (i = 0; i < elements.length; i++) {
								element = elements[i];
								element.Data.set(value);
							}
						}
						if (this.Target.get() === name) {
							this.IdRecord.set(getNumber(value));
						}
					}
				}
				record = this;
				function onClickReadButton (context) {
					id = record.IdRecord.get();
					settings = context.Modes.get(Enums.RecordsMode.Read);
					settings.Data.set({
						table   : context.TableName.get(),
						idRecord: id
					}, "global");
					settings.Key.set(id.toString());
					context.Childs.removeAll();
					context.Mode.set(Enums.RecordsMode.Read);
					Engine.HashEngine.Hash.set("read", "m");
					Engine.HashEngine.Hash.set(id.toString(), "i");
					Engine.HashEngine.setHashString();
					context.Modes.load();
				}

				readButtons = this.Childs.find({Target: "read"}, true);

				for (i = 0; i < readButtons.length; i++) {
					readButton = readButtons[i];
					readButton.Actions.add("click", onClickReadButton, self);
				}
			}
		};
		return settings;
	}, "ConfigData");

	settings.Events.set(function (pageData) {
		settings.Data.set({
			table      : self.TableName.get(),
			count      : countRecordsOnPage,
			sorting    : self.Sorting.get(),
			startRecord: countRecordsOnPage * (pageData.CurrentPage - 1)
		}, "global");
		settings.Key.set(pageData.CurrentPage.toString());
		settings.CurrentPage.set(pageData.CurrentPage);
		settings.PreviousPage.set(pageData.PreviousPage);
		self.Modes.load();
	}, "page");

	this.Modes.set(settings, Enums.RecordsMode.Default);
};

proto.initReadMode = function () {
	var settings;

	settings = new Modesettings({
		Pattern   : {
			global: this.Patterns.get("RecordRead")
		},
		PageEnable: false,
		Url       : {
			global: Engine.Connector.getUrl(Engine.getServerSettings("ServerPath"), "Records", "getRecord")
		},
		Data      : {
			global: {
				table   : this.TableName.get(),
				idRecord: this.CurrentId.get()
			}
		}
	});
	settings.Functions.set(function (dataRecord) {
		var self, settings;

		self = this;
		settings = {
			values: dataRecord,
			func  : function (data) {
				var name, value, findParams, elements, i, element, backButtons, backButton, settings;

				for (name in data) {
					if (data.hasOwnProperty(name)) {
						value = data[name];
						findParams = {
							Target: name
						};
						elements = this.Childs.find(findParams, true);
						if (!isEmpty(elements)) {
							for (i = 0; i < elements.length; i++) {
								element = elements[i];
								element.Data.set(value);
							}
						}
						if (this.Target.get() === name) {
							this.Data.set(value);
						}
					}
				}

				function onClickBackButton (context) {
					settings = context.Modes.get(Enums.RecordsMode.Default);
					Engine.HashEngine.Hash.delete("m");
					Engine.HashEngine.Hash.delete("i");
					Engine.HashEngine.setHashString();
					settings.Initialized.set(false, "page");
					settings.Initialized.set(false, "global");
					context.Childs.removeAll();
					context.Mode.set(Enums.RecordsMode.Default);
					context.Modes.load();
				}

				backButtons = this.Childs.find({Target: "back"}, true);
				for (i = 0; i < backButtons.length; i++) {
					backButton = backButtons[i];
					backButton.Actions.add("click", onClickBackButton, self);
				}
			}
		};
		return settings;
	}, "ConfigData");
	this.Modes.set(settings, Enums.RecordsMode.Read);
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
	Engine.HashEngine.Hash.set(currentPage.toString(), "p");
	Engine.HashEngine.setHashString();
};
