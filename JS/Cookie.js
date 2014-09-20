function Cookies (settings) {
	this.Name = this.addProp ("Name", Enums.Types.String, "Cookie");
	this.Cookie = this.addProp("Cookie", Enums.Types.Object);
	Cookies.Parent.apply (this, arguments);
	this.init();
	return this;
}

Extend (Cookies, SEngine);

var proto = Cookies.prototype;

proto.initPrivateProps = function () {
	Cookies.Parent.prototype.initPrivateProps.apply (this);
};

proto.init = function () {
	this.getCookieFromBrowser();
};

proto.initOverloadedGettersSetters = function () {
	Cookies.Parent.prototype.initOverloadedGettersSetters.apply (this);
	this.Cookie.add = this.Cookie.extend ("add", this.addCookie, this);
	this.Cookie.remove = this.Cookie.extend("remove", this.removeCookie, this);
};

proto.addCookie = function(name, value, expires){
	var d;

	if(!isEmpty(expires)){
		if (is(Enums.Types.Number, expires)) {
			d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = d;
		}

		if (expires.toUTCString) {
			expires = expires.toUTCString();
		}
	}
	value = encodeURIComponent(value);
	document.cookie = formatString("{0}={1}; path=/; expires={2}", name, value, expires);
	this.Cookie.set(value, name);
};

proto.removeCookie = function(name){
	this.Cookie.add(name, "", -1);
	this.Cookie.set(null, name);
};

proto.getCookieFromBrowser = function(){
	var cookieString, cookie, cookieObj, cookie_one, key, value, i;

	cookieString = document.cookie;
	cookie = cookieString.split("; ");
	cookieObj = {};
	for(i = 0; i < cookie.length; i++){
		cookie_one = cookie[i].split("=");
		key = cookie_one[0];
		value = cookie_one[1];
		cookieObj[key] = value;
	}
	this.Cookie.set(cookieObj);
};

