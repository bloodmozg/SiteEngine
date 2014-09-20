function Connector (settings) {
	this.Name = this.addProp("Name", Enums.Types.String, "Connector");
	Connector.Parent.apply(this, arguments);
	return this;
}

Extend(Connector, CS);

var proto = Connector.prototype;

proto.sendRequest = function (settings) {
	var url, data, fileData, request, jsonData;

	url = settings.Url;
	data = settings.Data;
	fileData = settings.FileData;

	if (isEmpty(url) || !isString(url)) {
		throw new ReferenceError(formatString("Connector error: URL ({0}) is incorrect", url));
	}
	if (isEmpty(data)) {
		data = null;
	}
	if (isEmpty(fileData)) {
		fileData = null;
	}

	request = this.createRequest(settings);

	request.open("POST", url, true);
	jsonData = $.toJSON(data);
	//var stringDataRequest = this.getRequestDataString (data);
	if (!isEmpty(fileData)) {
		fileData.append("data", jsonData);
		request.send(fileData);
	}
	else {
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.send(formatString("data={0}", jsonData));
	}

};

proto.createRequest = function (settings) {
	var context, before, success, error, complete, XmlHttp;

	context = settings.Context;
	before = settings.BeforeFunction;
	success = settings.SuccessFunction;
	error = settings.ErrorFunction;
	complete = settings.CompleteFunction;

	if (isEmpty(context)) {
		context = this;
	}

	XmlHttp = this.getXmlHttp();

	if (!isEmpty(before)) {
		setTimeout(function () {
			before.call(context);
		}, 1);
	}
	XmlHttp.onreadystatechange = function () {
		if (XmlHttp.readyState === 4) {
			if (XmlHttp.status === 200) {
				var response = XmlHttp.responseText;
				if (!isEmpty(success)) {
					setTimeout(function () {
						success.call(context, response);
					}, 1);
				}
			}
			else {
				if (!isEmpty(error)) {
					error.call(context, XmlHttp.status, XmlHttp.statusText);
				}
			}
			if (!isEmpty(complete)) {
				complete.call(context);
			}
		}
	};
	return XmlHttp;
};

proto.getXmlHttp = function () {
	var XmlHttp;

	try {
		XmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
	}
	catch (e) {
		try {
			XmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		catch (E) {
			XmlHttp = false;
		}
	}
	if (!isEmpty(XmlHttp)) {
		XmlHttp = new XMLHttpRequest();
	}
	return XmlHttp;
};

proto.getUrl = function (url, module, action) {
	var _url;

	_url = null;
	if (isString(url)) {
		_url = url;
		if (isString(module) && isString(action)) {
			_url = formatString("{0}?module={1}&action={2}", url, module, action);
		}
	}
	else {
		throw new ReferenceError(formatString("Connector error: URL ({0}) is incorrect", url));
	}
	return _url;
};

proto.getRequestDataString = function (data, string) {
	var resultString, name, value;

	resultString = "";
	if (!isEmptyObject(data)) {
		for (name in data) {
			if (data.hasOwnProperty(name)) {
				value = data[name];
				if (!isEmptyString(resultString)) {
					resultString += "&";
				}
				if (isEmpty(value)) {
					value = "null";
				}
				if (isEmptyString(string)) {
					if (isEmptyObject(value)) {
						resultString += formatString("{0}={1}", name, value.toString());
					}
					else {
						resultString += this.getRequestDataString(value, formatString("{0}", name));
					}
				}
				else {
					if (isEmptyObject(value)) {
						if (value === null) {
							value = "null";
						}
						resultString += formatString("{0}[{1}]={2}", string, name, value.toString());
					}
					else {
						resultString += this.getRequestDataString(value, formatString("{0}[{1}]", string, name));
					}
				}
			}
		}
	}
	return resultString;
};