<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\Member;

class MemberController extends Controller
{
    public function index()
    {
        // withCount agrega el campo loans_count sin cargar todos los préstamos
        return response()->json(Member::withCount('loans')->orderBy('name')->get(), 200);
    }

    public function store(StoreMemberRequest $request)
    {
        $member = Member::create($request->validated());

        return response()->json([
            'message' => 'Lector registrado exitosamente',
            'data'    => $member
        ], 201);
    }

    public function show(Member $member)
    {
        return response()->json($member->load('loans.book'), 200);
    }

    public function update(UpdateMemberRequest $request, Member $member)
    {
        $member->update($request->validated());

        return response()->json([
            'message' => 'Lector actualizado exitosamente',
            'data'    => $member
        ], 200);
    }

    public function destroy(Member $member)
    {
        if ($member->loans()->exists()) {
            throw new BusinessRuleException('No se puede eliminar un lector con préstamos registrados.');
        }

        $member->delete();

        return response()->json([
            'message' => 'Lector eliminado correctamente'
        ], 200);
    }
}
