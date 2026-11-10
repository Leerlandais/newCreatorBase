<?php
namespace model;
use PDO;
use Exception;
class MyPDO extends PDO
{
    private static array $instances = [];

    private function __construct($dsn, $username = null, $password = null, $options = null)
    {
        parent::__construct($dsn, $username, $password, $options);
    }

    public static function getInstance($dsn, $username = null, $password = null, $options = null): MyPDO
    {
        $key = md5($dsn . $username);

        if (!isset(self::$instances[$key])) {
            self::$instances[$key] = new MyPDO($dsn, $username, $password, $options);
        }

        return self::$instances[$key];
    }
}
