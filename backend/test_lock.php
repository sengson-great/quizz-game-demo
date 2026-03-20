<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;

$result = Cache::lock("test_lock", 5)->block(5, function () {
    return "Hello from inside the lock!";
});

echo "Result: " . $result . "\n";
