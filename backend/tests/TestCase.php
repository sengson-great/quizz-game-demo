<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (!file_exists(storage_path('oauth-private.key'))) {
            \Illuminate\Support\Facades\Artisan::call('passport:keys', ['--force' => true]);
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('oauth_clients')) {
            \Illuminate\Support\Facades\Artisan::call('passport:client', [
                '--personal' => true,
                '--name' => 'Testing Personal Access Client',
                '--no-interaction' => true,
            ]);
        }
    }
}

