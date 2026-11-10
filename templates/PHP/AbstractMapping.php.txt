<?php
namespace model\Abstract;
abstract class AbstractMapping
{
    public function __construct(array $tab)
    {
        $this->hydrate($tab);
    }
    protected function hydrate(array $assoc): void
    {
        foreach ($assoc as $key => $value) {
            $tab = explode("_", $key);
            $majuscule = array_map('ucfirst',$tab);
            $newNameCamelCase = implode($majuscule);
            $methodeName = "set" . $newNameCamelCase;
            if (method_exists($this, $methodeName)) {
                $this->$methodeName($value);
            }
        }
    }
}