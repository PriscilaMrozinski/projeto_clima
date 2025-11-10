# Projeto Clima

## Descrição
Aplicação web que fornece a previsão do tempo em tempo real para qualquer cidade, utilizando APIs externas.

## Funcionalidades
- Consulta de clima por cidade
- Exibição de temperatura, descrição do clima, data e hora
- Tema diurno/noturno automático
- Tratamento de erros de cidade não encontrada ou falha de conexão

## Tecnologias
- HTML, CSS, JavaScript
- API Open-Meteo (geocoding e previsão do tempo)

## Como usar
1. Abrir `index.html` no navegador
2. Digitar o nome da cidade e clicar em "Buscar"
3. Visualizar a previsão exibida na página

## Estrutura do projeto
- `index.html` → Interface principal
- `assets/css/style.css` → Estilos
- `assets/js/api.js` → Código JavaScript e integração com APIs

## Testes
- Jest para testar funções do `api.js`
- Cobertura de funções principais: `buscarCoordenadas`, `buscarClima`, `obterDescricaoClima`, `buscarPrevisaoCompleta`

## Licença
MIT
