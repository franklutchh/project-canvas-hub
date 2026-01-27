
## Plano de Continuacao da Potencializacao do DevClient Pro

### Visao Geral

Esta fase implementara tres melhorias principais:
1. **Log Automatico de Atividades** - Registrar automaticamente todas as acoes em todos os hooks
2. **Sistema de Comentarios Premium** - Redesign do RequirementComments com glassmorphism
3. **Notificacoes no Mobile** - Adicionar dropdown de notificacoes na sidebar mobile

---

### FASE 1: Log Automatico de Atividades

Adicionar chamadas automaticas do `logProjectActivity` em todos os hooks quando acoes sao realizadas.

**1.1 - useProjects.tsx**

Atualizar para registrar:
- Projeto criado: `action_type: 'created'`, descricao com nome do projeto
- Projeto atualizado: `action_type: 'updated'` ou `action_type: 'status_changed'` (com metadata do status antigo/novo)

Importar: `logProjectActivity` de `./useActivityLogs`

```text
onSuccess para createProject:
  -> logProjectActivity(data.id, user.id, 'created', 'Projeto criado')

onSuccess para updateProject:
  -> Se status mudou: logProjectActivity(..., 'status_changed', 'Status alterado', { old_status, new_status })
  -> Senao: logProjectActivity(..., 'updated', 'Projeto atualizado')
```

**1.2 - useRequirements.tsx**

Atualizar para registrar:
- Requisito criado: `action_type: 'requirement_added'`
- Requisito completado/descompletado: `action_type: 'requirement_completed'`

Precisa receber `projectId` nas callbacks e passar para log.

**1.3 - useMeetings.tsx**

Atualizar para registrar:
- Reuniao criada: `action_type: 'meeting_added'`

**1.4 - useProjectFiles.tsx**

Atualizar para registrar:
- Arquivo enviado: `action_type: 'file_uploaded'` com metadata do nome do arquivo
- Arquivo excluido: `action_type: 'file_deleted'`

**1.5 - useRequirementComments.tsx**

Atualizar para registrar:
- Comentario adicionado: `action_type: 'comment_added'`

Requer passar `projectId` como parametro adicional.

---

### FASE 2: Comentarios Premium (RequirementComments.tsx)

Redesign completo com o design system iOS 26:

- Cards glass para cada comentario (`glass-card rounded-xl`)
- Avatar com container gradiente ou inicial
- Input/Textarea com estilo glass e borda sutil
- Botao Send premium com hover glow
- Animacoes de entrada staggered nos comentarios
- Transicoes hover refinadas

Elementos visuais:
```text
- Container: glass-card p-4 rounded-2xl
- Comentarios: bg-white/[0.03] hover:bg-white/[0.05] rounded-xl
- Avatar: h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20
- Input: glass-card border-white/[0.08]
- Botao: bg-primary hover:shadow-glow transition
```

---

### FASE 3: Notificacoes no MobileSidebar

Adicionar o NotificationDropdown na sidebar mobile para paridade de funcionalidades.

**Alteracoes:**
- Importar `NotificationDropdown` de `@/components/notifications/NotificationDropdown`
- Adicionar botao/area de notificacoes antes da secao do usuario
- Manter mesmo estilo glass e transicoes

---

### FASE 4: Refinamentos Adicionais

**4.1 - Melhorar Transicoes em Hooks**

Adicionar `onMutate` para optimistic updates onde apropriado para feedback instantaneo.

**4.2 - Toast Notifications Contextuais**

Tornar mensagens de toast mais descritivas:
- "Requisito 'Nome do requisito' adicionado"
- "Arquivo 'documento.pdf' enviado com sucesso"

---

### Resumo de Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useProjects.tsx` | Adicionar logs de atividade para create/update |
| `src/hooks/useRequirements.tsx` | Adicionar logs para create/toggle + refatorar para aceitar callbacks |
| `src/hooks/useMeetings.tsx` | Adicionar log para create |
| `src/hooks/useProjectFiles.tsx` | Adicionar logs para upload/delete |
| `src/hooks/useRequirementComments.tsx` | Adicionar log para create + aceitar projectId |
| `src/components/projects/RequirementComments.tsx` | Redesign premium completo |
| `src/components/layout/MobileSidebar.tsx` | Adicionar NotificationDropdown |

---

### Detalhes Tecnicos

**Importacoes necessarias:**
```text
import { logProjectActivity } from './useActivityLogs';
import { useAuth } from './useAuth'; // onde nao existir
```

**Padrao de log:**
```text
// No onSuccess das mutations:
logProjectActivity(
  projectId,
  user.id,
  'action_type',
  'Descricao legivel',
  { metadata_opcional }
);
```

**Nota:** Os logs sao assincronos e nao bloqueiam a UI. Erros de log sao silenciosos (apenas console.error).

---

### Ordem de Implementacao

1. Atualizar `useProjects.tsx` com logs automaticos
2. Atualizar `useRequirements.tsx` com logs
3. Atualizar `useMeetings.tsx` e `useProjectFiles.tsx` com logs
4. Atualizar `useRequirementComments.tsx` (adicionar projectId e log)
5. Redesign premium do `RequirementComments.tsx`
6. Adicionar notificacoes no `MobileSidebar.tsx`

---

### Resultado Esperado

Apos implementacao:
- Timeline de atividades sera preenchida automaticamente com todas as acoes do usuario
- Comentarios terao visual premium consistente com o resto do sistema
- Mobile tera paridade de funcionalidades com desktop (notificacoes)
- Experiencia mais rica e profissional em todas as interacoes
