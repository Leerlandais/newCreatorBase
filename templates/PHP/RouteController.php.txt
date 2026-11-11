<?php

namespace Controllers;

use model\Manager\RouteManager;

class RouteController
{
    private RouteManager $router;

    public function __construct($twig, $db)
    {
        $this->router = new RouteManager($twig, $db);

        $this->registerRoutes();
    }

    private function registerRoutes(): void
    {
        // GENERAL ROUTES
        $this->router->registerRoute('home', ConnectionController::class, 'index');
        $this->router->registerRoute('logout', ConnectionController::class, 'logout');
        $this->router->registerRoute('404', ConnectionController::class, 'error404');

    }

    public function handleRequest(): void
    {
        $route = $_GET['route'] ?? 'home';

        $this->router->handleRequest($route);
    }
}