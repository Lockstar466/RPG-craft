# RPG powercraf - Minecraft Bedrock Add-on

Un add-on pour Minecraft Bedrock Edition (Windows 10, Consoles, Mobile) ajoutant un système de classe, mana et capacités spéciales. C'est un projet personnel fait dans le contexte d'un serveur local avec des potes. Il sera optimisé pour une utilisation plus globale dans de prochianes mises à jour.

## Technologies et Compétences
* **Langages :** JavaScript (ES6+), JSON
* **API :** Minecraft Bedrock Script API et UI (`@minecraft/server`; `@minecraft/server-ui`)
* **Concepts :** Programmation orientée événements, State Management, Game Loop (Tick events).

## Architecture du Code
*L'intelligence du mod se trouve principalement dans le Behavior Pack.*
* **`scripts/main.js` :** Point d'entrée gérant l'abonnement aux événements du monde (`world.events`).
* **`behavior_pack/entities/` :** Définition JSON des entités avec leurs composantes de comportement (pathfinding, interactions).
* **Communication :** Utilisation des *Dynamic Properties* pour sauvegarder l'état des joueurs ou du monde entre les sessions.

## Installation pour les joueurs
1. Allez dans la section [Releases](../../releases) de ce dépôt.
2. Téléchargez le fichier `.mcaddon`.
3. Double-cliquez sur le fichier pour l'importer automatiquement dans Minecraft.
4. Activez le "Behavior Pack" et le "Resource Pack" dans les paramètres de votre monde, et n'oubliez pas d'activer les **Holiday Creator Features** / **Beta APIs** si nécessaire.

## 👨‍💻 Pour les développeurs (Contribution)
Cloner le projet et placer les dossiers `behavior_pack` et `resource_pack` directement dans le dossier `development_behavior_packs` et `development_resource_packs` du dossier `com.mojang` de votre installation Minecraft.