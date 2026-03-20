<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;

$inviteCode = 'TEST_123';
$cacheKey = "battle_lobby_{$inviteCode}";

$lobby = [
    'id' => 'abc-123',
    'host_id' => 1,
    'host_name' => 'Host User',
    'player_count' => 3,
    'is_private' => true,
    'players' => [
        [
            'id' => 1,
            'name' => 'Host User',
            'joined_at' => now()->toDateTimeString(),
            'ready' => false
        ]
    ],
    'status' => 'waiting',
    'created_at' => now()->toDateTimeString()
];

Cache::put($cacheKey, $lobby, now()->addHours(1));

$fetched = Cache::get($cacheKey);
if (!$fetched) echo "Failed to fetch created lobby!\n";

// Add Player 2
$fetched['players'][] = [
    'id' => 2,
    'name' => 'Player 2',
    'joined_at' => now()->toDateTimeString(),
    'ready' => false
];
Cache::put($cacheKey, $fetched, now()->addHours(1));

$fetched2 = Cache::get($cacheKey);
if (!$fetched2) echo "Failed to fetch after Player 2 joined!\n";
else echo "Player 2 joined! Count: " . count($fetched2['players']) . "\n";

// Add Player 3
$fetched2['players'][] = [
    'id' => 3,
    'name' => 'Player 3',
    'joined_at' => now()->toDateTimeString(),
    'ready' => false
];
Cache::put($cacheKey, $fetched2, now()->addHours(1));

$fetched3 = Cache::get($cacheKey);
if (!$fetched3) echo "Failed to fetch after Player 3 joined!\n";
else echo "Player 3 joined! Count: " . count($fetched3['players']) . "\n";
