<?php

namespace Factory;

use model\MyPDO;


class ManagerFactory
{
    private MyPDO $db;
    private array $instances = [];

    public function __construct(MyPDO $db)
    {
        $this->db = $db;

    }

    public function get(string $managerClass): object
    {
        /*
         * Centralises Managers
         * Child Controllers call for their necessary Managers via their __construct
         * AbstractController requests the Manager from here and passes it on
         * This way only one function is used to instantiate Managers : DRY is the way
         */
        if (!isset($this->instances[$managerClass])) {
            $this->instances[$managerClass] = new $managerClass(
                $this->db
            );
        }
        return $this->instances[$managerClass];
    }
}