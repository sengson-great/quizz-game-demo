<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$event = new \App\Events\GameAction('1234', 1, 'score_update', ['score' => 500]);
echo json_encode($event);
