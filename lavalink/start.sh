#!/usr/bin/env bash
# Lance Lavalink (serveur de musique). Télécharge Lavalink.jar au premier lancement.
set -e
cd "$(dirname "$0")"

# Vérification de Java
if ! command -v java >/dev/null 2>&1 || ! java -version >/dev/null 2>&1; then
  echo "❌ Java 17+ est requis pour Lavalink (la musique)."
  echo ""
  echo "   Installation sur macOS :"
  echo "     brew install --cask temurin"
  echo ""
  echo "   Puis relance : npm run lavalink"
  exit 1
fi

JAVA_MAJOR=$(java -version 2>&1 | head -1 | sed -E 's/.*version "([0-9]+).*/\1/')
if [ "$JAVA_MAJOR" -lt 17 ]; then
  echo "❌ Java $JAVA_MAJOR détecté, mais Lavalink nécessite Java 17+."
  echo "   Installe une version récente : brew install --cask temurin"
  exit 1
fi

# Téléchargement de Lavalink.jar si absent
if [ ! -f Lavalink.jar ]; then
  echo "⬇️  Téléchargement de Lavalink..."
  curl -L -o Lavalink.jar "https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar"
  echo "✅ Lavalink téléchargé."
fi

echo "🎵 Démarrage de Lavalink sur le port 2333..."
exec java -jar Lavalink.jar
