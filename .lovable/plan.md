
## Plano de Potencializacao Avancada do DevClient Pro

### Visao Geral

Continuando a transformacao do sistema, esta fase implementara:
1. **Skeleton Loaders Premium** - Loading states elegantes sem forcar tela de loading
2. **Pagina 404 Premium** - Redesign completo da pagina NotFound
3. **Sistema de Busca Global** - Command Palette com Cmd+K
4. **Notificacoes em Tempo Real** - Sistema de alertas com badge no header
5. **Timeline de Atividades** - Historico de acoes por projeto
6. **Melhorias de UX** - Atalhos de teclado e microinteracoes

---

### FASE 1: Skeleton Loaders Premium

**1.1 - Novo Componente (src/components/ui/skeleton-card.tsx)**

Skeleton loader customizado para cards de projeto:
- Animacao shimmer premium com gradiente metalico
- Formato que espelha o ProjectCard real
- Transicao suave para conteudo carregado

**1.2 - Skeleton para Stats (src/components/ui/skeleton-stats.tsx)**

Skeleton para os cards de estatisticas:
- 4 cards com shimmer sincronizado
- Altura e espacamento identicos aos reais

**1.3 - Atualizacao do Dashboard**

Substituir PremiumLoader por skeletons contextuais:
- Mostrar skeleton de stats + skeleton de cards
- Transicao instantanea para dados reais
- Experiencia mais fluida sem tela bloqueante

---

### FASE 2: Pagina 404 Premium

**Redesign completo (src/pages/NotFound.tsx)**

Elementos:
- Background com gradiente radial e efeitos de particulas animadas
- Numero "404" gigante com gradiente metalico
- Icone animado flutuante (Compass ou Globe)
- Mensagem em portugues com tom amigavel
- Botoes glass para "Voltar" e "Ir ao Dashboard"
- Animacoes de entrada staggered

---

### FASE 3: Sistema de Busca Global

**3.1 - Novo Componente (src/components/search/GlobalSearch.tsx)**

Command Palette usando cmdk (ja instalado):
- Ativar com Cmd+K ou Ctrl+K
- Buscar projetos por nome, cliente, empresa
- Buscar requisitos por titulo
- Navegacao rapida entre paginas
- Historico de buscas recentes (localStorage)
- Design glass com backdrop blur

**3.2 - Integracao no AppLayout**

Adicionar:
- Listener de teclado global para Cmd+K
- Indicador visual no header/sidebar
- Shortcut hint sutil

**3.3 - Hook de Busca (src/hooks/useGlobalSearch.tsx)**

Funcionalidades:
- Busca em projetos carregados
- Busca em requisitos (lazy load)
- Debounce de 150ms
- Ordenacao por relevancia

---

### FASE 4: Sistema de Notificacoes

**4.1 - Migracao de Banco de Dados**

Nova tabela `notifications`:
```text
id: uuid (PK)
user_id: uuid (FK to auth.users, NOT NULL)
type: text (comment, deadline, status_change)
title: text (NOT NULL)
message: text
read: boolean (default false)
project_id: uuid (nullable, FK to projects)
created_at: timestamp
```

RLS Policies:
- SELECT: user_id = auth.uid()
- UPDATE: user_id = auth.uid()
- DELETE: user_id = auth.uid()

Enable realtime para updates instantaneos.

**4.2 - Hook de Notificacoes (src/hooks/useNotifications.tsx)**

Funcionalidades:
- Query de notificacoes nao lidas
- Mutation para marcar como lida
- Subscription realtime para novas notificacoes
- Contagem de nao lidas

**4.3 - Componente Dropdown (src/components/notifications/NotificationDropdown.tsx)**

Design premium:
- Icone de sino com badge contador animado (pulse)
- Dropdown glass com lista de notificacoes
- Items com icone por tipo, titulo, tempo relativo
- Botao "Marcar todas como lidas"
- Estado vazio elegante

**4.4 - Integracao na Sidebar**

Adicionar notificacao dropdown:
- Posicionar proximo ao usuario
- Badge visivel quando ha nao lidas

---

### FASE 5: Timeline de Atividades

**5.1 - Migracao de Banco de Dados**

