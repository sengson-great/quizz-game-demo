<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;

$inviteCode = "TES3P";
$lobby = [
    'id' => '1234',
    'host_id' => 1,
    'player_count' => 4,
    'players' => [
        ['id' => 1, 'ready' => false]
    ],
    'status' => 'waiting'
];

Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));

// Player 2
$lobby = Cache::get("battle_lobby_{$inviteCode}");
$lobby['players'][] = ['id' => 2, 'ready' => false];
Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));

// Player 3
$lobby = Cache::get("battle_lobby_{$inviteCode}");
$lobby['players'][] = ['id' => 3, 'ready' => false];
Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));

$final = Cache::get("battle_lobby_{$inviteCode}");
echo "Lobby players: " . count($final['players']) . "\n";
if (/Users/chhuong/millionaire-quiz/backendfinal) echo "Lobby not found!\n";
