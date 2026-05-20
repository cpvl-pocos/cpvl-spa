# Especificação de Design: Otimização de Performance da Área Privada

**Data**: 2026-05-20  
**Status**: Aprovado pelo Usuário  
**Autor**: Antigravity AI  

---

## 1. Contexto e Problema

Após a transição temporária do Sequelize ORM para o Prisma ORM e posterior reversão, o sistema passou a apresentar uma lentidão severa ao carregar as páginas e componentes da área privada (Dashboard).

### Investigação Técnica e Descobertas:
1. **Latência de Rede Externa**: O banco de dados MySQL está hospedado em `procode.studio`. A latência de rede entre o servidor da API (dentro do WSL) e o banco de dados remoto é de **136ms**. Qualquer query leva cerca de **141ms** para ir e voltar.
2. **Gargalo no JwtStrategy**: Em todas as requisições protegidas com `JwtAuthGuard`, a estratégia do Passport (`JwtStrategy.validate`) executa a busca síncrona `await this.usersService.findById(id)`. Como o SPA dispara várias requisições em paralelo ao abrir o Dashboard, essas consultas acumulam e enfileiram, gerando de 1.5 a 2.5 segundos de bloqueio na rede.
3. **Consulta de Licença Redundante no Profile**: O endpoint `/profile` para o papel `PILOTO` faz chamadas concorrentes para obter o piloto (`getPilotByUserId`) e a licença (`findByUserId`). No entanto, o `getPilotByUserId` já faz eager loading completo de `LicenseData` (e outras tabelas), tornando a segunda busca totalmente redundante.

---

## 2. Abordagem de Solução

Adotaremos uma abordagem combinada para reduzir drasticamente as requisições ao banco de dados:

### A. Autenticação JWT Stateless (Abordagem 1)
Removeremos a verificação síncrona ao banco na validação do token JWT. Uma vez que o token é assinado e verificado criptograficamente com o `PASSPORT_SECRET` do servidor e validado pelo Passport, o payload decodificado é seguro e suficiente para autenticar e autorizar a requisição.
* **Impacto**: Redução imediata de **1 query por requisição protegida** (ganho de ~141ms por requisição).

### B. Remoção de Consulta Redundante no Profile (Abordagem 3)
No endpoint `/profile` do `AppController`, reutilizaremos a propriedade `pilot.licenseData` trazida no eager loading do piloto, em vez de efetuar uma query separada ao banco de dados.
* **Impacto**: Economia de mais **1 query na inicialização** (ganho de ~141ms adicionais).

---

## 3. Alterações Propostas

### 3.1 `JwtStrategy`
**Arquivo**: `cpvl-api/src/auth/strategies/jwt.strategy.ts`
* Remover o `this.usersService.findById(id)` na função `validate`.
* Validar apenas se o `id` e o `role` constam do payload descriptografado e retornar o objeto parcial `{ username, id, role }` imediatamente.

### 3.2 `AppController`
**Arquivo**: `cpvl-api/src/app.controller.ts`
* No método `getProfile`, para o papel `ERoles.PILOTO`, alterar a busca de licença para:
  ```typescript
  const pilot = await this.pilotsService.getPilotByUserId(userId);
  const license = pilot?.licenseData ?? null;
  ```
* Remover o `this.licenseDataService.findByUserId(userId)` e o `Promise.all` redundante.

---

## 4. Plano de Verificação

### Testes Manuais de Performance:
1. Executar a API em modo watch e verificar que o tempo de carregamento da área privada diminui significativamente.
2. Confirmar através da aba Network do navegador (Chrome DevTools) que as requisições paralelas para `/profile`, `/status-list` e outros endpoints agora retornam em frações de segundo.

### Testes Automatizados de Regressão:
1. Validar que as rotas autenticadas continuam protegendo os recursos caso o token seja inválido ou ausente.
2. Confirmar que a API compila e inicia sem erros de injeção ou dependências.
