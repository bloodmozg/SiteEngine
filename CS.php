<?php
header('Content-Type: text/html; charset=utf-8');

$rootPath = "../CS/";

$mysqlFile = stringFormat("{0}{1}", $rootPath, "safeMysql.php");
$localizationFile = stringFormat("{0}{1}", $rootPath, "Localization.php");
$settingsFile = stringFormat("{0}{1}", $rootPath, "Settings.php");

include $mysqlFile;


abstract class CS {
	private static $settings;
	private static $localizations;
	private static $enums;
	private static $language;
	public static $dataContext;
	public static $rootPath;
	public static $enginePath;

	public static function init () {
		self::initRootPath();
		self::loadFiles();
		self::initEnums();
		self::initDataContext();
		self::initModules();
		self::initLinks();
		self::$language = CS::getSetting("Language");
	}

	private static function initRootPath () {
		self::$enginePath = "../CS/";
		self::$rootPath = "";
	}

	public static function getFullPath ($file) {
		$path = stringFormat("{0}{1}", self::$rootPath, $file);
		return $path;
	}

	public static function getFullSystemPath($file){
		$path = stringFormat("{0}{1}", self::$enginePath, $file);
		return $path;
	}

	public static function includeFile ($file) {
		include self::getFullPath($file);
	}

	public static function includeSystemFile($file){
		include self::getFullSystemPath($file);
	}

	private static function initEnums () {
		$classes     = get_declared_classes();
		self::$enums = Array();
		foreach ($classes as $class) {
			$classArray = class_parents($class);
			if ($classArray["BasicEnum"] == "BasicEnum") {
				self::$enums[$class] = $class::getConstants();
			}
		}
	}

	private static function initDataContext () {
		if(self::getSetting("UseDataBase")) {
			self::$dataContext = new SafeMysql(array(
				'user'    => self::getSetting("BD_Login"),
				'pass'    => self::getSetting("BD_Password"),
				'db'      => self::getSetting("BD_Name"),
				'charset' => 'utf8'
			));
		}
	}

	public static function addSetting ($name, $value, $global = true) {
		$setting               = new setting($name, $value, $global);
		self::$settings[$name] = $setting;
	}

	public static function getSetting ($name) {
		if (self::$settings[$name]) {
			return self::$settings[$name]->getValue();
		}
		else {
			echoPre(self::$settings);
			trigger_error(stringFormat("Error: Setting {0} not found.", $name), E_USER_ERROR);
			return NULL;
		}
	}

	public static function getGlobalSettings () {
		$resultArray = Array();
		foreach (self::$settings as $setting) {
			if ($setting->getGlobal()) {
				$resultArray[$setting->getName()] = $setting->getValue();
			}
		}
		return $resultArray;
	}

	public static function addLocalization ($key, $value, $lang) {
		if (!empty($key) && !empty($value)) {
			self::$localizations[$lang][$key] = $value;
		}
	}

	public static function getLocalization ($key, $lang = "") {
		if (empty($lang)) {
			$lang = self::$language;
		}
		if (self::$localizations[$lang][$key]) {
			return self::$localizations[$lang][$key];
		}
		else if (self::$localizations[CS::getSetting("Language")][$key]) {
			return self::$localizations[CS::getSetting("Language")][$key];
		}
		else {
			return "&nbsp;";
		}
	}

	public static function getState () {
		$stateData = array(
			"View"   => Links::$view,
			"Action" => Links::$action,
			"Params" => Links::$params
		);

		return $stateData;
	}

	public static function getFullLocalization () {
		return self::$localizations[self::$language];
	}

	public static function getDataForJS () {
		$settings     = self::getGlobalSettings();
		$localization = self::getFullLocalization();
		$enums        = self::$enums;
		$data         = Array(
			"settings"     => $settings,
			"localization" => $localization,
			"enums"        => $enums,
			"state"        => self::getState()
		);
		return str_replace("\"", "\\\"", json_encode($data));
	}

	private static function initLinks () {
		$data   = json_decode(stripslashes($_POST["data"]));
		$action = $_GET["action"];

		switch ($_GET["module"]) {
			case "Menu":
				Menu::initData($data);
				Menu::$action();
				break;
			case "Records":
				Records::initData($data);
				Records::$action();
				break;
			case "Gallery":
				Gallery::initData($data);
				Gallery::$action();
				break;
			case "Access":
				Access::initData($data);
				Access::$action();
				break;
			case "Slider":
				Slider::initData($data);
				Slider::$action();
				break;
			case "Links":
				Links::initData($data);
				Links::$action();
				break;
			case "Mosaic":
				Mosaic::initData($data);
				Mosaic::$action();
				break;
			case "Images":
				Images::initData($data);
				Images::$action();
				break;
		}
	}

