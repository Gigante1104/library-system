<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Member;

class MemberController extends Controller
{
    public function index()
    {
        // withCount agrega el campo loans_count sin cargar todos los préstamos
        return response()->json(Member::withCount('loans')->orderBy('name')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:members,email',
            'phone' => 'nullable|string|max:20',
        ]);

        $member = Member::create($validated);

        return response()->json([
            'message' => 'Lector registrado exitosamente',
            'data'    => $member
        ], 201);
    }

    public function show(Member $member)
    {
        return response()->json($member->load('loans.book'), 200);
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            // ignore(): al editar, el correo actual del propio lector no cuenta como duplicado
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('members', 'email')->ignore($member->id)],
            'phone' => 'nullable|string|max:20',
        ]);

        $member->update($validated);

        return response()->json([
            'message' => 'Lector actualizado exitosamente',
            'data'    => $member
        ], 200);
    }

    public function destroy(Member $member)
    {
        if ($member->loans()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un lector con préstamos registrados.'
            ], 409);
        }

        $member->delete();

        return response()->json([
            'message' => 'Lector eliminado correctamente'
        ], 200);
    }
}
