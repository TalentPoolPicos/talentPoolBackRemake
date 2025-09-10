/**
 * Lista de domínios de email institucional válidos
 */
export const INSTITUTIONAL_EMAIL_DOMAINS = [
  // Universidade Federal do Piauí
  '@ufpi.edu.br',
  '@ufpi.br',

  // Outras universidades federais
  '@ufc.br',
  '@uece.br',
  '@ifpi.edu.br',
  '@ifce.edu.br',
  '@unilab.edu.br',
  '@urca.br',

  // Universidades estaduais do Piauí
  '@uespi.br',
  '@fapepi.pi.gov.br',

  // Para testes e desenvolvimento
  '@student.test.br',
] as const;

/**
 * Verifica se um email possui domínio institucional válido
 */
export function isInstitutionalEmail(email: string): boolean {
  return INSTITUTIONAL_EMAIL_DOMAINS.some((domain) =>
    email.toLowerCase().endsWith(domain.toLowerCase()),
  );
}

/**
 * Extrai o domínio de um email
 */
export function getEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? `@${parts[1]}` : '';
}
