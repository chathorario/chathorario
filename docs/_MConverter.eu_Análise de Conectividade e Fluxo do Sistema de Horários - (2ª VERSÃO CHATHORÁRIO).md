# Análise de Conectividade e Fluxo do Sistema de Horários

Esta análise examina o código-fonte do sistema \"ChatHorário\"
(sistema_testes.html) com o objetivo específico de identificar falhas de
conexão, código órfão ou erros de lógica que possam **impedir um
utilizador de completar o fluxo e gerar um horário escolar.**

## Conclusão Geral

Após uma análise detalhada do fluxo de estados (conversationState) no
handleUserInput, **não foram identificados erros críticos que impeçam o
utilizador de gerar um horário.**

O fluxo principal, desde \"Começar do Zero\" (CRIAR_NOVO) até
\"Confirmar e Gerar Horário\" (CONFIRMAR_CONFIGS_GERAR), está
**completo, conectado e funcional.** As validações intermediárias (como
a soma de aulas das disciplinas e a carga horária dos professores)
funcionam como \"portões de qualidade\" que forçam a correção antes de
prosseguir, o que é uma funcionalidade intencional, não um erro.

No entanto, a análise identificou duas categorias de problemas:
\"Funcionalidades Desconectadas\" (código órfão de versões anteriores) e
\"Pontos de Fricção\" (decisões de design que podem confundir o
utilizador, mas não bloqueiam o processo).

## 1. Análise do Fluxo Principal (O \"Caminho Feliz\") {#análise-do-fluxo-principal-o-caminho-feliz}

O fluxo principal do sistema é robusto e totalmente conectado. Cada
etapa salva os dados necessários e passa corretamente para a próxima.

O utilizador é guiado pela seguinte cadeia de estados, que não apresenta
quebras:

1.  **Início:** START -\> exibirTelaDeBoasVindas().

2.  **Config. Escola:** O utilizador seleciona CRIAR_NOVO. O sistema
    > passa pelos estados AWAITING_ANO_REFERENCIA -\>
    > AWAITING_NIVEL_ENSINO -\> AWAITING_TURNO -\>
    > AWAITING_HORARIO_INICIO_AULAS -\> AWAITING_DURACAO_AULA e pelo
    > loop de AWAITING_QTD_INTERVALOS.

3.  **Confirmação Escola:** O estado CONFIRMAR_CONFIG_ESCOLA (ação
    > CONFIRMAR_CONFIG_ESCOLA_PROSSEGUIR) chama
    > iniciarContagemDeTurmas().

4.  **Cadastro de Turmas (Tabelas):**

    - O loop proximaPerguntaContagemTurma() (estado
      > AGUARDANDO_CONTAGEM_DE_TURMA) recolhe os dados.

    - Ao terminar, chama exibirTabelaDeCadastroDeTurmas() (estado
      > PREENCHENDO_TABELA_TURMAS).

    - A ação SALVAR_TURMAS_DA_TABELA chama salvarTurmasDaTabela(), que
      > por sua vez chama mostrarTabelaTurmasCadastradas().

    - O sistema entra em EDITANDO_TABELA_TURMAS.

5.  **Cadastro de Disciplinas (Tabela):** A ação SALVAR_EDICOES_TURMAS
    > (no estado EDITANDO_TABELA_TURMAS) chama
    > salvarEdicoesDaTabelaDeTurmas(). Se for bem-sucedido, avança para
    > iniciarCadastroDisciplinas(), definindo o estado como
    > EDITANDO_TABELA_DISCIPLINAS.

6.  **Cadastro de Professores (Tabela):** A ação
    > SALVAR_DADOS_DISCIPLINAS (no estado EDITANDO_TABELA_DISCIPLINAS)
    > chama salvarDadosDasDisciplinas(). Esta função valida os totais de
    > aulas. Se for bem-sucedido, avança para
    > exibirTabelaDeProfessores(), definindo o estado como
    > EDITANDO_TABELA_PROFESSORES.

7.  **Grade de Indisponibilidade (Tabela):** A ação
    > SALVAR_DADOS_PROFESSORES (no estado EDITANDO_TABELA_PROFESSORES)
    > chama salvarDadosDaTabelaProfessores(). Se for bem-sucedido,
    > avança para exibirTabelaDeIndisponibilidadeGeral(), definindo o
    > estado como CONFIGURANDO_INDISPONIBILIDADE_GERAL.

8.  **Relacionamento (Tabela):** A ação SALVAR_INDISPONIBILIDADE_GERAL
    > avança para exibirTabelaDeRelacionamentoFinal(), definindo o
    > estado como RELACIONAMENTO_FINAL.

9.  **Validação de Carga Horária:** A ação CONCLUIR_E_VALIDAR chama
    > validarCargaHorariaProfessores(). Esta é a verificação de
    > \"portão\" mais importante.

    - *Se falhar:* Entra num loop de correção
      > (HANDLE_CORRECTION_CHOICE), o que é intencional.

    - *Se for bem-sucedido:* Avança para exibirTelaConfiguracaoFinal(),
      > definindo o estado como AWAITING_FINAL_CONFIG_CONFIRMATION.

