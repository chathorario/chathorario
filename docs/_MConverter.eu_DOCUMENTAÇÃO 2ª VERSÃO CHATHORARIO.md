# Documentação do Sistema: ChatHorário (Gerador de Horários)

## 1. Alerta Importante: O Ficheiro é um Gerador de Horários {#alerta-importante-o-ficheiro-é-um-gerador-de-horários}

O ficheiro sistema_testes.html não é um sistema de testes ou quiz. O seu
conteúdo é um aplicativo web completo, robusto e funcional para a
**criação, gestão e otimização de horários escolares**.

O sistema utiliza uma interface de chatbot para guiar o utilizador
através de um fluxo de trabalho complexo, recolhendo todos os dados
necessários antes de usar um **Algoritmo Genético (GeneticScheduler)**
para gerar um horário otimizado.

## 2. Funcionalidades Existentes (O que o Sistema Já Faz) {#funcionalidades-existentes-o-que-o-sistema-já-faz}

O sistema é dividido em cinco módulos principais, todos geridos através
da interface do chatbot ou de tabelas/grades interativas.

### Módulo 1: Configuração de Dados (Wizard)

Este módulo guia o utilizador passo a passo para configurar a estrutura
base da escola.

- **Configuração da Escola:** Define dados globais como Ano de
  > Referência, Nível de Ensino (Fundamental ou Médio), Turno, Horário
  > de Início das aulas, Duração padrão da aula (em minutos) e a
  > configuração de Intervalos (quantos, duração e após qual aula
  > ocorrem).

- **Cadastro de Turmas (em Tabela):** O utilizador informa quantas
  > turmas existem por série/ano (ex: 3 turmas do 1º Ano). O sistema
  > então apresenta uma tabela dinâmica para nomear cada turma (ex: 1ºA,
  > 1ºB, 1ºC) e definir o número de aulas diárias para cada uma.

- **Cadastro de Disciplinas (Grade Curricular):** O sistema exibe uma
  > tabela de grade curricular. O utilizador cadastra as disciplinas
  > (ex: Matemática, Física) e define a *quantidade de aulas semanais*
  > dessa disciplina para *cada turma*. O sistema valida se a soma das
  > aulas bate com o total semanal da turma.

- **Cadastro de Professores (em Tabela):** Uma interface em tabela para
  > adicionar professores, definindo o Nome, Carga Horária total (CH),
  > aulas de Planeamento (P) e Hora Atividade (HA).

### Módulo 2: Alocação e Restrições

Este módulo trata das regras e atribuições complexas.

- **Grade de Indisponibilidade Geral:** Uma funcionalidade avançada onde
  > o administrador, numa única grade visual (Horário x Dia da Semana),
  > aloca as indisponibilidades de *todos* os professores. O
  > administrador seleciona um professor, uma sigla (P, HA, ND) e clica
  > nos horários para alocar. O sistema contabiliza as alocações (ex:
  > 3/5 HA alocadas).

