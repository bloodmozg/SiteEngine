<?php
$lang = Languages::Russian;
SEngine::addLocalization("error_default", "Произошла ошибка", $lang);
SEngine::addLocalization("error_".Errors::empty_login, "Логин не может быть пустым", $lang);
SEngine::addLocalization("error_".Errors::empty_password, "Пароль не может быть пустым", $lang);
SEngine::addLocalization("error_".Errors::length_password_is_not_valid, "Логин и/или пароль не соответствую требованиям", $lang);
SEngine::addLocalization("error_".Errors::login_password_is_wrong, "Логин/пароль не верны", $lang);
SEngine::addLocalization("error_".Errors::user_exist, "Пользователь с таким логином уже существует", $lang);


SEngine::addLocalization("buttonText", "Кнопка", $lang);
SEngine::addLocalization("textText", "Текст", $lang);


SEngine::addLocalization("buttonBack", "Назад", $lang);
SEngine::addLocalization("buttonAdd", "Добавить", $lang);
SEngine::addLocalization("buttonEdit", "Редактировать", $lang);
SEngine::addLocalization("buttonDelete", "Удалить", $lang);
SEngine::addLocalization("buttonRead", "Подробнее", $lang);
SEngine::addLocalization("buttonLogin", "Логин", $lang);

SEngine::addLocalization("loginInput", "Логин", $lang);
SEngine::addLocalization("passwordInput", "Пароль", $lang);

$lang = Languages::English;
SEngine::addLocalization("buttonText", "Button", $lang);
SEngine::addLocalization("buttonBack", "Back", $lang);
SEngine::addLocalization("buttonAdd", "Add", $lang);
SEngine::addLocalization("buttonEdit", "Edit", $lang);
SEngine::addLocalization("buttonDelete", "Delete", $lang);
SEngine::addLocalization("buttonRead", "More", $lang);
SEngine::addLocalization("buttonLogin", "Login", $lang);
SEngine::addLocalization("loginInput", "Login", $lang);
SEngine::addLocalization("passwordInput", "Password", $lang);

?>
