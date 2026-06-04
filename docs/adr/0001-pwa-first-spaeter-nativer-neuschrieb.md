# PWA zuerst, native iOS-App später als Neuschrieb

Die App wird auf **Windows 10** entwickelt; eine native iOS-App (Swift/SwiftUI) lässt sich nur auf einem Mac mit Xcode bauen. Langfristiges Ziel ist eine App-Store-App. Daher: **Phase 1 = PWA** (Web-App, vollständig auf Windows baubar, per Safari „Zum Home-Bildschirm", offline-fähig), **Phase 2 = von Grund auf neu geschriebene native Swift-App**.

## Considered Options

- **PWA + späterer Capacitor-Wrapper** (gleiche Codebasis weiterverwenden) — verworfen: bewusst native Qualität über Code-Wiederverwendung gestellt.
- **Sofort cross-platform** (Flutter / Expo, ein Code für Web + iOS) — verworfen: schwächere PWA-Qualität, mehr Setup.
- **Sofort nativ** — auf reinem Windows nicht möglich (kein Mac).

## Consequences

- PWA und native App teilen **keinen Code**; UI und Logik werden in Phase 2 komplett neu gebaut.
- Das einzige, was den Übergang überleben muss, sind die **Nutzerdaten** → siehe [ADR 0002](./0002-lokal-first-mit-json-export.md).
- Der Phase-2-iOS-Build erfordert zu gegebener Zeit einen Mac oder Cloud-Mac-Dienst.
