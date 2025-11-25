**Título**
- Revitalizacao_Visual_Design

**Objetivo**
- Documentar padrões visuais e de layout do diretório `ExemploDesign` aplicáveis ao projeto atual, focando em dashboards, grids, cards, gráficos, menus, cabeçalhos e rodapés.
- Excluir explicitamente qualquer alteração de landing page.

**Escopo**
- Dashboards (KPIs, Ações Rápidas, Atividades Recentes, Gráficos).
- Grids e Cards.
- Menus (dropdown, navigation), com atenção a animações.
- Cabeçalho e Rodapé institucionais.
- Sidebar colapsável.
- Componentes Radix UI (tabs, select, tooltip).
- Temas por módulo e utilitários de badges/estados.

**Padrões Reutilizáveis (ExemploDesign)**
- Cards e Grid
  - `src/components/dashboard/StatsCards.tsx`: grade responsiva `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`, microinterações `transition-smooth`, `hover-scale`, `animate-fade-in`.
  - `src/components/ui/card.tsx`: componentes `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` com tipografia consistente.
  - `src/index.css`: classe utilitária `card-edu` (`bg-card`, `border`, `rounded-lg`, `p-6`, sombra padronizada).
- Ações Rápidas
  - `src/components/dashboard/QuickActions.tsx`: grade de botões estilo “cards” (`Button variant="outline"`), integração de tema por módulo via `useModuleTheme`.
- Atividades Recentes
  - `src/components/dashboard/RecentActivity.tsx`: lista com ícone, título, badge de status e tempo; hover sutil.
  - `src/utils/badge-colors.ts`: utilitários `getStatusColor`/`getStatusLabel` para estados consistentes.
- Gráficos
  - `src/components/ui/chart.tsx`: `ChartContainer` com CSS vars por série (`--color-<key>`), padroniza tipografia e grid; `ChartTooltipContent` flexível.
  - `src/components/dashboard/InteractiveCharts.tsx`: tabs + cards + `ResponsiveContainer` (altura recomendada: 400) para diferentes tipos de gráfico (linha, barra, pizza, área).
- Menus
  - `src/components/ui/dropdown-menu.tsx`: conteúdo em `Portal` com classes de animação (avaliar remoção em headers sticky para evitar deslocamento visual).
  - `src/components/ui/navigation-menu.tsx`: `Viewport` com animações; usar com parcimônia em cabeçalhos fixos.
- Cabeçalho
  - `src/components/layout/Header.tsx`: `header-edu` com barra de busca, ícone de notificações e menu do usuário com Avatar e dados (CPF, matrícula, e-mail).
  - `src/index.css`: `header-edu` com bordas e sombra, `--gradient-header` disponível.
- Rodapé
  - `src/components/layout/Footer.tsx`: `footer-edu` com grid de contato/links úteis e separador com logo; sombra superior e borda.
- Sidebar
  - `src/components/layout/Sidebar.tsx`: colapsável com `Tooltip` para ícones; cores/descrições por módulo; transições suaves.
- Componentes Radix UI
  - `src/components/ui/tabs.tsx`: triggers com `data-[state=active]` e foco acessível.
  - `src/components/ui/select.tsx`: trigger com sombra; viewport popper; atenção às animações.
  - `src/components/ui/tooltip.tsx`: conteúdo com animação; utilizar sem causar “jolt” em headers fixos.
- Tema por módulo
  - `src/lib/theme-config.ts`: `moduleThemes` e `useModuleTheme` retornam classes (`primary`, `secondary`, `accent`, `badge`, `card`, `cardBorder`, etc.) para cada módulo (dashboard, documentos, processos, …).
- Badges e estados
  - `src/utils/badge-colors.ts`: cores/labels padronizadas para encomendas, processos, prazos, uploads, etc.

**Diretrizes de Integração (ChatHorario)**
- Tokens e classes globais
  - Adotar os tokens HSL e utilitários do `ExemploDesign/src/index.css`: `--primary`, `--accent-*`, `--card`, `--popover`, `--input`, `transition-smooth`, `hover-scale`, `micro-bounce`, `header-edu`, `footer-edu`, `card-edu`.
  - Padronizar `Card` + `CardHeader` + `CardTitle` + `CardContent` nos cards e seções.
