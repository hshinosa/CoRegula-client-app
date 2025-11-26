<?php
try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=postgres', 'postgres', '123hshi');
    $pdo->exec('CREATE DATABASE "coregula-laravel"');
    echo "Database 'coregula-laravel' created successfully!\n";
} catch(Exception $e) {
    if (str_contains($e->getMessage(), 'already exists')) {
        echo "Database 'coregula-laravel' already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