	private static function initModules () {
		Links::parseUrl();
		Menu::init();
		Links::setTitleActiveView();
	}

	public static function loadInclude () {
		self::includeSystemFile("Included.php");

		echo "<script type=\"text/javascript\">";
		echo "var serverData = '" . self::getDataForJS() . "';";
		echo "</script>";

		if (file_exists("Included.php")) {
			self::includeFile("Included.php");
		}
	}

	public static function loadFiles () {
		$files = Array(
			"Settings.php",
			"Localization.php"
		);
		foreach ($files as $file) {
			if (file_exists($file)) {
				self::includeFile($file);
			}
		}
	}
}

function stringFormat ($format) {
	$args   = func_get_args();
	$format = array_shift($args);

	preg_match_all('/(?=\{)\{(\d+)\}(?!\})/', $format, $matches, PREG_OFFSET_CAPTURE);
	$offset = 0;
	foreach ($matches[1] as $data) {
		$i      = $data[0];
		$format = substr_replace($format, @$args[$i], $offset + $data[1] - 1, 2 + strlen($i));
		$offset += strlen(@$args[$i]) - 2 - strlen($i);
	}

	return $format;
}

function echoPre ($data) {
	echo "<pre>";
	print_r($data);
	echo "</pre>";
}

class setting {
	private $_name;
	private $_value;
	private $_global;

	function __construct ($name, $value, $global = true) {
		$this->_name   = $name;
		$this->_value  = $value;
		$this->_global = $global;
	}

	public function getName () {
		return $this->_name;
	}

	public function getValue () {
		return $this->_value;
	}

	public function getGlobal () {
		return $this->_global;
	}
}

abstract class BasicEnum {
	private static $constCache = NULL;

	public static function getConstants () {
		$reflect          = new ReflectionClass(get_called_class());
		self::$constCache = $reflect->getConstants();

		return self::$constCache;
	}

	public static function isValidName ($name, $strict = false) {
		$constants = self::getConstants();

		if ($strict) {
			return array_key_exists($name, $constants);
		}

		$keys = array_map('strtolower', array_keys($constants));
		return in_array(strtolower($name), $keys);
	}

	public static function isValidValue ($value) {
		$values = array_values(self::getConstants());
		return in_array($value, $values, $strict = true);
	}
}

abstract class Errors
	extends BasicEnum {
	const user_exist                   = 0;
	const login_password_is_wrong      = 1;
	const empty_login                  = 2;
	const empty_password               = 3;
	const length_password_is_not_valid = 4;
}

abstract class Languages
	extends BasicEnum {
	const Russian = "ru";
	const English = "en";
}

class Records {
	private static $tableName;
	private static $count;
	private static $startRecord;
	private static $idRecord;
	private static $sorting;
	private static $files;
	private static $fields;

	public static function initData ($data) {
		self::$tableName   = $data->table;
		self::$count       = $data->count;
		self::$startRecord = $data->startRecord;
		self::$idRecord    = $data->idRecord;
		self::$sorting     = $data->sorting;
		self::$files       = $data->files;
		self::$fields      = $data->fields;
	}

	public static function getCountRecords () {
		$sql = 'SELECT COUNT(*)
                FROM ?n';
		echo CS::$dataContext->getOne($sql, self::$tableName);
	}

	public static function getRecords () {
		$dir = CS::$dataContext->whiteList(self::$sorting, array(
			'ASC',
			'DESC'
		), 'ASC');
		$sql = "SELECT *
                FROM ?n
                ORDER BY `id` $dir
                LIMIT ?i, ?i";

		$data = CS::$dataContext->getAll($sql, self::$tableName, self::$startRecord, self::$count);
		foreach ($data as $i => $record) {
			if ($record["photo"]) {
				$data[$i]["photo"] = stringFormat("{0}/{1}", CS::getSetting("ImageFolder"), $record["photo"]);
			}
			else {
				$data[$i]["photo"] = NULL;
			}
			if ($record["photo_min"]) {
				$data[$i]["photo_min"] = stringFormat("{0}/{1}", CS::getSetting("ImageFolder"), $record["photo_min"]);
			}
			else {
				$data[$i]["photo_min"] = NULL;
			}
		}
		echo json_encode($data);
	}