- Dashboards
  - KPIs: replicar a grade e o estilo de `StatsCards.tsx` (valores, variações, ícones com cores semânticas).
  - Ações Rápidas: incluir seção baseada em `QuickActions.tsx` e usar `useModuleTheme` para cores coerentes por módulo.
  - Atividades Recentes: adicionar uma lista com badges usando `badge-colors.ts`.
- Gráficos
  - Envolver gráficos Recharts em `ChartContainer` e `ResponsiveContainer`, padronizando altura em 400 e tooltips com `ChartTooltipContent` quando aplicável.
- Menus
  - Dropdown/Navigation: manter ou reduzir animações para evitar “jolt” em headers sticky; usar `sideOffset` e `align="end"`.
- Cabeçalho e Rodapé
  - Cabeçalho: usar `header-edu`, barra de pesquisa central e ícone de notificações com contador discreto, Avatar com fallback de iniciais.
  - Rodapé: adotar `footer-edu` com três colunas (informações, contato, links úteis) e linha de separação com logo.
- Sidebar (opcional)
  - Implementar uma barra lateral colapsável com ícones e tooltips se a navegação do projeto se beneficiar.
- Radix UI
  - Unificar `Tabs`, `Select`, `Tooltip` com as bases do `ExemploDesign`, cuidando de animações em cabeçalhos fixos.
- Tema por módulo
  - Introduzir `theme-config` simplificado e aplicar `useModuleTheme` em botões/cards/badges conforme a área.
- Badges e estados
  - Centralizar uso de `badge-colors.ts` para evitar estilos ad hoc de status/labels.

**Decisões já aplicadas no projeto atual**
- Dropdown sem animações: removidas classes de animação em `src/components/ui/dropdown-menu.tsx` para reduzir deslocamento visual ao abrir/fechar.
- Avatar modernizado: `src/components/layout/Header.tsx` e `src/components/layout/EscolaHeader.tsx` atualizados com ring sutil, fallback em gradiente e indicador de status; `DropdownMenuContent` com `sideOffset={8}` e label de papel estilizada.

**Checklist de Próximos Passos (sugerido)**
- Adotar `card-edu` e tokens HSL no `src/index.css` do ChatHorario.
- Criar seção de KPIs estilo `StatsCards` nas páginas de dashboard relevantes.
- Incluir “Ações Rápidas” com `useModuleTheme` para cores coerentes por módulo.
- Envolver gráficos existentes em `ChartContainer` e padronizar tooltips.
- Unificar `Tabs`, `Select`, `Tooltip` e revisar animações em menus/dropdowns.
- Consolidar `header-edu` com barra de busca e notificações; aplicar `footer-edu`.
- Centralizar badges de estado com `badge-colors.ts`.

**Referências de Arquivos**
- ExemploDesign (base de padrões)
  - `src/components/dashboard/StatsCards.tsx`, `QuickActions.tsx`, `RecentActivity.tsx`, `InteractiveCharts.tsx`.
  - `src/components/ui/card.tsx`, `chart.tsx`, `tabs.tsx`, `select.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `navigation-menu.tsx`.
  - `src/components/layout/Header.tsx`, `Footer.tsx`, `Sidebar.tsx`, `Layout.tsx`.
  - `src/lib/theme-config.ts`, `src/utils/badge-colors.ts`, `src/index.css`.
- ChatHorario (pontos de integração)
  - `src/pages/Dashboards/` e `src/pages/Escola/` para dashboards e gráficos.
  - `src/components/layout/` para Header, Footer, Sidebar.
  - `src/components/ui/` para unificação de `Card`, `Dropdown`, `Tabs`, `Select`, `Tooltip`.
  - `src/index.css` para tokens/variáveis HSL e classes utilitárias.

**Observações Finais**
- Evitar alterações na landing page.
- Ao integrar menus/dropdowns em headers sticky, manter animações discretas ou desabilitadas para prevenir deslocamentos visuais.
- Reutilizar ao máximo as classes utilitárias e o tema por módulo para consistência.