10. **Geração:** A ação CONFIRMAR_CONFIGS_GERAR recolhe os parâmetros
    > finais, chama a função adaptarGradeGeralParaProfessores() (que
    > \"traduz\" a nova grade de indisponibilidade para o formato que o
    > algoritmo genético entende) e, finalmente, chama
    > iniciarGeracaoComAlgoritmoGenetico(true).

11. **Fim:** O algoritmo gera o horário e apresenta o menu final
    > (apresentarMenuPosGeracao()).

**Conclusão do Fluxo:** O caminho principal está intacto e funcional.

## 2. Funcionalidades Desconectadas (Código Órfão) {#funcionalidades-desconectadas-código-órfão}

A análise identificou um conjunto de funcionalidades e estados de
conversação que estão presentes no código, mas **não estão ligados ao
fluxo principal**. Este é um \"código morto\" ou \"órfão\",
provavelmente de uma versão anterior do sistema.

**Isto não impede a geração do horário**, pois as novas funcionalidades
(baseadas em tabelas) substituíram estas antigas.

1.  **Botões \"Mortos\" na Tabela de Professores:**

    - Na função exibirTabelaDeProfessores(), os botões \"Disciplinas\"
      > (editar-disciplinas-btn) e \"Disponibilidade\"
      > (editar-disponibilidade-btn) são criados para cada professor.

    - **Problema:** Os *event listeners* para estes botões (adicionados
      > em tabelaBody.addEventListener(\'click\', \...)), apenas
      > executam addBotMessage(\...), informando que a funcionalidade
      > \"está a ser conectada\". Eles não ativam nenhuma lógica.

2.  **Fluxo de Edição de Professor Órfão:**

    - O código contém um conjunto completo de estados switch para editar
      > professores individualmente:

      - AWAITING_PROFESSOR_EDIT_ACTION

      - AWAITING_PROF_TO_RENAME_SELECTION

      - AWAITING_NEW_PROFESSOR_NAME

      - AWAITING_PROFESSOR_TO_EDIT_SELECTION

      - CONFIGURANDO_GRADE_PROFESSOR_EDICAO

    - **Problema:** Absolutamente **nenhuma parte do fluxo atual leva a
      > estes estados**. A função exibirTabelaDeProfessores (a única
      > tela de gestão de professores) define o estado como
      > EDITANDO_TABELA_PROFESSORES, que apenas ouve a ação
      > SALVAR_DADOS_PROFESSORES.

    - Isto significa que a antiga função
      > exibirGradeDisponibilidadeParaProfessor (o editor de
      > disponibilidade *individual*) também é órfã, tendo sido
      > substituída pela exibirTabelaDeIndisponibilidadeGeral.

3.  **Fluxo de Cadastro de Professor Antigo:**

    - Da mesma forma, o fluxo de cadastro individual de professores
      > (CADASTRO_PROFESSOR_NOME, CADASTRO_PROFESSOR_DISCIPLINAS,
      > CADASTRO_PROFESSOR_AULAS_SALA, CONFIGURANDO_GRADE_PROFESSOR) **é
      > código órfão**.

    - **Problema:** A nova função exibirTabelaDeProfessores permite
      > adicionar professores diretamente na tabela. Quando o utilizador
      > clica em \"Salvar e Prosseguir\" (SALVAR_DADOS_PROFESSORES), o
      > sistema avança para a exibirTabelaDeIndisponibilidadeGeral(),
      > ignorando completamente este fluxo de cadastro antigo.

## 3. Pontos de Fricção (Design, Não Erros) {#pontos-de-fricção-design-não-erros}

Existem duas decisões de design no fluxo de correção que, embora
funcionais, podem ser confusas para o utilizador. Elas não bloqueiam o
sistema, mas forçam uma repetição de trabalho.

1.  **Progressão Linear Forçada (Sem \"Saltos\"):**

    - O sistema é uma \"linha de montagem\". Se o utilizador está na
      > Etapa 5 (Relacionamento) e usa o menu lateral para \"Corrigir
      > Turmas\" (Etapa 2), o sistema não o devolve à Etapa 5.

    - **Fluxo Real:** O utilizador é enviado para a tela de edição de
      > turmas (EDITANDO_TABELA_TURMAS). Ao salvar, ele é **forçado a
      > passar pela Etapa 3 (Disciplinas) e Etapa 4 (Professores)
      > novamente**, antes de poder chegar à Etapa 5 (Relacionamento).

    - **Impacto:** Isto não é um bug, mas sim um design rígido que
      > garante a integridade dos dados (uma mudança nas turmas *deve*
      > forçar uma revisão das disciplinas).

2.  **Ação de Correção Destrutiva:**

    - Se o utilizador usar o menu lateral para \"Corrigir Configurações
      > da Escola\" (CORRIGIR_ESCOLA_GLOBAL), o handleUserInput chama
      > resetarDadosParaNovoHorario().

    - **Impacto:** Esta função apaga **todos** os dados (Turmas,
      > Disciplinas, Professores, etc.), não apenas as configurações da
      > escola. O utilizador que queria apenas mudar o turno de
      > \"Manhã\" para \"Tarde\" perderá todo o seu trabalho de
      > cadastro. Esta ação é funcional, mas drástica.
