# Jogo dos Países

Este projeto consiste em uma aplicação multiplataforma para adivinhação de países baseada em suas bandeiras. A solução engloba um servidor backend, uma interface web com suporte a PWA e um aplicativo móvel nativo desenvolvido com Expo.

## Estrutura do Projeto

O repositório está organizado da seguinte forma:

1. Backend: Localizado na pasta backend, gerencia a persistência de dados e autenticação.
2. Web PWA: Localizado na raiz do projeto, utiliza HTML, CSS e JavaScript puro.
3. Mobile Expo: Localizado na pasta CountryGameApp, desenvolvido em React Native.

## Backend

O servidor foi construído utilizando Node.js e atua como o núcleo lógico da aplicação. Suas principais responsabilidades são:

1. Autenticação: Gerenciamento de contas de usuários e emissão de tokens JWT.
2. CRUD de Personagens: Interface para criação, leitura, atualização e exclusão de personagens personalizados.
3. Gestão de Progresso: Armazenamento de pontuação e níveis vinculados a cada personagem.
4. Integração com API de Países: Embora o front-end consuma os dados geográficos, o backend valida as interações e persiste os resultados das partidas.

A API pública principal consumida pela aplicação é a Rest Countries, que fornece informações detalhadas sobre bandeiras, capitais, regiões e traduções de nomes de países.

## Frontend Web (PWA)

A versão original da aplicação foi desenvolvida com foco em acessibilidade e portabilidade, utilizando tecnologias web padrão.

1. Tecnologias: HTML5, CSS3 e Vanilla JavaScript.
2. Progressive Web App: O projeto inclui um Service Worker (sw.js) e um arquivo de manifesto (manifest.json), permitindo que a aplicação seja instalada no navegador e funcione parcialmente offline.
3. Localização: Utiliza a API de geolocalização do navegador para identificar a localização aproximada do jogador.
4. Dinâmica do Jogo: Carrega os dados dos países dinamicamente e gera rodadas de perguntas baseadas em bandeiras.

## Frontend Mobile (React Native Expo)

O aplicativo móvel foi criado para oferecer uma experiência nativa e fluida para usuários de Android e iOS.

1. Tecnologias: React Native, Expo SDK, Lucide Icons e Reanimated.
2. Design Moderno: Interface estilizada com Dark Mode, gradientes lineares e elementos de glassmorphism para garantir um aspecto premium.
3. Context API: Utilizada para gerenciar o estado global de autenticação e o personagem selecionado.
4. Funcionalidades Nativas: Integração com o sistema de localização do dispositivo via Expo Location e persistência de dados local com AsyncStorage.

## Como Executar o Projeto

### Executando o Frontend Web

1. Abra o arquivo index.html em qualquer navegador moderno.
2. Caso deseje testar as funcionalidades de PWA, recomenda-se utilizar um servidor local como o Live Server do VS Code.

### Executando o Aplicativo Mobile

1. Certifique-se de ter o Node.js instalado.
2. Navegue até a pasta do aplicativo:
   cd CountryGameApp
3. Instale as dependências:
   npm install
4. Inicie o servidor do Expo:
   npx expo start
5. Utilize o aplicativo Expo Go no seu smartphone para escanear o código QR gerado no terminal.

### Executando o Backend

1. Navegue até a pasta backend:
   cd backend
2. Instale as dependências:
   npm install
3. Inicie o servidor:
   npm start

Nota: O backend padrão está configurado para apontar para uma instância em produção no Render, mas pode ser configurado para execução local alterando as variáveis de ambiente.
