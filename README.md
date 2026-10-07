# Sistema de Gestão Acadêmica (SGA) — Área do Docente

Projeto desenvolvido para a disciplina de **Programar em Linguagem Interpretada** do curso de Análise e Desenvolvimento de Sistemas (ADS).

---

## 📌 Descrição do Projeto

O **Sistema de Gestão Acadêmica (SGA)** é uma aplicação web focada na área do docente, projetada para simplificar a rotina pedagógica de professores. O sistema permite gerenciar turmas, acompanhar estudantes, lançar e calcular notas com regras automáticas de aprovação e exame final, além de possibilitar o upload e download de materiais didáticos em PDF e a personalização de perfil.

Toda a persistência de dados e o controle de sessão são implementados no lado do cliente utilizando as APIs nativas do navegador (`localStorage` e `sessionStorage`), sem a necessidade de dependências pesadas ou servidores externos.

---

## 📁 Estrutura do Projeto

A organização de diretórios e arquivos da aplicação foi estruturada de forma modular, intuitiva e semântica:

```text
Projeto - SGA/
│
├── assets/
│   └── docs/
│       ├── Projeto_Linguagem_Interpretada_SGA.pdf  # Especificação e requisitos do projeto acadêmico
│       └── Rotina_de_Testes_QA_SGA.pdf             # Roteiro de testes de qualidade e homologação (QA)
│
├── cadastro.html                                   # Tela de cadastro de novas contas de professores
├── home.html                                       # Painel principal do docente (turmas, diário e perfil)
├── index.html                                      # Tela de acesso inicial (login e autenticação)
├── script.js                                       # Lógica da aplicação, cálculos, eventos e persistência
├── style.css                                       # Estilos globais, identidade visual (Flex/Grid) e temas
├── README.md                                       # Documentação completa e instruções do projeto
└── .gitignore                                      # Definição de arquivos e pastas ignorados pelo Git
```

### 🔍 Detalhamento dos Componentes

- **`index.html` (Tela de Autenticação / Login)**:  
  Página de entrada da aplicação. Apresenta o formulário de login institucional para docentes já cadastrados, valida credenciais contra a base do `localStorage` e direciona o usuário autenticado para o painel principal (`home.html`).

- **`cadastro.html` (Registro de Docentes)**:  
  Permite o auto-cadastro de novos professores no sistema. Realiza checagem de confirmação de senha e impede a duplicação de e-mails institucionais já existentes.

- **`home.html` (Painel Geral / Dashboard)**:  
  Estrutura do painel do professor contendo navegação lateral por abas:
  - **Minhas Turmas**: visualização em cards das disciplinas vinculadas ao docente e quantitativo de alunos matriculados.
  - **Diário de Notas (Detalhe da Turma)**: tabela dinâmica com os estudantes da turma selecionada, campos numéricos para inserção de notas (P1, P2, Projetos e Prova Final), paginação de registros e badges visuais de status acadêmico.
  - **Materiais da Disciplina**: área de upload via `FileReader` para anexo de arquivos PDF, com ações de download e exclusão.
  - **Meu Perfil**: formulário para atualização de dados (nome, e-mail institucional, redefinição de senha, seleção das disciplinas ministradas) e upload/remoção de foto de perfil (avatar).

- **`script.js` (Lógica de Negócio e Persistência)**:  
  Concentra toda a inteligência do sistema escrita em JavaScript Vanilla:
  - Inicialização automática de dados mockados (*seed*) no `localStorage` na primeira execução.
  - Controle de autenticação e proteção de sessão através do `sessionStorage`.
  - Mecanismo de cálculo ponderado de notas e atualização imediata do status acadêmico.
  - Validação em tempo real dos inputs numéricos (valores entre 0.0 e 10.0) e salvamento automático ao desfocar o campo (`blur`).
  - Paginação interativa na listagem de alunos da turma.
  - Conversão e armazenamento de arquivos em Base64 para PDFs e fotos de perfil.

