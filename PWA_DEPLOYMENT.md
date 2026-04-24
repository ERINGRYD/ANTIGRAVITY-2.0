# Guia de Deployment PWA (Progressive Web App)

Este documento descreve a arquitetura, configuração e os passos necessários para o deployment do aplicativo como um Progressive Web App (PWA) completo.

## 1. Arquitetura PWA Implementada

O projeto foi configurado utilizando o `vite-plugin-pwa`, que gera automaticamente o `manifest.json` e o Service Worker baseado no Workbox.

### Funcionalidades Incluídas:
- **Manifesto Web (`manifest.json`)**: Configurado com nome, cores de tema (`#3B82F6`), cor de fundo (`#0f172a`), modo de exibição `standalone` (experiência nativa) e orientação `portrait`.
- **Ícones**: Ícones SVG mascaráveis (`192x192` e `512x512`) para garantir compatibilidade com diferentes dispositivos e telas iniciais.
- **Service Worker & Caching**:
  - Estratégia `CacheFirst` para Google Fonts (fontes e estilos), com expiração de 1 ano.
  - Cache automático de assets estáticos (JS, CSS, HTML, imagens) gerados no build.
  - Suporte offline completo para a interface do usuário.
- **Instalação Nativa**: Hook customizado (`usePWAInstall`) e componente (`PWAInstallPrompt`) que interceptam o evento `beforeinstallprompt` para exibir um prompt de instalação personalizado.
- **Navegação Nativa & UX**:
  - Implementação de um **botão de voltar** (`arrow_back`) no Header para sub-views, simulando a navegação de apps nativos.
  - Lógica de **reset de estado** ao trocar de abas no BottomNav, garantindo que cada seção do app comece em um estado limpo.
- **Notificações Push**: Utilitário (`pushNotifications.ts`) e interface nas Configurações para solicitar permissão de notificações push e preparar a inscrição do usuário via VAPID keys.

## 2. Requisitos de Deployment

Para que o PWA funcione corretamente e seja instalável nos dispositivos dos usuários, os seguintes requisitos são **obrigatórios**:

### 2.1. HTTPS Obrigatório
Service Workers e a API de Notificações Push exigem um contexto seguro. O aplicativo **deve** ser servido via HTTPS.
- Se estiver utilizando Vercel, Netlify, Firebase Hosting ou Cloud Run, o HTTPS é providenciado automaticamente.
- Se estiver configurando um servidor próprio (ex: Nginx), você deve instalar um certificado SSL (ex: Let's Encrypt).

### 2.2. Redirecionamento HTTP para HTTPS
Certifique-se de que todo o tráfego HTTP seja redirecionado para HTTPS para garantir que o Service Worker seja registrado com sucesso.

## 3. Testes e Validação

### 3.1. Teste de Funcionalidade Offline
1. Faça o build e sirva o projeto localmente (`npm run build && npm run preview`).
2. Abra o Chrome DevTools > Aba **Application** > **Service Workers**.
3. Marque a opção **Offline**.
4. Recarregue a página. O aplicativo deve carregar normalmente usando o cache do Service Worker.

### 3.2. Teste de Performance (Lighthouse)
1. Abra o Chrome DevTools na aba **Lighthouse**.
2. Selecione a categoria **PWA** e **Performance** (dispositivo Mobile).
3. Clique em "Analyze page load".
4. O score deve ser superior a 90. O manifesto, o service worker e o HTTPS são os principais critérios avaliados.

### 3.3. Teste de Instalação
1. Acesse o aplicativo via Chrome no Android ou Safari no iOS.
2. No Android, o prompt de instalação personalizado deve aparecer na parte inferior da tela.
3. No iOS, o usuário deve usar a opção "Compartilhar > Adicionar à Tela de Início". O ícone e o nome configurados no manifesto serão aplicados.

## 4. Configuração Futura: Web Push Notifications
A base para notificações push está implementada no cliente. Para enviar notificações reais do servidor:
1. Gere um par de chaves VAPID (`npx web-push generate-vapid-keys`).
2. Substitua `'YOUR_PUBLIC_VAPID_KEY_HERE'` no arquivo `SettingsView.tsx` pela sua chave pública.
3. Implemente um endpoint no seu backend para receber e armazenar o objeto `PushSubscription`.
4. Use a biblioteca `web-push` no backend para disparar notificações para as assinaturas armazenadas.

## 5. Comandos de Build
Para gerar a versão de produção com o PWA configurado:
```bash
npm run build
```
Os arquivos do Service Worker (`sw.js` e `workbox-*.js`) e o `manifest.webmanifest` serão gerados na pasta `dist`.