Nova tabela `activity_logs`:
```text
id: uuid (PK)
project_id: uuid (FK to projects, NOT NULL)
user_id: uuid (NOT NULL)
action_type: text (created, updated, status_changed, file_uploaded, comment_added)
description: text (NOT NULL)
metadata: jsonb (dados extras como {old_status, new_status})
created_at: timestamp
```

RLS Policies:
- SELECT: project owner only
- INSERT: project owner only

**5.2 - Hook de Atividades (src/hooks/useActivityLogs.tsx)**

Funcionalidades:
- Query de atividades por projeto
- Paginacao ou infinite scroll
- Mutation para criar log

**5.3 - Componente Timeline (src/components/projects/ActivityTimeline.tsx)**

Design:
- Linha vertical conectando items
- Circulos com icones por tipo de acao
- Cards glass com descricao e timestamp
- Avatar do usuario (se disponivel)
- Animacao de entrada escalonada

**5.4 - Integracao no ProjectDetail**

Adicionar nova tab "Atividades":
- Mostrar timeline cronologica
- Filtro por tipo de acao (opcional)

---

### FASE 6: Melhorias de UX

**6.1 - Componente RequirementComments Premium**

Atualizar design:
- Cards glass para comentarios
- Avatar com icone ou inicial
- Input/Textarea com estilo glass
- Botao Send premium

**6.2 - Atalhos de Teclado Globais**

Implementar no AppLayout:
- `N`: Ir para Novo Projeto
- `/` ou `Cmd+K`: Abrir busca
- `G+D`: Ir para Dashboard
- `G+A`: Ir para Analytics
- `G+S`: Ir para Settings
- `?`: Mostrar modal de atalhos

**6.3 - Modal de Atalhos (src/components/ui/keyboard-shortcuts-modal.tsx)**

Design:
- Lista formatada de atalhos
- Teclas estilizadas como badges
- Abrir com tecla "?"

---

### Resumo de Arquivos

**CRIAR:**
1. `src/components/ui/skeleton-card.tsx` - Skeleton para ProjectCard
2. `src/components/ui/skeleton-stats.tsx` - Skeleton para Stats
3. `src/components/search/GlobalSearch.tsx` - Command Palette
4. `src/hooks/useGlobalSearch.tsx` - Hook de busca
5. `src/components/notifications/NotificationDropdown.tsx` - Dropdown de notificacoes
6. `src/hooks/useNotifications.tsx` - Hook de notificacoes
7. `src/components/projects/ActivityTimeline.tsx` - Timeline de atividades
8. `src/hooks/useActivityLogs.tsx` - Hook de atividades
9. `src/components/ui/keyboard-shortcuts-modal.tsx` - Modal de atalhos

**ATUALIZAR:**
1. `src/pages/NotFound.tsx` - Redesign premium 404
2. `src/pages/Dashboard.tsx` - Usar skeleton loaders
3. `src/components/layout/Sidebar.tsx` - Adicionar notifications e shortcuts
4. `src/components/layout/AppLayout.tsx` - Global search e keyboard listeners
5. `src/pages/ProjectDetail.tsx` - Nova tab Atividades
6. `src/components/projects/RequirementComments.tsx` - Design premium
7. `src/types/database.ts` - Tipos para notifications e activity_logs

**MIGRACOES:**
1. Tabela `notifications` com RLS e realtime
2. Tabela `activity_logs` com RLS

---

### Ordem de Implementacao

1. Skeletons e 404 (visual, sem dependencias)
2. Busca Global (melhoria de UX imediata)
3. Migracoes de banco (notifications, activity_logs)
4. Sistema de Notificacoes (apos migracao)
5. Timeline de Atividades (apos migracao)
6. Atalhos de Teclado (finalizacao)

---

### Principios Mantidos

- **Performance First**: Skeletons ao inves de loading blocante
- **Glassmorphism Consistente**: Todos novos componentes seguem o design system iOS 26
- **Animacoes Fluidas**: Transicoes de 0.2-0.4s, entrada staggered
- **Realtime**: Notificacoes instantaneas via Supabase Realtime
- **Acessibilidade**: Atalhos de teclado e feedback visual
