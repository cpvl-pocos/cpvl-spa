# Otimização de Performance da Área Privada - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Otimizar o tempo de carregamento do dashboard da área privada reduzindo consultas redundantes ao banco de dados e adotando validação stateless no token JWT.

**Architecture:** Transição da autenticação no JwtStrategy para stateless (utilizando payload do JWT sem consultar banco) e eliminação da chamada redundante da licença no endpoint `/profile` por meio do reuso dos dados de eager-loading.

**Tech Stack:** NestJS, Passport JWT, Sequelize, MySQL.

---

### Task 1: Otimização da Validação JWT no JwtStrategy

**Files:**
- Modify: `cpvl-api/src/auth/strategies/jwt.strategy.ts`

- [ ] **Step 1: Modificar a validação do token JWT para stateless**
  Alterar a validação em `jwt.strategy.ts` para que retorne `{ username, id, role }` diretamente a partir do payload criptográfico validado pelo Passport, sem efetuar chamadas adicionais de rede ao banco de dados.

  *Alteração sugerida:*
  Substituir o bloco de código do método `validate`:
  ```typescript
  async validate(payload: any): Promise<Partial<User>> {
    const {
      username,
      sub,
    } = payload;

    const id = sub?.id;
    const role = sub?.role;

    if (!id || !role) {
      console.log(`⚠️ [JwtStrategy] Payload de JWT inválido ou incompleto:`, payload);
      throw new UnauthorizedException('Payload do token inválido.');
    }

    return { username, id, role };
  }
  ```

- [ ] **Step 2: Verificar a compilação do código do back-end**
  Run: `wsl npm run build` no diretório da API para garantir que as alterações não contêm erros de digitação ou de importação.
  Cwd: `//wsl.localhost/Ubuntu-22.04/home/fernando/Documents/develop/www/Esportes/cpvl/v1_cpvl_dev_2026/cpvl-api`
  Expected: Recompilação com sucesso sem erros.

- [ ] **Step 3: Fazer o commit da alteração do JwtStrategy**
  Run:
  ```bash
  git add src/auth/strategies/jwt.strategy.ts
  git commit -m "perf: make jwt authentication strategy fully stateless"
  ```
  Cwd: `//wsl.localhost/Ubuntu-22.04/home/fernando/Documents/develop/www/Esportes/cpvl/v1_cpvl_dev_2026/cpvl-api`
  Expected: Commit executado com sucesso.

---

### Task 2: Otimização do Endpoint de Perfil (Profile)

**Files:**
- Modify: `cpvl-api/src/app.controller.ts`

- [ ] **Step 1: Otimizar o método getProfile para reutilizar dados de eager loading**
  Remover a chamada separada `this.licenseDataService.findByUserId(userId)` e obter a licença diretamente a partir do objeto do piloto (`pilot.licenseData`), que já vem acoplado graças à inclusão no `getPilotByUserId`.

  *Alteração sugerida:*
  Substituir o bloco `if (userRole === ERoles.PILOTO)` do controller pelo seguinte código:
  ```typescript
    if (userRole === ERoles.PILOTO) {
      // Fetch pilot info (which already eager-loads licenseData)
      const pilot = await this.pilotsService.getPilotByUserId(userId);
      const license = pilot?.licenseData ?? null;

      pilotInfo = pilot;

      if (license) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const EXPIRY_WARNING_DAYS = 30;

        const checkExpiration = (date: Date | null, docName: string) => {
          if (!date) return;
          const expDate = new Date(date);
          const diffDays = Math.ceil(
            (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays >= 0 && diffDays <= EXPIRY_WARNING_DAYS) {
            warnings.push(`Seu documento ${docName} vencerá em ${diffDays} dias.`);
          }
        };

        checkExpiration(license.cbvlExpiration, 'CBVL');
        checkExpiration(license.anacExpiration, 'ANAC');
      }
    }
  ```

- [ ] **Step 2: Verificar a compilação do back-end**
  Run: `wsl npm run build` no diretório da API.
  Cwd: `//wsl.localhost/Ubuntu-22.04/home/fernando/Documents/develop/www/Esportes/cpvl/v1_cpvl_dev_2026/cpvl-api`
  Expected: Build bem-sucedido.

- [ ] **Step 3: Fazer o commit da alteração do controller**
  Run:
  ```bash
  git add src/app.controller.ts
  git commit -m "perf: remove redundant license lookup and reuse eager-loaded data"
  ```
  Cwd: `//wsl.localhost/Ubuntu-22.04/home/fernando/Documents/develop/www/Esportes/cpvl/v1_cpvl_dev_2026/cpvl-api`
  Expected: Commit executado com sucesso.

---

### Task 3: Verificação de Performance e Sanidade

- [ ] **Step 1: Validar que os endpoints continuam funcionando**
  Testar chamando o endpoint `/profile` localmente enviando um token de teste.
  Expected: Retorno rápido com status HTTP 200, trazendo dados de piloto, warnings e rotas idênticos a antes, mas em fração de segundo.

- [ ] **Step 2: Testar se a lentidão no SPA foi resolvida**
  Acessar a área privada do site localmente e observar que a inicialização do Dashboard agora carrega instantaneamente sem travar a navegação e sem atrasos severos.