	public static function getRecord () {
		$sql = "SELECT *
                FROM ?n
                WHERE `id` = ?i";

		$data              = CS::$dataContext->getRow($sql, self::$tableName, self::$idRecord);
		$data['photo']     = stringFormat("{0}/{1}", CS::getSetting("ImageFolder"), $data["photo"]);
		$data['photo_min'] = stringFormat("{0}/{1}", CS::getSetting("ImageFolder"), $data["photo_min"]);
		echo json_encode($data);
	}

}

class Gallery {
	private static $count;
	private static $startRecord;
	private static $albumId;

	public static function initData ($data) {
		self::$count       = $data->count;
		self::$startRecord = $data->startRecord;
		self::$albumId     = $data->albumId;
	}

	public static function getAlbumsCount () {
		$sql = 'SELECT COUNT(*)
                FROM ?n';
		echo CS::$dataContext->getOne($sql, CS::getSetting("AlbumsTable"));
	}

	public static function getAlbums () {
		$sql = "SELECT *
                FROM ?n
                LIMIT ?i, ?i";

		$data = CS::$dataContext->getAll($sql, CS::getSetting("AlbumsTable"), self::$startRecord, self::$count);
		echo json_encode($data);
	}

	public static function getPhotos () {
		$sql = "SELECT *
                FROM ?n
                WHERE `albumId` = ?i
                LIMIT ?i, ?i";

		$data = CS::$dataContext->getAll($sql, CS::getSetting("PhotosTable"), self::$albumId, self::$startRecord, self::$count);
		echo json_encode($data);
	}

	public static function getPhotosCount () {
		$sql = 'SELECT COUNT(*)
                FROM ?n
                WHERE `albumId` = ?i';
		echo CS::$dataContext->getOne($sql, CS::getSetting("PhotosTable"), self::$albumId);
	}
}

class Menu {
	private static $xml;
	private static $result;
	private static $menu;
	private static $id;

	public static function initData ($data) {
		self::$id = $data->id;
	}

	private static function parseXML () {
		self::$menu = Array();
		foreach (self::$xml as $menu) {
			self::$menu[] = self::parseMenu($menu);
		}
	}

	private static function parseMenu ($menu, $parent = NULL) {
		$_menu["name"]        = (string)$menu["name"];
		$_menu["id"]          = (string)$menu["id"];
		$_menu["description"] = (string)str_replace("@/n", "<br/>", $menu["description"]);
		$_menu["tagName"]     = (string)$menu->getName();
		$_menu['imageSrc']    = stringFormat("{0}/{1}/{2}.jpg", CS::getSetting("ImageFolder"), CS::getSetting("MenuImagesFolder"), $_menu['id']);
		$_menu['clickable']   = true;
		if ($menu['clickable'] == "false") {
			$_menu['clickable'] = false;
		}
		$_menu["link"] = "";

		if ($_menu['tagName'] === "menuPoint") {
			$_menu["link"] = (string)$menu['id'];
		}
		else if ($_menu['tagName'] === "menu") {
			$_menu['link'] = stringFormat("Menu?id={0}", $menu['id']);
		}
		else if ($_menu['tagName'] === 'submenuPoint') {
			$_menu['link'] = stringFormat("{0}/{1}", $parent['link'], $menu['id']);
		}
		if ($menu->count() > 0) {
			foreach ($menu->children() as $child) {
				$_menu["childs"][] = self::parseMenu($child, $_menu);
			}
		}
		return $_menu;
	}

	private static function findPart ($menu, $id) {
		$result = NULL;
		$i      = 0;
		while ($menu[$i] && !$result) {
			if ($menu[$i]["id"] == $id) {
				$result = $menu[$i];
			}
			elseif ($menu[$i]["childs"]) {
				$result = self::findPart($menu[$i]["childs"], $id);
			}
			$i++;
		}
		return $result;
	}

	private static function findSection ($menu, $id, $parent = NULL) {
		$result = NULL;
		$i      = 0;
		while ($menu[$i] && !$result) {
			if ($menu[$i]["id"] == $id) {
				if ($parent) {
					$result = $parent;
				}
				elseif ($menu[$i]["childs"]) {
					$result = $menu[$i];
				}
			}
			elseif ($menu[$i]["childs"]) {
				$result = self::findSection($menu[$i]["childs"], $id, $menu[$i]);
			}

			$i++;
		}
		return $result;
	}

