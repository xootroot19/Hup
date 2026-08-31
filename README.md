# Carteira Demo (Expo + React Native)

Projeto demonstrativo e fictício inspirado em interfaces de carteira digital. Ele mostra sempre a indicação **SIMULAÇÃO • SEM VALOR REAL**, para não ser confundido com um aplicativo financeiro real.

## Recursos
- Tela inicial responsiva e interativa.
- Saldo ocultável.
- Atalhos animados.
- Modal de cartões fictícios.
- Menu de configuração acessível tocando 5 vezes no selo `SIMULAÇÃO`.
- Nome e saldo de demonstração persistidos no aparelho com AsyncStorage.
- Splash screen nativa.
- Build Android `release` via GitHub Actions.

## Desenvolvimento
```bash
npm ci
npx expo prebuild --platform android --non-interactive --clean
```

## APK no GitHub
Envie o projeto a um repositório do GitHub e abra a aba **Actions**. O workflow `Android Release APK` instala Node/Java, executa o prebuild, compila a variante `release`, assina o APK e publica o artefato `app-release-apk`.

> A chave de assinatura é criada durante o workflow. Isso é suficiente para APK instalável, mas builds de execuções diferentes terão chaves diferentes. Para publicar atualizações na Play Store, use uma chave de produção persistente guardada em GitHub Secrets.

## Personalização
Altere `android.package` em `app.json` antes de publicar. Não use package/nome/logotipo de banco real.
