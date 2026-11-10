<?php
namespace model\Trait;

use DateTime;
use Exception;

Trait TraitLaundryRoom {
   protected function standardClean($cleanThis): string
    {
        return htmlspecialchars(strip_tags(trim($cleanThis)), ENT_QUOTES);
    }
   protected function simpleTrim($trimThis): string
    {
        return trim($trimThis);
    }
   protected function urlClean($cleanThisUrl): string
    {
        return filter_var($cleanThisUrl, FILTER_SANITIZE_URL);
    }
   protected function intClean($cleanThisInt): int
    {
        $cleanedInt = filter_var($cleanThisInt, FILTER_SANITIZE_NUMBER_INT,
            FILTER_FLAG_ALLOW_FRACTION
        );
        $cleanedInt = intval($cleanedInt);
        return $cleanedInt;
    }
   protected function floatClean($cleanThisFloat): float
    {
        $cleanedFloat = filter_var($cleanThisFloat, FILTER_SANITIZE_NUMBER_FLOAT,
            FILTER_FLAG_ALLOW_FRACTION,
        );
        $cleanedFloat = floatval($cleanedFloat);
        return $cleanedFloat;
    }
   protected function emailClean($cleanThisEmail): string
    {
        return filter_var($cleanThisEmail, FILTER_SANITIZE_EMAIL);
    }
    protected function dateClean(string|DateTime $dateInput): string
    {
        try {
            if ($dateInput instanceof DateTime) {
                // if it's already DateTime, it can only have come from the server side, so ok
                $date = $dateInput;
            } else {
                // if it's a string, sanitise it and create a DateTime from it
                $cleaned = trim($dateInput);
                $cleaned = preg_replace('/[^0-9\-:\/\sTZ]/', '', $cleaned);
                $date = new DateTime($cleaned);
            }

            return $date->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            // If all that fails, send back the current time
            return (new DateTime())->format('Y-m-d H:i:s');
        }
    }
   protected function findTheNeedles($hay): bool
    {
        $needles = ["<script>",
            "<iframe>",
            "<object>",
            "<embed>",
            "<form>",
            "<input>",
            "<textarea>",
            "<select>",
            "<button>",
            "<link>",
            "<meta>",
            "<style>",
            "<svg>",
            "<base>",
            "<applet>",
            "script",
            "'click'",
            '"click"',
            "onclick",
            "onload",
            'onerror',
            'src'];
        foreach ($needles as $needle) {
            if (str_contains($hay, $needle)) {
                return true;
            }
        }
        return false;
    }
}