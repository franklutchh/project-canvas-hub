import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { project, requirements, meetings, files, tags } = await req.json();

    const completedReqs = requirements?.filter((r: any) => r.completed) || [];
    const pendingReqs = requirements?.filter((r: any) => !r.completed) || [];

    const projectContext = `
## Dados do Projeto

**Nome:** ${project.name}
**Status:** ${project.status}
**Cor/Identidade Visual:** ${project.visual_identity || "Não definida"}

### Cliente
- **Nome:** ${project.client_name || "Não informado"}
- **Email:** ${project.client_email || "Não informado"}
- **Telefone:** ${project.client_phone || "Não informado"}
- **Empresa:** ${project.client_company || "Não informada"}

### Prazos
- **Início:** ${project.deadline_start || "Não definido"}
- **Fim:** ${project.deadline_end || "Não definido"}

### Orçamento
- **Valor:** ${project.budget_value ? `R$ ${project.budget_value}` : "Não definido"}
- **Método de Pagamento:** ${project.budget_payment_method || "Não definido"}

### Preferências de Design
${project.design_preferences || "Nenhuma preferência registrada"}

### Tags
${tags?.length ? tags.map((t: any) => `- ${t.name}`).join("\n") : "Nenhuma tag"}

### Requisitos Concluídos (${completedReqs.length})
${completedReqs.length ? completedReqs.map((r: any, i: number) => `${i + 1}. ✅ ${r.title}${r.description ? ` — ${r.description}` : ""}`).join("\n") : "Nenhum"}

### Requisitos Pendentes (${pendingReqs.length})
${pendingReqs.length ? pendingReqs.map((r: any, i: number) => `${i + 1}. ⬜ ${r.title}${r.description ? ` — ${r.description}` : ""}`).join("\n") : "Nenhum"}

### Reuniões Registradas (${meetings?.length || 0})
${meetings?.length ? meetings.map((m: any) => `- ${m.date}${m.notes ? `: ${m.notes}` : ""}`).join("\n") : "Nenhuma reunião"}

### Arquivos do Projeto (${files?.length || 0})
${files?.length ? files.map((f: any) => `- ${f.name} (${f.type || "tipo desconhecido"})`).join("\n") : "Nenhum arquivo"}
`.trim();

    const systemPrompt = `Você é um Product Manager sênior especialista em documentação de software. Gere um PRD (Product Requirements Document) profissional, completo e detalhado em português brasileiro baseado nos dados do projeto fornecido.

O PRD deve conter as seguintes seções:

# 1. Visão Geral do Produto
Resumo executivo do projeto, propósito e proposta de valor.

# 2. Objetivos e Metas
Objetivos SMART baseados nos dados do projeto.

# 3. Público-Alvo e Personas
Inferir personas baseadas no contexto do cliente e do projeto.

# 4. Escopo Funcional
Listar todas as funcionalidades baseadas nos requisitos, separando em:
- Funcionalidades Core (requisitos existentes)
- Funcionalidades Sugeridas (baseadas no contexto)

# 5. Requisitos Não-Funcionais
Performance, segurança, usabilidade, compatibilidade.

# 6. Arquitetura Sugerida
Stack tecnológica e arquitetura recomendada.

# 7. Design e UX
Guidelines baseadas nas preferências de design e identidade visual.

# 8. Cronograma e Milestones
Baseado nos prazos definidos, criar fases e marcos.

# 9. Orçamento e Investimento
Detalhamento baseado no valor e método de pagamento.

# 10. Riscos e Mitigações
Identificar riscos potenciais e estratégias de mitigação.

# 11. Critérios de Aceite
Para cada requisito, definir critérios claros de aceite.

# 12. Próximos Passos
Ações imediatas recomendadas.

Regras:
- Use markdown formatado com headers, listas e tabelas
- Seja profissional mas objetivo
- Infira informações quando os dados forem insuficientes, mas sinalize como "[Inferido]"
- Inclua métricas e KPIs quando possível
- O documento deve ser completo e pronto para uso`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere um PRD completo para o seguinte projeto:\n\n${projectContext}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Configurações." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar PRD" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-prd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
