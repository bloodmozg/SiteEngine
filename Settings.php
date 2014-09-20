<?php
CS::addSetting("EngineName", "CS");
CS::addSetting("Debug", 1);
CS::addSetting("Language", Languages::Russian);
CS::addSetting("UseDataBase", true);

CS::addSetting("Error_view", "error_view.php");
CS::addSetting("Error_bd", "error_bd.php");

CS::addSetting("ViewFolder", "views");
CS::addSetting("DefaultView", "Shared");
CS::addSetting("DefaultAction", "index");
CS::addSetting("Subdomen", true);

CS::addSetting("MenuFile", "menu.xml");

CS::addSetting("ImageFolder", "Images");
CS::addSetting("SystemFolder", "System");
CS::addSetting("MenuImagesFolder", "Menu");
CS::addSetting("NoImage", "no-image.png");
CS::addSetting("AlbumsTable", "albums");
CS::addSetting("PhotosTable", "photos");

CS::addSetting("MiddleContainer", "middle");

CS::addSetting("BD_Login", "root", false);
CS::addSetting("BD_Password", "", false);
CS::addSetting("BD_Name", "liceum", false);
?>