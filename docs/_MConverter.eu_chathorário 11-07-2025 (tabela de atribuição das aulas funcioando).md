\<!DOCTYPE html\>

\<html lang=\"pt-br\"\>

\<head\>

\<meta charset=\"UTF-8\"\>

\<meta name=\"viewport\" content=\"width=device-width,
initial-scale=1.0\"\>

\<title\>Chatbot Gerador de Horários\</title\>

\<script src=\"https://cdn.tailwindcss.com\"\>\</script\>

\<link
href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\"
rel=\"stylesheet\"\>

\<script
src=\"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js\"\>\</script\>

\<script
src=\"https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js\"\>\</script\>

\<style\>

body {

font-family: \'Inter\', sans-serif;

}

/\* \-\-- ESTILOS DO CHAT \-\-- \*/

.chat-bubble-bot {

background-color: \#E0E7FF; /\* Indigo 100 \*/

color: \#3730A3; /\* Indigo 800 \*/

align-self: flex-start;

border-radius: 20px 20px 20px 5px;

}

.question-highlight-bot {

background-color: \#D1FAE5; /\* Green 100 \*/

color: \#065F46; /\* Green 800 \*/

font-weight: 500;

}

.chat-bubble-user {

background-color: \#3B82F6; /\* Blue 500 \*/

color: white;

align-self: flex-end;

border-radius: 20px 20px 5px 20px;

}

.chat-avatar {

width: 2.5rem; /\* 40px \*/

height: 2.5rem; /\* 40px \*/

border-radius: 9999px; /\* Borda totalmente redonda \*/

padding: 0.5rem; /\* 8px \*/

background-color: \#E0E7FF; /\* Fundo Indigo-100 para o bot \*/

color: \#4338CA; /\* Cor do ícone Indigo-700 para o bot \*/

}

.chat-avatar.user {

background-color: \#DBEAFE; /\* Fundo Blue-100 para o usuário \*/

color: \#1D4ED8; /\* Cor do ícone Blue-700 para o usuário \*/

}

.chat-input-container {

position: sticky;

bottom: 0;

background-color: white;

padding-bottom: env(safe-area-inset-bottom); /\* For iPhone X notch \*/

}

\#chat-messages::-webkit-scrollbar { width: 8px; }

\#chat-messages::-webkit-scrollbar-track { background: \#f1f1f1;
border-radius: 10px; }

\#chat-messages::-webkit-scrollbar-thumb { background: \#888;
border-radius: 10px; }

\#chat-messages::-webkit-scrollbar-thumb:hover { background: \#555; }

/\* \-\-- ESTILOS DOS BOTÕES DE OPÇÃO \-\-- \*/

.option-button {

background-color: \#E5E7EB; color: \#374151; font-weight: 500;

padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem;
margin: 0.25rem;

}

