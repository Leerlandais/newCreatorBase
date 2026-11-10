<?php
session_start();

if (isset($_SESSION["activity"]) && time() - $_SESSION["activity"] > 1800) {
    session_unset();
    session_destroy();
    header("location: ./");
    exit();
}

$_SESSION["activity"] = time();

if(isset($_SESSION["id"]) && $_SESSION["id"] !== session_id()) {
    session_unset();
    session_destroy();
    header("location: ./");
    exit();
}

if (isset($_SESSION["systemMessage"])) {
    $systemMessage = $_SESSION["systemMessage"];
    unset($_SESSION["systemMessage"]);
}else {
    $systemMessage = "";
}
$sessionRole = "";
if(isset($_SESSION['roles'])) $sessionRole = $_SESSION['roles'];
use Twig\Loader\FilesystemLoader;
use Twig\Environment;
use Factory\ConnectionFactory;
require_once "../config.php";
spl_autoload_register(function ($class) {
  $class = str_replace('\\', '/', $class);
  require PROJECT_DIRECTORY.'/' .$class . '.php';
});
require_once PROJECT_DIRECTORY.'/vendor/autoload.php';
$loader = new FilesystemLoader(PROJECT_DIRECTORY.'/view/');
// Dev version
$twig = new Environment($loader, [
  'debug' => true,
]);
$twig->addExtension(new \Twig\Extension\DebugExtension());

$twig->addGlobal('PUB_DIR', PUB_DIR);
$twig->addGlobal('PROJ_DIR', PROJECT_DIRECTORY);
$twig->addGlobal("ENV", ENV_MODE);
// // Prod version
// $twig = new Environment($loader, [
//    'cache' => '../cache/Twig',
//    'debug' => false,
// ]);
// // no DebugExtension online
// var_dump($_SESSION);
try {
    $db = ConnectionFactory::createDb();
} catch (Exception $e) {
    die($e->getMessage());
}

require_once PROJECT_DIRECTORY . '/Controllers/RouteController.php';
$db = null;