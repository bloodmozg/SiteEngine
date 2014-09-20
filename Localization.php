<?php
$lang = Languages::Russian;
CS::addLocalization("error_default", "Произошла ошибка", $lang);
CS::addLocalization("error_".Errors::empty_login, "Логин не может быть пустым", $lang);
CS::addLocalization("error_".Errors::empty_password, "Пароль не может быть пустым", $lang);
CS::addLocalization("error_".Errors::length_password_is_not_valid, "Логин и/или пароль не соответствую требованиям", $lang);
CS::addLocalization("error_".Errors::login_password_is_wrong, "Логин/пароль не верны", $lang);
CS::addLocalization("error_".Errors::user_exist, "Пользователь с таким логином уже существует", $lang);


CS::addLocalization("buttonText", "Кнопка", $lang);
CS::addLocalization("textText", "Текст", $lang);


CS::addLocalization("buttonBack", "Назад", $lang);
CS::addLocalization("buttonAdd", "Добавить", $lang);
CS::addLocalization("buttonEdit", "Редактировать", $lang);
CS::addLocalization("buttonDelete", "Удалить", $lang);
CS::addLocalization("buttonRead", "Подробнее", $lang);
CS::addLocalization("buttonLogin", "Логин", $lang);

CS::addLocalization("loginInput", "Логин", $lang);
CS::addLocalization("passwordInput", "Пароль", $lang);

$lang = Languages::English;
CS::addLocalization("buttonText", "Button", $lang);
CS::addLocalization("buttonBack", "Back", $lang);
CS::addLocalization("buttonAdd", "Add", $lang);
CS::addLocalization("buttonEdit", "Edit", $lang);
CS::addLocalization("buttonDelete", "Delete", $lang);
CS::addLocalization("buttonRead", "More", $lang);
CS::addLocalization("buttonLogin", "Login", $lang);
CS::addLocalization("loginInput", "Login", $lang);
CS::addLocalization("passwordInput", "Password", $lang);

?>