	public static function getPart () {
		print_r(json_encode(self::findPart(self::$menu, self::$id)));
	}

	public static function getSection () {
		print_r(json_encode(self::findSection(self::$menu, self::$id)));
	}

	public static function getMenuBlock () {
		$menu = self::findPart(self::$menu, self::$id);
		echo json_encode($menu["childs"]);
	}

	public static function createMenu () {
		$menus         = "";
		$buttonPattern = '
            <div class="CS buttonMenu leftNode CSButton" >
                <div class="rightNode">
                    <span class="textNode">{0}</span>
                </div>
            </div>
        ';

		foreach (self::$menu as $menu) {
			$_button = stringFormat($buttonPattern, $menu["name"]);
			if ($menu['clickable'] === true) {
				$_button = stringFormat("<a href=\"{0}\">{1}</a>", $menu["link"], $_button);
			}

			$_childs = "";
			if ((count($menu["childs"]) > 0)) {
				$_cButtons = "";
				foreach ($menu["childs"] as $child) {
					$_button1 = stringFormat($buttonPattern, $child["name"]);
					$_button1 = stringFormat('<a href="{0}">{1}</a>', $child["link"], $_button1);

					$_cButtons .= stringFormat('<li class="menuPanel {1}">{0}</li>', $_button1, $menu["id"]);
				}

				$_childs .= stringFormat('<ul class="subMenuPanel">{0}</ul>', $_cButtons);
			}
			$activeClass = "";
			if($menu['id'] == Links::$view){
				$activeClass = "Selected";
			}
			$menus .= stringFormat('<li class="menuPanel {2} {3}">{0}{1}</li>', $_button, $_childs, $menu["id"], $activeClass);
		}

		self::$result = stringFormat('
            <div class="menu Unselectable">
                <div class="navigation">
                    <div class="menu_div">
                        <ul class="menu_ul">{0}</ul>
                    </div>
                </div>
            </div>
        ', $menus);
	}

	public static function getMenu () {
		if (self::$result == NULL) {
			self::createMenu();
		}
		echo self::$result;
	}

	public static function getMenuForView($view){
		$result = "";
		foreach(self::$menu as $menu){
			if($menu['id'] == $view){
				return $menu['name'];
			}
		}
		return $result;
	}

	public static function init () {
		self::$xml = simplexml_load_file(CS::getFullPath(CS::getSetting("MenuFile")));
		self::parseXML();
	}
}

class Access {
	private static $login;
	private static $password;
	private static $hash;
	const localKey          = "CSEngine";
	const minPasswordLength = 8;
	const saltLength        = 8;

	public static function initData ($data) {
		self::$login    = $data->login;
		self::$password = $data->password;
		self::$hash     = $data->hash;
	}

	private static function sha512 ($str) {
		return hash('sha512', $str);
	}

	private static function getUserData ($login) {
		$sql = "SELECT u.login, u.password, u.key AS salt
                FROM users u
                WHERE u.login = ?s";

		return CS::$dataContext->getRow($sql, $login);
	}

	private static function generateKey () {
		$date = new DateTime();
		return substr(self::sha512(md5($date->getTimestamp())), 0, self::saltLength);
	}

	private static function checkLogin () {
		$validData = true;
		if (empty(self::$login)) {
			$validData = false;
			self::error(Errors::empty_login);
		}
		return $validData;
	}

	private static function checkPassword () {
		$validData = true;
		if (empty(self::$password)) {
			$validData = false;
			self::error(Errors::empty_password);
		}
		if (strlen(self::$password) < self::minPasswordLength) {
			$validData = false;
			self::error(Errors::length_password_is_not_valid);
		}
		return $validData;
	}

	private static function generateHash ($login, $password, $salt) {
		return self::sha512(self::localKey . $password . $salt . $login);
	}

	public static function registration () {
		if (self::checkLogin() && self::checkPassword()) {
			$user = self::getUserData(self::$login);
			if (empty($user)) {
				$login    = self::$login;
				$password = self::sha512(self::$password);
				$salt     = self::generateKey();

				$sql = "INSERT INTO users (`login`, `password`, `key`)
                    VALUES (?s, ?s, ?s)";

				CS::$dataContext->query($sql, $login, $password, $salt);
				$userData = array(
					"login" => $login,
					"hash"  => self::generateHash($login, $password, $salt)
				);
				echo json_encode($userData);
			}
			else {
				self::error(Errors::user_exist);
			}
		}
	}

