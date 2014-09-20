<?php
SEngine::addSetting("EngineName", "SEngine");
SEngine::addSetting("Debug", 1);
SEngine::addSetting("Language", Languages::Russian);
SEngine::addSetting("UseDataBase", true);

SEngine::addSetting("Error_view", "error_view.php");
SEngine::addSetting("Error_bd", "error_bd.php");

SEngine::addSetting("ViewFolder", "views");
SEngine::addSetting("DefaultView", "Shared");
SEngine::addSetting("DefaultAction", "index");
SEngine::addSetting("Subdomen", true);

SEngine::addSetting("MenuFile", "menu.xml");

SEngine::addSetting("ImageFolder", "Images");
SEngine::addSetting("SystemFolder", "System");
SEngine::addSetting("MenuImagesFolder", "Menu");
SEngine::addSetting("NoImage", "no-image.png");
SEngine::addSetting("AlbumsTable", "albums");
SEngine::addSetting("PhotosTable", "photos");

SEngine::addSetting("MiddleContainer", "middle");

SEngine::addSetting("BD_Login", "root", false);
SEngine::addSetting("BD_Password", "", false);
SEngine::addSetting("BD_Name", "liceum", false);
?>