- **Relacionamento Professor-Disciplina-Turma:** Uma interface
  > interativa de 3 colunas (Professores, Disciplinas, Turmas) permite
  > ao administrador selecionar um professor (ex: \"João\"), uma
  > disciplina (ex: \"Matemática\") e clicar nas turmas (ex: \"1ºA\",
  > \"1ºB\") para atribuir \"João\" como o professor de Matemática
  > dessas turmas instantaneamente.

- **Validação de Carga Horária:** Antes de gerar o horário, o sistema
  > **valida** se algum professor tem mais aulas atribuídas do que
  > horários disponíveis (considerando sua disponibilidade). Se houver
  > conflito, o sistema impede a geração e força uma correção.

### Módulo 3: Geração do Horário (O Núcleo)

Esta é a funcionalidade principal do seu sistema.

- **Algoritmo Genético (GeneticScheduler):** O sistema não faz um
  > simples sorteio. Ele usa um algoritmo genético complexo para criar
  > uma \"população\" de horários e \"evoluí-los\" ao longo de várias
  > gerações (ex: 100 gerações) para encontrar a melhor solução
  > possível.

- **Barra de Progresso:** Durante a geração, uma barra de progresso
  > informa ao utilizador o andamento da otimização.

- **Gestão de Restrições (Inteligência):**

  - **Restrições Duras (Obrigatórias):** O algoritmo penaliza
    > severamente (e tenta a todo custo evitar) horários que tenham:

    1.  **Choque de Professor:** O mesmo professor em duas turmas
        > diferentes no mesmo horário.

    2.  **Indisponibilidade:** Alocar um professor num horário em que
        > ele está \"Não Disponível\" (ND) ou em \"Planeamento\" (P).

  - **Restrições Suaves (Otimizações):** O algoritmo tenta ativamente
    > *reduzir*:

    1.  **\"Janelas\"** para professores (ex: ter aula no 1º e 3º
        > horário, ficando livre no 2º).

    2.  Professores com apenas 1 aula no dia.

    3.  Disciplinas com poucas aulas (ex: 2x/semana) sendo dadas no
        > mesmo dia.

### Módulo 4: Pós-Geração e Edição (Tela Final)

Após a geração, o utilizador tem controlo total sobre o resultado.

- **Visualização em Modal:** O horário gerado é exibido numa janela
  > modal, com tabelas claras para cada turma.

- **Modo de Troca Manual:** Uma funcionalidade poderosa que permite ao
  > utilizador clicar no botão \"Trocar Aulas\". Ao clicar em duas aulas
  > quaisquer (mesmo de turmas diferentes), o sistema:

  1.  **Valida a Troca:** Verifica instantaneamente se a troca causa
      > choque de professores ou viola a disponibilidade.

  2.  **Indicação Visual:** Pinta as células de destino de Verde
      > (Seguro), Amarelo (Viola disponibilidade, mas permite forçar) ou
      > Vermelho (Impossível, causa choque).

- **Edição Rápida (Duplo-Clique):** O utilizador pode clicar duas vezes
  > no nome de um professor ou disciplina *diretamente na tabela do
  > horário* para renomeá-lo. O sistema atualiza o nome em todo o
  > sistema (cadastro, relacionamento, etc.).

- **Gestão de Versões:** Permite salvar a versão atual do horário (ex:
  > \"Versão Pós-Trocas Manuais\") para carregar e comparar depois.

- **Exportação:**

  - **PDF:** Gera um PDF profissional de todos os horários de todas as
    > turmas.

  - **JSON:** Exporta *todos os dados do sistema* (turmas, professores,
    > horários) num ficheiro .json para backup ou importação futura.

### Módulo 5: Gestão de Dados (Persistência)

- **Sessão Atual:** O sistema salva automaticamente todo o progresso no
  > localStorage do navegador. O utilizador pode fechar o navegador e
  > \"Continuar Sessão Anterior\" depois.

- **Gestão de Modelos:** Permite ao utilizador salvar a configuração de
  > Professores e Disciplinas como um \"Modelo\" (ex:
  > \"Modelo_Escola_2025\"). Isso permite reutilizar a estrutura da
  > escola em anos futuros sem precisar cadastrar tudo do zero.

## 3. Funcionalidades Faltantes para Gerar Horários {#funcionalidades-faltantes-para-gerar-horários}

Esta é a parte mais importante da sua pergunta: \"o que falta criar para
gerar os horários?\"

**Resposta: Absolutamente nada.**

O seu sistema **já possui todas as funcionalidades centrais e avançadas
necessárias para gerar horários escolares.** O motor (GeneticScheduler)
está completo, o fluxo de recolha de dados é robusto e as ferramentas de
pós-geração (como a troca manual) são de nível profissional.

O que pode ser considerado \"faltante\" não são funcionalidades
essenciais, mas sim **melhorias ou refinamentos** que poderiam ser
adicionados:

1.  **Edição de Disponibilidade Individual (Refinamento):** O sistema
    > migrou para uma \"Grade de Indisponibilidade Geral\", o que é
    > excelente para o administrador. No entanto, o código ainda contém
    > botões (ex: editar-disponibilidade-btn na tabela de professores)
    > que parecem desativados. Seria uma melhoria permitir que se clique
    > ali para abrir a grade de disponibilidade *apenas* daquele
    > professor, em vez de sempre usar a grade geral.

2.  **Assistente de Conflitos (Melhoria):** O sistema *valida* conflitos
    > antes da geração. Após a geração, se o algoritmo não conseguir
    > resolver todas as \"janelas\" (uma otimização suave), ele apenas
    > apresenta o horário. Uma melhoria seria um \"Assistente\" que diz:
    > \"O Professor João tem uma janela na Terça-Feira. Sugerimos trocar
    > esta aula com a do Professor Mário.\"

3.  **Gestão de Múltiplos Turnos/Unidades:** O sistema atual parece
    > focado em gerar um horário para um turno (Manhã OU Tarde) de cada
    > vez. Uma expansão seria gerir múltiplos turnos (ex: professores
    > que dão aula de manhã e à noite) na mesma interface, mas isso é
    > uma complexidade significativamente maior.

4.  **Perfil de Utilizador (Em Breve):** O botão de perfil no cabeçalho
    > está marcado como \"(em breve)\". Esta funcionalidade não é
    > necessária para a geração, mas completaria o sistema.
