# Uso de IA

Uso de IA foi permitido e esperado durante o curso. Este arquivo declara como ela participou, o que ficou sob minha decisão e onde está a fronteira — seguindo a regra do projeto: **a IA sugere alternativas; a decisão continua sendo minha.**

## Ferramenta e método

- **Agente:** OpenCode (modelo GLM), usado como pair programming
- **Método:** eu discuto o plano → a IA propõe o código no meu estilo → eu reviso → **eu commito** (o histórico de commits é exclusivamente meu)
- **Origem da ideia:** tema próprio, anotado previamente no meu repositório de ideias (**app-ideias**)

## Prompts e momentos que importaram

- **"Arquitetura em camadas"** — a IA propôs a estrutura (`controllers/services/models/middlewares/lib`); eu rejeitei o repository pattern que ela sugeriu inicialmente e impus meu estilo de código (aspas simples, sem ponto e vírgula, `import type`)
- **Middleware `validate`** — a versão que entrou no projeto foi a **minha** (a IA adotou o meu código, com `z.flattenError` e 422)
- **Bug pego por teste no mesmo lote** — o Swagger UI foi montado primeiro na raiz engolindo 404s; a asserção do teste de integração pegou o defeito antes do commit. Teste provando teste
- **"Explique o histograma do prom-client"** — pedi a explicação do conceito (baldes, percentis) **antes** de aplicar; o `/metrics` só foi escrito depois que eu entendi como o p95 sai dos buckets
- **Leitura do Trivy** — o scan achou 21 CVEs HIGH; a IA explicou serem toolchain da base (npm CLI + esbuild Go), eu validei por conta própria: `npm audit` reporta 0 no projeto

## O que foi decisão minha (em vários casos, contra ou além da sugestão da IA)

- 302 vs 301 no redirect (motivo de negócio: a contagem de cliques)
- Usuário de menor privilégio no banco (`gtech_app` sem DELETE/DROP)
- Rejeitar TDD — código primeiro, teste no mesmo movimento
- Cortes de escopo: sem auth, sem DELETE, sem listagem, sem alias custom, sem deploy
- Cobertura mínima de 90% **declarada e respeitada** no pipeline
- ADR única (302 vs 301) em vez de espalhar vários documentos

## Fronteira

Código que eu não sei explicar não conta como meu. Todos os arquivos de `src/` estão sob defesa: posso explicar linha a linha — disponível para verificação na apresentação.