- **`style.css` (Design System e Estilização)**:  
  Folha de estilos completa e responsiva construída com CSS moderno:
  - Utilização de variáveis CSS (`:root`) para controle da paleta de cores institucional.
  - Layout estruturado com CSS Grid e Flexbox.
  - Badges de status acadêmico semafóricos (verde para Aprovado, vermelho para Reprovado, amarelo/âmbar para Prova Final).
  - Tipografia limpa utilizando a fonte *Inter*.

- **`assets/docs/` (Documentação e Garantia de Qualidade)**:  
  - `Projeto_Linguagem_Interpretada_SGA.pdf`: Documento com o descritivo de escopo e diretrizes do projeto.
  - `Rotina_de_Testes_QA_SGA.pdf`: Roteiro de testes com matriz de cenários para validação de fluxos (autenticação, cálculo de notas, validação de limites, upload de anexos e gestão de perfil).

---

## ⚙️ Regras de Avaliação e Negócio

O cálculo de desempenho dos estudantes segue a seguinte fórmula acadêmica implementada no sistema:

1. **Cálculo das Médias Parciais**:
   - $\text{Nota Individual} = \frac{\text{P1} + \text{P2}}{2}$
   - $\text{Nota de Projeto} = \frac{\text{Proj 1} + \text{Proj 2}}{2}$
   - $\text{Média Semestral} = (\text{Nota Individual} \times 0.4) + (\text{Nota de Projeto} \times 0.6)$

2. **Critérios de Situação Acadêmica**:
   - **Aprovado**: $\text{Média Semestral} \ge 7.0$
   - **Reprovado Direto**: $\text{Média Semestral} < 7.0$ **e** $\text{Nota de Projeto} < 4.0$
   - **Fará Prova Final**: $\text{Média Semestral} < 7.0$ **e** $\text{Nota de Projeto} \ge 4.0$ *(neste caso, o campo da Prova Final é liberado para lançamento)*.

3. **Avaliação Pós-Prova Final**:
   - Se $(\text{Nota de Projeto} + \text{Prova Final}) \ge 7.0$ $\rightarrow$ **Aprovado**
   - Caso contrário $\rightarrow$ **Reprovado**

---

## ✨ Funcionalidades Principais

- [x] **Autenticação Segura de Sessão**: Login e Logout com verificação de credenciais e proteção de acesso à página principal.
- [x] **Cadastro de Professores**: Criação de novas contas com verificação de e-mail único.
- [x] **Gestão de Perfil**: Alteração de nome, e-mail institucional, troca de senha, avatar personalizado e seleção de disciplinas ministradas.
- [x] **Gestão de Turmas e Alunos**: Filtragem de turmas por docente autenticado e exibição do total de matriculados.
- [x] **Diário de Notas Dinâmico**: Lançamento ágil com validação de limites e recálculo instantâneo de médias e status.
- [x] **Paginação de Resultados**: Tabela dividida em páginas (5 discentes por página) para melhor visualização.
- [x] **Gestão de Arquivos**: Envio e armazenamento de materiais em formato PDF, com suporte a download e exclusão.
- [x] **Persistência Local**: Dados gravados de forma resiliente no `localStorage` do navegador.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estruturação semântica e acessível das páginas.
- **CSS3**: Layouts baseados em Flexbox/Grid, variáveis de tema e design responsivo.
- **JavaScript (ES6+)**: Lógica da aplicação, eventos, manipulação dinâmica da DOM e regras de negócio.
- **Font Awesome 6**: Ícones de interface gráfica.
- **Web Storage API**: `localStorage` (persistência de dados) e `sessionStorage` (sessão de login ativa).
- **FileReader API**: Codificação de arquivos em Base64 para armazenamento no cliente.

---

## 🔑 Credenciais Padrão para Testes

O sistema gera automaticamente dados iniciais na primeira inicialização para testes imediatos:

- **E-mail**: `professor@maisunifacisa.com.br`
- **Senha**: `123`

*(Você também pode se cadastrar como um novo professor através da tela de cadastro).*