	public static function authorization () {
		if (self::checkLogin() && self::checkPassword()) {
			$user = self::getUserData(self::$login);
			if (!empty($user)) {
				if ($user['password'] === self::sha512(self::$password)) {
					$key      = self::updateKey($user['login']);
					$userData = array(
						"login" => $user['login'],
						"hash"  => self::generateHash($user['login'], $user['password'], $key)
					);
					echo json_encode($userData);
				}
				else {
					echoPre($user);
					echoPre(self::sha512(self::$password));
					self::error(Errors::login_password_is_wrong);
				}
			}
			else {
				self::error(Errors::login_password_is_wrong);
			}
		}
	}

	public static function checkHash () {
		$validHash = false;
		if (self::checkLogin()) {
			$user = self::getUserData(self::$login);
			$hash = self::generateHash($user['login'], $user['password'], $user['salt']);
			if ($hash === self::$hash) {
				$validHash = true;
			}
		}
		return $validHash;
	}

	public static function checkLoginHash () {
		$result['auth'] = false;
		if (self::checkLogin() && self::checkHash()) {
			$user            = self::getUserData(self::$login);
			$newKey          = self::updateKey(self::$login);
			$result['auth']  = true;
			$result['login'] = self::$login;
			$result['hash']  = self::generateHash(self::$login, $user['password'], $newKey);
		}
		echo json_encode($result);
	}

	private static function updateKey ($login) {
		$data["key"] = self::generateKey();
		$sql         = "UPDATE users
                		SET ?u
                		WHERE login = ?s";

		CS::$dataContext->query($sql, $data, $login);
		return $data['key'];
	}

	public static function logout () {
		if (self::checkLogin() && self::checkHash()) {
			$data["key"] = NULL;
			$sql         = "UPDATE users
                SET ?u
                WHERE login = ?s";

			CS::$dataContext->query($sql, $data, self::$login);
		}
	}

	private static function error ($err) {
		if (Errors::isValidValue($err)) {
			$result = CS::getLocalization("error_" . $err);
		}
		else {
			$result = CS::getLocalization("error_default");
		}
		echo json_encode($result);
		exit();
	}
}

class Slider {
	private static $albumName;

	public static function initData ($data) {
		self::$albumName = $data["album"];
	}

	public static function getPhotos () {
		$sql = "SELECT T1.Id as Id, T1.Name as Name, T1.Description as Description, CONCAT(T2.Path, '/', T1.Path) As Path
                FROM ?n T1
                JOIN ?n T2 on T1.albumId = T2.Id
                WHERE T2.Name = ?s";

		$photos = CS::$dataContext->getAll($sql, CS::getSetting("PhotosTable"), CS::getSetting("AlbumsTable"), self::$albumName);

		echo json_encode($photos);
	}
}

class Mosaic {
	private static $albumName;

	public static function initData ($data) {
		self::$albumName = $data->album;
	}

	public static function getPhotos () {
		$sql = "SELECT T1.Id as Id, T1.Name as Name, T1.Description as Description, CONCAT(T2.Path, '/', T1.Path) As Path
                FROM ?n T1
                JOIN ?n T2 on T1.albumId = T2.Id
                WHERE T2.Name = ?s";

		$photos = CS::$dataContext->getAll($sql, CS::getSetting("PhotosTable"), CS::getSetting("AlbumsTable"), self::$albumName);
		foreach ($photos as $i => $photo) {
			$photos[$i]["Path"] = stringFormat("{0}/{1}", CS::getSetting("ImageFolder"), $photo["Path"]);
		}

		echo json_encode($photos);
	}
}

class Links {
	public static $view;
	public static $action;
	public static $params;
	private static $withJs;

	public static function initData ($data) {
		self::$view   = $data->v;
		self::$action = $data->a;
		self::$params = $data->p;
	}

