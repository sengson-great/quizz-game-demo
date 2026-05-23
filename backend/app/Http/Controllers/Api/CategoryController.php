<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CategoryController extends Controller
{
    #[OA\Get(path: "/admin/categories", summary: "List all categories", tags: ["Admin: Categories"])]
    #[OA\Response(response: 200, description: "A list of categories")]
    public function index(Request $request)
    {
        $query = Category::withCount('questions');
        // If not admin, only show enabled categories
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->where('is_enabled', true);
        }
        return response()->json($query->get());
    }

    #[OA\Post(path: "/admin/categories", summary: "Create a new category", tags: ["Admin: Categories"])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "Science"),
                new OA\Property(property: "description", type: "string", example: "General science questions")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Category created")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories',
            'name_km'     => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:100',
            'is_enabled'  => 'nullable|boolean',
        ]);
        return response()->json(Category::create($request->only('name', 'name_km', 'description', 'icon', 'color', 'is_enabled')), 201);
    }

    #[OA\Get(path: "/admin/categories/{category}", summary: "Get a specific category", tags: ["Admin: Categories"])]
    #[OA\Parameter(name: "category", in: "path", required: true, description: "Category ID", example: 1)]
    #[OA\Response(response: 200, description: "Category details")]
    #[OA\Response(response: 404, description: "Category not found")]
    public function show($id)
    {
        return response()->json(Category::withCount('questions')->findOrFail($id));
    }

    #[OA\Put(path: "/admin/categories/{category}", summary: "Update an existing category", tags: ["Admin: Categories"])]
    #[OA\Parameter(name: "category", in: "path", required: true, description: "Category ID", example: 1)]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "name", type: "string", example: "Advanced Science"),
                new OA\Property(property: "description", type: "string", example: "Harder questions")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Category updated")]
    #[OA\Response(response: 404, description: "Category not found")]
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $request->validate([
            'name'        => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'name_km'     => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:100',
            'is_enabled'  => 'sometimes|boolean',
        ]);
        $category->update($request->only('name', 'name_km', 'description', 'icon', 'color', 'is_enabled'));
        return response()->json($category);
    }

    #[OA\Delete(path: "/admin/categories/{category}", summary: "Delete a category", tags: ["Admin: Categories"])]
    #[OA\Parameter(name: "category", in: "path", required: true, description: "Category ID", example: 1)]
    #[OA\Response(response: 200, description: "Category deleted")]
    #[OA\Response(response: 404, description: "Category not found")]
    public function destroy($id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}