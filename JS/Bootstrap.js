var Engine, settings;

settings = {};
onLoadDocument (function () {
	Engine = (function InitEngine (settings) {
		var serverSettings, templateEngineSettings, connectorSettings, hashEngineSettings, linkEngineSettings, cookiesSettings, _Engine;

		serverSettings = $.parseJSON (serverData);
		templateEngineSettings = settings.TemplateEngine;
		connectorSettings = settings.Connector;
		hashEngineSettings = settings.HashEngine;
		linkEngineSettings = settings.LinkEngine;
		cookiesSettings = settings.Cookies;

		_Engine = new SEngine ({
			ServerSettings : serverSettings,
			EngineName     : serverSettings.EngineName,
			Modules        : {
				TemplateEngine : templateEngineSettings,
				Connector      : connectorSettings,
				HashEngine     : hashEngineSettings,
				LinkEngine     : linkEngineSettings,
				Cookies        : cookiesSettings
			}
		});

		return _Engine;
	} (settings));
	Engine.Init();
	Engine.LinkEngine.initLinks ();
});