<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(version: "1.0.0", description: "API documentation", title: "Millionaire Quiz API")]
#[OA\Server(url: "/api", description: "Local API Server")]
#[OA\SecurityScheme(securityScheme: "bearerAuth", type: "http", scheme: "bearer")]
#[OA\OpenApi(security: [["bearerAuth" => []]])]
abstract class Controller
{
    //
}
