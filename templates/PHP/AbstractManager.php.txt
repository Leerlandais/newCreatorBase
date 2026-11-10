<?php

namespace model\Abstract;

use model\MyPDO;
use Twig\Environment;

abstract class AbstractManager
{
    protected MyPDO $db;
    protected Environment $twig;

    public function __construct(MyPDO $db)
    {
        $this->db = $db;
    }
    protected function insertAnything(array $data, string $dbName, string $dbType = "db", $returnId = false): bool|int
    {
        $columns = implode(", ", array_keys($data));
        $placeholders = ":" . implode(", :", array_keys($data));
        $stmt = $this->$dbType->prepare("INSERT INTO $dbName ($columns) VALUES ($placeholders)");
        $stmt->execute($data);
        if($returnId === true) return $this->$dbType->lastInsertId();
        return (int)$this->$dbType->lastInsertId() > 0; // Turns out insert and a rowCount() check is not always valid. Better to use a lastInsertId check
    }
    protected function updateAnything(array $data, string $uniqueField, int $uniqueId, string $dbName, string $dbType = "db"): bool
    {   // The data array contains the data to be updated, the uniqueField is the field that uniquely identifies the row to be updated, and the uniqueId is the value of that field.
        $dataSet = implode(", ", array_map(fn($key) => "$key = :$key", array_keys($data)));
        $stmt = $this->$dbType->prepare("UPDATE $dbName SET $dataSet WHERE `$uniqueField` = :id");
        $stmt->execute(array_merge($data, ["id" => $uniqueId]));
        return $stmt->rowCount() > 0; // rather than if($stmt->rowCount() === 0) return false; return true; This does it in one line
    }
        protected function selectAnything(array $data, string $dbName, string $dbType = "db"): array|false
    {

        $conditions = [];
        foreach ($data as $key => $value) {
            if(!empty($value)) {
                $conditions[] = "$key = :$key";
            }else {
                unset($data[$key]);
            }
        }
        $whereClause = implode(" OR ", $conditions);

        $sql = "SELECT * FROM $dbName WHERE $whereClause";
        $stmt = $this->$dbType->prepare($sql);
        $stmt->execute($data);

        $results = $stmt->fetchAll();

        return $results ?: false;
    }
}