

## Plano: Gerador de PRD com IA integrado ao projeto

### O que sera feito

Adicionar um botao "Gerar PRD com IA" na pagina do projeto que coleta todos os dados do projeto (requisitos, design, orcamento, reunioes, arquivos, tags) e envia para uma Edge Function que usa Lovable AI para gerar um PRD (Product Requirements Document) completo e profissional. O resultado sera exibido em um dialog premium com opcao de copiar ou exportar.

---

### Componentes

**1. Edge Function `generate-prd` (`supabase/functions/generate-prd/index.ts`)**

- Recebe todos os dados do projeto via POST
- Monta um prompt detalhado com: info do projeto, cliente, requisitos (completos/pendentes), preferencias de design, orcamento, prazos, reunioes, arquivos, tags
- Chama Lovable AI (`google/gemini-3-flash-preview`) com prompt de sistema instruindo a gerar um PRD profissional em portugues
- Retorna o PRD em streaming SSE para exibicao progressiva
- Trata erros 429/402

**2. Componente `GeneratePRDDialog` (`src/components/projects/GeneratePRDDialog.tsx`)**

- Dialog premium com glassmorphism
- Botao de acao com icone Sparkles "Gerar PRD com IA"
- Estado de loading com animacao
- Exibe o PRD gerado com markdown renderizado (react-markdown)
- Botoes: Copiar para clipboard, Gerar novamente
- Streaming token-by-token para feedback imediato

**3. Hook `useGeneratePRD` (`src/hooks/useGeneratePRD.tsx`)**

- Coleta dados do projeto: project, requirements, meetings, files, tags, comments
- Monta payload estruturado
- Gerencia streaming da edge function
- Estados: idle, generating, done, error

**4. Integracao no `ProjectDetail.tsx`**

- Adicionar botao "Gerar PRD" ao lado dos botoes existentes (Export PDF, Share, Edit)
- Icone Sparkles com estilo premium/glow

---

### Fluxo do usuario

1. Usuario abre um projeto
2. Clica em "Gerar PRD com IA" (botao com icone Sparkles)
3. Dialog abre mostrando "Analisando projeto..."
4. IA analisa todos os dados e gera o PRD em tempo real (streaming)
5. PRD completo aparece formatado com markdown
6. Usuario pode copiar ou gerar novamente

---

### Prompt da IA (resumo)

Sistema instrui a IA a atuar como Product Manager senior e gerar um PRD contendo:
- Visao geral e objetivos
- Personas e publico-alvo (inferidos do contexto)
- Escopo funcional baseado nos requisitos
- Requisitos nao-funcionais
- Arquitetura sugerida
- Design system baseado nas preferencias
- Cronograma baseado nos prazos
- Orcamento e modelo de pagamento
- Riscos e mitigacoes
- Criterios de aceite por requisito

---

### Arquivos

| Acao | Arquivo |
|------|---------|
| Criar | `supabase/functions/generate-prd/index.ts` |
| Criar | `src/components/projects/GeneratePRDDialog.tsx` |
| Criar | `src/hooks/useGeneratePRD.tsx` |
| Editar | `src/pages/ProjectDetail.tsx` (adicionar botao) |

### Dependencia

- `react-markdown` (verificar se ja esta instalado, senao adicionar)

