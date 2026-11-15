export function requiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `Variavel de ambiente obrigatoria "${name}" nao definida. ` +
        'Copie .env.example para .env (cp .env.example .env) e ajuste o valor, ' +
        'ou defina a variavel no ambiente antes de subir a aplicacao.',
    )
  }

  return value
}
