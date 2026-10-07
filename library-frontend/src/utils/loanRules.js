// Reglas de préstamo: deben coincidir con LoanService del backend.
// El frontend las usa para guiar al usuario; el backend es quien las hace cumplir.
export const MAX_ACTIVE_LOANS = 3
export const MAX_LOAN_DAYS = 30
export const DEFAULT_LOAN_DAYS = 14

/** Motivo por el que un lector no puede pedir un préstamo, o null si sí puede. */
export function borrowingBlockReason(member) {
  if (member.overdue_loans_count > 0) return 'tiene préstamos vencidos'
  if (member.active_loans_count >= MAX_ACTIVE_LOANS) return 'alcanzó el máximo de préstamos'
  return null
}