	public static function parseUrl () {
		$url    = parse_url($_SERVER['REQUEST_URI']);
		$path   = $url['path'];
		$params = $url['query'];
		$routes = explode('/', $path);
		$key    = 1;
		if (CS::getSetting("Subdomen")) {
			$key++;
		}
		if (!empty($routes[$key])) {
			self::$view = $routes[$key];
		}
		else {
			self::$view = CS::getSetting("DefaultView");
		}

		if (!empty($routes[$key + 1])) {
			self::$action = $routes[$key + 1];
		}
		else {
			self::$action = CS::getSetting("DefaultAction");
		}

		$params  = explode('&', $params);
		$_params = array();
		foreach ($params as $param) {
			$param         = explode("=", $param);
			$key           = $param[0];
			$value         = $param[1];
			$_params[$key] = $value;
		}
		self::$params = (object)$_params;
	}

	public static function getFullPathPage () {
		return CS::getFullPath(stringFormat("{0}/{1}/{2}.php", CS::getSetting("ViewFolder"), self::$view, self::$action));
	}

	public static function openPage () {
		$filePath = self::getFullPathPage();
		if (file_exists($filePath)) {
			include $filePath;
		}
		else {
			self::getErrorPage();
		}
	}

	public static function openPageWithoutJs () {
		self::parseUrl();
		self::$withJs = false;
		self::openPage();
	}

	public static function openPageWithJs () {
		self::$withJs = true;
		self::openPage();
	}

	public static function getErrorPage () {
		$errorPath = CS::getFullPath(CS::getSetting("Error_view"));
		if (file_exists($errorPath)) {
			include $errorPath;
		}
		else {
			echo "Error 404. Page not found.";
		}
	}

	public static function getViewAction () {
		self::parseUrl();
		return array(
			"view"   => self::$view,
			"action" => self::$action
		);
	}

	public static function setTitleActiveView(){
		$title = CS::getLocalization("title");
		$viewName = Menu::getMenuForView(self::$view);
		if(!empty($viewName)){

		}
		$title = stringFormat("{0} - {1}", $viewName, $title);
		CS::addLocalization("title", $title, Languages::Russian);
	}
}

class Images {
	private static $files;
	private static $images;
	private static $imagesBase64;
	private static $width;
	private static $height;
	private static $percent;
	private static $crop;
	private static $save;
	private static $namespace;

	public static function initData ($data) {
		self::$namespace    = $data->fileNamespace;
		self::$files        = $_FILES[self::$namespace];
		self::$imagesBase64 = $data->images;
		self::$width        = $data->width;
		self::$height       = $data->height;
		self::$percent      = $data->percent;
		self::$crop         = $data->crop;
		self::$save         = $data->save;
		self::initImagesFromPath(self::$files);
		if (count(self::$images) <= 0) {
			self::initImagesFromBase64(self::$imagesBase64);
		}
	}

	private static function initImagesFromPath ($files) {
		$countFiles = count($files['name']);
		for ($i = 0; $i < $countFiles; $i++) {
			$name           = $files["name"][$i];
			$path           = $files["tmp_name"][$i];
			self::$images[] = Image::CreateImageFromPath($name, $path);
		}
	}

	private static function initImagesFromBase64 ($files) {
		foreach ($files as $image) {
			$name           = $image["name"];
			$path           = $image["path"];
			$base64         = $image["base64"];
			self::$images[] = Image::CreateImageFromBase64($name, $base64, $path);
		}
	}

	public static function getBase64 () {
		$images = Array();
		foreach (self::$images as $i => $image) {
			if (self::$save) {
				$image->saveImage();
			}
			$images[$i] = $image->getImageDataForJS();
		}
		echo json_encode($images);
	}

	public static function resize () {
		$images = Array();
		foreach (self::$images as $i => $image) {
			$image->resize(self::$width, self::$height, self::$percent);
			if (self::$save) {
				$image->saveImage();
			}
			$images[$i] = $image->getImageDataForJS();
		}
		echo json_encode($images);
	}

	public static function crop () {
		$images = Array();
		foreach (self::$images as $i => $image) {
			$image->crop(self::$crop, self::$percent);
			if (self::$save) {
				$image->saveImage();
			}
			$images[$i] = $image->getImageDataForJS();
		}
		echo json_encode($images);
	}

	public static function save () {
		foreach (self::$images as $image) {
			$image->saveImage();
		}
	}
}

class Image {
	public $name;
	public $path;
	public $string;
	public $type;
	public $extension;
	public $width;
	public $height;
	public $image;

	public static function CreateImageFromPath ($name, $path) {
		$image = new Image();

		$image->name = $name;
		$image->path = $path;
		$image->initImageWithPath();

		return $image;
	}