.option-button:hover { background-color: \#D1D5DB; }

.option-button-selected { background-color: \#4F46E5; color: white; }

/\* \-\-- ESTILOS DAS TABELAS E GRADES \-\-- \*/

.table-container { /\* NOVO: Wrapper para responsividade \*/

overflow-x: auto;

-webkit-overflow-scrolling: touch; /\* Melhora a rolagem em iOS \*/

}

.data-table, .availability-grid, .parameters-table, .fixed-schedule-grid
{

width: 100%;

border-collapse: collapse;

margin-top: 10px;

margin-bottom: 20px;

font-size: 0.8rem;

min-width: 600px; /\* Garante que a tabela tenha uma largura mínima,
forçando a rolagem em telas pequenas \*/

}

.data-table th, .data-table td,

.availability-grid th, .availability-grid td,

.parameters-table th, .parameters-table td,

.fixed-schedule-grid th, .fixed-schedule-grid td {

border: 1px solid \#D1D5DB; padding: 6px; text-align: center;

}

.data-table th, .availability-grid th, .parameters-table th,
.fixed-schedule-grid th { background-color: \#F3F4F6; }

.data-table td div, .availability-grid td div, .parameters-table td div,
.fixed-schedule-grid td div { font-size: 0.75rem; line-height: 1.2; }

.interval-row td { background-color: \#FEF3C7; font-style: italic;
color: \#78350F; }

.availability-grid td, .fixed-schedule-grid td { cursor: pointer;
height: 40px; }

.status-D { background-color: \#D1FAE5; color: \#065F46; } /\* Green \*/

.status-P { background-color: \#FEF3C7; color: \#92400E; } /\* Amber \*/

.status-ND { background-color: \#FEE2E2; color: \#991B1B; } /\* Red \*/

.fixed-class-cell { background-color: \#BFDBFE; } /\* blue-200 \*/

/\* \-\-- ESTILOS DE MODAIS \-\-- \*/

.modal {

display: none; position: fixed; z-index: 100;

left: 0; top: 0; width: 100%; height: 100%;

overflow: auto; background-color: rgba(0,0,0,0.6);

}

.modal-content {

background-color: \#fefefe; margin: 5% auto; padding: 25px;

border: 1px solid \#888; width: 90%; max-width: 80vw;

border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);

}

.close-button { color: \#aaa; float: right; font-size: 28px;
font-weight: bold; }

.close-button:hover, .close-button:focus { color: black;
text-decoration: none; cursor: pointer; }

\#horario-modal-body, \#model-modal-body { max-height: 75vh; overflow-y:
auto; }

/\* \-\-- ESTILOS DE BOTÕES DE AÇÃO \-\-- \*/

.action-button {

font-weight: 600; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px
-2px rgb(0 0 0 / 0.1);

transition: all 0.2s ease-in-out;

}

.action-button:hover { transform: translateY(-2px); box-shadow: 0 10px
15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }

.button-overloaded { background-color: \#FEE2E2; color: \#B91C1C;
border: 1px solid \#F87171; }

.button-highlight-import { background-color: \#3B82F6; color: white; }

.button-highlight-import:hover { background-color: \#2563EB; }

.button-highlight-conclude { background-color: \#10B981; color: white; }

.button-highlight-conclude:hover { background-color: \#059669; }

.button-highlight-action { background-color: \#F59E0B; color: white; }

.button-highlight-action:hover { background-color: \#D97706; }

.button-correct { background-color: \#EF4444; color: white; }

.button-correct:hover { background-color: \#DC2626; }

.button-save { background-color: \#6366F1; color: white; }

.button-save:hover { background-color: \#4F46E5; }

/\* \-\-- ESTILOS DE TROCA MANUAL \-\-- \*/

.cell-to-swap { cursor: pointer; transition: background-color 0.2s; }

.cell-to-swap:hover { background-color: \#FEF9C3; outline: 2px solid
\#FBBF24; }

.cell-selected { background-color: \#FBBF24 !important; color: \#78350F;
font-weight: bold; outline: 2px solid \#92400E; }

\#swap-status-message { min-height: 2rem; transition: all 0.3s; }

.swap-safe { background-color: \#D1FAE5 !important; outline: 2px solid
\#10B981; }

.swap-warning { background-color: \#FEF3C7 !important; outline: 2px
solid \#F59E0B; }

.swap-impossible { background-color: \#FEE2E2 !important; outline: 2px
solid \#EF4444; cursor: not-allowed; }

/\* \-\-- ESTILOS DE EDIÇÃO RÁPIDA NO HORÁRIO \-\-- \*/

.editable-teacher-name {

cursor: pointer;

text-decoration: underline dotted;

}

/\* ================================================= \*/

/\* SUBSTITUA TODA A SEÇÃO DE CSS DO MENU LATERAL POR ISTO \*/

/\* ================================================= \*/

/\* Fundo escuro que cobre apenas o chat \*/

\#sidebar-overlay {

display: none;

position: absolute; /\* Relativo ao container do chat \*/

top: 0;

left: 0;

width: 100%;

height: 100%;

background-color: rgba(0, 0, 0, 0.4);

z-index: 190;

border-radius: 0.5rem; /\* Mesma borda do chat \*/

transition: opacity 0.3s ease-in-out;

}

\#sidebar-overlay.active {

display: block;

}

/\* O novo menu flutuante \*/

\#sidebar {

position: absolute; /\* Relativo ao container do chat \*/

top: 1rem; /\* Espaçamento do topo \*/

left: 1rem; /\* Espaçamento da esquerda \*/

height: auto; /\* Altura automática baseada no conteúdo \*/

width: 280px; /\* Largura do menu \*/

background-color: white;

z-index: 200;

transform: translateX(-110%); /\* Começa fora da tela à esquerda \*/

transition: transform 0.3s ease-in-out;

box-shadow: 0 10px 25px rgba(0,0,0,0.15);

border-radius: 12px;

padding: 0.5rem; /\* Espaçamento interno \*/

}

\#sidebar.active {

transform: translateX(0); /\* Move para a posição visível \*/

}

/\* Estilo dos links dentro do novo menu \*/

.sidebar-link {

display: flex;

align-items: center;

width: 100%;

padding: 0.75rem 1rem; /\* 12px vertical, 16px horizontal \*/

border-radius: 8px;

color: \#374151; /\* text-gray-700 \*/

font-weight: 500;

transition: background-color 0.2s, color 0.2s;

text-decoration: none;

}

.sidebar-link:hover {

background-color: \#F3F4F6; /\* bg-gray-100 \*/

color: \#111827; /\* text-gray-900 \*/

}

/\* Ícone dentro do link \*/

.sidebar-icon {

width: 24px;

height: 24px;

margin-right: 1rem; /\* Espaço entre ícone e texto \*/

color: \#4F46E5; /\* text-indigo-600 \*/

}

/\* O texto que antes era um tooltip, agora é o label do link \*/

.sidebar-label {

flex-grow: 1;

}

/\* Esconde o tooltip antigo \*/

.sidebar-tooltip {

display: none;

}

/\* \-\-- ESTILOS DA TELA DE CARREGAMENTO (LOADING) \-\-- \*/

.loading-overlay {

position: fixed; /\* Cobre a tela inteira \*/

top: 0;

left: 0;

width: 100%;

height: 100%;

background-color: \#FFFFFF; /\* Fundo branco para cobrir tudo \*/

display: flex;

align-items: center;

justify-content: center;

z-index: 9999; /\* Garante que fique por cima de tudo \*/

display: none; /\* Começa escondido \*/

transition: opacity 0.3s;

}

.loader {

border: 8px solid \#E5E7EB; /\* Cinza claro \*/

border-top: 8px solid \#4F46E5; /\* Cor principal do seu tema \*/

border-radius: 50%;

width: 60px;

height: 60px;

animation: spin 1s linear infinite;

}

@keyframes spin {

0% { transform: rotate(0deg); }

100% { transform: rotate(360deg); }

}

\</style\>

\</head\>

\<body class=\"bg-gray-100 flex flex-col items-center justify-center
min-h-screen p-4\"\>

\<div id=\"loading-overlay\" class=\"loading-overlay\"\>

\<div class=\"loader\"\>\</div\>

\</div\>

\<div class=\"w-full max-w-2xl bg-white shadow-xl rounded-lg flex
flex-col h-\[90vh\]\"\>

\<div id=\"sidebar-overlay\"\>\</div\>

\<div id=\"sidebar\" class=\"w-20 p-4 flex flex-col bg-white
shadow-lg\"\>

\<nav class=\"flex flex-col h-full\"\>

\<div class=\"flex flex-col space-y-2\"\>

\<a href=\"#\" class=\"sidebar-link group\"
data-action=\"CORRIGIR_ESCOLA_GLOBAL\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>\<path stroke-linecap=\"round\"
stroke-linejoin=\"round\" d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14
0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5\"
/\>\</svg\>

\<span class=\"sidebar-label\"\>Configurações da Escola\</span\>

\</a\>

\<a href=\"#\" class=\"sidebar-link group\"
data-action=\"CORRIGIR_TURMAS_GLOBAL\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>\<path stroke-linecap=\"round\"
stroke-linejoin=\"round\" d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17
20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0
015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0
019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7
10a2 2 0 11-4 0 2 2 0 014 0z\" /\>\</svg\>

\<span class=\"sidebar-label\"\>Cadastro de Turmas\</span\>

\</a\>

\<a href=\"#\" class=\"sidebar-link group\"
data-action=\"CORRIGIR_DISCIPLINAS_GLOBAL\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>\<path stroke-linecap=\"round\"
stroke-linejoin=\"round\" d=\"M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5
5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5
1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5
1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253\"
/\>\</svg\>

\<span class=\"sidebar-label\"\>Disciplinas das Turmas\</span\>

\</a\>

\<a href=\"#\" class=\"sidebar-link group\"
data-action=\"CORRIGIR_PROFESSORES_GLOBAL\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>\<path stroke-linecap=\"round\"
stroke-linejoin=\"round\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7
0 00-7 7h14a7 7 0 00-7-7z\" /\>\</svg\>

\<span class=\"sidebar-label\"\>Cadastro de Professores\</span\>

\</a\>

\<a href=\"#\" class=\"sidebar-link group\"
data-action=\"CORRIGIR_RELACIONAMENTO_GLOBAL\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>\<path stroke-linecap=\"round\"
stroke-linejoin=\"round\" d=\"M8 7h.01M12 7h.01M16 7h.01M9 17h6M5
10h14M4 17a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2
2h-5l-5 5v-5H4z\" /\>\</svg\>

\<span class=\"sidebar-label\"\>Relacionamento Prof./Disc.\</span\>

\</a\>

\<a href=\"#\" class=\"sidebar-link group mt-4 border-t pt-4\"
data-action=\"GERAR_COM_DADOS_CARREGADOS\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>\<path stroke-linecap=\"round\"
stroke-linejoin=\"round\" d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118
0z\" /\>\</svg\>

\<span class=\"sidebar-label\"\>Gerar Horário\</span\>

\</a\>

\</div\>

\<a href=\"#\" id=\"final-screen-button\" class=\"sidebar-link group
hidden\" data-action=\"NAVIGATE_TO_FINAL_SCREEN\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>

\<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4 6a2 2 0
012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0
012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0
012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0
012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z\" /\>

\</svg\>

\<span class=\"sidebar-label\"\>Tela Final / Ações\</span\>

\</a\>

\<a href=\"#\" id=\"logout-btn\" class=\"sidebar-link group mt-auto\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"sidebar-icon
text-red-500\" fill=\"none\" viewBox=\"0 0 24 24\"
stroke=\"currentColor\" stroke-width=\"2\"\>

\<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M17
16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0
013-3h4a3 3 0 013 3v1\" /\>

\</svg\>

\<span class=\"sidebar-label\"\>Sair do Sistema\</span\>

\</a\>

\</nav\>

\</div\>

\<header class=\"bg-indigo-600 text-white p-4 rounded-t-lg flex
items-center justify-between\"\>

\<button id=\"open-sidebar-button\" class=\"text-white p-2 -ml-2\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\"
viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"
stroke-width=\"2\" stroke-linecap=\"round\"
stroke-linejoin=\"round\"\>\<line x1=\"3\" y1=\"12\" x2=\"21\"
y2=\"12\"\>\</line\>\<line x1=\"3\" y1=\"6\" x2=\"21\"
y2=\"6\"\>\</line\>\<line x1=\"3\" y1=\"18\" x2=\"21\"
y2=\"18\"\>\</line\>\</svg\>

\</button\>

\<div class=\"flex items-center\"\>

\<svg baseProfile=\"tiny\" version=\"1.2\"
xmlns=\"http://www.w3.org/2000/svg\"
xmlns:ev=\"http://www.w3.org/2001/xml-events\"
xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"w-14 h-14 mr-3\"
viewBox=\"0 0 250 210\"\>

\<defs\>

\<linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"0%\"
y2=\"100%\"\>

\<stop offset=\"0.0\" stop-color=\"#00f0ff\" /\>

\<stop offset=\"1.0\" stop-color=\"#c040f0\" /\>

\</linearGradient\>

\<linearGradient id=\"grad2\" x1=\"0%\" y1=\"0%\" x2=\"100%\"
y2=\"100%\"\>

\<stop offset=\"0.0\" stop-color=\"#00f0ff\" /\>

\<stop offset=\"1.0\" stop-color=\"#c040f0\" /\>

\</linearGradient\>

\</defs\>

\<path d=\"M 50 60 Q 50 40 70 40 H 180 Q 200 40 200 60 V 130 Q 200 150
180 150 H 90 L 70 170 V 150 H 70 Q 50 150 50 130 Z\"
fill=\"url(#grad1)\" /\>

\<circle cx=\"175\" cy=\"95\" fill=\"none\" r=\"45\"
stroke=\"url(#grad2)\" stroke-width=\"4\" /\>

\<circle cx=\"175\" cy=\"95\" fill=\"#121538\" r=\"40\" /\>

\<line stroke=\"white\" stroke-width=\"4\" x1=\"175\" x2=\"200\"
y1=\"95\" y2=\"110\" /\>

\<line stroke=\"white\" stroke-width=\"4\" x1=\"175\" x2=\"175\"
y1=\"95\" y2=\"65\" /\>

\<line stroke=\"red\" stroke-width=\"2\" x1=\"175\" x2=\"160\" y1=\"95\"
y2=\"115\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"175\" x2=\"175\"
y1=\"55\" y2=\"60\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"215\" x2=\"210\"
y1=\"95\" y2=\"95\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"175\" x2=\"175\"
y1=\"135\" y2=\"130\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"135\" x2=\"140\"
y1=\"95\" y2=\"95\" /\>

\</svg\>

\<h1 class=\"text-xl font-semibold\"\>ChatHorário\</h1\>

\</div\>

\<div class=\"flex items-center space-x-2\"\>

\<button id=\"home-button\" class=\"text-white p-2 rounded-full
hover:bg-indigo-700 transition-colors\" title=\"Voltar ao Início\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-6 w-6\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>

\<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3
12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1
1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6
0h6\" /\>

\</svg\>

\</button\>

\<button id=\"user-profile-button\" class=\"text-white p-2 rounded-full
hover:bg-indigo-700 transition-colors\" title=\"Perfil do Usuário (em
breve)\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-6 w-6\"
fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"
stroke-width=\"2\"\>

\<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16 7a4 4
0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\" /\>

\</svg\>

\</button\>

\</div\>

\</header\>

\<div id=\"chat-messages\" class=\"flex-grow p-6 space-y-4
overflow-y-auto\"\>\</div\>

\<div class=\"chat-input-container border-t border-gray-200 p-4\"\>

\<div class=\"flex items-center space-x-3\"\>

\<input type=\"text\" id=\"user-input\" class=\"flex-1 border
border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500
focus:border-transparent outline-none\" placeholder=\"Digite sua
mensagem\...\"\>

\<button id=\"send-button\" class=\"bg-indigo-600 text-white px-6 py-3
rounded-lg font-semibold hover:bg-indigo-700 transition duration-150
focus:outline-none focus:ring-2 focus:ring-indigo-500
focus:ring-offset-2\"\>

\<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0
24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-6 h-6\"\>

\<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 12
3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27
20.875L5.999 12Zm0 0h7.5\" /\>

\</svg\>

\</button\>

\</div\>

\<div id=\"options-container\" class=\"mt-2 flex flex-wrap
gap-2\"\>\</div\>

\<div id=\"file-import-container\" class=\"hidden mt-3\"\>

\<label for=\"json-file-input\" class=\"block text-sm font-medium
text-gray-700 mb-1\"\>Selecione o arquivo .json:\</label\>

\<input type=\"file\" id=\"json-file-input\" accept=\".json\"
class=\"block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
file:rounded-full file:border-0 file:text-sm file:font-semibold
file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100\"\>

\</div\>

\<div id=\"availability-grid-container\" class=\"hidden mt-3 p-3 border
rounded-lg bg-gray-50 overflow-x-auto\"\>\</div\>

\</div\>

\</div\>

\<div id=\"horarioModal\" class=\"modal\"\>

\<div class=\"modal-content\"\>

\<div class=\"flex justify-between items-center mb-4\"\>

\<h3 class=\"text-xl font-semibold text-gray-700\"\>Horário
Gerado\</h3\>

\<span class=\"close-button\" id=\"closeHorarioModal\"\>&times;\</span\>

\</div\>

\<div id=\"horario-modal-body\"\>\</div\>

\<div class=\"mt-4 p-2 border-t\"\>

\<div id=\"swap-status-message\" class=\"text-center font-medium
text-indigo-700 mb-2\"\>\</div\>

\<div id=\"horario-modal-actions\" class=\"flex justify-end
gap-3\"\>\</div\>

\</div\>

\</div\>

\</div\>

\<div id=\"modelModal\" class=\"modal\"\>

\<div class=\"modal-content\"\>

\<div class=\"flex justify-between items-center mb-4\"\>

\<h3 class=\"text-xl font-semibold text-gray-700\"\>Gerir Modelos de
Escola\</h3\>

\<span class=\"close-button\" id=\"closeModelModal\"\>&times;\</span\>

\</div\>

\<div id=\"model-modal-body\"\>\</div\>

\<div class=\"flex justify-end mt-4\"\>

\<button id=\"fecharModelModalButton\" class=\"px-6 py-2 bg-gray-500
text-white rounded-lg font-semibold
hover:bg-gray-600\"\>Fechar\</button\>

\</div\>

\</div\>

\</div\>

\<div id=\"swapWarningModal\" class=\"modal\"\>

\<div class=\"modal-content max-w-md\"\>

\<h3 class=\"text-lg font-bold text-yellow-600\"\>Atenção\</h3\>

\<p id=\"swap-warning-message\" class=\"my-4 text-gray-700\"\>\</p\>

\<div class=\"flex justify-end gap-3\"\>

\<button id=\"confirm-swap-button\" class=\"px-4 py-2 bg-yellow-500
text-white rounded-lg font-semibold hover:bg-yellow-600\"\>Sim, forçar
troca\</button\>

\<button id=\"cancel-swap-button\" class=\"px-4 py-2 bg-gray-300
text-gray-800 rounded-lg font-semibold
hover:bg-gray-400\"\>Cancelar\</button\>

\</div\>

\</div\>

\</div\>

\<div id=\"deleteConfirmModal\" class=\"modal\"\>

\<div class=\"modal-content max-w-md\"\>

\<h3 class=\"text-lg font-bold text-red-600\"\>Confirmar Exclusão\</h3\>

\<p id=\"delete-confirm-message\" class=\"my-4 text-gray-700\"\>\</p\>

\<div class=\"flex justify-end gap-3\"\>

\<button id=\"confirm-delete-btn\" class=\"px-4 py-2 bg-red-500
text-white rounded-lg font-semibold hover:bg-red-600\"\>Sim,
excluir\</button\>

\<button id=\"cancel-delete-btn\" class=\"px-4 py-2 bg-gray-300
text-gray-800 rounded-lg font-semibold
hover:bg-gray-400\"\>Cancelar\</button\>

\</div\>

\</div\>

\</div\>

\<div id=\"infoModal\" class=\"modal\"\>

\<div class=\"modal-content max-w-md\"\>

\<h3 id=\"info-modal-title\" class=\"text-lg font-bold
text-yellow-600\"\>Atenção\</h3\>

\<p id=\"info-modal-message\" class=\"my-4 text-gray-700\"\>\</p\>

\<div class=\"flex justify-end\"\>

\<button id=\"info-modal-close-btn\" class=\"px-4 py-2 bg-gray-500
text-white rounded-lg font-semibold hover:bg-gray-600\"\>OK\</button\>

\</div\>

\</div\>

\</div\>

\<div id=\"fixedClassConflictModal\" class=\"modal\"\>

\<div class=\"modal-content max-w-md\"\>

\<h3 class=\"text-lg font-bold text-red-600\"\>Conflito
Encontrado\</h3\>

\<p id=\"fixed-class-conflict-message\" class=\"my-4
text-gray-700\"\>\</p\>

\<div class=\"flex justify-end gap-3\"\>

\<button id=\"confirm-remove-fixed\" class=\"px-4 py-2 bg-red-500
text-white rounded-lg font-semibold hover:bg-red-600\"\>Sim, remover
aula fixa\</button\>

\<button id=\"cancel-remove-fixed\" class=\"px-4 py-2 bg-gray-300
text-gray-800 rounded-lg font-semibold
hover:bg-gray-400\"\>Cancelar\</button\>

\</div\>

\</div\>

\</div\>

\<script\>

//
=======================================================================

//
=======================================================================

// 1. DECLARAÇÃO DE VARIÁVEIS GLOBAIS

//
=======================================================================

// \-\-- Constantes do DOM \-\--

const chatMessages = document.getElementById(\'chat-messages\');

const userInput = document.getElementById(\'user-input\');

const sendButton = document.getElementById(\'send-button\');

const optionsContainer = document.getElementById(\'options-container\');

const fileImportContainer =
document.getElementById(\'file-import-container\');

const jsonFileInput = document.getElementById(\'json-file-input\');

const availabilityGridContainer =
document.getElementById(\'availability-grid-container\');

const fixedClassConflictModal =
document.getElementById(\'fixedClassConflictModal\');

const horarioModal = document.getElementById(\'horarioModal\');

const horarioModalBody =
document.getElementById(\'horario-modal-body\');

const closeHorarioModalBtn =
document.getElementById(\'closeHorarioModal\');

const horarioModalActions =
document.getElementById(\'horario-modal-actions\');

const swapStatusMessage =
document.getElementById(\'swap-status-message\');

const modelModal = document.getElementById(\'modelModal\');

const modelModalBody = document.getElementById(\'model-modal-body\');

const closeModelModalBtn = document.getElementById(\'closeModelModal\');

const fecharModelModalButton =
document.getElementById(\'fecharModelModalButton\');

const swapWarningModal = document.getElementById(\'swapWarningModal\');

const swapWarningMessage =
document.getElementById(\'swap-warning-message\');

const confirmSwapButton =
document.getElementById(\'confirm-swap-button\');

const cancelSwapButton =
document.getElementById(\'cancel-swap-button\');

const sidebar = document.getElementById(\'sidebar\');

const sidebarOverlay = document.getElementById(\'sidebar-overlay\');

const openSidebarButton =
document.getElementById(\'open-sidebar-button\');

const sidebarLinks = document.querySelectorAll(\'.sidebar-link\');

// \-\-- Variáveis de Estado da Aplicação \-\--

let conversationState = \'START\';

let previousConversationState = \'START\';

let userData = {};

let tempData = {};

let scheduler = null;

let horarioHistory = \[\];

let elementosParaExcluir = null;

let disciplinaSelecionadaParaFixar = null;

let turmasSelecionadasParaFixar = new Set();

let turmasParaRelacionamento = \[\];

let currentTurmaRelacionamentoIndex = 0;

let currentDisciplinaRelacionamentoIndex = 0;

// \-\-- Variáveis de Estado para Loops e Lógica Interna \-\--

let isSwapModeActive = false;

let firstSwapSelection = null;

let secondSwapSelection = null;

let currentTurmaConfig = null;

let currentProfessorConfig = null;

let currentDisciplinaParaConfigurar = { nome: null, qtdAulasSemanais: 0,
indexNaTurma: -1, turmaKeyParaRelacionamento: null,
disciplinaIndexParaRelacionamento: null };

let currentSerieAnoParaCadastro = null;

let totalTurmasParaCadastrarNaSerieAno = 0;

let turmasCadastradasNaSerieAnoCount = 0;

let turmaKeyParaEditarAulas = null;

let allTurmasParaDisciplinas = \[\];

let currentTurmaParaDisciplinaIndex = 0;

let disciplinasParaConfigurarQtdAulas = \[\];

let disciplinaAtualParaConfigurarQtdIndex = 0;

let currentQtdIntervalos = 0;

let currentIntervaloIndex = 0;

let tempAulasDiarias = 0;

let tempDuracaoIntervalo = 0;

let currentProfessorGradeIndex = 0;

// \-\-- Constantes de Dados \-\--

const diasDaSemana = \[\"Segunda\", \"Terça\", \"Quarta\", \"Quinta\",
\"Sexta\"\];

const diasDaSemanaEng = \[\"monday\", \"tuesday\", \"wednesday\",
\"thursday\", \"friday\"\];

const SESSION_STORAGE_KEY = \'horarioFacilSessaoAtual\';

const MODELS_STORAGE_KEY = \'horarioFacilModelos\';

const listaParametrosProcessamento = \[

{ id: \"DISP_PROFESSORES\", nome: \"Considerar Disponibilidade dos
Professores\", habilitadoDefault: true, precisaValor: false },

{ id: \"CHOQUE_PROFESSORES\", nome: \"Não permitir Choque de Professores
(obrigatório)\", habilitadoDefault: true, precisaValor: false },

{ id: \"NUM_MAX_AULAS_PROF_TURMA_DIA\", nome: \"Definir Nº Máximo de
Aulas do Professor na Mesma Turma no Mesmo dia\", habilitadoDefault:
true, precisaValor: true, placeholder: \"Ex: 2\" },

{ id: \"ELIMINAR_JANELAS_PROFESSORES\", nome: \"Tentar Eliminar Janelas
dos Professores\", habilitadoDefault: true, precisaValor: false },

{ id: \"ELIMINAR_JANELAS_ALUNOS\", nome: \"Tentar Eliminar Janelas dos
Alunos\", habilitadoDefault: false, precisaValor: false },

{ id: \"EVITAR_PROF_1_AULA_DIA\", nome: \"Tentar Evitar Professor com
apenas 1 aula no dia\", habilitadoDefault: false, precisaValor: false },

\];

//
=======================================================================

// 2. \*\*\* GeneticScheduler Class (COM CORREÇÕES) \*\*\*

//
=======================================================================

class GeneticScheduler {

constructor(config) {

this.config = {

populationSize: 50,

generations: 100,

mutationRate: 0.05,

elitismCount: 2,

tournamentSize: 5,

\...config,

};

this.population = \[\];

this.data = null;

this.generationLog = \[\];

}

async generate(data) {

this.data = data;

this.initializePopulation();

// 1. Adiciona a barra de progresso vazia antes de iniciar o loop

addProgressBar();

for (let i = 0; i \< this.config.generations; i++) {

this.population = this.evolvePopulation();

this.population.sort((a, b) =\> a.fitness - b.fitness);

const bestFitness = this.population\[0\].fitness;

this.generationLog.push({ generation: i + 1, bestFitness });

// 2. SUBSTITUI o log de texto pela atualização da barra de progresso

const percentage = Math.round(((i + 1) / this.config.generations) \*
100);

updateProgressBar(percentage);

// Mantém a interface responsiva durante o processamento pesado

await new Promise(resolve =\> setTimeout(resolve, 0));

if (bestFitness === 0) {

// Se encontrar a solução ótima, atualiza para 100% e sai mais cedo

updateProgressBar(100);

await addBotMessage(\`Solução ótima encontrada na geração \${i + 1}!\`,
200);

break;

}

}

// 3. Remove a barra de progresso 500ms após o término do loop

setTimeout(removeProgressBar, 500);

const bestSchedule = this.population\[0\];

return this.formatSchedule(bestSchedule);

}

initializePopulation() {

this.population = \[\];

for (let i = 0; i \< this.config.populationSize; i++) {

const chromosome = new Map();

this.data.classes.forEach(classInfo =\> {

const classSchedule = new Array(classInfo.totalSlots).fill(null);

const requiredLessons = \[\];

const lessonCounts = new Map();

// Contabiliza o total de aulas necessárias por disciplina

classInfo.subjects.forEach(subject =\> {

lessonCounts.set(subject.id, subject.weeklyHours);

});

// CORREÇÃO: Pré-aloca as aulas fixas

if (classInfo.fixedLessons) {

classInfo.fixedLessons.forEach(fixed =\> {

const slotIndex = fixed.dayIndex \* this.data.maxAulasDiarias +
fixed.period;

classSchedule\[slotIndex\] = { subjectId: fixed.subjectId, teacherId:
fixed.teacherId };

// Decrementa a contagem da disciplina já alocada

if (lessonCounts.has(fixed.subjectId)) {

lessonCounts.set(fixed.subjectId, lessonCounts.get(fixed.subjectId) -
1);

}

});

}

// Cria a lista de aulas restantes a serem alocadas

lessonCounts.forEach((count, subjectId) =\> {

const subjectInfo = classInfo.subjects.find(s =\> s.id === subjectId);

for (let j = 0; j \< count; j++) {

requiredLessons.push({ subjectId: subjectId, teacherId:
subjectInfo.teacherId });

}

});

// Embaralha as aulas restantes

for (let k = requiredLessons.length - 1; k \> 0; k\--) {

const j = Math.floor(Math.random() \* (k + 1));

\[requiredLessons\[k\], requiredLessons\[j\]\] = \[requiredLessons\[j\],
requiredLessons\[k\]\];

}

// Preenche os slots vazios com as aulas restantes

let lessonIndex = 0;

for (let k = 0; k \< classSchedule.length; k++) {

if (classSchedule\[k\] === null) { // Se o slot está vazio

if (lessonIndex \< requiredLessons.length) {

classSchedule\[k\] = requiredLessons\[lessonIndex++\];

} else {

classSchedule\[k\] = { subjectId: \'VAGO\', teacherId: null };

}

}

}

chromosome.set(classInfo.id, classSchedule);

});

this.population.push({ chromosome, fitness:
this.calculateFitness(chromosome) });

}

}

calculateFitness(chromosome) {

let fitness = 0;

const teacherSchedule = new Map();

const HARD_CONSTRAINT_PENALTY = 10000;

for (let i = 0; i \< this.data.totalSlots; i++) {

const dayIndex = Math.floor(i / this.data.maxAulasDiarias);

const period = i % this.data.maxAulasDiarias;

const slotKey = \`\${diasDaSemanaEng\[dayIndex\]}-\${period}\`;

const teachersInSlot = new Set();

chromosome.forEach((schedule, classId) =\> {

const lesson = schedule\[i\];

if (lesson && lesson.teacherId) {

if (teachersInSlot.has(lesson.teacherId)) {

fitness += HARD_CONSTRAINT_PENALTY;

}

teachersInSlot.add(lesson.teacherId);

if (!this.data.teacherAvailability.get(lesson.teacherId)?.get(slotKey))
{

fitness += HARD_CONSTRAINT_PENALTY;

}

}

const classInfo = this.data.classes.find(c =\> c.id === classId);

const fixedLesson = classInfo.fixedLessons?.find(f =\> f.dayIndex ===
dayIndex && f.period === period);

if (fixedLesson && lesson && fixedLesson.subjectId !== lesson.subjectId)
{

fitness += HARD_CONSTRAINT_PENALTY;

}

});

}

chromosome.forEach((schedule, classId) =\> {

const classInfo = this.data.classes.find(c =\> c.id === classId);

if (!classInfo) return;

const teacherDailyLessons = new Map();

for (let dayIndex = 0; dayIndex \< 5; dayIndex++) {

const subjectCountOnDay = new Map();

for (let period = 0; period \< this.data.maxAulasDiarias; period++) {

const slotIndex = dayIndex \* this.data.maxAulasDiarias + period;

const lesson = schedule\[slotIndex\];

if (lesson && lesson.subjectId !== \'VAGO\') {

subjectCountOnDay.set(lesson.subjectId,
(subjectCountOnDay.get(lesson.subjectId) \|\| 0) + 1);

if(lesson.teacherId) {

const day = diasDaSemanaEng\[dayIndex\];

if (!teacherDailyLessons.has(lesson.teacherId))
teacherDailyLessons.set(lesson.teacherId, new Map());

if (!teacherDailyLessons.get(lesson.teacherId).has(day))
teacherDailyLessons.get(lesson.teacherId).set(day, \[\]);

teacherDailyLessons.get(lesson.teacherId).get(day).push(period);

}

}

}

subjectCountOnDay.forEach((count, subjectId) =\> {

if (count \> 1) {

const subjectInfo = classInfo.subjects.find(s =\> s.id === subjectId);

if (subjectInfo && subjectInfo.weeklyHours \< 3) {

fitness += 150 \* (count - 1);

}

}

if (count \>= 4) { // Penalidade para 4 ou mais aulas da mesma
disciplina

fitness += 200 \* (count - 3);

}

});

for (let period = 0; period \< this.data.maxAulasDiarias - 1; period++)
{

const slotIndex1 = dayIndex \* this.data.maxAulasDiarias + period;

const slotIndex2 = dayIndex \* this.data.maxAulasDiarias + period + 1;

const lesson1 = schedule\[slotIndex1\];

const lesson2 = schedule\[slotIndex2\];

if (lesson1 && lesson2 && lesson1.subjectId !== \'VAGO\' &&
lesson1.subjectId === lesson2.subjectId) {

const subjectInfo = classInfo.subjects.find(s =\> s.id ===
lesson1.subjectId);

if (subjectInfo && subjectInfo.weeklyHours \<= 4) {

fitness += 75;

}

}

}

}

teacherDailyLessons.forEach((days, teacherId) =\> {

days.forEach((periods, day) =\> {

periods.sort((a, b) =\> a - b);

let windowPenalty = 0;

const numberOfClassesToday = periods.length;

for (let i = 0; i \< periods.length - 1; i++) {

const gap = periods\[i+1\] - periods\[i\] - 1;

if (gap \> 0) {

if (numberOfClassesToday === 2 \|\| numberOfClassesToday === 3) {

windowPenalty += gap \* 100; // Penalidade maior para janelas em dias
com poucas aulas

} else {

windowPenalty += gap \* 50; // Penalidade padrão

}

}

}

fitness += windowPenalty;

if (periods.length === 1) {

fitness += 20;

}

});

});

});

return fitness;

}

evolvePopulation() {

const newPopulation = \[\];

for (let i = 0; i \< this.config.elitismCount; i++) {

newPopulation.push(this.population\[i\]);

}

while (newPopulation.length \< this.config.populationSize) {

const parent1 = this.tournamentSelection();

const parent2 = this.tournamentSelection();

let childChromosome = this.crossover(parent1.chromosome,
parent2.chromosome);

childChromosome = this.mutate(childChromosome);

newPopulation.push({ chromosome: childChromosome, fitness:
this.calculateFitness(childChromosome) });

}

return newPopulation;

}

tournamentSelection() {

let best = null;

for (let i = 0; i \< this.config.tournamentSize; i++) {

const randomIndividual = this.population\[Math.floor(Math.random() \*
this.population.length)\];

if (best === null \|\| randomIndividual.fitness \< best.fitness) {

best = randomIndividual;

}

}

return best;

}

crossover(parent1, parent2) {

const child = new Map();

this.data.classes.forEach(classInfo =\> {

const classId = classInfo.id;

const totalSlots = classInfo.totalSlots;

const childSchedule = new Array(totalSlots).fill(null);

const fixedSlots = \[\];

const lessonCounts = new Map();

// Step 1: Place fixed lessons and mark their slots. Also, initialize
lesson counts.

classInfo.subjects.forEach(subject =\> {

lessonCounts.set(subject.id, { required: subject.weeklyHours, teacherId:
subject.teacherId });

});

if (classInfo.fixedLessons) {

classInfo.fixedLessons.forEach(fixed =\> {

const slotIndex = fixed.dayIndex \* this.data.maxAulasDiarias +
fixed.period;

childSchedule\[slotIndex\] = { subjectId: fixed.subjectId, teacherId:
fixed.teacherId };

fixedSlots.push(slotIndex);

// Decrement the required count for fixed lessons

if (lessonCounts.has(fixed.subjectId)) {

lessonCounts.get(fixed.subjectId).required\--;

}

});

}

// Step 2: Get the remaining (non-fixed) lessons from parents

const getNonFixedLessons = (parentSchedule) =\> {

const lessons = \[\];

for (let i = 0; i \< totalSlots; i++) {

if (!fixedSlots.includes(i)) {

lessons.push(parentSchedule\[i\]);

}

}

return lessons;

};

const parent1NonFixed = getNonFixedLessons(parent1.get(classId));

const parent2NonFixed = getNonFixedLessons(parent2.get(classId));

// Step 3: Perform crossover on the non-fixed lessons

const crossoverPoint = Math.floor(Math.random() \*
parent1NonFixed.length);

let childNonFixed = parent1NonFixed.slice(0,
crossoverPoint).concat(parent2NonFixed.slice(crossoverPoint));

// Step 4: Repair the non-fixed part to have the correct number of
lessons

const currentCounts = new Map();

childNonFixed.forEach(lesson =\> {

if (lesson && lesson.subjectId !== \'VAGO\') {

currentCounts.set(lesson.subjectId, (currentCounts.get(lesson.subjectId)
\|\| 0) + 1);

}

});

const needed = new Map();

lessonCounts.forEach((data, id) =\> {

const current = currentCounts.get(id) \|\| 0;

if (data.required \> current) {

needed.set(id, data.required - current);

}

});

const extra = new Map();

currentCounts.forEach((count, id) =\> {

const required = lessonCounts.get(id)?.required \|\| 0;

if (count \> required) {

extra.set(id, count - required);

}

});

// Replace extra lessons with needed lessons

for (let i = 0; i \< childNonFixed.length; i++) {

const lesson = childNonFixed\[i\];

if (lesson && extra.has(lesson.subjectId) && extra.get(lesson.subjectId)
\> 0) {

let replaced = false;

for (const \[neededId, neededCount\] of needed.entries()) {

if (neededCount \> 0) {

const subjectInfo = classInfo.subjects.find(s =\> s.id === neededId);

childNonFixed\[i\] = { subjectId: neededId, teacherId:
subjectInfo.teacherId };

extra.set(lesson.subjectId, extra.get(lesson.subjectId) - 1);

needed.set(neededId, neededCount - 1);

replaced = true;

break;

}

}

if (!replaced) { // If no specific lesson is needed, turn it into a VAGO
slot

childNonFixed\[i\] = { subjectId: \'VAGO\', teacherId: null };

}

}

}

// Step 5: Place the repaired non-fixed lessons back into the child\'s
schedule

let nonFixedIndex = 0;

for (let i = 0; i \< totalSlots; i++) {

if (!fixedSlots.includes(i)) {

childSchedule\[i\] = childNonFixed\[nonFixedIndex++\] \|\| { subjectId:
\'VAGO\', teacherId: null };

}

}

child.set(classId, childSchedule);

});

return child;

}

mutate(chromosome) {

chromosome.forEach((schedule, classId) =\> {

const classInfo = this.data.classes.find(c =\> c.id === classId);

const fixedSlots = classInfo.fixedLessons.map(f =\> f.dayIndex \*
this.data.maxAulasDiarias + f.period);

for (let i = 0; i \< schedule.length; i++) {

if (fixedSlots.includes(i)) continue;

if (Math.random() \< this.config.mutationRate) {

let j = Math.floor(Math.random() \* schedule.length);

while(fixedSlots.includes(j)) {

j = Math.floor(Math.random() \* schedule.length);

}

\[schedule\[i\], schedule\[j\]\] = \[schedule\[j\], schedule\[i\]\];

}

}

});

return chromosome;

}

// ✅ PARTE 1: Substitua esta função dentro da classe GeneticScheduler

formatSchedule(individual) {

const formatted = new Map();

individual.chromosome.forEach((schedule, classId) =\> {

const classSchedule = {};

for (let i = 0; i \< schedule.length; i++) {

const dayIndex = Math.floor(i / this.data.maxAulasDiarias);

const period = i % this.data.maxAulasDiarias;

const day = diasDaSemanaEng\[dayIndex\];

if (!classSchedule\[day\]) classSchedule\[day\] = \[\];

const lesson = schedule\[i\];

const subject = this.data.subjects.find(s =\> s.id ===
lesson.subjectId);

const teacher = this.data.teachers.find(t =\> t.id ===
lesson.teacherId);

// CORREÇÃO: Gera apenas texto simples, sem HTML

classSchedule\[day\]\[period\] = lesson.subjectId === \'VAGO\' ? \' \' :
\`\${subject?.name \|\| \'N/A\'} (\${teacher?.name \|\| \'N/D\'})\`;

}

formatted.set(classId, classSchedule);

});

return formatted;

}

}

//
=======================================================================

// 3. FUNÇÕES DE GESTÃO DE DADOS (Modelos e Sessão)

//
=======================================================================

// SUBSTITUA A FUNÇÃO \'getModels\' INTEIRA POR ESTA

function getModels() {

const modelsJSON = localStorage.getItem(MODELS_STORAGE_KEY);

if (!modelsJSON) {

return {};

}

try {

// Adicionado try-catch para evitar erros com dados corrompidos

const models = JSON.parse(modelsJSON);

return models && typeof models === \'object\' ? models : {};

} catch (e) {

console.error(\"Erro ao analisar modelos salvos:\", e);

// Se houver um erro, remove o item corrompido para evitar futuros
problemas

localStorage.removeItem(MODELS_STORAGE_KEY);

return {};

}

}

function saveModel(modelName) {

const models = getModels();

models\[modelName\] = {

professores: userData.professores,

disciplinas: userData.disciplinas,

timestamp: new Date().toISOString()

};

localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));

}

function loadModel(modelName) {

const models = getModels();

const modelData = models\[modelName\];

if (modelData) {

resetarDadosParaNovoHorario(); // Limpa dados da sessão atual

userData.professores = modelData.professores \|\| \[\];

userData.disciplinas = modelData.disciplinas \|\| \[\];

return true;

}

return false;

}

function deleteModel(modelName) {

const models = getModels();

delete models\[modelName\];

localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));

}

function saveCurrentSession() {

try {

const dataToSave = { \...userData };

if (dataToSave.horarioGerado instanceof Map) {

dataToSave.horarioGerado = Object.fromEntries(dataToSave.horarioGerado);

}

localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave));

return true;

} catch (e) {

console.error(\"Erro ao salvar a sessão:\", e);

return false;

}

}

function loadCurrentSession() {

const dadosSalvos = localStorage.getItem(SESSION_STORAGE_KEY);

if (dadosSalvos) {

try {

const dadosParseados = JSON.parse(dadosSalvos);

userData = {\...userData, \...dadosParseados };

if (userData.horarioGerado && !(userData.horarioGerado instanceof Map))
{

userData.horarioGerado = new
Map(Object.entries(userData.horarioGerado));

}

updateFinalScreenButtonVisibility();

return true;

} catch (e) {

console.error(\"Erro ao carregar a sessão:\", e);

localStorage.removeItem(SESSION_STORAGE_KEY);

return false;

}

}

return false;

}

//
=======================================================================

// 4. FUNÇÕES AUXILIARES E DO CHATBOT

//
=======================================================================

function getProfessorCargaHoraria(nomeProfessor) {

const professor = userData.professores.find(p =\> p.nome ===
nomeProfessor);

if (!professor) return { atribuidas: 0, disponivel: 0 };

let aulasAtribuidas = 0;

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach(disc =\> {

if (disc.professorNome === nomeProfessor) {

aulasAtribuidas += disc.qtdAulasSemanais;

}

});

});

let disponibilidadeReal = 0;

if (professor.gradeDisponibilidade) {

for (const dia in professor.gradeDisponibilidade) {

disponibilidadeReal += professor.gradeDisponibilidade\[dia\].filter(slot
=\> slot === \'D\').length;

}

}

return { atribuidas: aulasAtribuidas, disponivel: disponibilidadeReal };

}

// COLE ESTE BLOCO INTEIRO APÓS A FUNÇÃO getProfessorCargaHoraria()

// COLE ESTE BLOCO INTEIRO DEPOIS DA FUNÇÃO getProfessorCargaHoraria()

function exibirAlertaModal(titulo, mensagem) {

const modal = document.getElementById(\'infoModal\');

if (!modal) return;

document.getElementById(\'info-modal-title\').textContent = titulo;

document.getElementById(\'info-modal-message\').innerHTML = mensagem;

modal.style.display = \'block\';

document.getElementById(\'info-modal-close-btn\').onclick = () =\> {

modal.style.display = \'none\';

};

}

function calcularCotaDiariaTotal() {

const maxAulas = Math.max(0,
\...Object.values(userData.horarioFinal).map(t =\> t.aulasDiarias));

const totalProfessores = userData.professores.length;

tempData.cotasDiarias = {};

diasDaSemanaEng.forEach(diaEng =\> {

let cotaTotalDoDia = 0;

for (let periodo = 0; periodo \< maxAulas; periodo++) {

let aulasFixasNoSlot = 0;

Object.values(userData.horarioFinal).forEach(turma =\> {

if (turma.horariosFixos.some(hf =\> hf.dia ===
diasDaSemana\[diasDaSemanaEng.indexOf(diaEng)\] && hf.periodo ===
periodo)) {

aulasFixasNoSlot++;

}

});

cotaTotalDoDia += (totalProfessores - aulasFixasNoSlot);

}

tempData.cotasDiarias\[diaEng\] = cotaTotalDoDia \> 0 ? cotaTotalDoDia :
0;

});

}

function atualizarVisorDeDisponibilidade() {

if (!userData.professores) return;

if (!tempData.cotasDiarias) calcularCotaDiariaTotal();

// 1. Atualiza Cotas Diárias

diasDaSemanaEng.forEach(diaEng =\> {

const cotaTotal = tempData.cotasDiarias\[diaEng\] \|\| 0;

let alocadas = 0;

if (userData.gradeIndisponibilidadeGeral &&
userData.gradeIndisponibilidadeGeral\[diaEng\]) {

userData.gradeIndisponibilidadeGeral\[diaEng\].forEach(slot =\> {

slot?.forEach(item =\> {

if (item.sigla === \'P\' \|\| item.sigla === \'HA\') {

alocadas++;

}

});

});

}

const spanCota = document.getElementById(\`cota-dia-\${diaEng}\`);

if (spanCota) {

spanCota.textContent = \`(\${alocadas}/\${cotaTotal})\`;

spanCota.style.color = alocadas \>= cotaTotal ? \'#B91C1C\' :
\'#15803D\';

}

});

// 2. Atualiza Contadores dos Professores

userData.professores.forEach(prof =\> {

const pTotal = prof.aulasSemanaisPlanejamento \|\| 0;

const haTotal = prof.horaAtividade \|\| 0;

let pAlocados = 0;

let haAlocados = 0;

if (userData.gradeIndisponibilidadeGeral) {

Object.values(userData.gradeIndisponibilidadeGeral).forEach(dia =\> {

dia?.forEach(slot =\> {

slot?.forEach(item =\> {

if (item.prof === prof.nome) {

if (item.sigla === \'P\') pAlocados++;

if (item.sigla === \'HA\') haAlocados++;

}

});

});

});

}

const contadorDiv =
document.getElementById(\`contador-prof-\${prof.nome.replace(/\s+/g,
\'-\')}\`);

if (contadorDiv) {

const pCor = pAlocados \>= pTotal ? \'text-red-600 font-bold\' :
\'text-gray-600\';

const haCor = haAlocados \>= haTotal ? \'text-red-600 font-bold\' :
\'text-gray-600\';

contadorDiv.innerHTML = \`(P: \<span
class=\"\${pCor}\"\>\${pAlocados}/\${pTotal}\</span\> \| HA: \<span
class=\"\${haCor}\"\>\${haAlocados}/\${haTotal}\</span\>)\`;

}

});

}

function adaptarGradeGeralParaProfessores() {

const maxAulas = Math.max(0,
\...Object.values(userData.horarioFinal).map(t =\> t.aulasDiarias));

if (maxAulas === 0) return;

userData.professores.forEach(prof =\> {

prof.gradeDisponibilidade = {};

diasDaSemana.forEach(diaPt =\> {

prof.gradeDisponibilidade\[diaPt\] = Array.from({ length: maxAulas }, ()
=\> \'D\');

});

});

diasDaSemanaEng.forEach((diaEng, diaIndex) =\> {

const diaPt = diasDaSemana\[diaIndex\];

if (userData.gradeIndisponibilidadeGeral\[diaEng\]) {

userData.gradeIndisponibilidadeGeral\[diaEng\].forEach((slot, periodo)
=\> {

slot.forEach(indisponibilidade =\> {

const professor = userData.professores.find(p =\> p.nome ===
indisponibilidade.prof);

if (professor && professor.gradeDisponibilidade\[diaPt\]?.\[periodo\]
!== undefined) {

const status = indisponibilidade.sigla === \'ND\' ? \'ND\' : \'P\';

professor.gradeDisponibilidade\[diaPt\]\[periodo\] = status;

}

});

});

}

});

}

// SUBSTITUA A FUNÇÃO INTEIRA PELA VERSÃO FINAL ABAIXO:

// SUBSTITUA A FUNÇÃO INTEIRA PELA VERSÃO FINAL ABAIXO:

async function exibirTabelaDeIndisponibilidadeGeral() {

await addBotMessage(\"Defina as indisponibilidades: \<b\>1.\</b\> Clique
no professor \> \<b\>2.\</b\> Clique na sigla \> \<b\>3.\</b\> Clique
nos horários na grade.\");

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

// Inicializa a grade de indisponibilidade se ainda não existir

if (!userData.gradeIndisponibilidadeGeral \|\|
Object.keys(userData.gradeIndisponibilidadeGeral).length === 0) {

const maxAulas = Math.max(0,
\...Object.values(userData.horarioFinal).map(t =\> t.aulasDiarias));

if (maxAulas \> 0) {

diasDaSemanaEng.forEach(dia =\> {

userData.gradeIndisponibilidadeGeral\[dia\] = Array.from({ length:
maxAulas }, () =\> \[\]);

});

}

}

calcularCotaDiariaTotal();

const renderizarListaSiglas = () =\> {

const listaSiglasUL = document.getElementById(\'lista-siglas-indisp\');

if (!listaSiglasUL) return;

listaSiglasUL.innerHTML = (userData.tiposIndisponibilidade \|\|
\[\]).map(s =\> \`

\<li class=\"p-2 rounded hover:bg-amber-100 flex justify-between
items-center cursor-pointer\" title=\"Clique para selecionar, clique
duplo para editar\" data-sigla-id=\"\${s.sigla}\"\>

\<span class=\"w-full\"\>\<b\>\${s.sigla}\</b\> - \${s.desc}\</span\>

\${s.editavel ? \`\<span class=\"text-red-500 font-bold delete-sigla-btn
ml-2 cursor-pointer\" title=\"Excluir Sigla\"
data-sigla-del=\"\${s.sigla}\"\>&times;\</span\>\` : \'\'}

\</li\>

\`).join(\'\');

};

let uiHTML = \`

\<div class=\"flex flex-col md:flex-row gap-4\"
id=\"container-indisponibilidade\"\>

\<div class=\"flex-shrink-0 border rounded-lg p-2 bg-white w-full
md:w-56\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>1.
Professores\</h4\>

\<ul id=\"lista-professores-indisp\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1 max-h-48 md:max-h-96 overflow-y-auto\"\>

\${userData.professores.map(p =\> \`

\<li class=\"p-2 rounded hover:bg-gray-100 transition-colors
duration-150\" data-professor-nome=\"\${p.nome}\"\>

\${p.nome}

\<div class=\"text-xs\" id=\"contador-prof-\${p.nome.replace(/\s+/g,
\'-\')}\"\>\</div\>

\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-shrink-0 border rounded-lg p-2 bg-white w-full
md:w-56\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>2.
Indisponibilidade\</h4\>

\<ul id=\"lista-siglas-indisp\" class=\"list-none p-0 text-sm
space-y-1\"\>\</ul\>

\<div id=\"form-add-sigla\" class=\"hidden space-y-2 mt-2\"\>

\<input type=\"text\" id=\"input-nova-sigla\" placeholder=\"Sigla (ex:
RE)\" class=\"w-full border p-1 rounded\"\>

\<input type=\"text\" id=\"input-novo-desc\" placeholder=\"Descrição\"
class=\"w-full border p-1 rounded\"\>

\<div class=\"flex gap-2\"\>

\<button id=\"salvar-nova-sigla-btn\" class=\"w-full text-sm
bg-green-500 text-white p-1 rounded\"\>Salvar\</button\>

\<button id=\"cancelar-nova-sigla-btn\" class=\"w-full text-sm
bg-gray-400 text-white p-1 rounded\"\>Cancelar\</button\>

\</div\>

\</div\>

\<button id=\"add-sigla-btn\" class=\"w-full text-sm bg-blue-500
text-white p-2 rounded hover:bg-blue-600 mt-2\"\>Adicionar
Indisponibilidade\</button\>

\<hr class=\"my-3\"\>\<h4 class=\"font-bold text-center border-b pb-1
mb-1\"\>Ações\</h4\>

\<button id=\"limpar-slot-btn\" class=\"w-full text-sm bg-gray-600
text-white p-2 rounded hover:bg-gray-700 mt-2 transition-colors\"\>Modo
Limpar\</button\>

\</div\>

\<div class=\"flex-grow\"\>

\<h4 class=\"font-bold text-center mb-1\"\>3. Grade de Horários\</h4\>

\<div class=\"table-container\"\>\<table class=\"data-table
fixed-schedule-grid\" id=\"grade-horarios-indisp\"\>\</table\>\</div\>

\</div\>

\</div\>

\<div class=\"mt-6 flex justify-end\"\>

\<button id=\"save-indisponibilidade-btn\" class=\"option-button
button-highlight-conclude\"\>Salvar e Prosseguir\</button\>

\</div\>

\`;

availabilityGridContainer.innerHTML = uiHTML;

const maxAulasDiarias = Math.max(0,
\...Object.values(userData.horarioFinal).map(t =\> t.aulasDiarias));

const gradeTable = document.getElementById(\'grade-horarios-indisp\');

const thead = gradeTable.createTHead();

let headerRowHTML = \'\<th\>Período\</th\>\';

diasDaSemana.forEach((dia, index) =\> {

headerRowHTML += \`\<th\>\${dia} \<span class=\"font-normal text-xs\"
id=\"cota-dia-\${diasDaSemanaEng\[index\]}\"\>\</span\>\</th\>\`;

});

thead.insertRow().innerHTML = headerRowHTML;

const tbody = gradeTable.createTBody();

for (let i = 0; i \< maxAulasDiarias; i++) {

let row = tbody.insertRow();

row.insertCell().textContent = \`\${i + 1}º\`;

diasDaSemanaEng.forEach(diaEng =\> {

let cell = row.insertCell();

cell.classList.add(\'slot-indisp\', \'cursor-pointer\',
\'hover:bg-yellow-100\', \'align-top\', \'h-12\', \'p-1\',
\'relative\');

cell.dataset.dia = diaEng;

cell.dataset.periodo = i;

});

}

const popularGradeComDados = () =\> {

for (let i = 0; i \< maxAulasDiarias; i++) {

diasDaSemanaEng.forEach((diaEng, j) =\> {

const cell = gradeTable.rows\[i + 1\]?.cells\[j + 1\];

if (cell) {

const indisponibilidades =
userData.gradeIndisponibilidadeGeral\[diaEng\]?.\[i\] \|\| \[\];

cell.innerHTML = indisponibilidades.map(item =\>

\`\<div class=\"text-xs p-1 my-1 bg-gray-200 rounded
text-gray-700\"\>\${item.prof} (\${item.sigla})\</div\>\`

).join(\'\');

}

});

}

};

let professorSelecionado = null;

let siglaSelecionada = null;

let modoLimparAtivo = false;

// Listener de eventos principal para todo o container

document.getElementById(\'container-indisponibilidade\').addEventListener(\'click\',
e =\> {

const target = e.target;

const formAddSigla = document.getElementById(\'form-add-sigla\');

const btnAddSigla = document.getElementById(\'add-sigla-btn\');

const btnLimpar = document.getElementById(\'limpar-slot-btn\');

if (target.closest(\'#lista-professores-indisp li\')) {

const liProfessor = target.closest(\'li\');

professorSelecionado = liProfessor.dataset.professorNome;

document.querySelectorAll(\'#lista-professores-indisp li\').forEach(li
=\> li.classList.remove(\'bg-indigo-200\', \'font-bold\'));

liProfessor.classList.add(\'bg-indigo-200\', \'font-bold\');

} else if (target.closest(\'#lista-siglas-indisp li\') &&
!target.closest(\'.delete-sigla-btn\')) {

const liSigla = target.closest(\'li\');

siglaSelecionada = liSigla.dataset.siglaId;

document.querySelectorAll(\'#lista-siglas-indisp li\').forEach(el =\>
el.classList.remove(\'bg-amber-200\', \'font-bold\'));

liSigla.classList.add(\'bg-amber-200\', \'font-bold\');

} else if (target.id === \'add-sigla-btn\') {

formAddSigla.classList.remove(\'hidden\');

btnAddSigla.classList.add(\'hidden\');

} else if (target.id === \'cancelar-nova-sigla-btn\') {

formAddSigla.classList.add(\'hidden\');

btnAddSigla.classList.remove(\'hidden\');

} else if (target.id === \'salvar-nova-sigla-btn\') {

const inputSigla = document.getElementById(\'input-nova-sigla\');

const inputDesc = document.getElementById(\'input-novo-desc\');

const novaSigla = inputSigla.value.trim().toUpperCase();

const novaDesc = inputDesc.value.trim();

if (novaSigla && novaDesc && !userData.tiposIndisponibilidade.some(s =\>
s.sigla === novaSigla)) {

userData.tiposIndisponibilidade.push({ sigla: novaSigla, desc: novaDesc,
editavel: true });

renderizarListaSiglas();

inputSigla.value = \'\';

inputDesc.value = \'\';

formAddSigla.classList.add(\'hidden\');

btnAddSigla.classList.remove(\'hidden\');

} else if (!novaSigla \|\| !novaDesc) {

exibirAlertaModal(\"Campo Vazio\", \"Ambos os campos, Sigla e Descrição,
devem ser preenchidos.\");

} else {

exibirAlertaModal(\"Erro de Duplicidade\", \`A sigla \"\${novaSigla}\"
já existe.\`);

}

} else if (target.closest(\'.delete-sigla-btn\')) {

const siglaParaDeletar =
target.closest(\'.delete-sigla-btn\').dataset.siglaDel;

if (confirm(\`Tem certeza que deseja excluir a sigla
\"\${siglaParaDeletar}\"?\`)) {

userData.tiposIndisponibilidade =
userData.tiposIndisponibilidade.filter(s =\> s.sigla !==
siglaParaDeletar);

renderizarListaSiglas();

}

} else if (target === btnLimpar) {

modoLimparAtivo = !modoLimparAtivo;

btnLimpar.classList.toggle(\'bg-red-500\', modoLimparAtivo);

btnLimpar.classList.toggle(\'bg-gray-600\', !modoLimparAtivo);

addBotMessage(modoLimparAtivo ? \"\<b\>Modo Limpar ativado:\</b\> Clique
em um slot da grade para limpar suas alocações.\" : \"Modo Limpar
desativado.\");

} else if (target.closest(\'.slot-indisp\')) {

const cellSlot = target.closest(\'.slot-indisp\');

const dia = cellSlot.dataset.dia;

const periodo = parseInt(cellSlot.dataset.periodo, 10);

if (modoLimparAtivo) {

if (userData.gradeIndisponibilidadeGeral\[dia\]?.\[periodo\]?.length \>
0) {

if (confirm(\`Tem certeza que deseja limpar as alocações deste horário
(\${dia}, \${periodo + 1}º)?\`)) {

userData.gradeIndisponibilidadeGeral\[dia\]\[periodo\] = \[\];

popularGradeComDados();

atualizarVisorDeDisponibilidade();

}

}

return;

}

if (!professorSelecionado) { exibirAlertaModal(\"Ação Necessária\",
\"Por favor, selecione um professor da lista.\"); return; }

if (!siglaSelecionada) { exibirAlertaModal(\"Ação Necessária\", \"Por
favor, selecione uma sigla de indisponibilidade.\"); return; }

const profData = userData.professores.find(p =\> p.nome ===
professorSelecionado);

if (!profData) return;

const pTotal = profData.aulasSemanaisPlanejamento \|\| 0;

const haTotal = profData.horaAtividade \|\| 0;

let pAlocados = 0, haAlocados = 0;

Object.values(userData.gradeIndisponibilidadeGeral).flat(2).forEach(item
=\> {

if (item?.prof === professorSelecionado) {

if (item.sigla === \'P\') pAlocados++;

if (item.sigla === \'HA\') haAlocados++;

}

});

const listaIndisponiveis =
userData.gradeIndisponibilidadeGeral\[dia\]\[periodo\];

const indexExistente = listaIndisponiveis.findIndex(item =\> item.prof
=== professorSelecionado);

if (indexExistente === -1) {

if (siglaSelecionada === \'P\' && pAlocados \>= pTotal) {

exibirAlertaModal(\"Limite Atingido\", \`O professor
\<b\>\${professorSelecionado}\</b\> já tem suas \<b\>\${pTotal}\</b\>
aulas de Planejamento alocadas.\`);

return;

}

if (siglaSelecionada === \'HA\' && haAlocados \>= haTotal) {

exibirAlertaModal(\"Limite Atingido\", \`O professor
\<b\>\${professorSelecionado}\</b\> já tem suas \<b\>\${haTotal}\</b\>
Horas Atividade alocadas.\`);

return;

}

}

if (indexExistente !== -1) {

if (listaIndisponiveis\[indexExistente\].sigla === siglaSelecionada) {

listaIndisponiveis.splice(indexExistente, 1);

} else {

listaIndisponiveis\[indexExistente\].sigla = siglaSelecionada;

}

} else {

listaIndisponiveis.push({ prof: professorSelecionado, sigla:
siglaSelecionada });

}

popularGradeComDados();

atualizarVisorDeDisponibilidade();

}

});

document.getElementById(\'save-indisponibilidade-btn\').onclick = () =\>
handleUserInput(\'SALVAR_INDISPONIBILIDADE_GERAL\');

renderizarListaSiglas();

popularGradeComDados();

atualizarVisorDeDisponibilidade();

conversationState = \'CONFIGURANDO_INDISPONIBILIDADE_GERAL\';

}

// ADICIONE ESTAS DUAS NOVAS FUNÇÕES AO SEU SCRIPT

function formatarMinutosParaHora(totalMinutos) {

const horas = Math.floor(totalMinutos / 60);

const minutos = totalMinutos % 60;

return \`\${String(horas).padStart(2,
\'0\')}:\${String(minutos).padStart(2, \'0\')}\`;

}

function adicionarMinutosAHora(horaString, minutosParaAdicionar) {

let totalMinutos = parseHoraParaMinutos(horaString);

totalMinutos += minutosParaAdicionar;

return formatarMinutosParaHora(totalMinutos);

}

/\*\*

\* NOVO: Controla a visibilidade do botão \"Tela Final\"

\*/

function updateFinalScreenButtonVisibility() {

const finalScreenButton =
document.getElementById(\'final-screen-button\');

if (!finalScreenButton) return;

// Verifica se existe um horário gerado nos dados do usuário

const hasHorario = userData.horarioGerado &&
(Object.keys(userData.horarioGerado).length \> 0 \|\|
(userData.horarioGerado instanceof Map && userData.horarioGerado.size \>
0));

if (hasHorario) {

finalScreenButton.classList.remove(\'hidden\'); // Mostra o botão

} else {

finalScreenButton.classList.add(\'hidden\'); // Esconde o botão

}

}

/\*\*

\* ✅ NOVA FUNÇÃO

\* Retorna um array com as disciplinas, siglas e aulas padrão

\* com base no nível de ensino (Médio ou Fundamental).

\*/

function getDisciplinasPadrao() {

const nivel = userData.nivelEnsino;

if (nivel === \'MEDIO\') {

return \[

{ nome: \'Língua Portuguesa\', sigla: \'LP\', aulas: 4 },

{ nome: \'Língua Inglesa\', sigla: \'LI\', aulas: 2 },

{ nome: \'Matemática\', sigla: \'MAT\', aulas: 4 },

{ nome: \'Física\', sigla: \'FIS\', aulas: 2 },

{ nome: \'Química\', sigla: \'QUI\', aulas: 2 },

{ nome: \'Biologia\', sigla: \'BIO\', aulas: 2 },

{ nome: \'História\', sigla: \'HIS\', aulas: 2 },

{ nome: \'Geografia\', sigla: \'GEO\', aulas: 2 },

{ nome: \'Filosofia\', sigla: \'FIL\', aulas: 1 },

{ nome: \'Sociologia\', sigla: \'SOC\', aulas: 1 },

{ nome: \'Artes\', sigla: \'ART\', aulas: 1 },

{ nome: \'Educação Física\', sigla: \'EF\', aulas: 1 },

{ nome: \'Estudo Orientado\', sigla: \'EO\', aulas: 2 },

{ nome: \'Nivelamento de Matemática\', sigla: \'NIV-MAT\', aulas: 2 },

{ nome: \'Nivelamento de Português\', sigla: \'NIV-LP\', aulas: 2 },

{ nome: \'Redação\', sigla: \'RED\', aulas: 2 },

{ nome: \'Projeto de vida\', sigla: \'PV\', aulas: 2 },

{ nome: \'Eletiva\', sigla: \'ELE\', aulas: 2 },

{ nome: \'Prática Experimental Química\', sigla: \'PEQ\', aulas: 2 },

{ nome: \'Prática Experimental Física\', sigla: \'PEF\', aulas: 2 },

{ nome: \'Prática Experimental Matemática\', sigla: \'PEM\', aulas: 1 },

{ nome: \'Prática Experimental Biologia\', sigla: \'PEB\', aulas: 2 },

{ nome: \'Avaliação Semanal/E.O.\', sigla: \'AV/EO\', aulas: 2 }

\];

}

if (nivel === \'FUNDAMENTAL\') {

return \[

{ nome: \'Língua Portuguesa\', sigla: \'LP\', aulas: 5 },

{ nome: \'Matemática\', sigla: \'MAT\', aulas: 5 },

{ nome: \'Ciências\', sigla: \'CIE\', aulas: 3 },

{ nome: \'História\', sigla: \'HIS\', aulas: 2 },

{ nome: \'Geografia\', sigla: \'GEO\', aulas: 2 },

{ nome: \'Arte\', sigla: \'ART\', aulas: 1 },

{ nome: \'Educação Física\', sigla: \'EF\', aulas: 1 },

{ nome: \'Língua Estrangeira\', sigla: \'LE\', aulas: 1 }

\];

}

return \[\]; // Retorna vazio se não for nenhum dos dois

}

// ✅ SUBSTITUA SUA FUNÇÃO addBotMessage POR ESTA VERSÃO COMPLETA

function addBotMessage(message, delay = 500, isQuestion = false) {

return new Promise(resolve =\> {

setTimeout(() =\> {

// Cria o container principal da mensagem (ícone + balão)

const messageContainer = document.createElement(\'div\');

messageContainer.className = \'flex items-end gap-3\'; // Usamos flexbox
para alinhar

// Ícone do Bot (agora com o seu logo)

const iconContainer = document.createElement(\'div\');

// Apenas definimos o tamanho, sem o fundo ou preenchimento da classe
\'chat-avatar\'

iconContainer.className = \'w-10 h-10\';

iconContainer.innerHTML = \`\<svg baseProfile=\"tiny\" version=\"1.2\"
xmlns=\"http://www.w3.org/2000/svg\"
xmlns:ev=\"http://www.w3.org/2001/xml-events\"
xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"w-full h-full\"
viewBox=\"0 0 250 210\"\>

\<defs\>

\<linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"0%\"
y2=\"100%\"\>

\<stop offset=\"0.0\" stop-color=\"#00f0ff\" /\>

\<stop offset=\"1.0\" stop-color=\"#c040f0\" /\>

\</linearGradient\>

\<linearGradient id=\"grad2\" x1=\"0%\" y1=\"0%\" x2=\"100%\"
y2=\"100%\"\>

\<stop offset=\"0.0\" stop-color=\"#00f0ff\" /\>

\<stop offset=\"1.0\" stop-color=\"#c040f0\" /\>

\</linearGradient\>

\</defs\>

\<path d=\"M 50 60 Q 50 40 70 40 H 180 Q 200 40 200 60 V 130 Q 200 150
180 150 H 90 L 70 170 V 150 H 70 Q 50 150 50 130 Z\"
fill=\"url(#grad1)\" /\>

\<circle cx=\"175\" cy=\"95\" fill=\"none\" r=\"45\"
stroke=\"url(#grad2)\" stroke-width=\"4\" /\>

\<circle cx=\"175\" cy=\"95\" fill=\"#121538\" r=\"40\" /\>

\<line stroke=\"white\" stroke-width=\"4\" x1=\"175\" x2=\"200\"
y1=\"95\" y2=\"110\" /\>

\<line stroke=\"white\" stroke-width=\"4\" x1=\"175\" x2=\"175\"
y1=\"95\" y2=\"65\" /\>

\<line stroke=\"red\" stroke-width=\"2\" x1=\"175\" x2=\"160\" y1=\"95\"
y2=\"115\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"175\" x2=\"175\"
y1=\"55\" y2=\"60\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"215\" x2=\"210\"
y1=\"95\" y2=\"95\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"175\" x2=\"175\"
y1=\"135\" y2=\"130\" /\>

\<line stroke=\"white\" stroke-width=\"6\" x1=\"135\" x2=\"140\"
y1=\"95\" y2=\"95\" /\>

\</svg\>\`;

// Balão da mensagem

const messageElement = document.createElement(\'div\');

messageElement.className = \`chat-bubble-bot p-3 max-w-md break-words
\${isQuestion ? \'question-highlight-bot\' : \'\'}\`;

messageElement.innerHTML = message;

// Adiciona o ícone e o balão ao container

messageContainer.appendChild(iconContainer);

messageContainer.appendChild(messageElement);

// Adiciona o container completo ao chat

chatMessages.appendChild(messageContainer);

scrollToBottom();

resolve();

}, delay);

});

}

// ✅ SUBSTITUA SUA FUNÇÃO addUserMessage POR ESTA

function addUserMessage(message) {

if (!message.trim()) return;

// Cria o container principal da mensagem (ícone + balão)

const messageContainer = document.createElement(\'div\');

messageContainer.className = \'flex items-end gap-3 justify-end\'; //
Alinha tudo à direita

// Ícone do Usuário (SVG de um ícone de pessoa)

const iconContainer = document.createElement(\'div\');

iconContainer.className = \'chat-avatar user\';

iconContainer.innerHTML = \`\<svg xmlns=\"http://www.w3.org/2000/svg\"
viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-full h-full\"\>

\<path fill-rule=\"evenodd\" d=\"M18.685 19.097A9.723 9.723 0 0 0 21.75
12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0
3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0
6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1
5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0
1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z\"
clip-rule=\"evenodd\" /\>

\</svg\>\`;

// Balão da mensagem

const messageElement = document.createElement(\'div\');

messageElement.className = \'chat-bubble-user p-3 max-w-md
break-words\';

messageElement.textContent = message;

// Adiciona o balão e o ícone ao container. A ordem é importante aqui.

messageContainer.appendChild(messageElement);

messageContainer.appendChild(iconContainer);

// Adiciona o container completo ao chat

chatMessages.appendChild(messageContainer);

userInput.value = \'\';

scrollToBottom();

}

// SUBSTITUA A FUNÇÃO \'exibirTelaDeBoasVindas\' INTEIRA POR ESTA

async function exibirTelaDeBoasVindas() {

// 1. Limpa o conteúdo atual do chat.

chatMessages.innerHTML = \'\';

optionsContainer.innerHTML = \'\';

// 2. Adiciona as mensagens de boas-vindas.

await addBotMessage(\"Bem-vindo ao ChatHorário! Sou seu assistente para
criar horários escolares.\");

await addBotMessage(\"Como deseja começar?\", 500, true);

// 3. Monta a lista de opções do zero, na ordem correta e sem
duplicatas.

const startupOptions = \[\]; // Começa com a lista VAZIA

// Adiciona \"Continuar Sessão\" se existir uma

if (localStorage.getItem(SESSION_STORAGE_KEY)) {

startupOptions.push({

text: \"Continuar Sessão Anterior\",

value: \"CARREGAR_SESSAO\",

highlight: \"action\"

});

}

// Adiciona as opções padrão

startupOptions.push(

{ text: \"Começar do Zero\", value: \"CRIAR_NOVO\" },

{ text: \"Importar Arquivo (.json)\", value: \"IMPORTAR_JSON\" }

);

// Adiciona opções de Modelo se existirem

const models = getModels();

if (Object.keys(models).length \> 0) {

startupOptions.push({

text: \"Carregar Modelo de Escola\",

value: \"CARREGAR_MODELO\",

highlight: \"action\"

});

startupOptions.push({

text: \"Gerir Modelos\",

value: \"GERIR_MODELOS\"

});

}

showOptions(startupOptions);

// 4. Define o estado da conversa para aguardar a escolha do usuário.

conversationState = \'POST_START_CHOICE\';

}

function scrollToBottom() {

chatMessages.scrollTop = chatMessages.scrollHeight;

}

function clearOptions() {

optionsContainer.innerHTML = \'\';

}

function showOptions(options, multiSelect = false, additionalActions =
\[\]) {

const buttonGroupContainer = document.createElement(\'div\');

buttonGroupContainer.className = \'flex flex-wrap gap-2 justify-start\';

chatMessages.appendChild(buttonGroupContainer);

const disableButtonGroup = () =\> {

buttonGroupContainer.querySelectorAll(\'button\').forEach(btn =\> {

btn.disabled = true;

btn.classList.add(\'opacity-50\', \'cursor-not-allowed\');

btn.classList.remove(\'action-button\');

});

userInput.disabled = false;

userInput.placeholder = \"Digite sua mensagem\...\";

userInput.focus();

};

options.forEach(option =\> {

const button = document.createElement(\'button\');

let highlightClass = \'\';

if (option.highlight) {

switch(option.highlight) {

case \'import\': highlightClass = \'button-highlight-import
action-button\'; break;

case \'conclude\': highlightClass = \'button-highlight-conclude
action-button\'; break;

case \'action\': highlightClass = \'button-highlight-action
action-button\'; break;

case \'correct\': highlightClass = \'button-correct action-button\';
break;

case \'save\': highlightClass = \'button-save action-button\'; break;

}

}

button.className = \`option-button \${option.customClass \|\| \'\'}
\${highlightClass}\`;

button.innerHTML = option.text;

button.dataset.value = option.value \|\| option.text;

button.onclick = () =\> {

if (!option.keepActive) {

disableButtonGroup();

}

addUserMessage(option.text.replace(/\<\[\^\>\]\*\>?/gm, \'\'));

handleUserInput(option.value \|\| option.text);

};

if (multiSelect) {

button.onclick = () =\>
button.classList.toggle(\'option-button-selected\');

}

buttonGroupContainer.appendChild(button);

});

if (multiSelect) {

const confirmButton = document.createElement(\'button\');

confirmButton.className = \'bg-green-500 hover:bg-green-600 text-white
font-medium py-2 px-4 rounded-lg text-sm confirm-multiselect-btn
action-button\';

confirmButton.textContent = \"Confirmar Seleção\";

buttonGroupContainer.appendChild(confirmButton);

confirmButton.onclick = () =\> {

disableButtonGroup();

const selectedValues = \[\];

const selectedTexts = \[\];

buttonGroupContainer.querySelectorAll(\'.option-button-selected\').forEach(btn
=\> {

selectedValues.push(btn.dataset.value);

selectedTexts.push(btn.textContent);

});

addUserMessage(selectedTexts.length \> 0 ? selectedTexts.join(\', \') :
\"Nenhuma opção selecionada.\");

handleUserInput(selectedValues);

};

}

additionalActions.forEach(action =\> {

const button = document.createElement(\'button\');

button.className = \`option-button button-highlight-action mt-2\`;

button.textContent = action.text;

buttonGroupContainer.appendChild(button);

button.onclick = () =\> {

disableButtonGroup();

addUserMessage(action.text);

handleUserInput(action.value);

};

});

userInput.disabled = true;

userInput.placeholder = \"Selecione uma opção acima\";

scrollToBottom();

}

/\*\*

\* NOVO: Adiciona um container com uma barra de progresso ao chat.

\*/

function addProgressBar() {

const progressBarContainer = document.createElement(\'div\');

progressBarContainer.id = \'progress-bar-container\';

progressBarContainer.className = \'my-3 p-3 bg-indigo-50 rounded-lg
shadow-inner\';

progressBarContainer.innerHTML = \`

\<p class=\"text-sm font-medium text-indigo-800 mb-2\"\>Otimizando o
horário, por favor aguarde\...\</p\>

\<div class=\"w-full bg-indigo-200 rounded-full h-5\"\>

\<div id=\"generation-progress-bar-inner\"

class=\"bg-indigo-600 h-5 rounded-full text-xs font-bold text-white
text-center leading-5 transition-all duration-300\"

style=\"width: 0%\"\>

0%

\</div\>

\</div\>

\`;

chatMessages.appendChild(progressBarContainer);

scrollToBottom();

}

/\*\*

\* NOVO: Atualiza a largura e o texto da barra de progresso.

\* @param {number} percentage - O percentual de conclusão (0-100).

\*/

function updateProgressBar(percentage) {

const innerBar =
document.getElementById(\'generation-progress-bar-inner\');

if (innerBar) {

innerBar.style.width = \`\${percentage}%\`;

innerBar.textContent = \`\${percentage}%\`;

}

}

/\*\*

\* NOVO: Remove a barra de progresso do chat.

\*/

function removeProgressBar() {

const progressBarContainer =
document.getElementById(\'progress-bar-container\');

if (progressBarContainer) {

progressBarContainer.remove();

}

}

//
=======================================================================

// 5. Funções de Adaptação e Geração com Algoritmo Genético

//
=======================================================================

function adaptDataForGeneticScheduler(sourceData) {

const classes = Object.values(sourceData.horarioFinal).map(turma =\> {

const subjects = turma.disciplinas.map(disc =\> ({

id: \`\${turma.key}-\${disc.nome}\`,

name: disc.nome,

weeklyHours: disc.qtdAulasSemanais,

teacherId: disc.professorNome

}));

const fixedLessons = turma.horariosFixos.map(fixed =\> {

const diaIndex = diasDaSemana.indexOf(fixed.dia);

const disciplinaDaAulaFixa = turma.disciplinas.find(d =\> d.nome ===
fixed.disciplina);

return {

dayIndex: diaIndex,

period: fixed.periodo,

subjectId: \`\${turma.key}-\${fixed.disciplina}\`,

teacherId: disciplinaDaAulaFixa?.professorNome

};

});

return {

id: turma.key,

name: turma.displayText,

totalSlots: turma.aulasDiarias \* 5,

subjects,

fixedLessons

};

});

const maxAulasDiarias = classes.length \> 0 ?
Math.max(\...Object.values(sourceData.horarioFinal).map(t =\>
t.aulasDiarias)) : 0;

const teacherAvailability = new Map();

sourceData.professores.forEach(prof =\> {

const availabilityMap = new Map();

diasDaSemana.forEach((diaPt, index) =\> {

const diaEn = diasDaSemanaEng\[index\];

if (prof.gradeDisponibilidade && prof.gradeDisponibilidade\[diaPt\]) {

for(let period = 0; period \< maxAulasDiarias; period++) {

const isAvailable = prof.gradeDisponibilidade\[diaPt\]\[period\] ===
\'D\';

availabilityMap.set(\`\${diaEn}-\${period}\`, isAvailable);

}

}

});

teacherAvailability.set(prof.nome, availabilityMap);

});

const allSubjects = classes.flatMap(c =\> c.subjects);

const simpleTeachers = sourceData.professores.map(prof =\> ({

id: prof.nome,

name: prof.nome

}));

return {

classes,

subjects: allSubjects,

teachers: simpleTeachers,

teacherAvailability,

maxAulasDiarias,

totalSlots: maxAulasDiarias \* 5,

parametrosProcessamento: sourceData.parametrosProcessamento

};

}

async function apresentarMenuPosGeracao() {

await addBotMessage(\"O que deseja fazer a seguir?\", 500, true);

const options = \[

{text: \"Visualizar / Trocar Aulas\", value:
\"VISUALIZAR_HORARIO_GERADO\", highlight: \"action\", keepActive: true},

{text: \"Gerar Outra Opção de Horário\", value:
\"REGERAR_HORARIO_OTIMIZADO\", highlight: \"action\"},

\];

if (horarioHistory.length \> 0) {

options.push({text: \"Ver Versões Salvas\", value:
\"VIEW_SAVED_VERSIONS\", highlight: \"action\"});

}

options.push(

{text: \"Exportar Horário para PDF\", value: \"EXPORTAR_PDF\",
highlight:\"action\"},

{text: \"Exportar Dados para Arquivo (.json)\", value:
\"EXPORTAR_JSON\", highlight:\"action\"},

{text: \"Salvar e Encerrar Sessão\", value: \"SALVAR_E_ENCERRAR\",
highlight:\"save\"},

{text: \"Iniciar Novo Horário\", value: \"REFAZER_TUDO\",
highlight:\"correct\"}

);

showOptions(options);

conversationState = \'AWAITING_POST_GENERATION_ACTION\';

}

async function iniciarGeracaoComAlgoritmoGenetico(isFirstGeneration =
false) {

await addBotMessage(\"Adaptando dados para a geração do horário\...\");

const schedulerData = adaptDataForGeneticScheduler(userData);

await addBotMessage(\"Iniciando a evolução do horário com o
\<b\>ChatHorário\</b\>. Isso pode levar alguns instantes\...\");

scheduler = new GeneticScheduler();

const result = await scheduler.generate(schedulerData);

if (result) {

await addBotMessage(\"Processo de evolução concluído. Exibindo o melhor
horário encontrado.\");

userData.horarioGerado = result;

updateFinalScreenButtonVisibility();

if(isFirstGeneration) {

await salvarVersaoHorario(\'Versão Inicial\');

} else {

await salvarVersaoHorario(\`Nova Versão \#\${horarioHistory.filter(h =\>
h.descricao.startsWith(\"Nova\")).length + 1}\`);

}

await addBotMessage(\"O horário será aberto em uma nova janela
(modal).\<br\>\<b\>Dica:\</b\> O botão para \<b\>Trocar Aulas
Manualmente\</b\> fica no rodapé dessa janela.\", 200);

await mostrarHorarioGerado();

await apresentarMenuPosGeracao();

} else {

await addBotMessage(\"Não foi possível gerar um horário. Verifique as
configurações e tente novamente.\");

conversationState = \'SHOW_CORRECTION_OPTIONS\';

await handleUserInput(\"corrigir\");

}

}

//
=======================================================================

// FUNÇÕES PARA CADASTRO DE TURMAS E DISCIPLINAS EM TABELA

//
=======================================================================

/\*\*

\* Abre um modal de confirmação customizado.

\*/

function solicitarConfirmacaoExclusao(elementos, mensagem, callback =
null) {

elementosParaExcluir = { itens: elementos, aposExcluir: callback };

const modal = document.getElementById(\'deleteConfirmModal\');

const modalMessage =
document.getElementById(\'delete-confirm-message\');

modalMessage.textContent = mensagem;

modal.style.display = \'block\';

}

/\*\*

\* Fluxo de Contagem de Turmas por Série/Ano

\*/

async function iniciarContagemDeTurmas() {

const nivel = userData.nivelEnsino;

const seriesAnos = (nivel === \'MEDIO\') ? \[1, 2, 3\] : \[1, 2, 3, 4,
5, 6, 7, 8, 9\];

tempData.contagemTurmas = {};

tempData.seriesAnosParaPerguntar = seriesAnos;

tempData.serieAnoAtualIndex = 0;

await addBotMessage(\"Ótimo! Para agilizar, vamos cadastrar todas as
turmas de uma vez.\");

await proximaPerguntaContagemTurma();

}

async function proximaPerguntaContagemTurma() {

const index = tempData.serieAnoAtualIndex;

const seriesAnos = tempData.seriesAnosParaPerguntar;

if (index \< seriesAnos.length) {

const serieAno = seriesAnos\[index\];

const serieAnoLabel = (userData.nivelEnsino === \'FUNDAMENTAL\') ?
\'Ano\' : \'Série\';

await addBotMessage(\`Quantas turmas da \<b\>\${serieAno}ª
\${serieAnoLabel}\</b\> você deseja cadastrar?\`, 500, true);

const options = Array.from({ length: 11 }, (\_, i) =\> ({ text:
\`\${i}\`, value: \`\${i}\` }));

showOptions(options);

conversationState = \'AGUARDANDO_CONTAGEM_DE_TURMA\';

} else {

await exibirTabelaDeCadastroDeTurmas();

}

}

/\*\*

\* 💡 PASSO 2 DO NOVO FLUXO

\* Exibe a tabela para o usuário preencher os detalhes de cada turma.

\*/

async function exibirTabelaDeCadastroDeTurmas() {

await addBotMessage(\"Perfeito. Agora, preencha os detalhes para cada
turma na tabela abaixo e clique em \'Salvar Turmas\'.\");

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

let tableHTML = \`

\<div class=\"table-container\"\>

\<table class=\"data-table\" id=\"data-table\"\>

\<thead\>

\<tr\>

\<th\>Série/Ano\</th\>

\<th\>Identificação da Turma (Ex: A)\</th\>

\<th\>Nº de Aulas Diárias\</th\>

\</tr\>

\</thead\>

\<tbody\>

\`;

const serieAnoLabel = (userData.nivelEnsino === \'FUNDAMENTAL\') ?
\'Ano\' : \'Série\';

const prefix = userData.nivelEnsino.substring(0, 1);

for (const serieAno in tempData.contagemTurmas) {

const quantidade = tempData.contagemTurmas\[serieAno\];

for (let i = 0; i \< quantidade; i++) {

const inputId = \`\${prefix}-\${serieAno}-\${i}\`;

tableHTML += \`

\<tr data-serie-ano=\"\${serieAno}\"\>

\<td\>\${serieAno}ª \${serieAnoLabel}\</td\>

\<td\>\<input type=\"text\" id=\"id-turma-\${inputId}\" class=\"w-full
border border-gray-300 p-2 rounded-md\" placeholder=\"Ex: A\"\>\</td\>

\<td\>\<input type=\"number\" id=\"aulas-turma-\${inputId}\"
class=\"w-24 border border-gray-300 p-2 rounded-md\" placeholder=\"Ex:
5\" min=\"1\" max=\"10\"\>\</td\>

\</tr\>

\`;

}

}

tableHTML += \`\</tbody\>\</table\>\</div\>\`;

availabilityGridContainer.innerHTML = tableHTML;

const saveButton = document.createElement(\'button\');

saveButton.textContent = \'Salvar Turmas\';

saveButton.className = \'option-button button-highlight-conclude mt-4\';

saveButton.onclick = () =\>
handleUserInput(\"SALVAR_TURMAS_DA_TABELA\");

availabilityGridContainer.appendChild(saveButton);

conversationState = \'PREENCHENDO_TABELA_TURMAS\';

}

/\*\*

\* ✅ FUNÇÃO CORRIGIDA

\* Processa a tabela de cadastro inicial e depois chama a tela de
gerenciamento.

\*/

async function salvarTurmasDaTabela() {

// A função salvarEdicoesDaTabelaDeTurmas já faz tudo que precisamos.

// Vamos chamá-la e, se o salvamento for bem-sucedido, mostramos a
tabela de gerenciamento.

const sucesso = await salvarEdicoesDaTabelaDeTurmas(true); // Passamos
\'true\' para indicar que é o salvamento inicial

if (sucesso) {

await mostrarTabelaTurmasCadastradas();

}

}

/\*\*

\* Exibe a tabela editável para o Gerenciamento de Turmas.

\*/

async function mostrarTabelaTurmasCadastradas() {

const turmas = Object.values(userData.horarioFinal);

if (turmas.length === 0) {

await addBotMessage(\"\<p\>Nenhuma turma cadastrada ainda.\</p\>\");

await iniciarContagemDeTurmas();

return;

}

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

let tableHTML = \`

\<h3 class=\"text-lg font-semibold mb-2\"\>Gerenciamento de
Turmas\</h3\>

\<p class=\"text-sm text-gray-600 mb-4\"\>Edite os dados, marque para
excluir e use os botões de ação abaixo.\</p\>

\<div class=\"table-container\"\>

\<table class=\"data-table\" id=\"tabela-editavel-turmas\"\>

\<thead\>

\<tr\>

\<th class=\"w-10\"\>Excluir\</th\>

\<th\>Série/Ano\</th\>

\<th\>Identificação da Turma\</th\>

\<th\>Aulas Diárias\</th\>

\</tr\>

\</thead\>

\<tbody\>\`;

const serieAnoLabel = (userData.nivelEnsino === \'FUNDAMENTAL\') ?
\'Ano\' : \'Série\';

turmas.forEach(turma =\> {

tableHTML += \`

\<tr data-serie-ano=\"\${turma.serieAno}\"\>

\<td\>\<input type=\"checkbox\" class=\"delete-turma-checkbox h-5 w-5
mx-auto\"\>\</td\>

\<td\>\${turma.serieAno}º \${serieAnoLabel}\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1\"
value=\"\${turma.id}\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-24 border-b p-1 text-center\"
value=\"\${turma.aulasDiarias}\" min=\"1\" max=\"10\"\>\</td\>

\</tr\>\`;

});

tableHTML += \`\</tbody\>\</table\>\</div\>\`;

availabilityGridContainer.innerHTML = tableHTML;

const actionContainer = document.createElement(\'div\');

actionContainer.className = \'mt-6 flex justify-between items-center\';

const seriesAnos = (userData.nivelEnsino === \'MEDIO\') ? \[1, 2, 3\] :
\[1, 2, 3, 4, 5, 6, 7, 8, 9\];

let selectOptions = seriesAnos.map(s =\> \`\<option
value=\"\${s}\"\>\${s}ª \${serieAnoLabel}\</option\>\`).join(\'\');

actionContainer.innerHTML = \`

\<div class=\"flex items-center gap-2\"\>

\<select id=\"select-nova-turma\" class=\"border-gray-300 rounded-md
p-2\"\>\${selectOptions}\</select\>

\<button id=\"add-turma-btn\" class=\"option-button
button-highlight-action\"\>Adicionar Turma\</button\>

\<button id=\"delete-selected-turmas-btn\" class=\"option-button
button-correct\"\>Excluir Selecionadas\</button\>

\</div\>

\<button id=\"save-turmas-btn\" class=\"option-button
button-highlight-conclude\"\>Salvar Alterações e
Prosseguir\</button\>\`;

availabilityGridContainer.appendChild(actionContainer);

const tabelaBody =
document.getElementById(\'tabela-editavel-turmas\').querySelector(\'tbody\');

document.getElementById(\'add-turma-btn\').addEventListener(\'click\',
() =\> {

const select = document.getElementById(\'select-nova-turma\');

const serieAno = select.value;

const newRow = tabelaBody.insertRow();

newRow.dataset.serieAno = serieAno;

newRow.innerHTML = \`

\<td\>\<input type=\"checkbox\" class=\"delete-turma-checkbox h-5 w-5
mx-auto\"\>\</td\>

\<td\>\${serieAno}º \${serieAnoLabel}\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1\"
placeholder=\"Nova Turma\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-24 border-b p-1 text-center\"
placeholder=\"5\" min=\"1\" max=\"10\"\>\</td\>\`;

});

document.getElementById(\'delete-selected-turmas-btn\').addEventListener(\'click\',
() =\> {

const checkboxes =
tabelaBody.querySelectorAll(\'.delete-turma-checkbox:checked\');

if (checkboxes.length \> 0) {

const linhasParaExcluir = Array.from(checkboxes).map(cb =\>
cb.closest(\'tr\'));

solicitarConfirmacaoExclusao(

linhasParaExcluir,

\`Você tem certeza que deseja excluir as \${linhasParaExcluir.length}
turmas selecionadas?\`

);

} else {

addBotMessage(\"Nenhuma turma selecionada para exclusão.\");

}

});

document.getElementById(\'save-turmas-btn\').addEventListener(\'click\',
() =\> handleUserInput(\'SALVAR_EDICOES_TURMAS\'));

await addBotMessage(\"A tabela de turmas foi aberta acima para edição.
Quando terminar, clique em \'Salvar Alterações e Prosseguir\'.\");

conversationState = \'EDITANDO_TABELA_TURMAS\';

}

/\*\*

\* ✅ FUNÇÃO CORRIGIDA

\* Lê a tabela editável, valida, salva e retorna true/false.

\* A responsabilidade de avançar para a próxima tela foi movida para o
handleUserInput.

\*/

async function salvarEdicoesDaTabelaDeTurmas(isInitialSave = false) {

const tableId = isInitialSave ? \'data-table\' :
\'tabela-editavel-turmas\';

const tabelaBody = document.querySelector(\`#\${tableId} tbody\`);

if (!tabelaBody) {

await addBotMessage(\"Erro: Tabela de turmas não encontrada.\");

return false;

}

const novasTurmas = {};

const todasLinhas = tabelaBody.querySelectorAll(\'tr\');

let dadosValidos = true;

let temDuplicatas = false;

const chavesUnicas = new Set();

for (const linha of todasLinhas) {

const serieAno = linha.dataset.serieAno;

const idInput = linha.querySelector(\'input\[type=\"text\"\]\');

const aulasInput = linha.querySelector(\'input\[type=\"number\"\]\');

const idTurma = idInput.value.trim().toUpperCase();

const aulasDiarias = parseInt(aulasInput.value, 10);

if (idInput) idInput.classList.remove(\'border-red-500\');

if (aulasInput) aulasInput.classList.remove(\'border-red-500\');

if (!idTurma \|\| !aulasDiarias \|\| aulasDiarias \<= 0) {

if (!idTurma && idInput) idInput.classList.add(\'border-red-500\');

if ((!aulasDiarias \|\| aulasDiarias \<= 0) && aulasInput)
aulasInput.classList.add(\'border-red-500\');

dadosValidos = false;

} else {

const prefix = userData.nivelEnsino.substring(0, 1);

const serieAnoLabel = (userData.nivelEnsino === \'FUNDAMENTAL\') ?
\'Ano\' : \'Série\';

const turmaKey = \`\${prefix}-\${serieAno}-\${idTurma}\`;

if (chavesUnicas.has(turmaKey)) {

temDuplicatas = true;

if(idInput) idInput.classList.add(\'border-red-500\');

} else {

chavesUnicas.add(turmaKey);

novasTurmas\[turmaKey\] = {

key: turmaKey,

displayText: \`\${serieAno}º \${serieAnoLabel} \${idTurma}\`,

type: userData.nivelEnsino,

serieAno: serieAno,

id: idTurma,

aulasDiarias: aulasDiarias,

aulasSemanais: aulasDiarias \* 5,

disciplinas: \[\],

horariosFixos: \[\]

};

}

}

}

if (!dadosValidos) {

await addBotMessage(\"\<b\>Erro:\</b\> Por favor, preencha todos os
campos das turmas. Os campos em vermelho precisam de atenção.\");

return false;

}

if (temDuplicatas) {

await addBotMessage(\"\<b\>Erro:\</b\> Existem turmas com o mesmo
identificador para a mesma série. Por favor, corrija os campos em
vermelho.\");

return false;

}

userData.horarioFinal = novasTurmas;

await addBotMessage(\"✅ Turmas salvas com sucesso!\");

return true; // Retorna true para indicar que o salvamento foi
bem-sucedido

}

async function iniciarCadastroDisciplinas() {

await addBotMessage(\"Vamos configurar as disciplinas. A tabela abaixo
foi pré-preenchida com um modelo padrão.\");

const disciplinasPadrao = getDisciplinasPadrao();

exibirTabelaDeDisciplinas(disciplinasPadrao);

}

/\*\*

\* Cria a tabela dinâmica e editável para as disciplinas.

\*/

function exibirTabelaDeDisciplinas(disciplinas) {

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

const turmas = Object.values(userData.horarioFinal);

let headers = \`\<th
class=\"w-10\"\>Excluir\</th\>\<th\>Disciplina\</th\>\<th\>Abreviatura\</th\>\`;

turmas.forEach(turma =\> {

headers += \`\<th
class=\"text-center\"\>\${turma.displayText}\<br\>\<small
class=\"font-normal\"\>(Total:
\${turma.aulasSemanais})\</small\>\</th\>\`;

});

let rows = \'\';

disciplinas.forEach((disciplina, index) =\> {

rows += \`

\<tr data-row-id=\"\${index}\"\>

\<td\>\<input type=\"checkbox\" class=\"delete-disciplina-checkbox h-5
w-5 mx-auto\"\>\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1\"
value=\"\${disciplina.nome}\"\>\</td\>

\<td\>\<input type=\"text\" class=\"w-20 border-b p-1 text-center\"
value=\"\${disciplina.sigla}\"\>\</td\>

\${turmas.map(() =\> \`\<td\>\<input type=\"number\" class=\"w-20
border-b p-1 text-center\" value=\"\${disciplina.aulas}\"
min=\"0\"\>\</td\>\`).join(\'\')}

\</tr\>\`;

});

let totalRow = \`

\<tr class=\"bg-gray-100 font-bold\"\>

\<td colspan=\"3\" class=\"text-right p-2\"\>TOTAL DE AULAS POR
TURMA:\</td\>

\${turmas.map((turma, i) =\> \`\<td id=\"total-turma-\${i}\"
class=\"text-center p-2\"\>0\</td\>\`).join(\'\')}

\</tr\>\`;

const fullHTML = \`

\<h3 class=\"text-lg font-semibold mb-2\"\>Configuração de
Disciplinas\</h3\>

\<p class=\"text-sm text-gray-600 mb-4\"\>Ajuste os dados, marque para
excluir e use os botões abaixo.\</p\>

\<div class=\"table-container\"\>

\<table class=\"data-table\" id=\"tabela-disciplinas\"\>

\<thead\>\<tr\>\${headers}\</tr\>\</thead\>

\<tbody\>\${rows}\</tbody\>

\<tfoot\>\${totalRow}\</tfoot\>

\</table\>

\</div\>

\<div class=\"mt-6 flex justify-between items-center\"\>

\<div\>

\<button id=\"add-disciplina-btn\" class=\"option-button
button-highlight-action\"\>Adicionar Nova Disciplina\</button\>

\<button id=\"delete-selected-disciplinas-btn\" class=\"option-button
button-correct\"\>Excluir Selecionadas\</button\>

\</div\>

\<button id=\"save-disciplinas-btn\" class=\"option-button
button-highlight-conclude\"\>Salvar Disciplinas e Prosseguir\</button\>

\</div\>\`;

availabilityGridContainer.innerHTML = fullHTML;

const tabelaDisciplinas =
document.getElementById(\'tabela-disciplinas\');

const addBtn = document.getElementById(\'add-disciplina-btn\');

const deleteBtn =
document.getElementById(\'delete-selected-disciplinas-btn\');

const saveBtn = document.getElementById(\'save-disciplinas-btn\');

tabelaDisciplinas.addEventListener(\'input\', (event) =\> {

if (event.target.type === \'number\') {

calcularTotaisDisciplinas();

}

});

deleteBtn.addEventListener(\'click\', () =\> {

const checkboxes =
tabelaDisciplinas.querySelectorAll(\'.delete-disciplina-checkbox:checked\');

if (checkboxes.length \> 0) {

const linhasParaExcluir = Array.from(checkboxes).map(cb =\>
cb.closest(\'tr\'));

solicitarConfirmacaoExclusao(

linhasParaExcluir,

\`Você tem certeza que deseja excluir as \${linhasParaExcluir.length}
disciplina(s) selecionada(s)?\`,

calcularTotaisDisciplinas

);

} else {

addBotMessage(\"Nenhuma disciplina selecionada para exclusão.\");

}

});

addBtn.addEventListener(\'click\', () =\> {

const tabelaBody = tabelaDisciplinas.querySelector(\'tbody\');

const newRow = tabelaBody.insertRow();

newRow.innerHTML = \`

\<td\>\<input type=\"checkbox\" class=\"delete-disciplina-checkbox h-5
w-5 mx-auto\"\>\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1\"
placeholder=\"Nova Disciplina\"\>\</td\>

\<td\>\<input type=\"text\" class=\"w-20 border-b p-1 text-center\"
placeholder=\"SIGLA\"\>\</td\>

\${turmas.map(() =\> \`\<td\>\<input type=\"number\" class=\"w-20
border-b p-1 text-center\" value=\"0\"
min=\"0\"\>\</td\>\`).join(\'\')}\`;

});

saveBtn.addEventListener(\'click\', () =\>
handleUserInput(\"SALVAR_DADOS_DISCIPLINAS\"));

calcularTotaisDisciplinas();

conversationState = \'EDITANDO_TABELA_DISCIPLINAS\';

}

function calcularTotaisDisciplinas() {

const turmas = Object.values(userData.horarioFinal);

const tabelaBody = document.querySelector(\'#tabela-disciplinas
tbody\');

if(!tabelaBody) return;

turmas.forEach((turma, turmaIndex) =\> {

let totalCalculado = 0;

const linhas = tabelaBody.querySelectorAll(\'tr\');

linhas.forEach(linha =\> {

const input =
linha.querySelectorAll(\'input\[type=\"number\"\]\')\[turmaIndex\];

if(input) totalCalculado += parseInt(input.value, 10) \|\| 0;

});

const totalCell =
document.getElementById(\`total-turma-\${turmaIndex}\`);

if(totalCell) {

totalCell.textContent = totalCalculado;

if (totalCalculado === turma.aulasSemanais) {

totalCell.style.backgroundColor = \'#D1FAE5\';

totalCell.style.color = \'#065F46\';

} else {

totalCell.style.backgroundColor = \'#FEE2E2\';

totalCell.style.color = \'#991B1B\';

}

}

});

}

async function salvarDadosDasDisciplinas() {

const turmas = Object.values(userData.horarioFinal);

const tabelaBody = document.querySelector(\'#tabela-disciplinas
tbody\');

let todosOsTotaisCorretos = true;

const errosDeValidacao = \[\];

if (!tabelaBody) {

await addBotMessage(\"Erro: Tabela de disciplinas não encontrada.\");

return;

}

turmas.forEach((turma, turmaIndex) =\> {

const totalCell =
document.getElementById(\`total-turma-\${turmaIndex}\`);

const totalCalculado = parseInt(totalCell.textContent, 10);

if (totalCalculado !== turma.aulasSemanais) {

todosOsTotaisCorretos = false;

const diferenca = Math.abs(totalCalculado - turma.aulasSemanais);

const tipoErro = totalCalculado \> turma.aulasSemanais ? \'\<b\>a
mais\</b\>\' : \'\<b\>a menos\</b\>\';

errosDeValidacao.push(\`\<li\>A turma \<b\>\${turma.displayText}\</b\>
espera \${turma.aulasSemanais} aulas, mas a soma na tabela é
\${totalCalculado}.\</li\>\`);

}

});

if (!todosOsTotaisCorretos) {

let mensagemErroHTML = \"\<b\>Atenção: A soma das aulas não bate com o
total da turma.\</b\>\<ul class=\'list-disc pl-5 mt-2\'\>\" +
errosDeValidacao.join(\'\') + \"\</ul\>\";

await addBotMessage(mensagemErroHTML);

showOptions(\[

{ text: \"Ajustar aulas na tabela de Disciplinas\", value:
\"CORRIGIR_DISCIPLINAS_TABELA\", highlight: \"action\" },

{ text: \"Corrigir total de aulas das Turmas\", value:
\"VOLTAR_PARA_EDICAO_TURMAS\", highlight: \"correct\" }

\]);

return;

}

const disciplinasMasterList = \[\];

turmas.forEach(turma =\> turma.disciplinas = \[\]);

const linhas = tabelaBody.querySelectorAll(\'tr\');

linhas.forEach(linha =\> {

const nomeInput = linha.querySelector(\'input\[type=\"text\"\]\');

const siglaInput =
linha.querySelectorAll(\'input\[type=\"text\"\]\')\[1\];

const nomeDisciplina = nomeInput ? nomeInput.value.trim() : \'\';

const siglaDisciplina = siglaInput ?
siglaInput.value.trim().toUpperCase() : \'\';

if (!nomeDisciplina \|\| !siglaDisciplina) return;

// Adiciona à lista mestre se ainda não existir

if (!disciplinasMasterList.some(d =\> d.nome === nomeDisciplina)) {

disciplinasMasterList.push({ nome: nomeDisciplina, sigla:
siglaDisciplina });

}

const inputsDeAula =
linha.querySelectorAll(\'input\[type=\"number\"\]\');

turmas.forEach((turma, turmaIndex) =\> {

const qtdAulas = parseInt(inputsDeAula\[turmaIndex\].value, 10) \|\| 0;

if (qtdAulas \> 0) {

turma.disciplinas.push({

nome: nomeDisciplina,

sigla: siglaDisciplina, // ✅ GARANTE QUE A SIGLA SEJA SALVA

qtdAulasSemanais: qtdAulas,

professorNome: null

});

}

});

});

userData.disciplinas = disciplinasMasterList;

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"✅ Disciplinas configuradas com sucesso!\");

await exibirTabelaDeProfessores();

}

/\*\*

\* Ponto de entrada que chama a construção da nova interface.

\*/

async function iniciarFixacaoDeAulas() {

await addBotMessage(\"Ok. Na tela a seguir, clique primeiro em uma
disciplina, depois em uma ou mais turmas, e por fim, nos horários
desejados para fixar as aulas.\");

exibirInterfaceDeFixacao();

}

/\*\*

\* Cria a interface de 3 colunas para a fixação avançada de aulas.

\*/

function exibirInterfaceDeFixacao() {

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

const turmas = Object.values(userData.horarioFinal);

const disciplinas = \[\...userData.disciplinas\]; // Garante que é uma
cópia

// Estrutura principal com 3 colunas usando Flexbox

let fullHTML = \`

\<h3 class=\"text-lg font-semibold mb-2\"\>Fixação de Aulas na
Grade\</h3\>

\<div class=\"flex gap-4\" id=\"container-fixacao\"\>

\<div class=\"flex-shrink-0 border rounded-lg p-2 bg-white\"
style=\"width: 200px;\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>1.
Disciplina\</h4\>

\<ul id=\"lista-disciplinas-fixar\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1\"\>

\${disciplinas.map(d =\> \`\<li class=\"p-1 rounded
hover:bg-indigo-100\"
data-disciplina=\"\${d}\"\>\${d}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-shrink-0 border rounded-lg p-2 bg-white\"
style=\"width: 150px;\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>2.
Turmas\</h4\>

\<ul id=\"lista-turmas-fixar\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1\"\>

\${turmas.map(t =\> \`\<li class=\"p-1 rounded hover:bg-indigo-100\"
data-turma-key=\"\${t.key}\"\>\${t.displayText}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-grow\"\>

\<h4 class=\"font-bold text-center mb-1\"\>3. Grade de Horários\</h4\>

\<div class=\"table-container\"\>

\<table class=\"data-table fixed-schedule-grid\"
id=\"grade-horarios-fixar\"\>

\<thead\>

\<tr\>

\<th\>Período\</th\>

\${diasDaSemana.map(dia =\> \`\<th\>\${dia}\</th\>\`).join(\'\')}

\</tr\>

\</thead\>

\<tbody\>

\</tbody\>

\</table\>

\</div\>

\</div\>

\</div\>

\<div class=\"mt-6 flex justify-end\"\>

\<button id=\"save-fixed-btn\" class=\"option-button
button-highlight-conclude\"\>Concluir Fixação e Prosseguir\</button\>

\</div\>

\`;

availabilityGridContainer.innerHTML = fullHTML;

// \-\-- Lógica da Interface \-\--

const maxAulasDiarias = Math.max(\...turmas.map(t =\> t.aulasDiarias),
0);

const gradeBody =
document.getElementById(\'grade-horarios-fixar\').querySelector(\'tbody\');

// Preenche a grade de horários

for (let i = 0; i \< maxAulasDiarias; i++) {

let rowHTML = \`\<td\>\${i + 1}º Horário\</td\>\`;

diasDaSemana.forEach(dia =\> {

rowHTML += \`\<td class=\"slot-fixar cursor-pointer
hover:bg-yellow-100\" data-dia=\"\${dia}\"
data-periodo=\"\${i}\"\>\</td\>\`;

});

gradeBody.innerHTML += \`\<tr\>\${rowHTML}\</tr\>\`;

}

// Adiciona os Event Listeners principais

const containerFixacao = document.getElementById(\'container-fixacao\');

containerFixacao.addEventListener(\'click\', (event) =\> {

const target = event.target;

// Lógica para selecionar a DISCIPLINA

if (target.closest(\'#lista-disciplinas-fixar\')) {

const li = target.closest(\'li\');

if (li) {

disciplinaSelecionadaParaFixar = li.dataset.disciplina;

// Atualiza visualmente

containerFixacao.querySelectorAll(\'#lista-disciplinas-fixar
li\').forEach(el =\> el.classList.remove(\'bg-indigo-200\',
\'font-bold\'));

li.classList.add(\'bg-indigo-200\', \'font-bold\');

}

}

// Lógica para selecionar as TURMAS (multi-seleção)

if (target.closest(\'#lista-turmas-fixar\')) {

const li = target.closest(\'li\');

if (li) {

const turmaKey = li.dataset.turmaKey;

if (turmasSelecionadasParaFixar.has(turmaKey)) {

turmasSelecionadasParaFixar.delete(turmaKey);

li.classList.remove(\'bg-blue-200\', \'font-bold\');

} else {

turmasSelecionadasParaFixar.add(turmaKey);

li.classList.add(\'bg-blue-200\', \'font-bold\');

}

}

}

// Lógica para clicar no SLOT DE HORÁRIO

if (target.classList.contains(\'slot-fixar\')) {

if (!disciplinaSelecionadaParaFixar \|\|
turmasSelecionadasParaFixar.size === 0) {

addBotMessage(\"⚠️ Por favor, selecione primeiro uma disciplina e pelo
menos uma turma.\", 0);

return;

}

const dia = target.dataset.dia;

const periodo = parseInt(target.dataset.periodo);

const jaTemEssaDisciplina =
target.textContent.includes(disciplinaSelecionadaParaFixar);

turmasSelecionadasParaFixar.forEach(turmaKey =\> {

const turma = userData.horarioFinal\[turmaKey\];

// Limpa qualquer aula nesse slot para essa turma

turma.horariosFixos = turma.horariosFixos.filter(hf =\> hf.dia !== dia
\|\| hf.periodo !== periodo);

// Se a célula não tinha essa disciplina, adiciona. Se tinha, remove
(efeito toggle)

if (!jaTemEssaDisciplina) {

turma.horariosFixos.push({ disciplina: disciplinaSelecionadaParaFixar,
dia, periodo });

}

});

// Atualiza visualmente o slot clicado

target.textContent = jaTemEssaDisciplina ? \'\' :
disciplinaSelecionadaParaFixar;

target.classList.toggle(\'fixed-class-cell\', !jaTemEssaDisciplina);

}

});

document.getElementById(\'save-fixed-btn\').onclick = () =\>
handleUserInput(\'CONCLUIR_FIXACAO_AULAS\');

conversationState = \'FIXANDO_AULAS_EM_GRADE\';

}

// SUBSTITUA A FUNÇÃO INTEIRA PELA VERSÃO FINAL ABAIXO:

// ADICIONE ESTA FUNÇÃO ANTES DE exibirTabelaDeRelacionamentoFinal

function gerarCoresParaDisciplinas() {

if (!tempData.coresDisciplinas) {

tempData.coresDisciplinas = new Map();

const cores = \[

\'#FEE2E2\', \'#FFE4E6\', \'#FCE7F3\', \'#F3E8FF\', \'#EDE9FE\',
\'#E0E7FF\',

\'#DBEAFE\', \'#CFFAFE\', \'#D1FAE5\', \'#F0FDF4\', \'#FEFCE8\',
\'#FFFBEB\'

\];

let corIndex = 0;

// ✅ Garante que userData.disciplinas exista e seja um array

if (Array.isArray(userData.disciplinas)) {

userData.disciplinas.forEach(disciplina =\> {

if(disciplina && disciplina.nome) { // Checagem de segurança

tempData.coresDisciplinas.set(disciplina.nome, cores\[corIndex %
cores.length\]);

corIndex++;

}

});

}

}

}

async function exibirTabelaDeRelacionamentoFinal() {

await addBotMessage(\"Use a interface para o relacionamento:
\<b\>1.\</b\> Selecione 1 professor \> \<b\>2.\</b\> Selecione uma ou
mais disciplinas \> \<b\>3.\</b\> Clique nas turmas para
atribuir/desatribuir instantaneamente.\");

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

gerarCoresParaDisciplinas();

const turmas = Object.values(userData.horarioFinal);

const disciplinas = userData.disciplinas;

// ✅ REMOVIDO o botão \'Atribuir\' do HTML

let uiHTML = \`

\<div class=\"flex flex-col\" id=\"container-relacionamento-final\"\>

\<div class=\"flex flex-col md:flex-row gap-4 mb-4\"\>

\<div class=\"flex-1 border rounded-lg p-2 bg-white\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>1.
Professor\</h4\>

\<ul id=\"lista-professores-rel\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1 max-h-48 overflow-y-auto\"\>

\${userData.professores.map(p =\> \`\<li class=\"p-2 rounded
hover:bg-indigo-100\"
data-professor-nome=\"\${p.nome}\"\>\${p.nome}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-1 border rounded-lg p-2 bg-white\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>2.
Disciplina(s)\</h4\>

\<ul id=\"lista-disciplinas-rel\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1 max-h-48 overflow-y-auto\"\>

\${disciplinas.map(d =\> \`\<li class=\"p-2 rounded hover:bg-amber-100\"
data-disciplina-nome=\"\${d.nome}\" style=\"border-left: 5px solid
\${tempData.coresDisciplinas.get(d.nome)};\"\>\${d.nome}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-1 border rounded-lg p-2 bg-white\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>3.
Turma(s)\</h4\>

\<ul id=\"lista-turmas-rel\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1 max-h-48 overflow-y-auto\"\>

\${turmas.map(t =\> \`\<li class=\"p-2 rounded hover:bg-green-100\"
data-turma-key=\"\${t.key}\"\>\${t.displayText}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\</div\>

\<div class=\"flex justify-center mb-4 gap-4\"\>

\<button id=\"limpar-selecao-btn\" class=\"option-button bg-gray-500
text-white font-semibold shadow-md\"\>Limpar Seleção\</button\>

\</div\>

\<div class=\"table-container\"\>

\<table class=\"data-table\" id=\"grade-relacionamento-principal\"\>

\</table\>

\</div\>

\</div\>

\<div class=\"mt-6 flex justify-end\"\>

\<button id=\"concluir-relacionamento-btn\" class=\"option-button
button-highlight-conclude\"\>Concluir e Validar\</button\>

\</div\>

\`;

availabilityGridContainer.innerHTML = uiHTML;

const popularTabela = () =\> {

const gradeTable =
document.getElementById(\'grade-relacionamento-principal\');

const maxAulasSemanais = Math.max(0, \...turmas.map(t =\>
t.aulasSemanais));

let aHTML = \`

\<thead\>

\<tr\>

\<th class=\"w-1/5\"\>AULA\</th\>

\${turmas.map(t =\> \`\<th\>\${t.displayText}\</th\>\`).join(\'\')}

\</tr\>

\</thead\>

\<tbody\>

\${Array.from({ length: maxAulasSemanais }).map((\_, i) =\> \`

\<tr\>

\<td class=\"font-semibold\"\>\${i + 1}\</td\>

\${turmas.map(t =\> {

let cellContent = \'&nbsp;\';

let cellColor = \'\';

let aulaCounter = 0;

// Encontra a aula para este slot

for (const disciplina of t.disciplinas) {

if (disciplina.professorNome) {

if (i \>= aulaCounter && i \< aulaCounter + disciplina.qtdAulasSemanais)
{

const sigla = userData.disciplinas.find(d =\> d.nome ===
disciplina.nome)?.sigla \|\| \'N/A\';

cellColor = tempData.coresDisciplinas.get(disciplina.nome) + \'80\';

cellContent = \`\<div
class=\"text-xs\"\>\${disciplina.professorNome}-\${sigla}\</div\>\`;

break;

}

aulaCounter += disciplina.qtdAulasSemanais;

}

}

return \`\<td class=\"slot-relacionamento\"
style=\"background-color:\${cellColor}\"\>\${cellContent}\</td\>\`;

}).join(\'\')}

\</tr\>

\`).join(\'\')}

\</tbody\>

\<tfoot\>

\<tr\>

\<td class=\"font-bold text-right pr-2\"\>Total\</td\>

\${turmas.map(t =\> {

const totalAlocadas = t.disciplinas.reduce((acc, d) =\> acc +
(d.professorNome ? d.qtdAulasSemanais : 0), 0);

return \`\<td
class=\"font-bold\"\>\${totalAlocadas}/\${t.aulasSemanais}\</td\>\`;

}).join(\'\')}

\</tr\>

\</tfoot\>

\`;

gradeTable.innerHTML = aHTML;

};

let professorSelecionado = null;

let disciplinasSelecionadas = new Set();

let turmasSelecionadas = new Set();

document.getElementById(\'container-relacionamento-final\').addEventListener(\'click\',
(e) =\> {

const target = e.target.closest(\'li\');

if (!target) return; // Se o clique não foi em um item de lista, ignora

if (target.closest(\'#lista-professores-rel\')) {

professorSelecionado = target.dataset.professorNome;

document.querySelectorAll(\'#lista-professores-rel li\').forEach(li =\>
li.classList.remove(\'bg-indigo-200\', \'font-bold\'));

target.classList.add(\'bg-indigo-200\', \'font-bold\');

} else if (target.closest(\'#lista-disciplinas-rel\')) {

const discNome = target.dataset.disciplinaNome;

target.classList.toggle(\'bg-amber-200\');

target.classList.toggle(\'font-bold\');

disciplinasSelecionadas.has(discNome) ?
disciplinasSelecionadas.delete(discNome) :
disciplinasSelecionadas.add(discNome);

} else if (target.closest(\'#lista-turmas-rel\')) {

if (!professorSelecionado \|\| disciplinasSelecionadas.size === 0) {

exibirAlertaModal(\"Seleção Incompleta\", \"Primeiro, selecione 1
professor e pelo menos 1 disciplina.\");

return;

}

const turmaKey = target.dataset.turmaKey;

const turma = userData.horarioFinal\[turmaKey\];

// Toggle de seleção visual

target.classList.toggle(\'bg-green-200\');

target.classList.toggle(\'font-bold\');

// Lógica de Atribuição/Desatribuição Instantânea

disciplinasSelecionadas.forEach(disciplinaNome =\> {

const disciplinaNaTurma = turma.disciplinas.find(d =\> d.nome ===
disciplinaNome);

if (disciplinaNaTurma) {

// Se a turma está sendo desmarcada, limpa o professor

if (turmasSelecionadas.has(turmaKey)) {

if (disciplinaNaTurma.professorNome === professorSelecionado) {

disciplinaNaTurma.professorNome = null;

}

} else { // Se está sendo marcada, atribui o professor

disciplinaNaTurma.professorNome = professorSelecionado;

}

}

});

// Atualiza o set de turmas selecionadas

turmasSelecionadas.has(turmaKey) ? turmasSelecionadas.delete(turmaKey) :
turmasSelecionadas.add(turmaKey);

popularTabela();

}

});

document.getElementById(\'concluir-relacionamento-btn\').onclick = ()
=\> handleUserInput(\'CONCLUIR_E_VALIDAR\');

popularTabela();

conversationState = \'RELACIONAMENTO_FINAL\';

}

/\*\*

\* 💡 NOVO: Exibe uma tabela totalmente editável para gerenciar os
professores.

\* Substitui a antiga função que apenas mostrava um resumo.

\*/

async function exibirTabelaDeProfessores() {

await addBotMessage(\"Abaixo está a tabela para gerenciar os
professores. Você pode adicionar, editar ou remover e depois clicar em
\'Salvar e Prosseguir\'.\");

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

// Mapeia os dados existentes para a nova estrutura com Hora Atividade
(HA)

const professoresParaExibir = userData.professores.map(p =\> ({

nome: p.nome \|\| \'\',

ch: p.aulasSemanaisSala \|\| 0,

p: p.aulasSemanaisPlanejamento \|\| 0,

ha: p.horaAtividade \|\| 0, // Adiciona o novo campo HA

// Preserva dados não editáveis na tabela

disciplinasMinistra: p.disciplinasMinistra \|\| \[\],

gradeDisponibilidade: p.gradeDisponibilidade \|\| {}

}));

let tableHTML = \`

\<div class=\"table-container\"\>

\<table class=\"data-table\" id=\"tabela-professores\"\>

\<thead\>

\<tr\>

\<th class=\"w-10\"\>\<input type=\"checkbox\"
id=\"selecionar-todos-professores\" title=\"Selecionar Todos\"\>\</th\>

\<th\>Nome do Professor\</th\>

\<th title=\"Carga Horária em Sala de Aula\"\>CH\</th\>

\<th title=\"Planejamento\"\>P\</th\>

\<th title=\"Hora Atividade\"\>HA\</th\>

\<th\>Ações\</th\>

\</tr\>

\</thead\>

\<tbody\>

\`;

professoresParaExibir.forEach((prof, index) =\> {

tableHTML += \`

\<tr data-index=\"\${index}\" data-nome-original=\"\${prof.nome}\"\>

\<td\>\<input type=\"checkbox\" class=\"delete-professor-checkbox h-5
w-5 mx-auto\"\>\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1 bg-transparent
nome-prof-input\" value=\"\${prof.nome}\" placeholder=\"Nome
Completo\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-20 border-b p-1 text-center
bg-transparent ch-prof-input\" value=\"\${prof.ch}\" min=\"0\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-20 border-b p-1 text-center
bg-transparent p-prof-input\" value=\"\${prof.p}\" min=\"0\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-20 border-b p-1 text-center
bg-transparent ha-prof-input\" value=\"\${prof.ha}\" min=\"0\"\>\</td\>

\<td\>

\<button class=\"text-sm bg-blue-500 text-white px-2 py-1 rounded
hover:bg-blue-600 editar-disciplinas-btn\"\>Disciplinas\</button\>

\<button class=\"text-sm bg-purple-500 text-white px-2 py-1 rounded
hover:bg-purple-600
editar-disponibilidade-btn\"\>Disponibilidade\</button\>

\</td\>

\</tr\>

\`;

});

tableHTML += \`\</tbody\>\</table\>\</div\>\`;

availabilityGridContainer.innerHTML = tableHTML;

// Ações abaixo da tabela

const actionContainer = document.createElement(\'div\');

actionContainer.className = \'mt-6 flex justify-between items-center\';

actionContainer.innerHTML = \`

\<div\>

\<button id=\"add-professor-btn\" class=\"option-button
button-highlight-action\"\>Adicionar Professor\</button\>

\<button id=\"delete-professors-btn\" class=\"option-button
button-correct\"\>Excluir Selecionados\</button\>

\</div\>

\<button id=\"save-professors-btn\" class=\"option-button
button-highlight-conclude\"\>Salvar e Prosseguir\</button\>

\`;

availabilityGridContainer.appendChild(actionContainer);

// \-\-- Lógica dos Eventos \-\--

const tabelaBody =
document.getElementById(\'tabela-professores\').querySelector(\'tbody\');

document.getElementById(\'add-professor-btn\').onclick = () =\> {

const newIndex = tabelaBody.rows.length;

const newRow = tabelaBody.insertRow();

newRow.dataset.index = newIndex;

newRow.innerHTML = \`

\<td\>\<input type=\"checkbox\" class=\"delete-professor-checkbox h-5
w-5 mx-auto\"\>\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1 bg-transparent
nome-prof-input\" placeholder=\"Novo Professor\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-20 border-b p-1 text-center
bg-transparent ch-prof-input\" value=\"0\" min=\"0\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-20 border-b p-1 text-center
bg-transparent p-prof-input\" value=\"0\" min=\"0\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-20 border-b p-1 text-center
bg-transparent ha-prof-input\" value=\"0\" min=\"0\"\>\</td\>

\<td\>

\<span class=\"text-xs text-gray-500\"\>Salve para poder editar\</span\>

\</td\>

\`;

};

document.getElementById(\'delete-professors-btn\').onclick = () =\> {

const checkboxes =
tabelaBody.querySelectorAll(\'.delete-professor-checkbox:checked\');

if (checkboxes.length \> 0) {

const linhasParaExcluir = Array.from(checkboxes).map(cb =\>
cb.closest(\'tr\'));

solicitarConfirmacaoExclusao(

linhasParaExcluir,

\`Você tem certeza que deseja excluir os \${linhasParaExcluir.length}
professores selecionados?\`

);

} else {

addBotMessage(\"Nenhum professor selecionado para exclusão.\");

}

};

document.getElementById(\'selecionar-todos-professores\').onchange = (e)
=\> {

tabelaBody.querySelectorAll(\'.delete-professor-checkbox\').forEach(cb
=\> {

cb.checked = e.target.checked;

});

};

// Delegação de eventos para os botões de editar (melhor performance)

tabelaBody.addEventListener(\'click\', (event) =\> {

const target = event.target;

if (target.classList.contains(\'editar-disponibilidade-btn\')) {

const nomeOriginal = target.closest(\'tr\').dataset.nomeOriginal;

// Aqui você pode chamar a função para abrir o modal da grade de
disponibilidade

// Ex: abrirEditorDisponibilidade(nomeOriginal);

addBotMessage(\`(Funcionalidade de editar disponibilidade do professor
\'\${nomeOriginal}\' a ser conectada aqui.)\`);

}

if (target.classList.contains(\'editar-disciplinas-btn\')) {

const nomeOriginal = target.closest(\'tr\').dataset.nomeOriginal;

// Aqui você pode chamar a função para abrir o modal de disciplinas

addBotMessage(\`(Funcionalidade de editar disciplinas do professor
\'\${nomeOriginal}\' a ser conectada aqui.)\`);

}

});

document.getElementById(\'save-professors-btn\').onclick = () =\>
handleUserInput(\'SALVAR_DADOS_PROFESSORES\');

conversationState = \'EDITANDO_TABELA_PROFESSORES\';

}

async function salvarDadosDaTabelaProfessores() {

const tabelaBody = document.querySelector(\'#tabela-professores
tbody\');

if (!tabelaBody) {

await addBotMessage(\"Erro: Tabela de professores não encontrada.\");

return false;

}

const novosProfessores = \[\];

const nomesUnicos = new Set();

const todasLinhas = tabelaBody.querySelectorAll(\'tr\');

let dadosValidos = true;

let temDuplicatas = false;

for (const linha of todasLinhas) {

const nomeInput = linha.querySelector(\'.nome-prof-input\');

const chInput = linha.querySelector(\'.ch-prof-input\');

const pInput = linha.querySelector(\'.p-prof-input\');

const haInput = linha.querySelector(\'.ha-prof-input\');

const nome = nomeInput.value.trim().toUpperCase();

const ch = parseInt(chInput.value, 10);

const p = parseInt(pInput.value, 10);

const ha = parseInt(haInput.value, 10);

nomeInput.classList.remove(\'border-red-500\');

if (!nome) {

nomeInput.classList.add(\'border-red-500\');

dadosValidos = false;

} else if (nomesUnicos.has(nome)) {

nomeInput.classList.add(\'border-red-500\');

temDuplicatas = true;

} else {

nomesUnicos.add(nome);

const nomeOriginal = linha.dataset.nomeOriginal;

const profExistente = userData.professores.find(p =\> p.nome ===
nomeOriginal);

novosProfessores.push({

nome: nome,

aulasSemanaisSala: isNaN(ch) ? 0 : ch,

aulasSemanaisPlanejamento: isNaN(p) ? 0 : p,

horaAtividade: isNaN(ha) ? 0 : ha,

disciplinasMinistra: profExistente ? profExistente.disciplinasMinistra :
\[\],

gradeDisponibilidade: profExistente ? profExistente.gradeDisponibilidade
: {}

});

}

}

if (!dadosValidos) {

await addBotMessage(\"\<b\>Erro:\</b\> O nome de todos os professores
deve ser preenchido. Corrija os campos em vermelho.\");

return false;

}

if (temDuplicatas) {

await addBotMessage(\"\<b\>Erro:\</b\> Existem professores com nomes
duplicados. Os nomes devem ser únicos. Corrija os campos em
vermelho.\");

return false;

}

userData.professores = novosProfessores;

saveCurrentSession();

await addBotMessage(\"✅ Professores salvos com sucesso!\");

return true;

}

async function validarCargaHorariaProfessores() {

await addBotMessage(\"Validando a carga horária de todos os
professores\...\");

let professoresSobrecarregados = \[\];

for (const professor of userData.professores) {

const carga = getProfessorCargaHoraria(professor.nome);

const saldo = carga.disponivel - carga.atribuidas;

if (saldo \< 0) {

professoresSobrecarregados.push({

nome: professor.nome,

atribuidas: carga.atribuidas,

disponivel: carga.disponivel,

});

}

}

if (professoresSobrecarregados.length \> 0) {

let erroMsg = \"\<b\>Atenção: Validação falhou!\</b\> Os seguintes
professores estão com mais aulas atribuídas do que horários
disponíveis:\<br\>\<ul class=\'list-disc pl-5 mt-2\'\>\";

professoresSobrecarregados.forEach(p =\> {

erroMsg += \`\<li\>\<b\>\${p.nome}\</b\>: \${p.atribuidas} aulas
atribuídas, mas só \${p.disponivel} horários disponíveis.\</li\>\`;

});

erroMsg += \"\</ul\>\";

await addBotMessage(erroMsg);

await addBotMessage(\"É necessário corrigir isso antes de gerar o
horário. O que deseja fazer?\", 500, true);

tempData.professoresSobrecarregados = professoresSobrecarregados;

showOptions(\[

{ text: \"Reatribuir disciplinas\", value:
\"CORRIGIR_RELACIONAMENTO_GLOBAL\", highlight: \"correct\" },

{ text: \"Corrigir disponibilidade dos professores\", value:
\"CORRIGIR_PROFESSORES_TABELA\", highlight: \"action\" }

\]);

conversationState = \'HANDLE_CORRECTION_CHOICE\';

} else {

await addBotMessage(\"Validação de carga horária concluída com sucesso!
Todos os professores têm horários suficientes.\");

await addBotMessage(\"Vamos para as configurações finais antes de gerar
o horário.\", 1000);

await exibirTelaConfiguracaoFinal();

conversationState = \'AWAITING_FINAL_CONFIG_CONFIRMATION\';

}

}

async function proximaDisciplinaParaRelacionar() {

if (currentTurmaRelacionamentoIndex \< turmasParaRelacionamento.length)
{

const turmaAtual =
turmasParaRelacionamento\[currentTurmaRelacionamentoIndex\];

if (currentDisciplinaRelacionamentoIndex \<
turmaAtual.disciplinas.length) {

const disciplinaAtual =
turmaAtual.disciplinas\[currentDisciplinaRelacionamentoIndex\];

if (disciplinaAtual.professorNome) {

currentDisciplinaRelacionamentoIndex++;

await proximaDisciplinaParaRelacionar();

return;

}

await addBotMessage(\`Turma:
\<b\>\${turmaAtual.displayText}\</b\>\<br\>Disciplina:
\<b\>\${disciplinaAtual.nome}\</b\>
(\${disciplinaAtual.qtdAulasSemanais} aulas/sem)\`);

const professoresCompativeis = userData.professores.filter(prof =\>

prof.disciplinasMinistra.includes(disciplinaAtual.nome)

);

if (professoresCompativeis.length \> 0) {

await addBotMessage(\"Qual professor ministrará esta disciplina? A carga
horária de cada um é exibida abaixo.\", 500, true);

const profOptions = professoresCompativeis.map(p =\> {

const carga = getProfessorCargaHoraria(p.nome);

const saldo = carga.disponivel - carga.atribuidas;

const temAulasSuficientes = saldo \>= disciplinaAtual.qtdAulasSemanais;

const overloadClass = !temAulasSuficientes ? \'button-overloaded\' :
\'\';

return {

text: \`\${p.nome} \<span class=\"text-xs opacity-75\"\>(\${saldo} aulas
livres)\</span\>\`,

value: p.nome,

customClass: \`option-button \${overloadClass}\`

};

});

profOptions.push({text: \"Pular esta disciplina por agora\", value:
\"PULAR_DISCIPLINA_REL\", customClass: \"option-button\"});

showOptions(profOptions);

userInput.disabled = true;

userInput.placeholder = \"Selecione uma opção acima\";

currentDisciplinaParaConfigurar.turmaKeyParaRelacionamento =
turmaAtual.key;

currentDisciplinaParaConfigurar.disciplinaIndexParaRelacionamento =
currentDisciplinaRelacionamentoIndex;

conversationState = \'RELACIONAMENTO_SELECIONAR_PROFESSOR\';

} else {

await addBotMessage(\`\<b\>ATENÇÃO:\</b\> Nenhum professor cadastrado
ministra a disciplina de \${disciplinaAtual.nome}.\`);

currentDisciplinaRelacionamentoIndex++;

await proximaDisciplinaParaRelacionar();

}

} else {

currentTurmaRelacionamentoIndex++;

currentDisciplinaRelacionamentoIndex = 0;

await proximaDisciplinaParaRelacionar();

}

} else {

await addBotMessage(\"Relacionamento inicial concluído. Verificando a
viabilidade da carga horária dos professores\...\");

saveCurrentSession(); // \*\* CORREÇÃO CRÍTICA \*\* Salva os dados após
o loop de relacionamento.

await validarCargaHorariaProfessores();

}

}

async function exibirTelaDeReatribuicao(professoresSobrecarregados) {

await addBotMessage(\"Use a tela abaixo para reatribuir as disciplinas
dos professores sobrecarregados.\", 0, true);

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

let containerHTML = \`\<h4 class=\"text-md font-semibold text-gray-800
mb-2\"\>Reatribuição de Disciplinas\</h4\>\`;

professoresSobrecarregados.forEach(profInfo =\> {

containerHTML += \`\<div class=\"p-3 border rounded-lg mb-4\"\>\`;

containerHTML += \`\<h5 class=\"font-semibold\"\>\${profInfo.nome}
(\${profInfo.atribuidas} / \${profInfo.disponivel} aulas)\</h5\>\`;

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach((disc, discIndex) =\> {

if (disc.professorNome === profInfo.nome) {

const outrosProfessores = userData.professores.filter(p =\> p.nome !==
profInfo.nome && p.disciplinasMinistra.includes(disc.nome));

containerHTML += \`\<div class=\"flex items-center justify-between my-2
p-2 bg-gray-50 rounded\"\>\`;

containerHTML += \`\<span\>\${turma.displayText} -
\${disc.nome}\</span\>\`;

containerHTML += \`\<select class=\"reatribuir-select border-gray-300
rounded-md\" data-turma-key=\"\${turma.key}\"
data-disc-index=\"\${discIndex}\"\>\`;

containerHTML += \`\<option
value=\"\${disc.professorNome}\"\>\${disc.professorNome}
(Manter)\</option\>\`;

outrosProfessores.forEach(outroProf =\> {

containerHTML += \`\<option
value=\"\${outroProf.nome}\"\>\${outroProf.nome}\</option\>\`;

});

containerHTML += \`\<option value=\"NOVO_PROFESSOR\"\>\-- Cadastrar Novo
Professor \--\</option\>\`;

containerHTML += \`\</select\>\</div\>\`;

}

});

});

containerHTML += \`\</div\>\`;

});

availabilityGridContainer.innerHTML += containerHTML;

const confirmButton = document.createElement(\'button\');

confirmButton.textContent = \'Confirmar Reatribuições\';

confirmButton.className = \'option-button button-highlight-conclude
mt-4\';

confirmButton.onclick = () =\>
handleUserInput(\'CONFIRMAR_REATRIBUICAO\');

availabilityGridContainer.appendChild(confirmButton);

conversationState = \'AWAITING_REATRIBUICAO_CONFIRMATION\';

}

function contarAulasAlocadas(disciplinaNome, turmaKey) {

let count = 0;

if (!userData.horarioGerado \|\| !userData.horarioGerado\[turmaKey\])
return 0;

for (const dia in userData.horarioGerado\[turmaKey\]) {

count += userData.horarioGerado\[turmaKey\]\[dia\].filter(aula =\>
aula.startsWith(disciplinaNome)).length;

}

return count;

}

function encontrarAulasNaoAlocadas() {

let aulasNaoAlocadas = \[\];

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach(disciplina =\> {

const aulasEsperadas = disciplina.qtdAulasSemanais;

const aulasAlocadas = contarAulasAlocadas(disciplina.nome, turma.key);

const aulasFaltantes = aulasEsperadas - aulasAlocadas;

for (let i = 0; i \< aulasFaltantes; i++) {

aulasNaoAlocadas.push({

disciplinaNome: disciplina.nome,

professorNome: disciplina.professorNome,

turmaKey: turma.key,

turmaObj: turma,

});

}

});

});

return aulasNaoAlocadas;

}

async function analisarConflitosRestantes() {

let html = \"Análise de Pós-Geração: O algoritmo genético busca a melhor
solução possível, mas pode não ser perfeita. \";

let fitnessFinal = 0;

if (scheduler.population.length \> 0) {

fitnessFinal = scheduler.population\[0\].fitness;

}

if (fitnessFinal \> 0) {

html += \`A melhor solução encontrada ainda possui uma pontuação de
penalidade de \<b\>\${fitnessFinal}\</b\>, indicando que algumas
restrições (principalmente as \'suaves\' como janelas) não foram
totalmente resolvidas.\`;

} else {

html += \"A solução encontrada é ótima e não viola nenhuma restrição
dura!\";

}

await addBotMessage(html);

await addBotMessage(\"O que deseja fazer agora?\", 500, true);

showOptions(\[

{text: \"Exportar Horário para PDF\", value: \"EXPORTAR_PDF\",
highlight:\"action\"},

{text: \"Exportar Dados para Arquivo (.json)\", value:
\"EXPORTAR_JSON\", highlight:\"action\"},

{text: \"Salvar e Encerrar\", value: \"SALVAR_E_ENCERRAR\",
highlight:\"save\"},

\]);

conversationState = \'AWAITING_POST_GENERATION_ACTION\';

}

function generateTimeSlots(startHour, endHour, intervalMinutes) {

const slots = \[\];

let minutes = startHour \* 60;

const endMinutes = endHour \* 60;

while (minutes \<= endMinutes) {

const h = Math.floor(minutes / 60);

const m = minutes % 60;

slots.push(\`\${String(h).padStart(2, \'0\')}:\${String(m).padStart(2,
\'0\')}\`);

minutes += intervalMinutes;

}

return slots;

}

async function salvarVersaoHorario(descricao) {

if (!userData.horarioGerado \|\| userData.horarioGerado.size === 0) {

await addBotMessage(\"Não há horário ativo para salvar.\");

return;

}

const id = \`versao-\${Date.now()}\`;

const horarioCopiado = new
Map(JSON.parse(JSON.stringify(Array.from(userData.horarioGerado))));

horarioHistory.push({ id, descricao, horario: horarioCopiado, timestamp:
new Date().toLocaleString() });

if (horarioHistory.length \> 5) {

horarioHistory.shift();

}

await addBotMessage(\`✅ Versão do horário salva:
\"\<b\>\${descricao}\</b\>\"\`);

await mostrarVersoesSalvas();

}

async function mostrarVersoesSalvas() {

if (horarioHistory.length === 0) {

await addBotMessage(\"Nenhuma versão de horário foi salva ainda.\");

return;

}

let html = \"\<b\>Versões Salvas:\</b\>\<ul class=\'list-none mt-4
space-y-2\'\>\";

horarioHistory.forEach(version =\> {

html += \`

\<li class=\"flex justify-between items-center p-2 bg-gray-100
rounded-lg\"\>

\<span\>\${version.descricao} \<span class=\"text-xs
text-gray-500\"\>(\${version.timestamp})\</span\>\</span\>

\<div class=\"flex gap-2\"\>

\<button class=\"text-sm bg-blue-500 text-white px-3 py-1 rounded
hover:bg-blue-600\"
onclick=\"handleUserInput(\'LOAD_SAVED_VERSION\_\${version.id}\')\"\>Carregar\</button\>

\<button class=\"text-sm bg-red-500 text-white px-3 py-1 rounded
hover:bg-red-600\"
onclick=\"handleUserInput(\'DELETE_SAVED_VERSION\_\${version.id}\')\"\>Excluir\</button\>

\</div\>

\</li\>

\`;

});

html += \"\</ul\>\";

html += \`\<button class=\"option-button mt-2\"
onclick=\"addUserMessage(\'Voltar\');
handleUserInput(\'RETURN_TO_POST_GEN_MENU\');\"\>Voltar para
Opções\</button\>\`;

await addBotMessage(html);

conversationState = \'MANAGING_SAVED_VERSIONS\';

}

async function exportarHorarioParaPDFGeral() {

try {

const { jsPDF } = window.jspdf;

const doc = new jsPDF({ orientation: \'landscape\' });

let firstPage = true;

if (!userData.horarioGerado \|\| userData.horarioGerado.size === 0) {

await addBotMessage(\"Não há horário gerado para exportar.\");

return;

}

for (const \[turmaKey, horarioTurma\] of
userData.horarioGerado.entries()) {

if (!firstPage) {

doc.addPage();

}

firstPage = false;

const turmaInfo = userData.horarioFinal\[turmaKey\];

if (!turmaInfo) continue;

doc.setFontSize(16);

doc.text(\`Horário da Turma: \${turmaInfo.displayText}\`, 14, 15);

const head = \[\[\'Horário\', \...diasDaSemana\]\];

const body = \[\];

let horaAtualMinutos =
parseHoraParaMinutos(userData.horarioInicioAulas);

const duracaoAula = userData.duracaoAulaMinutos \|\| 50;

const maxAulasNoTurno = turmaInfo.aulasDiarias \|\| 0;

for (let i = 0; i \< maxAulasNoTurno; i++) {

const inicioAula = formatarMinutosParaHora(horaAtualMinutos);

const fimAula = adicionarMinutosAHora(inicioAula, duracaoAula);

const rowData = \[\`\${inicioAula} - \${fimAula}\`\];

diasDaSemana.forEach(dia =\> {

const diaEng = diasDaSemanaEng\[diasDaSemana.indexOf(dia)\];

const aulaConteudo = horarioTurma\[diaEng\]?.\[i\] \|\| \' \';

rowData.push(aulaConteudo.replace(/\<\[\^\>\]\*\>?/gm, \'\')); // Remove
HTML tags

});

body.push(rowData);

horaAtualMinutos = parseHoraParaMinutos(fimAula);

const intervaloAposEstaAula = userData.intervalos.find(intervalo =\>
intervalo.aposAula === (i + 1));

if (intervaloAposEstaAula) {

const inicioIntervalo = formatarMinutosParaHora(horaAtualMinutos);

const fimIntervalo = adicionarMinutosAHora(inicioIntervalo,
intervaloAposEstaAula.duracaoMinutos);

const intervaloRow = \[{

content: \`INTERVALO (\${intervaloAposEstaAula.duracaoMinutos} min)\`,

colSpan: diasDaSemana.length + 1,

styles: { halign: \'center\', fillColor: \[254, 243, 199\], textColor:
\[120, 53, 15\] }

}\];

body.push(intervaloRow);

horaAtualMinutos = parseHoraParaMinutos(fimIntervalo);

}

}

doc.autoTable({

head: head,

body: body,

startY: 25,

theme: \'grid\',

headStyles: { fillColor: \[224, 231, 255\], textColor: \[29, 78, 216\],
fontStyle: \'bold\' },

styles: { font: \'helvetica\', halign: \'center\', fontSize: 8,
cellPadding: 2 },

alternateRowStyles: { fillColor: \[249, 250, 251\] },

});

}

const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g,
\"\");

doc.save(\`horario_geral\_\${userData.anoReferencia}\_\${timestamp}.pdf\`);

await addBotMessage(\"PDF do horário geral gerado e download
iniciado!\");

} catch(e) {

await addBotMessage(\"Ocorreu um erro ao gerar o PDF. Verifique se as
bibliotecas jsPDF e jsPDF-AutoTable estão carregadas corretamente.\");

console.error(\"Erro no PDF:\", e);

}

}

//
=======================================================================

// 7. NOVAS FUNÇÕES PARA TROCA MANUAL E EDIÇÃO RÁPIDA

//
=======================================================================

function toggleSwapMode() {

isSwapModeActive = !isSwapModeActive;

const swapButton = document.getElementById(\'swap-mode-button\');

const allCells =
horarioModalBody.querySelectorAll(\'td\[data-turma-key\]\');

if (isSwapModeActive) {

swapButton.textContent = \'Sair do Modo de Troca\';

swapButton.classList.add(\'button-correct\');

swapStatusMessage.textContent = \'Modo de troca ativado. Selecione a
primeira aula.\';

allCells.forEach(cell =\> {

if (cell.textContent.trim() !== \'\') {

cell.classList.add(\'cell-to-swap\');

cell.onclick = handleSwapCellClick;

}

});

} else {

swapButton.textContent = \'Trocar Aulas Manualmente\';

swapButton.classList.remove(\'button-correct\');

swapStatusMessage.textContent = \'\';

firstSwapSelection = null;

allCells.forEach(cell =\> {

cell.classList.remove(\'cell-to-swap\', \'cell-selected\',
\'swap-safe\', \'swap-warning\', \'swap-impossible\');

cell.onclick = null;

});

}

}

//
=======================================================================

// ✅ NOVO BLOCO COMPLETO PARA TROCA MANUAL E VALIDAÇÃO DE CORES

//
=======================================================================

/\*\*

\* NOVA FUNÇÃO AUXILIAR: Extrai informações da aula diretamente da
célula do DOM.

\* @param {HTMLElement} cellElement - O elemento \<td\> da célula da
tabela.

\* @returns {object\|null} - Um objeto com disciplina e professor, ou
null.

\*/

function getAulaInfoFromCell(cellElement) {

const disciplineSpan =
cellElement.querySelector(\'.editable-discipline-name\');

const teacherSpan =
cellElement.querySelector(\'.editable-teacher-name\');

if (!disciplineSpan \|\| !teacherSpan) {

return null; // Célula vazia ou mal formada

}

return {

disciplina: disciplineSpan.dataset.disciplineName,

professor: teacherSpan.dataset.teacherName

};

}

/\*\*

\* Verifica se um professor está ocupado em um determinado horário,
ignorando a turma de origem.

\*/

function isTeacherBusy(professor, dia, periodo, ignoreTurmaKey) {

if (!professor) return false;

for (const \[turmaKey, horario\] of userData.horarioGerado.entries()) {

if (turmaKey === ignoreTurmaKey) continue;

const aulaNoSlot = horario\[dia\]?.\[periodo\];

if (aulaNoSlot && aulaNoSlot.includes(\`(\${professor})\`)) {

return true;

}

}

return false;

}

/\*\*

\* Verifica se um professor está com status \'Disponível\' (D) em sua
grade.

\*/

function isTeacherAvailable(professor, dia, periodo) {

if (!professor) return true;

const profData = userData.professores.find(p =\> p.nome === professor);

if (!profData) return false;

const diaPt = diasDaSemana\[diasDaSemanaEng.indexOf(dia)\];

const status = profData.gradeDisponibilidade?.\[diaPt\]?.\[periodo\];

return status === \'D\';

}

/\*\*

\* Executa a troca de aulas na memória e no DOM.

\*/

function executeSwap(selection1, selection2) {

const horarioTurma1 = userData.horarioGerado.get(selection1.turmaKey);

horarioTurma1\[selection1.dia\]\[selection1.periodo\] =
selection2.fullContent;

const horarioTurma2 = userData.horarioGerado.get(selection2.turmaKey);

horarioTurma2\[selection2.dia\]\[selection2.periodo\] =
selection1.fullContent;

// Redesenha o modal inteiro para garantir que todos os listeners sejam
recriados corretamente

mostrarHorarioGerado().then(() =\> {

// Reativa o modo de troca após o redesenho

if (!isSwapModeActive) {

toggleSwapMode();

} else {

// Se já estava ativo, apenas limpa a seleção

firstSwapSelection = null;

swapStatusMessage.textContent = \'Troca realizada! Selecione a primeira
aula.\';

swapStatusMessage.style.color = \'#065F46\'; // Green-800

setTimeout(() =\> {

if (isSwapModeActive) {

swapStatusMessage.textContent = \'Modo de troca ativado. Selecione a
primeira aula.\';

swapStatusMessage.style.color = \'#3730A3\'; // Indigo-800

}

}, 2000);

}

});

}

/\*\*

\* Colore as células da tabela para indicar a viabilidade da troca.

\*/

function highlightPotentialSwaps(selection) {

const allCells =
horarioModalBody.querySelectorAll(\'td\[data-turma-key\]\');

const aulaInfo1 = getAulaInfoFromCell(selection.cellElement);

if (!aulaInfo1) return;

allCells.forEach(cell =\> {

if (cell === selection.cellElement \|\| cell.textContent.trim() ===
\'\') return;

const aulaInfo2 = getAulaInfoFromCell(cell);

if (!aulaInfo2) {

cell.classList.add(\'swap-impossible\'); // Não pode trocar com célula
mal formada

return;

}

const targetSelection = {

turmaKey: cell.dataset.turmaKey,

dia: cell.dataset.dia,

periodo: parseInt(cell.dataset.periodo)

};

// Verificação de choque de horário

const prof1Busy = isTeacherBusy(aulaInfo1.professor,
targetSelection.dia, targetSelection.periodo, selection.turmaKey);

const prof2Busy = isTeacherBusy(aulaInfo2.professor, selection.dia,
selection.periodo, targetSelection.turmaKey);

if (prof1Busy \|\| prof2Busy) {

cell.classList.add(\'swap-impossible\');

return;

}

// Verificação de disponibilidade

const prof1Available = isTeacherAvailable(aulaInfo1.professor,
targetSelection.dia, targetSelection.periodo);

const prof2Available = isTeacherAvailable(aulaInfo2.professor,
selection.dia, selection.periodo);

if (prof1Available && prof2Available) {

cell.classList.add(\'swap-safe\');

} else {

cell.classList.add(\'swap-warning\');

}

});

}

/\*\*

\* Gerencia o clique em uma célula durante o modo de troca.

\*/

async function handleSwapCellClick(event) {

const cell = event.currentTarget;

const aulaInfo = getAulaInfoFromCell(cell);

if (!aulaInfo) return; // Não faz nada se a célula for vazia

const currentSelection = {

turmaKey: cell.dataset.turmaKey,

dia: cell.dataset.dia,

periodo: parseInt(cell.dataset.periodo),

fullContent:
userData.horarioGerado.get(cell.dataset.turmaKey)\[cell.dataset.dia\]\[parseInt(cell.dataset.periodo)\],

cellElement: cell

};

if (!firstSwapSelection) {

firstSwapSelection = currentSelection;

cell.classList.add(\'cell-selected\');

swapStatusMessage.textContent = \`Aula de \${aulaInfo.disciplina}
selecionada. Escolha um destino.\`;

highlightPotentialSwaps(firstSwapSelection);

} else {

if (firstSwapSelection.cellElement === currentSelection.cellElement)
return;

secondSwapSelection = currentSelection;

const aulaInfo2 = getAulaInfoFromCell(secondSwapSelection.cellElement);

if (cell.classList.contains(\'swap-impossible\')) {

swapStatusMessage.textContent = \'Troca impossível: Causa um choque de
horário para um professor.\';

swapStatusMessage.style.color = \'#B91C1C\';

return;

}

if (cell.classList.contains(\'swap-warning\')) {

const aulaInfo1 = getAulaInfoFromCell(firstSwapSelection.cellElement);

const prof1Available = isTeacherAvailable(aulaInfo1.professor,
secondSwapSelection.dia, secondSwapSelection.periodo);

const prof2Available = isTeacherAvailable(aulaInfo2.professor,
firstSwapSelection.dia, firstSwapSelection.periodo);

let warningTxt = \"Atenção: \";

if (!prof1Available) warningTxt += \`O professor \${aulaInfo1.professor}
não está \'Disponível\' no horário de destino. \`;

if (!prof2Available) warningTxt += \`O professor \${aulaInfo2.professor}
não está \'Disponível\' no horário de origem. \`;

swapWarningMessage.textContent = warningTxt + \"Deseja forçar a troca
mesmo assim?\";

swapWarningModal.style.display = \'block\';

return;

}

// Se for \'swap-safe\'

executeSwap(firstSwapSelection, secondSwapSelection);

}

}

// APAGUE as funções de update e listeners antigas e cole ESTE BLOCO no
lugar

function updateName(type, oldName, newName) {

// Retorna se não houver mudança

if (!oldName \|\| !newName \|\| oldName === newName) return;

if (type === \'professor\') {

// 1. Atualiza a lista principal de professores

const profIndex = userData.professores.findIndex(p =\> p.nome ===
oldName);

if (profIndex !== -1) {

userData.professores\[profIndex\].nome = newName;

}

// 2. Atualiza o nome do professor em todas as configurações de turma

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach(disc =\> {

if (disc.professorNome === oldName) {

disc.professorNome = newName;

}

});

});

// 3. Atualiza o nome no horário já gerado (o que é exibido na tela)

if (userData.horarioGerado && userData.horarioGerado.size \> 0) {

for (const horarioTurma of userData.horarioGerado.values()) {

for (const diaEng in horarioTurma) {

horarioTurma\[diaEng\] = horarioTurma\[diaEng\].map(aula =\> {

if (aula && aula.includes(\`(\${oldName})\`)) {

return aula.replace(\`(\${oldName})\`, \`(\${newName})\`);

}

return aula;

});

}

}

}

} else if (type === \'disciplina\') {

// 1. Atualiza a lista principal de disciplinas

const masterIndex = userData.disciplinas.indexOf(oldName);

if (masterIndex !== -1) {

userData.disciplinas\[masterIndex\] = newName;

}

// 2. Atualiza a lista de disciplinas que cada professor ministra

userData.professores.forEach(prof =\> {

const profDiscIndex = prof.disciplinasMinistra.indexOf(oldName);

if (profDiscIndex !== -1) {

prof.disciplinasMinistra\[profDiscIndex\] = newName;

}

});

// 3. Atualiza o nome da disciplina nas configurações das turmas e nos
horários fixos

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach(disc =\> {

if (disc.nome === oldName) {

disc.nome = newName;

}

});

turma.horariosFixos.forEach(fixed =\> {

if (fixed.disciplina === oldName) {

fixed.disciplina = newName;

}

});

});

// 4. Atualiza o nome da disciplina no horário já gerado

if (userData.horarioGerado && userData.horarioGerado.size \> 0) {

for (const horarioTurma of userData.horarioGerado.values()) {

for (const diaEng in horarioTurma) {

horarioTurma\[diaEng\] = horarioTurma\[diaEng\].map(aula =\> {

if (aula && aula.startsWith(oldName + \' (\')) {

return aula.replace(oldName, newName);

}

return aula;

});

}

}

}

}

// Salva a sessão com os dados atualizados

saveCurrentSession();

}

function addDoubleClickListeners() {

const attachListener = (selector, type) =\> {

const spans = horarioModalBody.querySelectorAll(selector);

spans.forEach(span =\> {

span.ondblclick = (e) =\> {

e.stopPropagation();

const dataAttribute = type === \'professor\' ? \'teacherName\' :
\'disciplineName\';

const oldName = span.dataset\[dataAttribute\];

if (!oldName \|\| span.parentNode.querySelector(\'input\')) return;

const input = document.createElement(\'input\');

input.type = \'text\';

input.value = oldName;

input.className = \'w-full text-center bg-yellow-100 border
border-yellow-400 rounded\';

span.style.display = \'none\';

if (type === \'disciplina\') {

span.parentNode.insertBefore(input, span.parentNode.firstChild);

} else {

span.parentNode.appendChild(input);

}

input.focus();

input.select();

const saveChanges = () =\> {

const newName = (type === \'professor\') ?
input.value.trim().toUpperCase() : input.value.trim();

if (!newName \|\| newName === oldName) {

span.style.display = \'\';

if (input.parentNode) input.remove();

return;

}

// Chama a função de atualização central

updateName(type, oldName, newName);

// Redesenha o modal para refletir a mudança em todas as células

mostrarHorarioGerado();

swapStatusMessage.textContent = \`\${type.charAt(0).toUpperCase() +
type.slice(1)} \'\${oldName}\' renomeado para \'\${newName}\'.\`;

swapStatusMessage.style.color = \'#065F46\'; // Tom de verde

setTimeout(() =\> { swapStatusMessage.textContent = \'\'; }, 4000);

};

input.onblur = saveChanges;

input.onkeydown = (e) =\> {

if (e.key === \'Enter\') { e.preventDefault(); saveChanges(); }

else if (e.key === \'Escape\') { span.style.display = \'\'; if
(input.parentNode) input.remove(); }

};

};

});

};

attachListener(\'.editable-teacher-name\', \'professor\');

attachListener(\'.editable-discipline-name\', \'disciplina\');

}

async function mostrarHorarioGerado() {

if (!userData.horarioGerado \|\| userData.horarioGerado.size === 0) {

await addBotMessage(\"Nenhum horário foi gerado ainda.\");

await apresentarMenuPosGeracao();

return;

}

let htmlOutput = \"\";

// Itera sobre cada turma para criar sua respectiva tabela de horário

for (const \[turmaKey, horarioTurma\] of
userData.horarioGerado.entries()) {

const turmaInfo = userData.horarioFinal\[turmaKey\];

if (!turmaInfo) continue;

htmlOutput += \`\<div class=\"my-4 p-3 border rounded-lg bg-white
shadow-sm\"\>\`;

htmlOutput += \`\<h3 class=\"text-lg font-semibold mb-2
text-indigo-700\"\>Turma: \${turmaInfo.displayText}\</h3\>\`;

htmlOutput += \`\<div class=\"table-container\"\>\`;

htmlOutput += \`\<table
class=\"data-table\"\>\<thead\>\<tr\>\<th\>Horário\</th\>\`;

diasDaSemana.forEach(dia =\> htmlOutput += \`\<th\>\${dia}\</th\>\`);

htmlOutput += \`\</tr\>\</thead\>\<tbody\>\`;

let horaAtualMinutos =
parseHoraParaMinutos(userData.horarioInicioAulas);

const duracaoAula = userData.duracaoAulaMinutos \|\| 50;

const maxAulasNoTurno = turmaInfo.aulasDiarias \|\| 0;

for (let i = 0; i \< maxAulasNoTurno; i++) {

const inicioAula = formatarMinutosParaHora(horaAtualMinutos);

const fimAula = adicionarMinutosAHora(inicioAula, duracaoAula);

htmlOutput += \`\<tr\>\<td\>\${inicioAula} - \${fimAula}\</td\>\`;

diasDaSemana.forEach((dia, diaIndex) =\> {

const diaEng = diasDaSemanaEng\[diaIndex\];

const aulaConteudo = horarioTurma\[diaEng\]?.\[i\] \|\| \' \'; // Ex:
\"Química (RAIMUNDO)\"

// Lógica para separar disciplina e professor e criar os spans editáveis

const match = aulaConteudo.match(/(.+)\s+\\(\[\^)\]+)\\/);

let contentDiv;

if (match) {

const disciplina = match\[1\].trim();

const professor = match\[2\].trim();

contentDiv = \`\<span class=\"editable-discipline-name\"
data-discipline-name=\"\${disciplina}\"\>\${disciplina}\</span\> (\<span
class=\"editable-teacher-name\"
data-teacher-name=\"\${professor}\"\>\${professor}\</span\>)\`;

} else {

contentDiv = aulaConteudo;

}

htmlOutput += \`\<td data-turma-key=\"\${turmaKey}\"
data-dia=\"\${diaEng}\"
data-periodo=\"\${i}\"\>\<div\>\${contentDiv}\</div\>\</td\>\`;

});

htmlOutput += \`\</tr\>\`;

horaAtualMinutos = parseHoraParaMinutos(fimAula);

const intervaloAposEstaAula = userData.intervalos.find(intervalo =\>
intervalo.aposAula === (i + 1));

if (intervaloAposEstaAula) {

horaAtualMinutos =
parseHoraParaMinutos(adicionarMinutosAHora(formatarMinutosParaHora(horaAtualMinutos),
intervaloAposEstaAula.duracaoMinutos));

htmlOutput += \`\<tr class=\"interval-row\"\>\<td
colspan=\"\${diasDaSemana.length + 1}\"\>INTERVALO
(\${intervaloAposEstaAula.duracaoMinutos} min)\</td\>\</tr\>\`;

}

}

htmlOutput += \`\</tbody\>\</table\>\</div\>\</div\>\`;

}

// Insere o HTML gerado no corpo do modal

horarioModalBody.innerHTML = htmlOutput;

// Chama a função que anexa TODOS os listeners de duplo clique

addDoubleClickListeners();

// Limpa e recria os botões de ação do modal

horarioModalActions.innerHTML = \'\';

const createButton = (id, text, classes, onClick) =\> {

const button = document.createElement(\'button\');

if (id) button.id = id;

button.textContent = text;

button.className = classes;

button.onclick = onClick;

return button;

};

const swapButton = createButton(\'swap-mode-button\', \'Trocar Aulas\',
\'px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold
hover:bg-amber-600 action-button\', toggleSwapMode);

const saveButton = createButton(null, \'Salvar Versão\', \'px-4 py-2
bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600
action-button\', () =\> salvarVersaoHorario(\'Versão Manual \' +
(horarioHistory.length + 1)));

const pdfButton = createButton(null, \'Exportar PDF\', \'px-4 py-2
bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700
action-button\', exportarHorarioParaPDFGeral);

const closeButton = createButton(\'fecharHorarioModalButton\',
\'Fechar\', \'px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold
hover:bg-gray-700\', () =\> {

if(isSwapModeActive) toggleSwapMode();

horarioModal.style.display = \"none\";

});

horarioModalActions.appendChild(swapButton);

horarioModalActions.appendChild(saveButton);

horarioModalActions.appendChild(pdfButton);

horarioModalActions.appendChild(closeButton);

// Exibe o modal

horarioModal.style.display = \"block\";

}

/\*\*

\* ✅ FUNÇÃO SUBSTITUÍDA

\* Mostra uma tabela de turmas totalmente editável.

\*/

async function mostrarTabelaTurmasCadastradas() {

const turmas = Object.values(userData.horarioFinal);

if (turmas.length === 0) {

await addBotMessage(\"\<p\>Nenhuma turma cadastrada ainda.\</p\>\");

await iniciarContagemDeTurmas();

return;

}

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

let tableHTML = \`

\<h3 class=\"text-lg font-semibold mb-2\"\>Gerenciamento de
Turmas\</h3\>

\<p class=\"text-sm text-gray-600 mb-4\"\>Edite os dados abaixo,
adicione ou remova turmas conforme necessário.\</p\>

\<div class=\"table-container\"\>

\<table class=\"data-table\" id=\"tabela-editavel-turmas\"\>

\<thead\>

\<tr\>

\<th class=\"w-10\"\>Excluir\</th\>

\<th\>Série/Ano\</th\>

\<th\>Identificação da Turma\</th\>

\<th\>Aulas Diárias\</th\>

\</tr\>

\</thead\>

\<tbody\>

\`;

const serieAnoLabel = (userData.nivelEnsino === \'FUNDAMENTAL\') ?
\'Ano\' : \'Série\';

turmas.forEach(turma =\> {

tableHTML += \`

\<tr data-serie-ano=\"\${turma.serieAno}\"\>

\<td\>\<input type=\"checkbox\" class=\"delete-turma-checkbox h-5 w-5
mx-auto\"\>\</td\>

\<td\>\${turma.serieAno}º \${serieAnoLabel}\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1\"
value=\"\${turma.id}\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-24 border-b p-1 text-center\"
value=\"\${turma.aulasDiarias}\" min=\"1\" max=\"10\"\>\</td\>

\</tr\>

\`;

});

tableHTML += \`\</tbody\>\</table\>\</div\>\`;

availabilityGridContainer.innerHTML = tableHTML;

const actionContainer = document.createElement(\'div\');

actionContainer.className = \'mt-6 flex justify-between items-center\';

const seriesAnos = (userData.nivelEnsino === \'MEDIO\') ? \[1, 2, 3\] :
\[1, 2, 3, 4, 5, 6, 7, 8, 9\];

let selectOptions = seriesAnos.map(s =\> \`\<option
value=\"\${s}\"\>\${s}ª \${serieAnoLabel}\</option\>\`).join(\'\');

actionContainer.innerHTML = \`

\<div class=\"flex items-center gap-2\"\>

\<select id=\"select-nova-turma\" class=\"border-gray-300 rounded-md
p-2\"\>

\${selectOptions}

\</select\>

\<button id=\"add-turma-btn\" class=\"option-button
button-highlight-action\"\>Adicionar Turma\</button\>

\<button id=\"delete-selected-turmas-btn\" class=\"option-button
button-correct\"\>Excluir Selecionadas\</button\>

\</div\>

\<button id=\"save-turmas-btn\" class=\"option-button
button-highlight-conclude\"\>Salvar Alterações e Prosseguir\</button\>

\`;

availabilityGridContainer.appendChild(actionContainer);

const tabelaBody =
document.getElementById(\'tabela-editavel-turmas\').querySelector(\'tbody\');

document.getElementById(\'add-turma-btn\').addEventListener(\'click\',
() =\> {

const select = document.getElementById(\'select-nova-turma\');

const serieAno = select.value;

const newRow = tabelaBody.insertRow();

newRow.dataset.serieAno = serieAno;

newRow.innerHTML = \`

\<td\>\<input type=\"checkbox\" class=\"delete-turma-checkbox h-5 w-5
mx-auto\"\>\</td\>

\<td\>\${serieAno}º \${serieAnoLabel}\</td\>

\<td\>\<input type=\"text\" class=\"w-full border-b p-1\"
placeholder=\"Nova Turma\"\>\</td\>

\<td\>\<input type=\"number\" class=\"w-24 border-b p-1 text-center\"
placeholder=\"5\" min=\"1\" max=\"10\"\>\</td\>

\`;

});

document.getElementById(\'delete-selected-turmas-btn\').addEventListener(\'click\',
() =\> {

const checkboxes =
tabelaBody.querySelectorAll(\'.delete-turma-checkbox:checked\');

if (checkboxes.length \> 0) {

const linhasParaExcluir = Array.from(checkboxes).map(cb =\>
cb.closest(\'tr\'));

solicitarConfirmacaoExclusao(

linhasParaExcluir,

\`Você tem certeza que deseja excluir as \${linhasParaExcluir.length}
turmas selecionadas?\`

); // Não passamos callback aqui, pois não há totais para recalcular

} else {

addBotMessage(\"Nenhuma turma selecionada para exclusão.\");

}

});

document.getElementById(\'save-turmas-btn\').addEventListener(\'click\',
() =\> handleUserInput(\'SALVAR_EDICOES_TURMAS\'));

await addBotMessage(\"A tabela de turmas foi aberta acima para edição.
Quando terminar, clique em \'Salvar Alterações e Prosseguir\'.\");

conversationState = \'EDITANDO_TABELA_TURMAS\';

}

// SUBSTITUA ESTA FUNÇÃO

async function mostrarTabelaProfessoresCadastrados() {

let htmlTable = \"\<b\>Professores Cadastrados:\</b\>\<br\>\<br\>\";

if (userData.professores.length === 0) {

htmlTable += \"\<p\>Nenhum professor cadastrado ainda.\</p\>\";

} else {

htmlTable += \`\<div class=\"table-container\"\>\<table
class=\"data-table\"\>\<thead\>\<tr\>\<th\>Nome\</th\>\<th\>Disciplinas\</th\>\<th\>Aulas/Sala\</th\>\<th\>Aulas/Planej.\</th\>\</tr\>\</thead\>\<tbody\>\`;

userData.professores.forEach(prof =\> {

htmlTable +=
\`\<tr\>\<td\>\${prof.nome}\</td\>\<td\>\${prof.disciplinasMinistra.join(\',
\')}\</td\>\<td\>\${prof.aulasSemanaisSala}\</td\>\<td\>\${prof.aulasSemanaisPlanejamento}\</td\>\</tr\>\`;

});

htmlTable += \`\</tbody\>\</table\>\</div\>\`;

}

await addBotMessage(htmlTable);

await addBotMessage(\"O que deseja fazer?\", 500, true);

const options = \[

{text: \"Prosseguir para Relacionamento\", value:
\"PROSSEGUIR_RELACIONAMENTO_TABELA\", highlight:\"conclude\"},

{text: \"Cadastrar Novo Professor\", value:
\"CADASTRAR_NOVO_PROFESSOR_TABELA\", highlight: \"action\"},

{text: \"Editar Professor\", value: \"EDITAR_PROFESSOR_MENU\",
highlight: \"correct\"},

{text: \"Salvar como Modelo de Escola\", value:
\"SALVAR_MODELO_ESCOLA\", highlight: \"save\"}

\];

// NOVO: Bloco para adicionar o botão de voltar, se aplicável

if (userData.horarioGerado && userData.horarioGerado.size \> 0) {

options.push({ text: \"Voltar para Tela Final\", value:
\"VOLTAR_TELA_FINAL\", highlight: \"action\" });

}

showOptions(options);

conversationState = \'CONFERIR_PROFESSORES_CADASTRADOS_ACAO\';

}

// SUBSTITUA ESTA FUNÇÃO

async function mostrarTabelaRelacionamentosFeitos() {

let htmlTable = \"\<b\>Relacionamento Professor-Disciplina por
Turma:\</b\>\<br\>\<br\>\";

let algumRelacionamentoFeito = false;

htmlTable += \`\<div class=\"table-container\"\>\<table
class=\"data-table\"\>\<thead\>\<tr\>\<th\>Turma\</th\>\<th\>Disciplina\</th\>\<th\>Professor
Atribuído\</th\>\</tr\>\</thead\>\<tbody\>\`;

Object.values(userData.horarioFinal).forEach(turma =\> {

if (turma.disciplinas && turma.disciplinas.length \> 0) {

turma.disciplinas.forEach(disc =\> {

htmlTable +=
\`\<tr\>\<td\>\${turma.displayText}\</td\>\<td\>\${disc.nome}
(\${disc.qtdAulasSemanais} aulas)\</td\>\<td\>\${disc.professorNome \|\|
\'Nenhum\'}\</td\>\</tr\>\`;

if(disc.professorNome) algumRelacionamentoFeito = true;

});

}

});

htmlTable += \`\</tbody\>\</table\>\</div\>\`;

if (!algumRelacionamentoFeito &&
Object.keys(userData.horarioFinal).length \> 0) {

htmlTable = \"\<b\>Relacionamento Professor-Disciplina por
Turma:\</b\>\<br\>\<br\>\<p\>Nenhum professor foi atribuído às
disciplinas ainda.\</p\>\";

} else if (Object.keys(userData.horarioFinal).length === 0) {

htmlTable = \"\<b\>Relacionamento Professor-Disciplina por
Turma:\</b\>\<br\>\<br\>\<p\>Nenhuma turma com disciplinas cadastradas
para exibir relacionamentos.\</p\>\";

}

await addBotMessage(htmlTable);

await addBotMessage(\"O que deseja fazer?\", 500, true);

const options = \[

{text: \"Prosseguir para Validação/Geração\", value:
\"PROSSEGUIR_VALIDACAO_TABELA\", highlight: \"conclude\"},

{text: \"Corrigir Relacionamento\", value:
\"CORRIGIR_RELACIONAMENTO_TABELA\", highlight: \"correct\"}

\];

// NOVO: Bloco para adicionar o botão de voltar, se aplicável

if (userData.horarioGerado && userData.horarioGerado.size \> 0) {

options.push({ text: \"Voltar para Tela Final\", value:
\"VOLTAR_TELA_FINAL\", highlight: \"action\" });

}

showOptions(options);

conversationState = \'CONFERIR_RELACIONAMENTOS_FEITOS_ACAO\';

}

async function exibirTelaConfiguracaoFinal() {

availabilityGridContainer.innerHTML = \'\'; // Limpa a área

availabilityGridContainer.classList.remove(\'hidden\');

let containerHTML = \`

\<h4 class=\"text-md font-semibold text-gray-800 mt-6 mb-2\"\>Parâmetros
de Processamento Adicionais\</h4\>

\<div class=\"table-container\"\>

\<table class=\"parameters-table\"\>

\<thead\>

\<tr\>

\<th\>Parâmetro\</th\>

\<th class=\"w-1/4\"\>Habilitar\</th\>

\<th class=\"w-1/4\"\>Valor\</th\>

\</tr\>

\</thead\>

\<tbody\>\`;

listaParametrosProcessamento.forEach(param =\> {

const isChecked = param.habilitadoDefault;

const valorInputId = \`valor-\${param.id}\`;

const valorInputDisplay = param.precisaValor && isChecked ? \'\' :
\'hidden\';

containerHTML += \`\<tr\>

\<td class=\"text-left\"\>\${param.nome}\</td\>

\<td\>

\<input type=\"checkbox\" id=\"param-\${param.id}\"
data-valor-input-id=\"\${valorInputId}\" \${isChecked ? \'checked\' :
\'\'} class=\"h-5 w-5 text-indigo-600 border-gray-300 rounded
focus:ring-indigo-500\"\>

\</td\>

\<td\>

\<input type=\"number\" id=\"\${valorInputId}\" class=\"w-24 px-2 py-1
border border-gray-300 rounded-md \${valorInputDisplay}\"
placeholder=\"\${param.placeholder \|\| \'\'}\"\>

\</td\>

\</tr\>\`;

});

containerHTML += \`\</tbody\>\</table\>\</div\>\`;

availabilityGridContainer.innerHTML = containerHTML;

// Add listeners

listaParametrosProcessamento.forEach(param =\> {

if(param.precisaValor) {

const checkbox = document.getElementById(\`param-\${param.id}\`);

const valorInput =
document.getElementById(checkbox.dataset.valorInputId);

checkbox.addEventListener(\'change\', (e) =\> {

valorInput.classList.toggle(\'hidden\', !e.target.checked);

});

}

});

const saveButton = document.createElement(\'button\');

saveButton.textContent = \`Confirmar e Gerar Horário\`;

saveButton.className = \'option-button button-highlight-conclude mt-4\';

saveButton.onclick = () =\>
handleUserInput(\"CONFIRMAR_CONFIGS_GERAR\");

availabilityGridContainer.appendChild(saveButton);

}

// SUBSTITUA SUA FUNÇÃO resetCompletoParaLogout POR ESTA:

function resetCompletoParaLogout() {

conversationState = \'START\';

const disciplinasIniciais = \[\"Português\", \"Matemática\", \"Física\",
\"Química\", \"Biologia\", \"História\", \"Geografia\", \"Filosofia\",
\"Sociologia\", \"Inglês\", \"Artes\", \"Educação Física\",
\"Ciências\"\];

userData = {

anoReferencia: \'\',

turno: \'\',

horarioInicioAulas: \'\',

duracaoAulaMinutos: 0,

intervalos: \[\],

nivelEnsino: \'\',

horarioFinal: {},

disciplinas: \[\...new Set(disciplinasIniciais)\],

professores: \[\],

horarioGerado: new Map(),

parametrosProcessamento: {},

gradeIndisponibilidadeGeral: {}, // Campo para a nova grade

tiposIndisponibilidade: \[ // Campo para as siglas dinâmicas

{ sigla: \'P\', desc: \'Planejamento\', editavel: false },

{ sigla: \'HA\', desc: \'Hora Atividade\', editavel: true },

{ sigla: \'ND\', desc: \'Não Disponível\', editavel: false },

\]

};

// Zera as variáveis temporárias e de estado

tempData = {};

horarioHistory = \[\];

isSwapModeActive = false;

firstSwapSelection = null;

secondSwapSelection = null;

updateFinalScreenButtonVisibility();

}

// ✅ FUNÇÃO CORRIGIDA - SEPARADA DA ANTERIOR

function resetarDadosParaNovoHorario() {

resetCompletoParaLogout();

}

// \... continua com o resto do seu código (async function
handleJsonFileImport) \...

async function handleJsonFileImport(event) {

const file = event.target.files\[0\];

if (file) {

const reader = new FileReader();

reader.onload = async function(e) {

try {

const importedData = JSON.parse(e.target.result);

if (importedData.professores \|\| importedData.horarioFinal) {

userData = importedData;

if (userData.horarioGerado && !(userData.horarioGerado instanceof Map))
{

userData.horarioGerado = new
Map(Object.entries(userData.horarioGerado));

}

saveCurrentSession();

updateFinalScreenButtonVisibility();

await addBotMessage(\"Dados importados do arquivo com sucesso!\");

fileImportContainer.classList.add(\'hidden\');

await addBotMessage(\"O que você gostaria de fazer com os dados
importados?\", 500, true);

showOptions(\[

{text: \"Visualizar Horário (se gerado)\", value:
\"VISUALIZAR_CARREGADO\", highlight: \"action\"},

{text: \"Continuar Edição\", value: \"CONTINUAR_EDICAO_CARREGADO\",
highlight:\"action\"},

{text: \"Gerar Horário\", value: \"GERAR_COM_DADOS_CARREGADOS\"}

\]);

conversationState = \'MENU_DADOS_CARREGADOS\';

} else {

await addBotMessage(\"ERRO: Arquivo JSON inválido ou com estrutura
incorreta.\");

fileImportContainer.classList.add(\'hidden\');

await handleUserInput();

}

} catch (error) {

await addBotMessage(\"ERRO ao processar o arquivo JSON: \" +
error.message);

fileImportContainer.classList.add(\'hidden\');

await handleUserInput();

}

};

reader.readAsText(file);

}

}

async function exportarDadosParaJSON() {

try {

const dataToExport = { \...userData };

if (dataToExport.horarioGerado instanceof Map) {

dataToExport.horarioGerado =
Object.fromEntries(dataToExport.horarioGerado);

}

const jsonData = JSON.stringify(dataToExport, null, 2);

const blob = new Blob(\[jsonData\], {type: \"application/json\"});

const url = URL.createObjectURL(blob);

const a = document.createElement(\'a\');

const timestamp = new
Date().toISOString().slice(0,10).replace(/-/g,\"\");

a.href = url;

a.download = \`horario_facil_dados\_\${timestamp}.json\`;

document.body.appendChild(a);

a.click();

document.body.removeChild(a);

URL.revokeObjectURL(url);

await addBotMessage(\"Arquivo JSON com os dados exportado com
sucesso!\");

} catch (e) {

await addBotMessage(\"Erro ao exportar os dados para JSON: \" +
e.message);

}

}

async function iniciarConfiguracaoGradeDisponibilidadeTodosProfessores()
{

currentProfessorGradeIndex = 0;

await proximoProfessorParaGradeDisponibilidade();

}

async function proximoProfessorParaGradeDisponibilidade() {

if (currentProfessorGradeIndex \< userData.professores.length) {

currentProfessorConfig =
userData.professores\[currentProfessorGradeIndex\];

await addBotMessage(\`Configurando disponibilidade para o professor(a)
\<b\>\${currentProfessorConfig.nome}\</b\>.\`);

await exibirGradeDisponibilidadeParaProfessor(currentProfessorConfig);

conversationState = \'CONFIGURANDO_GRADE_PROFESSOR\';

return;

}

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"Configuração de disponibilidade/planejamento para
todos os professores concluída.\");

await mostrarTabelaProfessoresCadastrados();

}

async function exibirGradeDisponibilidadeParaProfessor(professor) {

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

const tableContainer = document.createElement(\'div\'); // Wrapper para
responsividade

tableContainer.className = \'table-container\';

const table = document.createElement(\'table\');

table.className = \'availability-grid\';

const thead = table.createTHead();

const headerRow = thead.insertRow();

const thHorario = document.createElement(\'th\');

thHorario.textContent = \'Horário\';

headerRow.appendChild(thHorario);

diasDaSemana.forEach(dia =\> {

const th = document.createElement(\'th\');

th.textContent = dia;

headerRow.appendChild(th);

});

const tbody = table.createTBody();

let horaAtualMinutos =
parseHoraParaMinutos(userData.horarioInicioAulas);

const maxAulasNoTurno =
Object.values(userData.horarioFinal).reduce((max, turma) =\>
Math.max(max, turma.aulasDiarias), 0) \|\| 5;

if (!professor.gradeDisponibilidade) professor.gradeDisponibilidade =
{};

for (let i = 0; i \< maxAulasNoTurno; i++) {

const inicioAula = formatarMinutosParaHora(horaAtualMinutos);

const fimAula = adicionarMinutosAHora(inicioAula,
userData.duracaoAulaMinutos);

const row = tbody.insertRow();

const cellHorario = row.insertCell();

cellHorario.innerHTML =
\`\<div\>\${inicioAula}\</div\>\<div\>\${fimAula}\</div\>\`;

diasDaSemana.forEach(dia =\> {

if (!professor.gradeDisponibilidade\[dia\]) {

professor.gradeDisponibilidade\[dia\] = new
Array(maxAulasNoTurno).fill(\"D\");

}

const status = professor.gradeDisponibilidade\[dia\]\[i\] \|\| \"D\";

const cell = row.insertCell();

cell.textContent = status;

cell.classList.add(\`status-\${status}\`);

cell.dataset.dia = dia;

cell.dataset.slot = i;

cell.onclick = () =\> handleCellClick(dia, i, cell, professor);

});

horaAtualMinutos += userData.duracaoAulaMinutos;

const intervaloAposEstaAula = userData.intervalos.find(intervalo =\>
intervalo.aposAula === (i + 1));

if (intervaloAposEstaAula) {

const intRow = tbody.insertRow();

const intCell = intRow.insertCell();

intCell.colSpan = diasDaSemana.length + 1;

intCell.classList.add(\'interval-row\');

const inicioIntervalo = formatarMinutosParaHora(horaAtualMinutos);

const fimIntervalo = adicionarMinutosAHora(inicioIntervalo,
intervaloAposEstaAula.duracaoMinutos);

intCell.textContent = \`INTERVALO
(\${intervaloAposEstaAula.duracaoMinutos} min)\`;

horaAtualMinutos += intervaloAposEstaAula.duracaoMinutos;

}

}

tableContainer.appendChild(table);

availabilityGridContainer.appendChild(tableContainer);

const saveButton = document.createElement(\'button\');

saveButton.textContent = \`Salvar Disponibilidade para
\${professor.nome}\`;

saveButton.className = \'option-button button-highlight-conclude mt-4\';

saveButton.onclick = () =\> handleUserInput(\"SALVAR_GRADE_PROFESSOR\");

availabilityGridContainer.appendChild(saveButton);

await addBotMessage(\`Clique nas células para alterar entre D
(Disponível), P (Planejamento), ND (Não Disponível) para o professor
\<b\>\${professor.nome}\</b\>. Depois clique em Salvar.\`, 0, true);

}

async function exibirGradeParaFixarDisciplinas(turma) {

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

const tableContainer = document.createElement(\'div\');

tableContainer.className = \'table-container\';

const table = document.createElement(\'table\');

table.className = \'fixed-schedule-grid\';

const thead = table.createTHead();

const headerRow = thead.insertRow();

const thHorario = document.createElement(\'th\');

thHorario.textContent = \'Período\';

headerRow.appendChild(thHorario);

diasDaSemana.forEach(dia =\> {

const th = document.createElement(\'th\');

th.textContent = dia;

headerRow.appendChild(th);

});

const tbody = table.createTBody();

for (let i = 0; i \< turma.aulasDiarias; i++) {

const row = tbody.insertRow();

const cellHorario = row.insertCell();

cellHorario.textContent = \`\${i + 1}º\`;

diasDaSemana.forEach(dia =\> {

const cell = row.insertCell();

cell.dataset.dia = dia;

cell.dataset.periodo = i;

cell.onclick = () =\> handleFixarAulaClick(cell, turma);

const aulaFixa = turma.horariosFixos?.find(hf =\> hf.dia === dia &&
hf.periodo === i);

if (aulaFixa) {

cell.textContent = aulaFixa.disciplina;

cell.classList.add(\'fixed-class-cell\');

}

});

}

tableContainer.appendChild(table);

availabilityGridContainer.appendChild(tableContainer);

const saveButton = document.createElement(\'button\');

saveButton.textContent = \`Salvar Horários Fixos\`;

saveButton.className = \'option-button button-highlight-save mt-4\';

saveButton.onclick = () =\> handleUserInput(\"SALVAR_HORARIOS_FIXOS\");

availabilityGridContainer.appendChild(saveButton);

}

function handleFixarAulaClick(cell, turma) {

if (cell.querySelector(\'select\')) return;

const dia = cell.dataset.dia;

const periodo = parseInt(cell.dataset.periodo);

const disciplinaAtual = cell.textContent;

cell.innerHTML = \'\';

const select = document.createElement(\'select\');

select.className = \'w-full bg-transparent border-0 focus:ring-0\';

const optionVago = document.createElement(\'option\');

optionVago.value = \'\';

optionVago.textContent = \'\-- Vago \--\';

select.appendChild(optionVago);

turma.disciplinas.forEach(disc =\> {

const option = document.createElement(\'option\');

option.value = disc.nome;

option.textContent = disc.nome;

if (disc.nome === disciplinaAtual) {

option.selected = true;

}

select.appendChild(option);

});

select.onchange = () =\> {

const disciplinaSelecionada = select.value;

turma.horariosFixos = turma.horariosFixos.filter(hf =\> hf.dia !== dia
\|\| hf.periodo !== periodo);

if (disciplinaSelecionada) {

turma.horariosFixos.push({ disciplina: disciplinaSelecionada, dia,
periodo });

cell.textContent = disciplinaSelecionada;

cell.classList.add(\'fixed-class-cell\');

} else {

cell.textContent = \'\';

cell.classList.remove(\'fixed-class-cell\');

}

};

select.onblur = () =\> {

const aulaFixa = turma.horariosFixos.find(hf =\> hf.dia === dia &&
hf.periodo === periodo);

cell.textContent = aulaFixa ? aulaFixa.disciplina : \'\';

};

cell.appendChild(select);

select.focus();

}

// SUBSTITUA sua função handleCellClick por esta

function handleCellClick(dia, slotIndex, cellElement, professor) {

const currentStatus =
professor.gradeDisponibilidade\[dia\]\[slotIndex\];

let nextStatus;

if (currentStatus === \"D\") nextStatus = \"P\";

else if (currentStatus === \"P\") nextStatus = \"ND\";

else nextStatus = \"D\";

// \-\-- NOVA LÓGICA DE VERIFICAÇÃO \-\--

if (nextStatus === \'ND\' \|\| nextStatus === \'P\') {

let conflito = null;

// Verifica se o professor tem uma aula fixa neste exato horário

for (const turma of Object.values(userData.horarioFinal)) {

const aulaFixa = turma.horariosFixos?.find(hf =\> {

const disc = turma.disciplinas.find(d =\> d.nome === hf.disciplina);

return disc && disc.professorNome === professor.nome && hf.dia === dia
&& hf.periodo === slotIndex;

});

if (aulaFixa) {

conflito = { turma, aulaFixa };

break;

}

}

if (conflito) {

const { turma, aulaFixa } = conflito;

document.getElementById(\'fixed-class-conflict-message\').innerHTML = \`

O professor \<b\>\${professor.nome}\</b\> tem uma aula fixa de
\<b\>\${aulaFixa.disciplina}\</b\>

na turma \<b\>\${turma.displayText}\</b\> neste horário.\<br\>\<br\>

Para marcá-lo como \'\${nextStatus}\', a aula fixa precisa ser removida.
Deseja continuar?

\`;

fixedClassConflictModal.style.display = \'block\';

document.getElementById(\'confirm-remove-fixed\').onclick = () =\> {

// Remove a aula fixa

turma.horariosFixos = turma.horariosFixos.filter(hf =\> hf !==
aulaFixa);

// Aplica a mudança de status

professor.gradeDisponibilidade\[dia\]\[slotIndex\] = nextStatus;

cellElement.textContent = nextStatus;

cellElement.className = \`status-\${nextStatus}\`;

fixedClassConflictModal.style.display = \'none\';

saveCurrentSession();

};

document.getElementById(\'cancel-remove-fixed\').onclick = () =\> {

fixedClassConflictModal.style.display = \'none\';

};

return; // Impede a alteração de status até que o usuário decida

}

}

// \-\-- FIM DA NOVA LÓGICA \-\--

// Se não houver conflito, altera o status normalmente

professor.gradeDisponibilidade\[dia\]\[slotIndex\] = nextStatus;

cellElement.textContent = nextStatus;

cellElement.className = \`status-\${nextStatus}\`;

}

async function handleSaveGradeDisponibilidade(professor) {

let aulasPlanejamentoCalculadas = 0;

for (const dia in professor.gradeDisponibilidade) {

professor.gradeDisponibilidade\[dia\].forEach(status =\> {

if (status === \"P\") aulasPlanejamentoCalculadas++;

});

}

professor.aulasSemanaisPlanejamento = aulasPlanejamentoCalculadas;

const profIndex = userData.professores.findIndex(p =\> p.id ===
professor.id);

if (profIndex !== -1) {

userData.professores\[profIndex\] = professor;

}

await addBotMessage(\`Disponibilidade/Planejamento do(a) professor(a)
\<b\>\${professor.nome}\</b\> salva.\`);

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"Deseja cadastrar outro professor?\", 500, true);

showOptions(\[

{ text: \"Sim\", value: \"ADD_PROF_SIM\" },

{ text: \"Não\", value: \"ADD_PROF_NAO\" }

\]);

conversationState = \'CONFIRM_ADD_PROFESSOR\';

}

function verificarAulasNaoAlocadas(horarioGerado, dados) {

const aulasNaoAlocadas = \[\];

const aulasContadas = new Map();

for (const \[turmaKey, horarioTurma\] of horarioGerado.entries()) {

for (const diaEng in horarioTurma) {

for (const aula of horarioTurma\[diaEng\]) {

if (!aula \|\| !aula.includes(\'(\')) continue;

const disciplinaNome = aula.split(\' (\')\[0\];

const chave = \`\${turmaKey}-\${disciplinaNome}\`;

aulasContadas.set(chave, (aulasContadas.get(chave) \|\| 0) + 1);

}

}

}

for (const turmaKey in dados.horarioFinal) {

const turma = dados.horarioFinal\[turmaKey\];

for (const disciplina of turma.disciplinas) {

const chave = \`\${turmaKey}-\${disciplina.nome}\`;

const contagemRequerida = disciplina.qtdAulasSemanais;

const contagemReal = aulasContadas.get(chave) \|\| 0;

if (contagemReal \< contagemRequerida) {

aulasNaoAlocadas.push({

disciplina: disciplina.nome,

professor: disciplina.professorNome,

turma: turma.displayText,

faltantes: contagemRequerida - contagemReal

});

}

}

}

return aulasNaoAlocadas;

}

async function gerarDiagnosticoDetalhado(horarioProblematico, dados) {

const sugestoes = new Set();

const aulasFaltantes = verificarAulasNaoAlocadas(horarioProblematico,
dados);

if (aulasFaltantes.length \> 0) {

aulasFaltantes.forEach(item =\> {

sugestoes.add(\`\<b\>Problema Crítico:\</b\> A aula de
\<b\>\${item.disciplina}\</b\> (\${item.faltantes}x) para a turma
\<b\>\${item.turma}\</b\> não foi alocada.

\<br\>\<b\>Causa Provável:\</b\> O professor
\<b\>\${item.professor}\</b\> não possui horários disponíveis (\'D\')
suficientes.

\<br\>\<b\>Ações:\</b\>

\<button class=\"option-button button-highlight-action\"
onclick=\"abrirEditorDisponibilidade(\'\${item.professor}\')\"\>Corrigir
Disp. de \${item.professor}\</button\>

\<button class=\"option-button button-correct\"
onclick=\"iniciarAlocacaoManual()\"\>Alocar Manualmente\</button\>\`);

});

return Array.from(sugestoes);

}

for (const \[turmaKey, horarioTurma\] of horarioProblematico.entries())
{

const turmaInfo = dados.horarioFinal\[turmaKey\];

if (!turmaInfo) continue;

for (const diaEng of diasDaSemanaEng) {

if (!horarioTurma\[diaEng\]) continue;

horarioTurma\[diaEng\].forEach((aula, periodo) =\> {

if (!aula \|\| !aula.includes(\'(\')) return;

const professorNome = aula.substring(aula.indexOf(\'(\') + 1,
aula.indexOf(\')\'));

const profData = dados.professores.find(p =\> p.nome === professorNome);

const diaPt = diasDaSemana\[diasDaSemanaEng.indexOf(diaEng)\];

const status = profData?.gradeDisponibilidade?.\[diaPt\]?.\[periodo\];

if (status === \'ND\' \|\| status === \'P\') {

sugestoes.add(\`\<b\>Conflito de Disponibilidade:\</b\> A aula do
professor \<b\>\${professorNome}\</b\> na
\<b\>\${turmaInfo.displayText}\</b\> (\${diaPt}, \${periodo + 1}º
horário) foi alocada em um horário de \<b\>\'\${status === \'P\' ?
\'Planejamento\' : \'Não Disponível\'}\'\</b\>.

\<br\>\<b\>Ação:\</b\> \<button class=\"option-button
button-highlight-action\"
onclick=\"abrirEditorDisponibilidade(\'\${professorNome}\')\"\>Corrigir
Disponibilidade de \${professorNome}\</button\>\`);

}

});

}

}

if(sugestoes.size \> 0) return Array.from(sugestoes);

const agendaProfessores = new Map();

for (const \[turmaKey, horarioTurma\] of horarioProblematico.entries())
{

for (const diaEng of diasDaSemanaEng) {

horarioTurma\[diaEng\]?.forEach((aula, periodo) =\> {

if (!aula \|\| !aula.includes(\'(\')) return;

const professorNome = aula.substring(aula.indexOf(\'(\') + 1,
aula.indexOf(\')\'));

const chave = \`\${professorNome}-\${diaEng}\`;

if (!agendaProfessores.has(chave)) agendaProfessores.set(chave, \[\]);

agendaProfessores.get(chave).push(periodo);

});

}

}

agendaProfessores.forEach((periodos, chave) =\> {

const \[professorNome, diaEng\] = chave.split(\'-\');

periodos.sort((a,b) =\> a-b);

for (let i = 0; i \< periodos.length - 1; i++) {

if (periodos\[i+1\] - periodos\[i\] \> 1) {

const diaPt = diasDaSemana\[diasDaSemanaEng.indexOf(diaEng)\];

sugestoes.add(\`\<b\>Janela de Otimização:\</b\> O professor
\<b\>\${professorNome}\</b\> possui uma janela na \<b\>\${diaPt}\</b\>.
Embora todas as aulas estejam alocadas, a agenda dele pode ser
melhorada.\`);

}

}

});

return Array.from(sugestoes);

}

async function iniciarAlocacaoManual() {

const aulasFaltantes = verificarAulasNaoAlocadas(userData.horarioGerado,
userData);

if(aulasFaltantes.length === 0){

await addBotMessage(\"Não há aulas faltantes para alocar.\");

return;

}

await addBotMessage(\"Selecione a aula que deseja alocar manualmente:\",
0, true);

const options = aulasFaltantes.map((aula, index) =\> ({

text: \`\${aula.disciplina} na \${aula.turma}\`,

value: \`ALOCAR_MANUAL\_\${index}\`

}));

showOptions(options);

tempData.aulasFaltantes = aulasFaltantes; // Armazena temporariamente

conversationState = \'AWAITING_MANUAL_ALLOCATION_SELECTION\';

}

async function exibirGradeParaAlocacaoManual(turmaKey) {

const turma = userData.horarioFinal\[turmaKey\];

const professorNome = aulaParaAlocarManualmente.professor;

const profData = userData.professores.find(p =\> p.nome ===
professorNome);

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

let html = \`\<h4\>Alocando:
\<b\>\${aulaParaAlocarManualmente.disciplina} (\${professorNome})\</b\>
na Turma \<b\>\${turma.displayText}\</b\>\</h4\>\`;

html += \"\<p\>Clique em um horário verde (válido) para alocar a
aula.\</p\>\";

html += \`\<div class=\"table-container\"\>\<table
class=\"fixed-schedule-grid\"\>\...\`; // (O código da tabela é similar
ao de exibirGradeParaFixarDisciplinas)

const tbody = document.createElement(\'tbody\');

for (let periodo = 0; periodo \< turma.aulasDiarias; periodo++) {

const row = tbody.insertRow();

//\... (criação da linha da tabela)

diasDaSemana.forEach((dia, diaIndex) =\> {

const cell = row.insertCell();

const diaEng = diasDaSemanaEng\[diaIndex\];

const aulaExistente =
userData.horarioGerado.get(turmaKey)?.\[diaEng\]?.\[periodo\];

if (aulaExistente && aulaExistente.trim() !== \'\') {

cell.textContent = aulaExistente;

cell.style.backgroundColor = \'#f3f4f6\'; // Cinza para slots ocupados

} else {

// Verifica se o slot é válido

const statusDisp = profData?.gradeDisponibilidade?.\[dia\]?.\[periodo\];

const chaveOcupacao = \`\${professorNome}-\${diaEng}-\${periodo}\`;

const ocupadoEmOutraTurma = agendaCompleta.has(chaveOcupacao); //
Precisa ter a agendaCompleta

if (statusDisp === \'D\' && !ocupadoEmOutraTurma) {

cell.style.backgroundColor = \'#D1FAE5\'; // Verde para válido

cell.style.cursor = \'pointer\';

cell.onclick = () =\>
handleUserInput(\`PLACE_MANUAL\_\${turmaKey}\_\${diaEng}\_\${periodo}\`);

} else {

cell.style.backgroundColor = \'#FEE2E2\'; // Vermelho para inválido

}

}

});

}

html += \`\</table\>\</div\>\`; // Fechamento da tabela

// É preciso remontar a tabela completa aqui

availabilityGridContainer.innerHTML = html;

// O ideal é refatorar a criação da grade para uma função
reaproveitável.

}

async function abrirEditorDisponibilidade(professorNome) {

const professor = userData.professores.find(p =\> p.nome ===
professorNome);

if (professor) {

currentProfessorConfig = professor;

await addBotMessage(\`Editando a disponibilidade para o professor(a)
\<b\>\${professor.nome}\</b\>\...\`, 0);

await exibirGradeDisponibilidadeParaProfessor(professor);

// Define o estado para garantir que, ao salvar, o sistema saiba que
está em modo de edição

conversationState = \'CONFIGURANDO_GRADE_PROFESSOR_EDICAO\';

} else {

await addBotMessage(\`Erro: Não foi possível encontrar o professor
\${professorNome}.\`);

}

}

async function validarHorarioFinal() {

await addBotMessage(\"Validando o horário gerado contra a
disponibilidade dos professores\...\");

let conflitosEncontrados = \[\];

for (const \[turmaKey, horarioTurma\] of
userData.horarioGerado.entries()) {

const turmaInfo = userData.horarioFinal\[turmaKey\];

if (!turmaInfo) continue;

diasDaSemanaEng.forEach((diaEng, diaIndex) =\> {

if (!horarioTurma\[diaEng\]) return;

horarioTurma\[diaEng\].forEach((aula, periodo) =\> {

if (aula && aula.includes(\'(\')) {

const professorNome = aula.substring(aula.indexOf(\'(\') + 1,
aula.indexOf(\')\'));

const profData = userData.professores.find(p =\> p.nome ===
professorNome);

const diaPt = diasDaSemana\[diaIndex\];

const statusDisponibilidade =
profData?.gradeDisponibilidade?.\[diaPt\]?.\[periodo\];

if (statusDisponibilidade === \'ND\' \|\| statusDisponibilidade ===
\'P\') {

conflitosEncontrados.push(

\`\<li\>\<b\>\${professorNome}\</b\> tem aula na
\<b\>\${turmaInfo.displayText}\</b\> (\${diaPt}, \${periodo + 1}º
horário), mas seu status é \<b\>\${statusDisponibilidade === \'ND\' ?
\'Não Disponível\' : \'Planejamento\'}\</b\>.\</li\>\`

);

}

}

});

});

}

if (conflitosEncontrados.length \> 0) {

let erroMsg = \"\<b\>Atenção: Conflitos de disponibilidade
encontrados!\</b\>\<ul class=\'list-disc pl-5 mt-2\'\>\" +
conflitosEncontrados.join(\'\') + \"\</ul\>\";

await addBotMessage(erroMsg);

return false; // Indica que há conflitos

} else {

await addBotMessage(\"✅ Validação de disponibilidade concluída. Nenhum
conflito encontrado.\");

return true; // Indica que está tudo ok

}

}

async function handleUserInput(input) {

const message = input \|\| userInput.value.trim();

if (message === \'VOLTAR_TELA_FINAL\') {

clearOptions();

await addUserMessage(\"Voltar para Tela Final\");

await addBotMessage(\"Ok, retornando para a tela final de visualização e
ações.\");

await apresentarMenuPosGeracao();

return;

}

const globalActions = \[

\"CORRIGIR_ESCOLA_GLOBAL\",

\"CORRIGIR_TURMAS_GLOBAL\",

\"CORRIGIR_DISCIPLINAS_GLOBAL\",

\"CORRIGIR_PROFESSORES_GLOBAL\",

\"CORRIGIR_RELACIONAMENTO_GLOBAL\",

\"GERAR_COM_DADOS_CARREGADOS\"

\];

if (globalActions.includes(message)) {

if (message === \"GERAR_COM_DADOS_CARREGADOS\") {

clearOptions();

await addBotMessage(\"Ok, vamos prosseguir para a geração do horário com
os dados atuais.\");

if (Object.keys(userData.horarioFinal).length \> 0 &&
userData.professores.length \> 0) {

await validarCargaHorariaProfessores();

} else {

await addBotMessage(\"Não há dados suficientes (turmas e professores)
para gerar um horário. Por favor, complete o cadastro primeiro.\");

await addBotMessage(\"Retornando ao início para garantir que todos os
dados sejam preenchidos.\");

conversationState = \'START\';

await handleUserInput();

}

return;

}

conversationState = \'HANDLE_CORRECTION_CHOICE\';

}

const palavrasCorrecao = \[\"corrigir\", \"alterar\", \"voltar\"\];

if (typeof message === \'string\' &&

palavrasCorrecao.includes(message.toLowerCase()) &&

conversationState !== \'START\' &&

conversationState !== \'POST_START_CHOICE\' &&

conversationState !== \'MENU_DADOS_CARREGADOS\' &&

conversationState !== \'SHOW_CORRECTION_OPTIONS\') {

previousConversationState = conversationState;

conversationState = \'SHOW_CORRECTION_OPTIONS\';

}

// A condição que impedia a inicialização foi removida daqui.

if (typeof message === \'string\' && !input && conversationState !==
\'SHOW_CORRECTION_OPTIONS\') {

addUserMessage(message);

}

switch (conversationState) {

case \'START\': {

// Apenas chama a função que desenha a tela de boas-vindas.

// O reset de dados só acontecerá se o usuário clicar em \"Começar do
Zero\".

await exibirTelaDeBoasVindas();

break;

}

case \'POST_START_CHOICE\': {

clearOptions();

fileImportContainer.classList.add(\'hidden\');

if (message === \"CARREGAR_SESSAO\") {

if (loadCurrentSession()) {

await addBotMessage(\"Sessão anterior carregada com sucesso!\");

await addBotMessage(\"O que você gostaria de fazer?\", 500, true);

showOptions(\[{

text: \"Visualizar Horário (se gerado)\",

value: \"VISUALIZAR_CARREGADO\",

highlight: \"action\"

}, {

text: \"Continuar Edição\",

value: \"CONTINUAR_EDICAO_CARREGADO\",

highlight: \"action\"

}, {

text: \"Gerar Horário\",

value: \"GERAR_COM_DADOS_CARREGADOS\"

}\]);

conversationState = \'MENU_DADOS_CARREGADOS\';

} else {

await addBotMessage(\"Não foi possível carregar a sessão. Vamos começar
um novo.\");

await handleUserInput(\"CRIAR_NOVO\");

}

} else if (message === \"CARREGAR_MODELO\") {

await exibirTelaGestaoModelos();

} else if (message === \"IMPORTAR_JSON\") {

await addBotMessage(\"Por favor, selecione o arquivo .json com os dados
do horário.\", 500, true);

fileImportContainer.classList.remove(\'hidden\');

jsonFileInput.value = \'\';

jsonFileInput.onchange = handleJsonFileImport;

} else if (message === \"GERIR_MODELOS\") {

await exibirTelaGestaoModelos();

} else if (message === \"CRIAR_NOVO\") {

// A linha \"addUserMessage\" foi removida daqui, corrigindo a
duplicata.

await addBotMessage(\"Ok, vamos criar um novo horário do zero.\");

resetarDadosParaNovoHorario();

localStorage.removeItem(SESSION_STORAGE_KEY);

const currentYear = new Date().getFullYear();

const yearOptions = \[{

text: \`\${currentYear - 1}\`,

value: \`\${currentYear - 1}\`

}, {

text: \`\${currentYear}\`,

value: \`\${currentYear}\`

}, {

text: \`\${currentYear + 1}\`,

value: \`\${currentYear + 1}\`

}\];

await addBotMessage(\"Para qual ano de referência você deseja gerar o
horário?\", 500, true);

showOptions(yearOptions);

conversationState = \'AWAITING_ANO_REFERENCIA\';

}

break;

}

// DENTRO DE async function handleUserInput(input)

// \...

// SUBSTITUA ESTE CASE:

case \'EDITANDO_TABELA_PROFESSORES\': {

if (message === \'SALVAR_DADOS_PROFESSORES\') {

const sucesso = await salvarDadosDaTabelaProfessores();

if (sucesso) {

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await exibirTabelaDeIndisponibilidadeGeral();

}

}

break;

}

case \'CONFIGURANDO_INDISPONIBILIDADE_GERAL\': {

if (message === \'SALVAR_INDISPONIBILIDADE_GERAL\') {

saveCurrentSession();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"✅ Indisponibilidades salvas com sucesso!\");

await exibirTabelaDeRelacionamentoFinal();

}

break;

}

// DENTRO DE async function handleUserInput(input)

// \...

case \'CONFERIR_PROFESSORES_CADASTRADOS_ACAO\': {

clearOptions();

if (message === \"PROSSEGUIR_RELACIONAMENTO_TABELA\") {

await addUserMessage(\"Prosseguir para Relacionamento\");

// ✅ CORREÇÃO: Chamando a função correta que você já possui

await exibirTabelaDeRelacionamentoFinal();

} else if (message === \"CADASTRAR_NOVO_PROFESSOR_TABELA\") {

await exibirTabelaDeProfessores();

} else if (message === \"EDITAR_PROFESSOR_MENU\") {

await exibirTabelaDeProfessores();

}

break;

}

// 2. SUBSTITUA ESTE CASE:

case \'CONCLUIR_E_VALIDAR\': {

if (message === \'CONCLUIR_E_VALIDAR\') {

saveCurrentSession();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"✅ Relacionamentos salvos. Validando carga horária
dos professores\...\");

await validarCargaHorariaProfessores();

}

break;

}

// \...

// \...

case \'MANAGING_MODELS\':

{

if (message.startsWith(\'LOAD_MODEL\_\')) {

const modelNameToLoad = message.replace(\'LOAD_MODEL\_\', \'\');

if (loadModel(modelNameToLoad)) {

modelModal.style.display = \'none\';

await addBotMessage(\`Modelo \"\<b\>\${modelNameToLoad}\</b\>\"
carregado com sucesso!\`);

await addBotMessage(\"Os dados de professores e disciplinas foram
pré-preenchidos.\");

await addBotMessage(\"Vamos agora definir as configurações para esta
geração de horário.\", 500);

const yearOptions = \[{

text: \`\${new Date().getFullYear()}\`,

value: \`\${new Date().getFullYear()}\`

}, {

text: \`\${new Date().getFullYear() + 1}\`,

value: \`\${new Date().getFullYear() + 1}\`

}\];

await addBotMessage(\"Para qual ano de referência você deseja gerar o
horário?\", 500, true);

showOptions(yearOptions);

conversationState = \'AWAITING_ANO_REFERENCIA\';

} else {

await addBotMessage(\`Erro ao carregar o modelo
\"\${modelNameToLoad}\".\`);

}

} else if (message.startsWith(\'DELETE_MODEL\_\')) {

const modelNameToDelete = message.replace(\'DELETE_MODEL\_\', \'\');

tempData.modelToDelete = modelNameToDelete;

await addBotMessage(\`Tem certeza que deseja excluir o modelo
\"\<b\>\${modelNameToDelete}\</b\>\"? Esta ação não pode ser
desfeita.\`, 0, true);

showOptions(\[{

text: \"Sim, excluir\",

value: \"CONFIRM_DELETE_MODEL\",

highlight: \"correct\"

}, {

text: \"Não, cancelar\",

value: \"CANCEL_DELETE_MODEL\"

}\]);

conversationState = \'AWAITING_MODEL_DELETE_CONFIRMATION\';

}

break;

}

case \'AWAITING_MODEL_DELETE_CONFIRMATION\': {

if (message === \'CONFIRM_DELETE_MODEL\') {

deleteModel(tempData.modelToDelete);

await addBotMessage(\`Modelo \"\<b\>\${tempData.modelToDelete}\</b\>\"
excluído.\`);

tempData.modelToDelete = null;

await exibirTelaGestaoModelos(); // Atualiza a lista no modal

} else {

await addBotMessage(\"Exclusão cancelada.\");

await exibirTelaGestaoModelos();

}

break;

}

case \'AWAITING_MODEL_NAME_TO_SAVE\': {

const modelName = message.trim();

if (!modelName) {

await addBotMessage(\"O nome do modelo não pode estar em branco. Por
favor, digite um nome válido.\");

break;

}

saveModel(modelName);

await addBotMessage(\`Modelo de escola \"\<b\>\${modelName}\</b\>\"
salvo com sucesso!\`);

await mostrarTabelaProfessoresCadastrados();

break;

}

case \'MENU_DADOS_CARREGADOS\':

clearOptions();

if (message === \"VISUALIZAR_CARREGADO\") {

if (userData.horarioGerado && (userData.horarioGerado.size \> 0 \|\|
Object.keys(userData.horarioGerado).length \> 0)) {

if (!(userData.horarioGerado instanceof Map)) {

userData.horarioGerado = new
Map(Object.entries(userData.horarioGerado));

}

await mostrarHorarioGerado();

} else {

await addBotMessage(\"Ainda não há um horário gerado para visualizar.
Continue a edição ou gere um novo horário.\");

showOptions(\[

{text: \"Continuar Edição\", value: \"CONTINUAR_EDICAO_CARREGADO\",
highlight: \"action\"},

{text: \"Gerar Novo Horário (com dados atuais)\", value:
\"GERAR_COM_DADOS_CARREGADOS\"},

\]);

}

} else if (message === \"CONTINUAR_EDICAO_CARREGADO\") {

await addBotMessage(\"Ok, vamos continuar a edição.\");

await mostrarTabelaTurmasCadastradas();

} else if (message === \"GERAR_COM_DADOS_CARREGADOS\") {

await addBotMessage(\"Ok, vamos prosseguir para a geração do horário com
os dados atuais.\");

await validarCargaHorariaProfessores();

} else {

await addBotMessage(\"Opção inválida.\");

showOptions(\[

{text: \"Visualizar Horário (se gerado)\", value:
\"VISUALIZAR_CARREGADO\", highlight: \"action\"},

{text: \"Continuar Edição\", value: \"CONTINUAR_EDICAO_CARREGADO\",
highlight: \"action\"},

{text: \"Gerar Novo Horário (com dados atuais)\", value:
\"GERAR_COM_DADOS_CARREGADOS\"},

\]);

}

break;

case \'SHOW_CORRECTION_OPTIONS\':

await addBotMessage(\"O que você gostaria de corrigir/alterar?\", 0,
true);

showOptions(\[

{text: \"Configurações da Escola (Ano, Turno, etc.)\", value:
\"CORRIGIR_ESCOLA_GLOBAL\"},

{text: \"Cadastro de Turmas\", value: \"CORRIGIR_TURMAS_GLOBAL\"},

{text: \"Disciplinas das Turmas\", value:
\"CORRIGIR_DISCIPLINAS_GLOBAL\"},

{text: \"Cadastro de Professores/Disponibilidade\", value:
\"CORRIGIR_PROFESSORES_GLOBAL\"},

{text: \"Relacionamento Professor-Disciplina\", value:
\"CORRIGIR_RELACIONAMENTO_GLOBAL\"},

{text: \"Cancelar Correção\", value: \"CANCELAR_CORRECAO\"}

\]);

conversationState = \'HANDLE_CORRECTION_CHOICE\';

break;

case \'HANDLE_CORRECTION_CHOICE\': {

clearOptions();

// \... outras condições \...

// Altere esta condição para chamar a nova função

if (message === \"CORRIGIR_PROFESSORES_TABELA\" \|\| message ===
\"CORRIGIR_PROFESSORES_GLOBAL\") {

await addBotMessage(\"Ok, vamos para a tela de gerenciamento de
Professores.\");

await exibirTabelaDeProfessores(); // \<\<\-- CHAMADA AQUI

}

// \... resto do seu código \...

break;

}

// \... dentro da função handleUserInput, dentro do switch
(conversationState) \...

// ✅ NOVO CASE: Para navegar para a tela final

case \'NAVIGATE_TO_FINAL_SCREEN\': {

clearOptions();

await addUserMessage(\"Navegar para a Tela Final\");

// Verifica se um horário já foi gerado

if (userData.horarioGerado && (userData.horarioGerado.size \> 0 \|\|
Object.keys(userData.horarioGerado).length \> 0)) {

await addBotMessage(\"Ok, exibindo o menu de ações do horário.\");

await apresentarMenuPosGeracao();

} else {

await addBotMessage(\"Você precisa gerar um horário primeiro para
acessar esta tela.\");

// Opcional: Iniciar o fluxo de geração

// await handleUserInput(\"GERAR_COM_DADOS_CARREGADOS\");

}

// Define o estado correto para o menu de ações

conversationState = \'AWAITING_POST_GENERATION_ACTION\';

break;

}

// \... resto dos seus \'cases\'

case \'AWAITING_ANO_REFERENCIA\':

if (!/\^\d{4}\$/.test(message)) {

await addBotMessage(\"Por favor, insira um ano válido com 4 dígitos (Ex:
2025).\");

} else {

userData.anoReferencia = message;

await addBotMessage(\`Ano de referência definido:
\${userData.anoReferencia}.\`);

await addBotMessage(\"Qual a modalidade de ensino?\", 500, true);

showOptions(\[

{ text: \"Ensino Fundamental\", value: \"FUNDAMENTAL\" },

{ text: \"Ensino Médio\", value: \"MEDIO\" },

\]);

conversationState = \'AWAITING_NIVEL_ENSINO\';

}

break;

case \'AWAITING_TURNO\': {

clearOptions();

userData.turno = message;

await addBotMessage(\`Turno selecionado: \${message}.\`);

let timeSlots = \[\];

switch (userData.turno.toUpperCase()) {

case \'MANHA\':

case \'INTEGRAL\':

timeSlots = generateTimeSlots(7, 9, 15);

break;

case \'TARDE\':

case \'TARDE - NOITE\':

timeSlots = generateTimeSlots(13, 15, 15);

break;

case \'NOITE\':

timeSlots = generateTimeSlots(18, 20, 15);

break;

}

if (timeSlots.length \> 0) {

const timeOptions = timeSlots.map(time =\> ({ text: time, value: time
}));

await addBotMessage(\"Qual o horário de \<b\>início\</b\> das aulas
neste turno?\", 500, true);

showOptions(timeOptions);

} else {

await addBotMessage(\"Qual o horário de \<b\>início\</b\> das aulas
neste turno? (Ex: 07:30)\", 500, true);

}

conversationState = \'AWAITING_HORARIO_INICIO_AULAS\';

break;

}

case \'AWAITING_HORARIO_INICIO_AULAS\': {

userData.horarioInicioAulas = message;

await addBotMessage(\`Horário de início:
\${userData.horarioInicioAulas}.\`);

const duracaoOptions = \[

{ text: \"40 min\", value: \"40\" },

{ text: \"45 min\", value: \"45\" },

{ text: \"50 min\", value: \"50\" },

{ text: \"55 min\", value: \"55\" },

{ text: \"60 min\", value: \"60\" }

\];

await addBotMessage(\"Qual a duração de cada aula em minutos?\", 500,
true);

showOptions(duracaoOptions);

conversationState = \'AWAITING_DURACAO_AULA\';

break;

}

case \'AWAITING_DURACAO_AULA\': {

const duracao = parseInt(message);

if (isNaN(duracao) \|\| duracao \<= 0) {

await addBotMessage(\"Opção de duração inválida. Por favor, tente
novamente.\");

const duracaoOptions = \[

{ text: \"40 min\", value: \"40\" }, { text: \"45 min\", value: \"45\"
},

{ text: \"50 min\", value: \"50\" }, { text: \"55 min\", value: \"55\"
},

{ text: \"60 min\", value: \"60\" }

\];

showOptions(duracaoOptions);

} else {

userData.duracaoAulaMinutos = duracao;

await addBotMessage(\`Duração da aula definida para \${duracao}
minutos.\`);

const intervaloOptions = \[

{ text: \"Nenhum\", value: \"0\" }, { text: \"1\", value: \"1\" },

{ text: \"2\", value: \"2\" }, { text: \"3\", value: \"3\" },

{ text: \"4\", value: \"4\" }, { text: \"5\", value: \"5\" }

\];

await addBotMessage(\"Quantos intervalos haverá neste turno?\", 500,
true);

showOptions(intervaloOptions);

conversationState = \'AWAITING_QTD_INTERVALOS\';

}

break;

}

case \'AWAITING_QTD_INTERVALOS\': {

const qtdIntervalos = parseInt(message);

if (isNaN(qtdIntervalos) \|\| qtdIntervalos \< 0 \|\| qtdIntervalos \>
5) {

await addBotMessage(\"Por favor, selecione uma opção de 0 a 5.\");

const intervaloOptions = \[

{ text: \"Nenhum\", value: \"0\" }, { text: \"1\", value: \"1\" },

{ text: \"2\", value: \"2\" }, { text: \"3\", value: \"3\" },

{ text: \"4\", value: \"4\" }, { text: \"5\", value: \"5\" }

\];

showOptions(intervaloOptions);

break;

}

currentQtdIntervalos = qtdIntervalos;

userData.intervalos = \[\];

currentIntervaloIndex = 0;

if (currentQtdIntervalos \> 0) {

const duracaoIntervaloOptions = \[\];

for (let i = 5; i \<= 90; i += 5) {

duracaoIntervaloOptions.push({ text: \`\${i} min\`, value: \`\${i}\` });

}

await addBotMessage(\`Qual a duração do \${currentIntervaloIndex + 1}º
intervalo?\`, 500, true);

showOptions(duracaoIntervaloOptions);

conversationState = \'AWAITING_DURACAO_INTERVALO\';

} else {

await addBotMessage(\"Nenhum intervalo configurado.\");

await addBotMessage(\`\<b\>Resumo da Configuração da
Escola:\</b\>\<br\>Ano: \${userData.anoReferencia}.\<br\>Nível:
\${userData.nivelEnsino}\<br\>Turno: \${userData.turno}.\<br\>Início:
\${userData.horarioInicioAulas}.\<br\>Duração Aula:
\${userData.duracaoAulaMinutos} min.\<br\>Intervalos:
Nenhum.\<br\>Deseja confirmar ou corrigir?\`, 500, true);

showOptions(\[

{text: \"Confirmar e ir para Cadastro de Turmas\", value:
\"CONFIRMAR_CONFIG_ESCOLA_PROSSEGUIR\", highlight: \"conclude\"},

{text: \"Corrigir Configurações da Escola\", value:
\"CORRIGIR_CONFIG_ESCOLA\", highlight: \"correct\"}

\]);

conversationState = \'CONFIRMAR_CONFIG_ESCOLA\';

}

break;

}

case \'AWAITING_DURACAO_INTERVALO\': {

clearOptions();

const duracaoIntervalo = parseInt(message);

if (isNaN(duracaoIntervalo) \|\| duracaoIntervalo \<= 0) {

await addBotMessage(\"Duração inválida. Por favor, selecione uma das
opções.\");

const duracaoOptions = \[\];

for (let i = 5; i \<= 90; i += 5) {

duracaoOptions.push({ text: \`\${i} min\`, value: \`\${i}\` });

}

showOptions(duracaoOptions);

break;

}

tempDuracaoIntervalo = duracaoIntervalo;

await addBotMessage(\`Duração do \${currentIntervaloIndex + 1}º
intervalo: \${duracaoIntervalo} min.\`);

const primeiraTurma = Object.values(userData.horarioFinal)\[0\];

let maxAulasPrevisao = primeiraTurma ? primeiraTurma.aulasDiarias :
(userData.turno.toUpperCase().includes(\'INTEGRAL\') \|\|
userData.turno.toUpperCase().includes(\'NOITE\') ? 9 : 6);

const posicaoOptions = \[\];

for (let i = 1; i \< maxAulasPrevisao; i++) {

posicaoOptions.push({ text: \`Após a \${i}ª aula\`, value: \`\${i}\` });

}

await addBotMessage(\"Após qual aula este intervalo ocorrerá?\", 500,
true);

showOptions(posicaoOptions);

conversationState = \'AWAITING_POSICAO_INTERVALO\';

break;

}

case \'AWAITING_POSICAO_INTERVALO\': {

clearOptions();

const aposAula = parseInt(message);

if (isNaN(aposAula) \|\| aposAula \<= 0) {

await addBotMessage(\"Posição inválida. Por favor, selecione uma das
opções.\");

} else {

userData.intervalos.push({ duracaoMinutos: tempDuracaoIntervalo,
aposAula: aposAula });

currentIntervaloIndex++;

if (currentIntervaloIndex \< currentQtdIntervalos) {

await addBotMessage(\`Intervalo \${currentIntervaloIndex}
configurado.\`);

const duracaoIntervaloOptions = \[\];

for (let i = 5; i \<= 90; i += 5) {

duracaoIntervaloOptions.push({ text: \`\${i} min\`, value: \`\${i}\` });

}

await addBotMessage(\`Qual a duração do \${currentIntervaloIndex + 1}º
intervalo?\`, 500, true);

showOptions(duracaoIntervaloOptions);

conversationState = \'AWAITING_DURACAO_INTERVALO\';

} else {

await addBotMessage(\"Todos os intervalos foram configurados com
sucesso.\");

const resumoIntervalos = userData.intervalos.map((int, idx) =\>

\`\${idx + 1}º: \${int.duracaoMinutos} min (após a \${int.aposAula}ª
aula)\`

).join(\'\<br\>\');

await addBotMessage(\`\<b\>Resumo da Configuração:\</b\>\<br\>Ano:
\${userData.anoReferencia}\<br\>Turno: \${userData.turno}\<br\>Início:
\${userData.horarioInicioAulas}\<br\>Duração/Aula:
\${userData.duracaoAulaMinutos}
min\<br\>Intervalos:\<br\>\${resumoIntervalos}\`);

showOptions(\[

{text: \"Confirmar e ir para Cadastro de Turmas\", value:
\"CONFIRMAR_CONFIG_ESCOLA_PROSSEGUIR\", highlight: \"conclude\"},

{text: \"Corrigir Configurações\", value: \"CORRIGIR_CONFIG_ESCOLA\",
highlight: \"correct\"}

\]);

conversationState = \'CONFIRMAR_CONFIG_ESCOLA\';

}

}

break;

}

case \'AWAITING_NIVEL_ENSINO\':

clearOptions();

if (\[\"FUNDAMENTAL\", \"MEDIO\"\].includes(message)) {

userData.nivelEnsino = message;

await addBotMessage(\"Qual o turno das atividades escolares?\", 500,
true);

showOptions(\[

{text: \"Manhã\", value: \"MANHA\"}, {text: \"Tarde\", value:
\"TARDE\"}, {text: \"Noite\", value: \"NOITE\"},

{text: \"Manhã - Tarde\", value: \"MANHA_TARDE\"}, {text: \"Tarde -
Noite\", value: \"TARDE_NOITE\"},

{text: \"Integral\", value: \"INTEGRAL\"}

\]);

conversationState = \'AWAITING_TURNO\';

} else {

await addBotMessage(\"Opção inválida. Por favor, selecione uma das
opções abaixo.\");

showOptions(\[

{ text: \"Ensino Fundamental\", value: \"FUNDAMENTAL\" },

{ text: \"Ensino Médio\", value: \"MEDIO\" },

\]);

}

break;

case \'CONFIRMAR_CONFIG_ESCOLA\': {

clearOptions();

if (message === \"CONFIRMAR_CONFIG_ESCOLA_PROSSEGUIR\") {

await addUserMessage(\"Confirmar e ir para Cadastro de Turmas\");

// Chama a PRIMEIRA função do nosso novo fluxo de tabela

await iniciarContagemDeTurmas();

}

else if (message === \"CORRIGIR_CONFIG_ESCOLA\") {

await addBotMessage(\"Ok, vamos corrigir as configurações da escola
desde o início.\");

resetarDadosParaNovoHorario();

const currentYear = new Date().getFullYear();

const yearOptions = \[

{ text: \`\${currentYear - 1}\`, value: \`\${currentYear - 1}\` },

{ text: \`\${currentYear}\`, value: \`\${currentYear}\` },

{ text: \`\${currentYear + 1}\`, value: \`\${currentYear + 1}\` }

\];

await addBotMessage(\"Para qual ano de referência você deseja gerar o
horário?\", 500, true);

showOptions(yearOptions);

conversationState = \'AWAITING_ANO_REFERENCIA\';

}

break;

}

// Adicione estes dois novos cases dentro do switch em handleUserInput

case \'AGUARDANDO_CONTAGEM_DE_TURMA\': {

const quantidade = parseInt(message, 10);

if (isNaN(quantidade) \|\| quantidade \< 0 \|\| quantidade \> 10) {

await addBotMessage(\"Por favor, selecione uma quantidade válida (0 a
10).\");

await proximaPerguntaContagemTurma(); // Pergunta de novo

break;

}

const serieAno =
tempData.seriesAnosParaPerguntar\[tempData.serieAnoAtualIndex\];

if (quantidade \> 0) {

tempData.contagemTurmas\[serieAno\] = quantidade;

}

tempData.serieAnoAtualIndex++;

await proximaPerguntaContagemTurma(); // Pergunta para a próxima
série/ano

break;

}

case \'PREENCHENDO_TABELA_TURMAS\': {

if (message === \"SALVAR_TURMAS_DA_TABELA\") {

await salvarTurmasDaTabela();

}

break;

}

case \'EDITANDO_TABELA_TURMAS\': {

if (message === \'SALVAR_EDICOES_TURMAS\') {

const sucesso = await salvarEdicoesDaTabelaDeTurmas();

if (sucesso) {

// Se salvou com sucesso, limpa a tela e avança para as disciplinas.

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"Agora, vamos configurar as disciplinas para estas
turmas.\");

await iniciarCadastroDisciplinas();

}

}

break;

}

case \'CONFERIR_TURMAS_CADASTRADAS_ACAO\':

clearOptions();

if (message === \"PROSSEGUIR_DISCIPLINAS_TABELA\") {

await addUserMessage(\"Prosseguir para Cadastro de Disciplinas\");

await iniciarCadastroDisciplinas(); // Chama a função principal do novo
fluxo

}

else if (message === \"EDITAR_AULAS_TURMA_SELECIONAR_TABELA\") {

const turmasEditaveis = Object.values(userData.horarioFinal);

if (turmasEditaveis.length \> 0) {

await addBotMessage(\"Qual turma deseja editar as aulas?\", 500, true);

const turmaOptions = turmasEditaveis.map(t =\> ({text: t.displayText,
value: t.key}));

showOptions(turmaOptions);

conversationState = \'EDITAR_AULAS_TURMA_SELECIONADA\';

} else {

await addBotMessage(\"Nenhuma turma para editar.\");

await mostrarTabelaTurmasCadastradas();

}

} else if (message === \"CORRIGIR_TURMAS_GLOBAL\") {

await addBotMessage(\`Ok, vamos corrigir o cadastro de turmas.\`);

userData.horarioFinal = {};

userData.horarioGerado = {};

const serieAnoLabel = userData.nivelEnsino === \'FUNDAMENTAL\' ? \'Ano\'
: \'Série\';

currentSerieAnoParaCadastro = userData.nivelEnsino === \'FUNDAMENTAL\' ?
\'1\' : \'1\';

turmasCadastradasNaSerieAnoCount = 0;

await askForQtdTurmas();

} else {

await addBotMessage(\"Opção inválida. Por favor, escolha uma das
opções.\");

await mostrarTabelaTurmasCadastradas();

}

break;

case \'EDITAR_AULAS_TURMA_SELECIONADA\': {

clearOptions();

const turmaKey = message;

const turmaSelecionada = userData.horarioFinal\[turmaKey\];

if (turmaSelecionada) {

currentTurmaConfig = turmaSelecionada;

turmaKeyParaEditarAulas = turmaKey;

await addBotMessage(\`A turma
\<b\>\${turmaSelecionada.displayText}\</b\> possui atualmente
\<b\>\${turmaSelecionada.aulasDiarias}\</b\> aulas diárias. Qual a nova
quantidade?\`, 0, true);

let maxAulas = 6;

const turno = userData.turno.toUpperCase();

if (turno === \'INTEGRAL\' \|\| turno === \'MANHA-TARDE\' \|\| turno ===
\'TARDE-NOITE\') {

maxAulas = 10;

}

const qtdAulasOptions = \[\];

for (let i = 1; i \<= maxAulas; i++) {

qtdAulasOptions.push({ text: \`\${i}\`, value: \`\${i}\` });

}

showOptions(qtdAulasOptions);

conversationState = \'AWAITING_NOVA_QTD_AULAS_TURMA\';

} else {

await addBotMessage(\"Turma não encontrada. Por favor, tente
novamente.\");

await mostrarTabelaTurmasCadastradas();

}

break;

}

case \'AWAITING_NOVA_QTD_AULAS_TURMA\': {

clearOptions();

const novaQtdAulas = parseInt(message);

if (isNaN(novaQtdAulas) \|\| novaQtdAulas \<= 0) {

await addBotMessage(\"Quantidade inválida.\");

} else {

const turmaEditada = userData.horarioFinal\[turmaKeyParaEditarAulas\];

turmaEditada.aulasDiarias = novaQtdAulas;

turmaEditada.aulasSemanais = novaQtdAulas \* 5;

await addBotMessage(\`A quantidade de aulas da turma
\<b\>\${turmaEditada.displayText}\</b\> foi atualizada para
\<b\>\${novaQtdAulas}\</b\> aulas diárias.\`);

}

turmaKeyParaEditarAulas = null;

await mostrarTabelaTurmasCadastradas();

break;

}

case \'EDITANDO_TABELA_DISCIPLINAS\': {

if (message === \'SALVAR_DADOS_DISCIPLINAS\') {

await salvarDadosDasDisciplinas();

}

// Se o usuário clicar no botão para corrigir as disciplinas após o erro

else if (message === \'CORRIGIR_DISCIPLINAS_TABELA\') {

await addUserMessage(\"Ajustar aulas na tabela de Disciplinas\");

await addBotMessage(\"Ok, a tabela foi reaberta para ajuste.\");

// A função getDisciplinasPadrao() agora deve ler os dados salvos para
não perder as edições

const disciplinasAtuais = \[\];

const tabelaAntiga = document.querySelectorAll(\'#tabela-disciplinas
tbody tr\'); // Supondo que a tabela ainda está no DOM ou precisamos
recriá-la a partir do userData

// Vamos simplificar: recriamos a tabela a partir do zero com os dados
padrão

// O ideal seria salvar o estado da tabela, mas isso adiciona muita
complexidade.

// Vamos apenas reabrir com os padrões, o que força a correção completa.

const disciplinasPadrao = getDisciplinasPadrao();

exibirTabelaDeDisciplinas(disciplinasPadrao);

}

// Se o usuário clicar para voltar para a edição de turmas

else if (message === \'VOLTAR_PARA_EDICAO_TURMAS\') {

await addUserMessage(\"Corrigir total de aulas das Turmas\");

await addBotMessage(\"Ok, retornando à tela de gerenciamento de
turmas.\");

await mostrarTabelaTurmasCadastradas();

}

break;

}

// DENTRO DE handleUserInput

case \'FIXANDO_AULAS_EM_GRADE\': {

if (message === \'CONCLUIR_FIXACAO_AULAS\') {

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addUserMessage(\"Concluir fixação de aulas\");

await addBotMessage(\"Aulas fixas salvas! Vamos para a próxima
etapa.\");

await addBotMessage(\"Vamos agora para o cadastro de professores.\");

// ✅ Linha CORRIGIDA: Chama a função que cria a tabela de edição

await exibirTabelaDeProfessores();

}

break;

}

case \'CADASTRO_PROFESSOR_NOME\': {

if (!message \|\| message.length \< 2) {

await addBotMessage(\"Por favor, digite um nome válido para o
professor.\");

break;

}

currentProfessorConfig.nome = message.toUpperCase();

await addBotMessage(\`Professor
\<b\>\${currentProfessorConfig.nome}\</b\> cadastrado.\`);

// \*\* CORREÇÃO \*\*: Filtra as disciplinas que já foram adicionadas a
alguma turma.

const disciplinasCadastradas = new Set();

Object.values(userData.horarioFinal).forEach(turma =\> {

if (turma.disciplinas) {

turma.disciplinas.forEach(d =\> disciplinasCadastradas.add(d.nome));

}

});

const listaFiltradaDeDisciplinas = Array.from(disciplinasCadastradas);

if (listaFiltradaDeDisciplinas.length === 0) {

await addBotMessage(\"\<b\>ATENÇÃO:\</b\> Nenhuma disciplina foi
cadastrada em nenhuma turma ainda. Não é possível continuar o cadastro
de professores. Por favor, corrija o cadastro de disciplinas
primeiro.\");

showOptions(\[

{ text: \"Corrigir Cadastro de Disciplinas\", value:
\"CORRIGIR_DISCIPLINAS_GLOBAL\", highlight: \"correct\" }

\]);

conversationState = \'HANDLE_CORRECTION_CHOICE\';

break;

}

await addBotMessage(\"Agora, selecione as disciplinas que este(a)
professor(a) ministra:\", 500, true);

const options = listaFiltradaDeDisciplinas.map(d =\> ({ text: d, value:
d }));

showOptions(options, true);

conversationState = \'CADASTRO_PROFESSOR_DISCIPLINAS\';

break;

}

case \'CADASTRO_PROFESSOR_DISCIPLINAS\':

clearOptions();

const disciplinasSelecionadas = Array.isArray(message) ? message :
\[message\];

if (disciplinasSelecionadas.length === 0 \|\|
disciplinasSelecionadas\[0\] === \"Nenhuma opção selecionada.\"){

await addBotMessage(\"Nenhuma disciplina selecionada. Por favor,
selecione ao menos uma.\");

const disciplinasDisponiveis = \[\...new
Set(Object.values(userData.horarioFinal).flatMap(t =\>
t.disciplinas.map(d =\> d.nome)))\];

const options = disciplinasDisponiveis.map(d =\> ({ text: d, value: d
}));

showOptions(options, true);

conversationState = \'CADASTRO_PROFESSOR_DISCIPLINAS\';

break;

}

currentProfessorConfig.disciplinasMinistra = disciplinasSelecionadas;

await addBotMessage(\`Disciplinas de
\<b\>\${currentProfessorConfig.nome}\</b\>:
\${disciplinasSelecionadas.join(\', \')}.\`);

await addBotMessage(\`Qual a carga horária total de aulas \<b\>EM
SALA\</b\> deste professor por semana? (apenas números)\`, 500, true);

conversationState = \'CADASTRO_PROFESSOR_AULAS_SALA\';

break;

case \'CADASTRO_PROFESSOR_AULAS_SALA\': {

const aulas = parseInt(message);

if (isNaN(aulas) \|\| aulas \< 0) {

await addBotMessage(\"Por favor, insira um número válido para a carga
horária.\", 0, true);

break;

}

currentProfessorConfig.aulasSemanaisSala = aulas;

await addBotMessage(\`Carga horária de \<b\>\${aulas}\</b\> aulas/semana
definida.\`);

await addBotMessage(\`Agora, configure a grade de disponibilidade e
planejamento para \<b\>\${currentProfessorConfig.nome}\</b\>.\`, 500);

await exibirGradeDisponibilidadeParaProfessor(currentProfessorConfig);

conversationState = \'CONFIGURANDO_GRADE_PROFESSOR\';

break;

}

case \'CONFIGURANDO_GRADE_PROFESSOR\': {

if (message === \'SALVAR_GRADE_PROFESSOR\') {

let aulasPlanejamentoCalculadas = 0;

for (const dia in currentProfessorConfig.gradeDisponibilidade) {

currentProfessorConfig.gradeDisponibilidade\[dia\].forEach(status =\> {

if (status === \"P\") aulasPlanejamentoCalculadas++;

});

}

currentProfessorConfig.aulasSemanaisPlanejamento =
aulasPlanejamentoCalculadas;

userData.professores.push(currentProfessorConfig);

saveCurrentSession();

await addBotMessage(\`Disponibilidade do(a) professor(a)
\<b\>\${currentProfessorConfig.nome}\</b\> salva.\`);

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"Deseja cadastrar outro professor?\", 500, true);

showOptions(\[

{ text: \"Sim\", value: \"ADD_PROF_SIM\" },

{ text: \"Não, concluir cadastro\", value: \"ADD_PROF_NAO\", highlight:
\"conclude\" }

\]);

conversationState = \'CONFIRM_ADD_PROFESSOR\';

} else {

await addBotMessage(\"Por favor, clique no botão \'Salvar
Disponibilidade\' para continuar.\");

}

break;

}

case \'CONFIRM_ADD_PROFESSOR\':

clearOptions();

if (message === \'ADD_PROF_SIM\') {

currentProfessorConfig = { nome: null, disciplinasMinistra: \[\],
aulasSemanaisSala: 0, aulasSemanaisPlanejamento: 0,
gradeDisponibilidade: {} };

await addBotMessage(\"Qual o nome do próximo professor(a)?\", 500,
true);

conversationState = \'CADASTRO_PROFESSOR_NOME\';

} else {

await addBotMessage(\"Ok, cadastro de professores finalizado.\");

await mostrarTabelaProfessoresCadastrados();

}

break;

case \'AWAITING_PROFESSOR_EDIT_ACTION\': {

clearOptions();

if (message === \'EDITAR_NOME_PROFESSOR_INICIAR\') {

await addBotMessage(\"Qual professor você deseja renomear?\", 0, true);

const profOptions = userData.professores.map((prof, index) =\> ({

text: prof.nome,

value: \`SELECT_PROF_RENAME\_\${index}\`

}));

profOptions.push({ text: \"Cancelar\", value: \"CANCELAR_EDICAO_PROF\"
});

showOptions(profOptions);

conversationState = \'AWAITING_PROF_TO_RENAME_SELECTION\';

} else if (message === \'EDITAR_DISPONIBILIDADE_PROFESSOR_INICIAR\') {

await addBotMessage(\"Qual professor você deseja editar a
disponibilidade?\", 0, true);

const profOptions = userData.professores.map((prof, index) =\> ({

text: prof.nome,

value: \`EDIT_PROF_DISP\_\${index}\`

}));

profOptions.push({ text: \"Cancelar\", value: \"CANCELAR_EDICAO_PROF\"
});

showOptions(profOptions);

conversationState = \'AWAITING_PROFESSOR_TO_EDIT_SELECTION\';

} else if (message === \'VOLTAR_MENU_PROFESSORES\') {

await mostrarTabelaProfessoresCadastrados();

}

break;

}

case \'AWAITING_PROF_TO_RENAME_SELECTION\': {

clearOptions();

if (message === \'CANCELAR_EDICAO_PROF\') {

await addBotMessage(\"Renomeação cancelada.\");

await mostrarTabelaProfessoresCadastrados();

break;

}

const profIndex = parseInt(message.replace(\'SELECT_PROF_RENAME\_\',
\'\'));

if (profIndex \>= 0 && profIndex \< userData.professores.length) {

tempData.profToRenameIndex = profIndex;

const oldName = userData.professores\[profIndex\].nome;

tempData.oldProfName = oldName;

await addBotMessage(\`Digite o novo nome para \<b\>\${oldName}\</b\>:\`,
0, true);

conversationState = \'AWAITING_NEW_PROFESSOR_NAME\';

} else {

await addBotMessage(\"Seleção inválida.\");

await mostrarTabelaProfessoresCadastrados();

}

break;

}

case \'AWAITING_NEW_PROFESSOR_NAME\': {

clearOptions();

const newName = message.trim().toUpperCase();

if (!newName \|\| newName.length \< 2) {

await addBotMessage(\"Nome inválido. Por favor, digite um nome com pelo
menos 2 caracteres.\");

conversationState = \'AWAITING_NEW_PROFESSOR_NAME\';

break;

}

if (userData.professores.some(p =\> p.nome === newName)) {

await addBotMessage(\`Erro: Já existe um professor com o nome
\<b\>\${newName}\</b\>. Por favor, escolha outro nome.\`);

conversationState = \'AWAITING_NEW_PROFESSOR_NAME\';

break;

}

const oldName = tempData.oldProfName;

updateProfessorName(oldName, newName);

await addBotMessage(\`Professor \<b\>\${oldName}\</b\> foi renomeado
para \<b\>\${newName}\</b\> com sucesso em todo o sistema.\`);

tempData = {};

await addBotMessage(\"O que deseja fazer a seguir?\", 0, true);

const postRenameOptions = \[{ text: \"Voltar para a Lista de
Professores\", value: \"VOLTAR_MENU_PROFESSORES\" }\];

if (userData.horarioGerado && (userData.horarioGerado.size \> 0 \|\|
Object.keys(userData.horarioGerado).length \> 0)) {

postRenameOptions.push({ text: \"Ir para a Tela Final\", value:
\"IR_TELA_FINAL\", highlight: \"action\" });

}

showOptions(postRenameOptions);

conversationState = \'POST_RENAME_ACTION\';

break;

}

case \'POST_RENAME_ACTION\': {

clearOptions();

if (message === \'VOLTAR_MENU_PROFESSORES\') {

await mostrarTabelaProfessoresCadastrados();

} else if (message === \'IR_TELA_FINAL\') {

await apresentarMenuPosGeracao();

} else {

await addBotMessage(\"Opção inválida.\");

await mostrarTabelaProfessoresCadastrados();

}

break;

}

case \'AWAITING_PROFESSOR_TO_EDIT_SELECTION\': {

clearOptions();

if (message === \'CANCELAR_EDICAO_PROF\') {

await addBotMessage(\"Edição cancelada.\");

await mostrarTabelaProfessoresCadastrados();

break;

}

if (message.startsWith(\'EDIT_PROF_DISP\_\')) {

const profIndex = parseInt(message.replace(\'EDIT_PROF_DISP\_\', \'\'));

if (profIndex \>= 0 && profIndex \< userData.professores.length) {

currentProfessorConfig = userData.professores\[profIndex\];

await addBotMessage(\`Editando disponibilidade para
\<b\>\${currentProfessorConfig.nome}\</b\>.\`);

await exibirGradeDisponibilidadeParaProfessor(currentProfessorConfig);

conversationState = \'CONFIGURANDO_GRADE_PROFESSOR_EDICAO\';

} else {

await addBotMessage(\"Professor inválido selecionado. Tente
novamente.\");

await mostrarTabelaProfessoresCadastrados();

}

}

break;

}

case \'CONFIGURANDO_GRADE_PROFESSOR_EDICAO\': {

if (message === \'SALVAR_GRADE_PROFESSOR\') {

const profIndex = userData.professores.findIndex(p =\> p.nome ===
currentProfessorConfig.nome);

if (profIndex !== -1) {

let aulasPlanejamentoCalculadas = 0;

for (const dia in currentProfessorConfig.gradeDisponibilidade) {

currentProfessorConfig.gradeDisponibilidade\[dia\].forEach(status =\> {

if (status === \"P\") aulasPlanejamentoCalculadas++;

});

}

currentProfessorConfig.aulasSemanaisPlanejamento =
aulasPlanejamentoCalculadas;

userData.professores\[profIndex\] = currentProfessorConfig;

}

saveCurrentSession();

await addBotMessage(\`Disponibilidade de
\<b\>\${currentProfessorConfig.nome}\</b\> atualizada com sucesso!\`);

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"O que deseja fazer agora?\", 0, true);

showOptions(\[

{ text: \"Tentar Otimizar Novamente\", value:
\"REFAZER_OTIMIZACAO_COMPLETA\", highlight: \"action\" },

{ text: \"Editar Outro Professor\", value: \"EDITAR_PROFESSOR_MENU\" },

{ text: \"Voltar para a Lista de Professores\", value:
\"VOLTAR_MENU_PROFESSORES\" }

\]);

conversationState = \'POST_PROFESSOR_EDIT_ACTION\';

} else {

await addBotMessage(\"Por favor, clique no botão \'Salvar
Disponibilidade\' para continuar.\");

}

break;

}

//
=======================================================================

// NOVA LÓGICA DE FIXAÇÃO DE AULAS (INTERFACE AVANÇADA)

//
=======================================================================

/\*\*

\* Ponto de entrada que chama a construção da nova interface.

\*/

async function iniciarFixacaoDeAulas() {

await addBotMessage(\"Ok. Na tela a seguir, clique primeiro em uma
disciplina, depois em uma ou mais turmas, e por fim, nos horários
desejados para fixar as aulas.\");

exibirInterfaceDeFixacao();

}

/\*\*

\* Cria a interface de 3 colunas para a fixação avançada de aulas.

\*/

/\*\*

\* ✅ FUNÇÃO ATUALIZADA

\* Cria a interface de fixação de aulas com tooltips para mostrar as
turmas.

\*/

function exibirInterfaceDeFixacao() {

clearOptions();

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.remove(\'hidden\');

const turmas = Object.values(userData.horarioFinal);

const disciplinas = \[\...userData.disciplinas\];

// Estrutura principal com 3 colunas

let fullHTML = \`

\<h3 class=\"text-lg font-semibold mb-2\"\>Fixação de Aulas na
Grade\</h3\>

\<div class=\"flex gap-4\" id=\"container-fixacao\"\>

\<div class=\"flex-shrink-0 border rounded-lg p-2 bg-white\"
style=\"width: 200px;\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>1. Selecione a
Disciplina\</h4\>

\<ul id=\"lista-disciplinas-fixar\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1 max-h-96 overflow-y-auto\"\>

\${disciplinas.map(d =\> \`\<li class=\"p-1 rounded
hover:bg-indigo-100\"
data-disciplina=\"\${d}\"\>\${d}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-shrink-0 border rounded-lg p-2 bg-white\"
style=\"width: 150px;\"\>

\<h4 class=\"font-bold text-center border-b pb-1 mb-1\"\>2. Selecione as
Turmas\</h4\>

\<ul id=\"lista-turmas-fixar\" class=\"list-none p-0 text-sm
cursor-pointer space-y-1\"\>

\${turmas.map(t =\> \`\<li class=\"p-1 rounded hover:bg-indigo-100\"
data-turma-key=\"\${t.key}\"\>\${t.displayText}\</li\>\`).join(\'\')}

\</ul\>

\</div\>

\<div class=\"flex-grow\"\>

\<h4 class=\"font-bold text-center mb-1\"\>3. Clique na Grade para
Fixar\</h4\>

\<div class=\"table-container\"\>

\<table class=\"data-table fixed-schedule-grid\"
id=\"grade-horarios-fixar\"\>

\<thead\>

\<tr\>

\<th\>Período\</th\>

\${diasDaSemana.map(dia =\> \`\<th\>\${dia}\</th\>\`).join(\'\')}

\</tr\>

\</thead\>

\<tbody\>\</tbody\>

\</table\>

\</div\>

\</div\>

\</div\>

\<div class=\"mt-6 flex justify-end\"\>

\<button id=\"save-fixed-btn\" class=\"option-button
button-highlight-conclude\"\>Concluir Fixação e Prosseguir\</button\>

\</div\>

\`;

availabilityGridContainer.innerHTML = fullHTML;

// \-\-- Lógica da Interface \-\--

const maxAulasDiarias = Math.max(0, \...turmas.map(t =\>
t.aulasDiarias));

const gradeBody =
document.getElementById(\'grade-horarios-fixar\').querySelector(\'tbody\');

// Preenche a grade de horários

for (let i = 0; i \< maxAulasDiarias; i++) {

const row = gradeBody.insertRow();

row.insertCell().textContent = \`\${i + 1}º Horário\`;

diasDaSemana.forEach(dia =\> {

const cell = row.insertCell();

cell.classList.add(\'slot-fixar\', \'cursor-pointer\',
\'hover:bg-yellow-100\');

cell.dataset.dia = dia;

cell.dataset.periodo = i;

});

}

// Função para atualizar a grade com os dados salvos

function popularGradeExistente() {

const todosSlots = gradeBody.querySelectorAll(\'.slot-fixar\');

todosSlots.forEach(slot =\> {

const dia = slot.dataset.dia;

const periodo = parseInt(slot.dataset.periodo);

const turmasNesteSlot = \[\];

let disciplinaNoSlot = \'\';

turmas.forEach(turma =\> {

const aulaFixa = turma.horariosFixos.find(hf =\> hf.dia === dia &&
hf.periodo === periodo);

if (aulaFixa) {

disciplinaNoSlot = aulaFixa.disciplina;

turmasNesteSlot.push(turma.displayText);

}

});

if (disciplinaNoSlot) {

slot.textContent = disciplinaNoSlot;

slot.title = \`Turmas: \${turmasNesteSlot.join(\', \')}\`;

slot.classList.add(\'fixed-class-cell\');

} else {

slot.textContent = \'\';

slot.title = \'\';

slot.classList.remove(\'fixed-class-cell\');

}

});

}

const containerFixacao = document.getElementById(\'container-fixacao\');

containerFixacao.addEventListener(\'click\', (event) =\> {

const target = event.target;

if (target.closest(\'#lista-disciplinas-fixar\')) {

const li = target.closest(\'li\');

if (li) {

disciplinaSelecionadaParaFixar = li.dataset.disciplina;

containerFixacao.querySelectorAll(\'#lista-disciplinas-fixar
li\').forEach(el =\> el.classList.remove(\'bg-indigo-200\',
\'font-bold\'));

li.classList.add(\'bg-indigo-200\', \'font-bold\');

}

}

else if (target.closest(\'#lista-turmas-fixar\')) {

const li = target.closest(\'li\');

if (li) {

const turmaKey = li.dataset.turmaKey;

if (turmasSelecionadasParaFixar.has(turmaKey)) {

turmasSelecionadasParaFixar.delete(turmaKey);

li.classList.remove(\'bg-blue-200\', \'font-bold\');

} else {

turmasSelecionadasParaFixar.add(turmaKey);

li.classList.add(\'bg-blue-200\', \'font-bold\');

}

}

}

else if (target.classList.contains(\'slot-fixar\')) {

if (!disciplinaSelecionadaParaFixar) {

addBotMessage(\"⚠️ Por favor, selecione primeiro uma disciplina.\", 0);

return;

}

if (turmasSelecionadasParaFixar.size === 0) {

addBotMessage(\"⚠️ Por favor, selecione pelo menos uma turma.\", 0);

return;

}

const dia = target.dataset.dia;

const periodo = parseInt(target.dataset.periodo);

// Verifica se a disciplina clicada já está no slot para QUALQUER das
turmas selecionadas

let jaTemDisciplina = false;

turmasSelecionadasParaFixar.forEach(key =\> {

const turma = userData.horarioFinal\[key\];

if (turma.horariosFixos.some(hf =\> hf.dia === dia && hf.periodo ===
periodo && hf.disciplina === disciplinaSelecionadaParaFixar)) {

jaTemDisciplina = true;

}

});

// Aplica a lógica a todas as turmas selecionadas

turmasSelecionadasParaFixar.forEach(turmaKey =\> {

const turma = userData.horarioFinal\[turmaKey\];

turma.horariosFixos = turma.horariosFixos.filter(hf =\> !(hf.dia === dia
&& hf.periodo === periodo));

if (!jaTemDisciplina) {

turma.horariosFixos.push({ disciplina: disciplinaSelecionadaParaFixar,
dia, periodo });

}

});

popularGradeExistente(); // Redesenha a grade inteira para refletir o
estado atual

}

});

document.getElementById(\'save-fixed-btn\').onclick = () =\>
handleUserInput(\'CONCLUIR_FIXACAO_AULAS\');

popularGradeExistente(); // Popula a grade com os dados já existentes na
primeira carga

conversationState = \'FIXANDO_AULAS_EM_GRADE\';

}

case \'REATRIBUIR_INICIAR_FLUXO\': {

clearOptions();

await addBotMessage(\"Qual disciplina você deseja reatribuir para outro
professor?\", 0, true);

const disciplinasAtribuidas = new Set();

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach(disc =\>
disciplinasAtribuidas.add(disc.nome));

});

const options = Array.from(disciplinasAtribuidas).map(d =\> ({ text: d,
value: d }));

showOptions(options);

conversationState = \'REATRIBUIR_SELECIONAR_DISCIPLINA\';

break;

}

case \'REATRIBUIR_SELECIONAR_DISCIPLINA\': {

clearOptions();

const disciplinaParaReatribuir = message;

const professoresCompativeis = userData.professores.filter(

p =\> p.disciplinasMinistra.includes(disciplinaParaReatribuir)

);

if (professoresCompativeis.length \<= 1) {

await addBotMessage(\`Não há outros professores cadastrados que possam
ministrar \<b\>\${disciplinaParaReatribuir}\</b\>. Cadastre um novo
professor primeiro.\`);

await mostrarTabelaProfessoresCadastrados();

break;

}

await addBotMessage(\`Atualmente, todas as turmas de
\<b\>\${disciplinaParaReatribuir}\</b\> estão com um professor. Para
qual professor você deseja mover \*algumas\* turmas de
\${disciplinaParaReatribuir}?\`, 0, true);

const options = professoresCompativeis.map(p =\> ({ text: p.nome, value:
p.nome }));

showOptions(options);

tempData.disciplinaParaReatribuir = disciplinaParaReatribuir;

conversationState = \'REATRIBUIR_SELECIONAR_NOVO_PROFESSOR\';

break;

}

case \'REATRIBUIR_SELECIONAR_NOVO_PROFESSOR\': {

clearOptions();

const novoProfessor = message;

const disciplina = tempData.disciplinaParaReatribuir;

const turmasComDisciplina = Object.values(userData.horarioFinal).filter(

t =\> t.disciplinas.some(d =\> d.nome === disciplina)

);

await addBotMessage(\`Quais turmas de \<b\>\${disciplina}\</b\> devem
ser atribuídas ao professor(a) \<b\>\${novoProfessor}\</b\>?\`, 0,
true);

const options = turmasComDisciplina.map(t =\> ({ text: t.displayText,
value: t.key }));

showOptions(options, true);

tempData.novoProfessorParaReatribuir = novoProfessor;

conversationState = \'REATRIBUIR_CONFIRMAR_TURMAS\';

break;

}

case \'POST_PROFESSOR_EDIT_ACTION\': {

clearOptions();

if (message === \'REFAZER_OTIMIZACAO_COMPLETA\') {

await iniciarGeracaoComAlgoritmoGenetico(false);

} else if (message === \'EDITAR_PROFESSOR_MENU\') {

await addBotMessage(\"Certo. O que mais deseja editar?\");

showOptions(\[

{text: \"Editar Nome de um Professor\", value:
\"EDITAR_NOME_PROFESSOR_INICIAR\"},

{text: \"Editar Disponibilidade de um Professor\", value:
\"EDITAR_DISPONIBILIDADE_PROFESSOR_INICIAR\"},

{text: \"Voltar\", value: \"VOLTAR_MENU_PROFESSORES\"}

\]);

conversationState = \'AWAITING_PROFESSOR_EDIT_ACTION\';

} else if (message === \'VOLTAR_MENU_PROFESSORES\') {

await addBotMessage(\"Ok, retornando ao menu de professores.\");

await mostrarTabelaProfessoresCadastrados();

} else if (message === \'PROSSEGUIR_GERACAO_APOS_EDICAO\') {

await addBotMessage(\"Ok. Com as novas disponibilidades, vamos para a
tela de geração.\");

await validarCargaHorariaProfessores();

}

break;

}

case \'RELACIONAMENTO_SELECIONAR_PROFESSOR\': {

clearOptions();

const nomeProfessorSelecionado = message;

let turmaKey, discIndex, disciplinaNome;

if (previousConversationState === \'EDITING_REL\') {

turmaKey = currentTurmaConfig.key;

discIndex =
currentDisciplinaParaConfigurar.disciplinaIndexParaRelacionamento;

} else {

turmaKey = currentDisciplinaParaConfigurar.turmaKeyParaRelacionamento;

discIndex =
currentDisciplinaParaConfigurar.disciplinaIndexParaRelacionamento;

}

if (nomeProfessorSelecionado === \'PULAR_DISCIPLINA_REL\') {

await addBotMessage(\"Ok, a disciplina ficará sem professor por
enquanto.\");

userData.horarioFinal\[turmaKey\].disciplinas\[discIndex\].professorNome
= null;

} else {

if (userData.horarioFinal\[turmaKey\] &&
userData.horarioFinal\[turmaKey\].disciplinas\[discIndex\]) {

userData.horarioFinal\[turmaKey\].disciplinas\[discIndex\].professorNome
= nomeProfessorSelecionado;

disciplinaNome =
userData.horarioFinal\[turmaKey\].disciplinas\[discIndex\].nome;

await addBotMessage(\`Professor \<b\>\${nomeProfessorSelecionado}\</b\>
atribuído à disciplina de \<b\>\${disciplinaNome}\</b\>.\`);

} else {

await addBotMessage(\"Ocorreu um erro ao atribuir o professor.\");

}

}

saveCurrentSession(); // Garante que a atribuição seja salva

if (previousConversationState === \'EDITING_REL\') {

previousConversationState = null;

await mostrarTabelaRelacionamentosFeitos();

} else {

currentDisciplinaRelacionamentoIndex++;

await proximaDisciplinaParaRelacionar();

}

break;

}

case \'REATRIBUIR_SELECIONAR_PROFESSOR_SOBRECARREGADO\': {

clearOptions();

if (message === \"CORRIGIR_DISPONIBILIDADE_GERAL\") {

await addBotMessage(\"Ok, vamos para a tela de edição de
disponibilidade.\");

await mostrarTabelaProfessoresCadastrados();

break;

}

const profSelecionado = message;

tempData.professorParaReatribuir = profSelecionado;

let turmasDoProfessor = \[\];

Object.values(userData.horarioFinal).forEach(turma =\> {

turma.disciplinas.forEach(disc =\> {

if (disc.professorNome === profSelecionado) {

turmasDoProfessor.push({

text: \`\${turma.displayText} - \${disc.nome}\`,

value: \`\${turma.key}\|\${disc.nome}\`

});

}

});

});

await addBotMessage(\`Selecione as aulas de
\<b\>\${profSelecionado}\</b\> que você deseja mover para outro
professor:\`, 0, true);

showOptions(turmasDoProfessor, true);

conversationState = \'REATRIBUIR_SELECIONAR_AULAS_PARA_MOVER\';

break;

}

case \'REATRIBUIR_SELECIONAR_AULAS_PARA_MOVER\': {

clearOptions();

const aulasParaMover = Array.isArray(message) ? message : \[message\];

if (!aulasParaMover\[0\]) {

await addBotMessage(\"Nenhuma aula selecionada. Voltando\...\");

await validarCargaHorariaProfessores();

break;

}

tempData.aulasParaMover = aulasParaMover;

const disciplinaExemplo = aulasParaMover\[0\].split(\'\|\')\[1\];

const professoresCompativeis = userData.professores.filter(

p =\> p.disciplinasMinistra.includes(disciplinaExemplo) && p.nome !==
tempData.professorParaReatribuir

);

await addBotMessage(\`Para qual professor você deseja mover estas
aulas?\`, 0, true);

const options = professoresCompativeis.map(p =\> ({ text: p.nome, value:
p.nome }));

options.push({ text: \"Cadastrar Novo Professor\", value:
\"CADASTRAR_NOVO_PARA_REATRIBUIR\" });

showOptions(options);

conversationState = \'REATRIBUIR_FINALIZAR_TROCA\';

break;

}

case \'REATRIBUIR_FINALIZAR_TROCA\': {

clearOptions();

if(message === \"CADASTRAR_NOVO_PARA_REATRIBUIR\") {

await addBotMessage(\"Ok, vamos cadastrar um novo professor. Depois,
você precisará reiniciar a validação.\");

currentProfessorConfig = { nome: null, disciplinasMinistra: \[\],
aulasSemanaisSala: 0, aulasSemanaisPlanejamento: 0,
gradeDisponibilidade: {} };

await addBotMessage(\"Qual o nome do novo professor(a)?\", 500, true);

conversationState = \'CADASTRO_PROFESSOR_NOME\';

break;

}

const novoProfessor = message;

tempData.aulasParaMover.forEach(item =\> {

const \[turmaKey, discNome\] = item.split(\'\|\');

const turma = userData.horarioFinal\[turmaKey\];

if (turma) {

const disc = turma.disciplinas.find(d =\> d.nome === discNome);

if (disc) {

disc.professorNome = novoProfessor;

}

}

});

saveCurrentSession();

await addBotMessage(\`Aulas reatribuídas para
\<b\>\${novoProfessor}\</b\> com sucesso!\`);

await addBotMessage(\"Verificando novamente a carga horária de todos os
professores\...\", 500);

await validarCargaHorariaProfessores();

break;

}

case \'CONFERIR_RELACIONAMENTOS_FEITOS_ACAO\':

clearOptions();

if (message === \'PROSSEGUIR_VALIDACAO_TABELA\') {

await addBotMessage(\"Ok, vamos validar os dados antes de prosseguir
para a tela de geração.\");

await validarCargaHorariaProfessores();

} else if (message === \'CORRIGIR_RELACIONAMENTO_TABELA\') {

await addBotMessage(\"Qual turma você deseja editar o relacionamento de
disciplinas?\", 0, true);

const turmaOptions = Object.values(userData.horarioFinal).map(turma =\>
({

text: turma.displayText,

value: \`EDIT_REL_TURMA\_\${turma.key}\`

}));

turmaOptions.push({ text: \"Voltar\", value: \"CANCELAR_EDICAO_REL\" });

showOptions(turmaOptions);

conversationState = \'AWAITING_REL_EDIT_TURMA_SELECTION\';

} else {

await addBotMessage(\"Opção inválida. Por favor, escolha uma das opções
abaixo.\");

await mostrarTabelaRelacionamentosFeitos();

}

break;

case \'REATRIBUIR_CONFIRMAR_TURMAS\': {

clearOptions();

const turmasSelecionadasKeys = Array.isArray(message) ? message :
\[message\];

const novoProfessor = tempData.novoProfessorParaReatribuir;

const disciplina = tempData.disciplinaParaReatribuir;

if (turmasSelecionadasKeys.length \> 0 && turmasSelecionadasKeys\[0\]) {

turmasSelecionadasKeys.forEach(turmaKey =\> {

const turma = userData.horarioFinal\[turmaKey\];

if (turma) {

const discIndex = turma.disciplinas.findIndex(d =\> d.nome ===
disciplina);

if (discIndex !== -1) {

turma.disciplinas\[discIndex\].professorNome = novoProfessor;

}

}

});

saveCurrentSession();

await addBotMessage(\`Turmas de \<b\>\${disciplina}\</b\> atribuídas
para \<b\>\${novoProfessor}\</b\> com sucesso!\`);

} else {

await addBotMessage(\"Nenhuma turma selecionada.\");

}

await addBotMessage(\"Verifique a nova atribuição na tabela abaixo.\");

await mostrarTabelaRelacionamentosFeitos();

break;

}

case \'AWAITING_REL_EDIT_TURMA_SELECTION\': {

clearOptions();

if (message === \'CANCELAR_EDICAO_REL\') {

await mostrarTabelaRelacionamentosFeitos();

break;

}

const turmaKey = message.replace(\'EDIT_REL_TURMA\_\', \'\');

currentTurmaConfig = userData.horarioFinal\[turmaKey\];

if (currentTurmaConfig && currentTurmaConfig.disciplinas.length \> 0) {

await addBotMessage(\`Qual disciplina da turma
\<b\>\${currentTurmaConfig.displayText}\</b\> você deseja alterar o
professor?\`, 0, true);

const discOptions = currentTurmaConfig.disciplinas.map((disc, index) =\>
({

text: \`\${disc.nome} (Atual: \${disc.professorNome \|\| \'Nenhum\'})\`,

value: \`EDIT_REL_DISC\_\${index}\`

}));

discOptions.push({ text: \"Voltar\", value: \"CANCELAR_EDICAO_REL\" });

showOptions(discOptions);

conversationState = \'AWAITING_REL_EDIT_DISC_SELECTION\';

} else {

await addBotMessage(\"Esta turma não possui disciplinas para editar.
Voltando\...\");

await mostrarTabelaRelacionamentosFeitos();

}

break;

}

case \'AWAITING_REATRIBUICAO_CONFIRMATION\': {

clearOptions();

const selects = document.querySelectorAll(\'.reatribuir-select\');

let precisaCadastrarNovo = false;

selects.forEach(select =\> {

const novoProfessor = select.value;

const turmaKey = select.dataset.turmaKey;

const discIndex = parseInt(select.dataset.discIndex);

if (novoProfessor === \"NOVO_PROFESSOR\") {

precisaCadastrarNovo = true;

} else {

userData.horarioFinal\[turmaKey\].disciplinas\[discIndex\].professorNome
= novoProfessor;

}

});

saveCurrentSession();

availabilityGridContainer.classList.add(\'hidden\');

await addBotMessage(\"Reatribuições salvas!\");

if (precisaCadastrarNovo) {

await addBotMessage(\"Vamos cadastrar o novo professor que você
precisa.\");

currentProfessorConfig = { nome: null, disciplinasMinistra: \[\],
aulasSemanaisSala: 0, aulasSemanaisPlanejamento: 0,
gradeDisponibilidade: {} };

await addBotMessage(\"Qual o nome do novo professor(a)?\", 500, true);

conversationState = \'CADASTRO_PROFESSOR_NOME\';

} else {

await addBotMessage(\"Verificando novamente a carga horária de todos os
professores\...\", 500);

await validarCargaHorariaProfessores();

}

break;

}

case \'AWAITING_REL_EDIT_DISC_SELECTION\': {

clearOptions();

if (message === \'CANCELAR_EDICAO_REL\') {

await mostrarTabelaRelacionamentosFeitos();

break;

}

const discIndex = parseInt(message.replace(\'EDIT_REL_DISC\_\', \'\'));

const disciplinaSelecionada =
currentTurmaConfig.disciplinas\[discIndex\];

if (!disciplinaSelecionada) {

await addBotMessage(\"Erro: Não foi possível encontrar a disciplina
selecionada.\");

await mostrarTabelaRelacionamentosFeitos();

break;

}

const professoresCompativeis = userData.professores.filter(prof =\>

prof.disciplinasMinistra.includes(disciplinaSelecionada.nome)

);

if (professoresCompativeis.length \> 0) {

await addBotMessage(\`Selecione o novo professor para
\<b\>\${disciplinaSelecionada.nome}\</b\> na turma
\<b\>\${currentTurmaConfig.displayText}\</b\>:\`, 0, true);

const profOptions = professoresCompativeis.map(p =\> ({ text: p.nome,
value: p.nome }));

profOptions.push({text: \"Deixar sem professor\", value:
\"PULAR_DISCIPLINA_REL\"});

currentDisciplinaParaConfigurar.disciplinaIndexParaRelacionamento =
discIndex;

showOptions(profOptions);

previousConversationState = \'EDITING_REL\';

conversationState = \'RELACIONAMENTO_SELECIONAR_PROFESSOR\';

} else {

await addBotMessage(\`Nenhum professor cadastrado é compatível com a
disciplina de \${disciplinaSelecionada.nome}.\`);

await mostrarTabelaRelacionamentosFeitos();

}

break;

}

case \'AWAITING_POST_GENERATION_ACTION\': {

if (message !== \'VISUALIZAR_HORARIO_GERADO\' && message !==
\'VIEW_SAVED_VERSIONS\') {

clearOptions();

}

if (message === \'VISUALIZAR_HORARIO_GERADO\') {

await addBotMessage(\"Reabrindo a visualização do horário\...\", 100);

await mostrarHorarioGerado();

} else if (message === \'REGERAR_HORARIO_OTIMIZADO\') {

await addBotMessage(\"Ok! Gerando uma nova versão otimizada do horário.
Isso pode levar um momento\...\", 200);

await iniciarGeracaoComAlgoritmoGenetico(false); // false indica que não
é a primeira geração

} else if (message === \'VIEW_SAVED_VERSIONS\') {

await mostrarVersoesSalvas();

} else if (message === \'EXPORTAR_PDF\') {

await exportarHorarioParaPDFGeral();

await apresentarMenuPosGeracao();

} else if (message === \'EXPORTAR_JSON\') {

await exportarDadosParaJSON();

await apresentarMenuPosGeracao();

} else if (message === \'SALVAR_E_ENCERRAR\') {

if (saveCurrentSession()) {

await addBotMessage(\"Sessão salva com sucesso! Você pode fechar a
página e continuar depois.\");

} else {

await addBotMessage(\"Ocorreu um erro ao tentar salvar a sessão.\");

}

conversationState = \'END\';

} else if (message === \'REFAZER_TUDO\') {

await addBotMessage(\"Ok, vamos começar um novo horário do zero.\");

resetarDadosParaNovoHorario();

localStorage.removeItem(SESSION_STORAGE_KEY);

await handleUserInput();

}

break;

}

case \'MANAGING_SAVED_VERSIONS\': {

if (message.startsWith(\'LOAD_SAVED_VERSION\_\')) {

const versionId = message.replace(\'LOAD_SAVED_VERSION\_\', \'\');

const versionToLoad = horarioHistory.find(v =\> v.id === versionId);

if (versionToLoad) {

userData.horarioGerado = versionToLoad.horario;

await addBotMessage(\`Versão \"\<b\>\${versionToLoad.descricao}\</b\>\"
carregada.\`);

await mostrarHorarioGerado();

await apresentarMenuPosGeracao();

} else {

await addBotMessage(\"Erro: Versão não encontrada.\");

await apresentarMenuPosGeracao();

}

} else if (message.startsWith(\'DELETE_SAVED_VERSION\_\')) {

const versionIdToDelete = message.replace(\'DELETE_SAVED_VERSION\_\',
\'\');

horarioHistory = horarioHistory.filter(v =\> v.id !==
versionIdToDelete);

await addBotMessage(\"Versão excluída.\");

await mostrarVersoesSalvas();

} else if (message === \'RETURN_TO_POST_GEN_MENU\') {

await apresentarMenuPosGeracao();

}

break;

}

case \'AWAITING_FINAL_CONFIG_CONFIRMATION\': {

if (message === \"CONFIRMAR_CONFIGS_GERAR\") {

// 1. Limpa e lê os parâmetros de processamento selecionados na tela

userData.parametrosProcessamento = {};

listaParametrosProcessamento.forEach(param =\> {

const checkbox = document.getElementById(\`param-\${param.id}\`);

if (checkbox && checkbox.checked) {

userData.parametrosProcessamento\[param.id\] = { habilitado: true,
valor: null };

if (param.precisaValor) {

const valorInput = document.getElementById(\`valor-\${param.id}\`);

if (valorInput && valorInput.value) {

const valor = parseInt(valorInput.value, 10);

// Salva como número se for um número válido, senão salva como texto

userData.parametrosProcessamento\[param.id\].valor = !isNaN(valor) ?
valor : valorInput.value;

}

}

} else {

userData.parametrosProcessamento\[param.id\] = { habilitado: false,
valor: null };

}

});

// 2. Limpa a interface do usuário

availabilityGridContainer.innerHTML = \'\';

availabilityGridContainer.classList.add(\'hidden\');

// 3. ✅ Passo CRÍTICO: Adapta a grade de indisponibilidade geral para o
formato que o algoritmo entende

adaptarGradeGeralParaProfessores();

// 4. Inicia a geração do horário

await iniciarGeracaoComAlgoritmoGenetico(true); // true = é a primeira
geração

}

break;

}

// Você pode adicionar um \'default\' como boa prática

default:

if (message && message !== \'retomar\') {

// console.log(\"Estado não reconhecido ou sem ação: \",
conversationState);

}

break;

} // \<\<\<\< 🎯 1. ADICIONE A CHAVE DE FECHAMENTO DO \`switch\` AQUI

} // \<\<\<\< 🎯 2. ADICIONE A CHAVE DE FECHAMENTO DA FUNÇÃO
\`handleUserInput\` AQUI

async function exibirTelaGestaoModelos() {

const models = getModels();

const modelNames = Object.keys(models);

let html = \'\<p\>Selecione um modelo para carregar ou excluir.\</p\>\';

if (modelNames.length \> 0) {

html += \'\<ul class=\"list-none mt-4 space-y-2\"\>\';

modelNames.forEach(name =\> {

html += \`

\<li class=\"flex items-center justify-between p-2 bg-gray-100
rounded-lg\"\>

\<span\>\${name}\</span\>

\<div class=\"flex gap-2\"\>

\<button onclick=\"handleUserInput(\'LOAD_MODEL\_\${name}\')\"
class=\"text-sm bg-blue-500 text-white px-3 py-1 rounded
hover:bg-blue-600\"\>Carregar\</button\>

\<button onclick=\"handleUserInput(\'DELETE_MODEL\_\${name}\')\"
class=\"text-sm bg-red-500 text-white px-3 py-1 rounded
hover:bg-red-600\"\>Excluir\</button\>

\</div\>

\</li\>

\`;

});

html += \'\</ul\>\';

} else {

html += \'\<p class=\"mt-4 text-gray-500\"\>Nenhum modelo salvo
ainda.\</p\>\';

}

modelModalBody.innerHTML = html;

modelModal.style.display = \'block\';

conversationState = \'MANAGING_MODELS\';

}

let sidebarCloseTimer;

function openSidebar() {

sidebar.classList.add(\'active\');

sidebarOverlay.classList.add(\'active\');

}

function closeSidebar() {

sidebar.classList.remove(\'active\');

sidebarOverlay.classList.remove(\'active\');

}

openSidebarButton.addEventListener(\'click\', openSidebar);

// ✅ REMOVIDO: Listener para \'closeSidebarButton\' que não existe
mais.

sidebarOverlay.addEventListener(\'click\', closeSidebar);

sidebar.addEventListener(\'mouseleave\', () =\> {

sidebarCloseTimer = setTimeout(() =\> {

closeSidebar();

}, 300); // 300ms de espera para não fechar acidentalmente

});

// NOVO: Cancela o fechamento se o mouse voltar para o menu

sidebar.addEventListener(\'mouseenter\', () =\> {

clearTimeout(sidebarCloseTimer);

});

sidebarLinks.forEach(link =\> {

link.addEventListener(\'click\', (e) =\> {

e.preventDefault();

const action = e.currentTarget.dataset.action;

closeSidebar();

// A mensagem e o handleUserInput já estão na função
\'handleUserInput\',

// então não precisa duplicar aqui para evitar mensagens repetidas.

if (action) {

handleUserInput(action);

}

});

});

// \-\-- Listeners Principais \-\--

sendButton.addEventListener(\'click\', () =\> {

const message = userInput.value;

if (!message.trim()) return;

addUserMessage(message);

handleUserInput(message);

});

userInput.addEventListener(\'keypress\', (e) =\> {

if (e.key === \'Enter\' && !userInput.disabled) {

const message = userInput.value;

if (!message.trim()) return;

addUserMessage(message);

handleUserInput(message);

}

});

// \-\-- Listeners dos Modais \-\--

closeHorarioModalBtn.onclick = function() {

if(isSwapModeActive) toggleSwapMode(); // Desativa o modo de troca ao
fechar

horarioModal.style.display = \"none\";

};

closeModelModalBtn.onclick = fecharModelModalButton.onclick = async
function() {

modelModal.style.display = \"none\";

await addBotMessage(\"Retornando ao menu principal.\");

await handleUserInput(\"START\"); // Reinicia o fluxo

};

cancelSwapButton.onclick = () =\> {

swapWarningModal.style.display = \'none\';

if (firstSwapSelection) {

firstSwapSelection.cellElement.classList.remove(\'cell-selected\');

}

firstSwapSelection = null;

secondSwapSelection = null;

horarioModalBody.querySelectorAll(\'td\').forEach(c =\>
c.classList.remove(\'swap-safe\', \'swap-warning\',
\'swap-impossible\'));

swapStatusMessage.textContent = \'Troca cancelada. Selecione a primeira
aula.\';

};

confirmSwapButton.onclick = () =\> {

swapWarningModal.style.display = \'none\';

executeSwap(firstSwapSelection, secondSwapSelection);

secondSwapSelection = null;

};

// SUBSTITUA TODO O BLOCO \'DOMContentLoaded\' POR ESTE CÓDIGO

document.addEventListener(\'DOMContentLoaded\', function() {

// Inicializa o Chatbot na primeira carga da página

handleUserInput();

// Adicione este bloco dentro do seu \'DOMContentLoaded\'

const confirmDeleteBtn =
document.getElementById(\'confirm-delete-btn\');

const cancelDeleteBtn = document.getElementById(\'cancel-delete-btn\');

const deleteModal = document.getElementById(\'deleteConfirmModal\');

// Dentro do \'DOMContentLoaded\', substitua o listener do
\'confirm-delete-btn\'

if(confirmDeleteBtn) {

confirmDeleteBtn.onclick = () =\> {

if (elementosParaExcluir.itens && elementosParaExcluir.itens.length \>
0) {

elementosParaExcluir.itens.forEach(el =\> el.remove());

}

deleteModal.style.display = \'none\';

// Executa a função de callback, se ela existir

if (elementosParaExcluir.aposExcluir) {

elementosParaExcluir.aposExcluir();

}

elementosParaExcluir = {};

};

}

if(cancelDeleteBtn) {

cancelDeleteBtn.onclick = () =\> {

deleteModal.style.display = \'none\';

elementosParaExcluir = \[\];

};

}

// \-\-- Listener do botão de Logout (no menu lateral) \-\--

const logoutButton = document.getElementById(\'logout-btn\');

if (logoutButton) {

logoutButton.addEventListener(\'click\', async (event) =\> {

event.preventDefault();

await addUserMessage(\"Sair do Sistema\");

await addBotMessage(\"Saindo e limpando a sessão. Até logo!\");

localStorage.removeItem(SESSION_STORAGE_KEY);

setTimeout(() =\> location.reload(), 1000);

});

}

// \-\-- Listener para o botão Home no header (LÓGICA CORRIGIDA) \-\--

const homeButton = document.getElementById(\'home-button\');

if (homeButton) {

homeButton.addEventListener(\'click\', () =\> {

// Apenas chama a nova função para redesenhar a tela inicial.

// Isso não apaga os dados, apenas volta para o menu.

exibirTelaDeBoasVindas();

});

}

// \-\-- Listener para o botão de Perfil do Usuário \-\--

const userProfileButton =
document.getElementById(\'user-profile-button\');

if (userProfileButton) {

userProfileButton.addEventListener(\'click\', async () =\> {

await addUserMessage(\"Perfil do Usuário\");

await addBotMessage(\"A funcionalidade de perfil do usuário estará
disponível em futuras versões. 😉\");

});

}

});

\</script\>

\</body\>

\</html\>
