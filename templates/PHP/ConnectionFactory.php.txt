<?php

namespace Factory;

use model\MyPDO;

class ConnectionFactory
{
    public static function createDb(): MyPDO
    {
        return MyPDO::getInstance(
            DB_CONNECTION_STRING,
            DB_LOGIN,
            DB_PWD,
            DB_OPTIONS
        );
    }

    /**
     * @throws \Exception
     */
    public static function insertNewDb(): void
    {
        $pdo = MyPDO::getInstance(
            DB_UNKNOWN_CONNECTION_STRING,
            DB_LOGIN,
            DB_PWD
        );

        $stmt = $pdo->prepare(
            "CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "`
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_general_ci"
        );

        $stmt->execute();
    }

}