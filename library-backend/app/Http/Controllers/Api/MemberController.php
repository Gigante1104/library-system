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
        // withCount agrega contadores sin cargar todos los préstamos:
        // loans_count (histórico), active_loans_count y overdue_loans_count (reutiliza los scopes de Loan)
        $members = Member::withCount([
            'loans',
            'loans as active_loans_count'  => fn ($query) => $query->active(),
            'loans as overdue_loans_count' => fn ($query) => $query->overdue(),
        ])->orderBy('name')->get();

        return response()->json($members, 200);
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