	public static function CreateImageFromBase64 ($name, $base64, $path) {
		$image = new Image();

		$image->name   = $name;
		$image->path   = $path;
		$image->string = base64_decode($base64);
		$image->initImageWithBase64();

		return $image;
	}

	private function initImageWithPath () {
		list($width, $height, $type) = getimagesize($this->path);
		$this->type      = $type;
		$this->extension = $this->getExtension($type);
		$this->width     = $width;
		$this->height    = $height;
		switch ($this->type) {
			case IMAGETYPE_GIF:
				$this->image = imagecreatefromgif($this->path);
				break;
			case IMAGETYPE_JPEG:
				$this->image = imagecreatefromjpeg($this->path);
				break;
			case IMAGETYPE_BMP:
				$this->image = imagecreatefromwbmp($this->path);
				break;
			case IMAGETYPE_PNG:
				$this->image = imagecreatefrompng($this->path);
				break;
			default:
				$this->image = NULL;
		}
	}

	private function initImageWithBase64 () {
		list($width, $height, $type) = getimagesizefromstring($this->string);
		$this->type      = $type;
		$this->extension = $this->getExtension($type);
		$this->width     = $width;
		$this->height    = $height;
		switch ($this->type) {
			case IMAGETYPE_GIF:
				$this->image = imagecreatefromgif($this->string);
				break;
			case IMAGETYPE_JPEG:
				$this->image = imagecreatefromjpeg($this->string);
				break;
			case IMAGETYPE_BMP:
				$this->image = imagecreatefromwbmp($this->string);
				break;
			case IMAGETYPE_PNG:
				$this->image = imagecreatefrompng($this->string);
				break;
			default:
				$this->image = NULL;
		}
	}

	private function getExtension ($type) {
		$extension = "";
		switch ($type) {
			case 1:
				$extension = "gif";
				break;
			case 2:
				$extension = "jpg";
				break;
			case 3:
				$extension = "png";
				break;
			case 6:
				$extension = "bmp";
				break;
		}
		return $extension;
	}

	public function getBase64 () {
		return base64_encode(file_get_contents($this->path));
	}

	public function saveImage ($path = "") {
		if (empty($path)) {
			$path = $this->path;
		}
		switch ($this->type) {
			case IMAGETYPE_GIF:
				imagegif($this->image, $path);
				break;
			case IMAGETYPE_JPEG:
				imagejpeg($this->image, $path, 100);
				break;
			case IMAGETYPE_BMP:
				imagewbmp($this->image, $path);
				break;
			case IMAGETYPE_PNG:
				imagepng($this->image, $path);
				break;
		}
	}

	public function resize ($width, $height, $percent = false) {
		if ($percent) {
			$width *= $this->width / 100;
			$height *= $this->height / 100;
		}
		if (!$height) {
			$height = $width / ($this->width / $this->height);
		}
		if (!$width) {
			$width = $height / ($this->height / $this->width);
		}
		$newImage = imagecreatetruecolor($width, $height);
		imagecopyresampled($newImage, $this->image, 0, 0, 0, 0, $width, $height, $this->width, $this->height);
		$this->image  = $newImage;
		$this->width  = $width;
		$this->height = $height;
		$this->saveImage();

		return $this;
	}

	public function crop ($crop = 'square', $percent = false) {
		$xOutput = 0;
		$yOutput = 0;
		if ($crop == 'square') {
			$min = $this->width;
			if ($this->width > $this->height) {
				$min = $this->height;
			}
			$width = $height = $min;
		}
		else {
			list($xOutput, $yOutput, $width, $height) = $crop;
			if ($percent) {
				$width *= $this->width / 100;
				$height *= $this->height / 100;
				$xOutput *= $this->width / 100;
				$yOutput *= $this->height / 100;
			}
			if ($width < 0) {
				$width += $this->width;
			}
			$width -= $xOutput;
			if ($height < 0) {
				$height += $this->height;
			}
			$height -= $yOutput;
		}
		$newImage = imagecreatetruecolor($width, $height);
		imagecopy($newImage, $this->image, 0, 0, $xOutput, $yOutput, $width, $height);
		$this->image  = $newImage;
		$this->width  = $width;
		$this->height = $height;
		$this->saveImage();

		return $this;
	}

	public function getImageDataForJS () {
		return Array(
			"name"   => $this->name,
			"type"   => $this->extension,
			"base64" => $this->getBase64()
		);
	}
}

include $settingsFile;
include $localizationFile;

CS::init();
?>