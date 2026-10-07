/**
 * Script qui gère l'acquisition de droit de capacité.
 * La fonction getspark() gère l'acquisition du tag "spark" suite à l'utilisation de l'"Arche du pouvoir"
 * La fonction removeSpark() gère (comme son nom l'indique), la suppression du tag "Spark" à la mort du joueur.
 * Idem pour la fonction removeClass() qui retire la classe d'un joueur mort.
 */

import { world } from "@minecraft/server";

export function getSpark () {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;
        const classList = ["archer", "tank", "alchimiste", "troll"];

        if ( item && item.typeId === "combat:arche_pouvoir"){
            if (classList.some(name => player.hasTag(name)) && !player.hasTag("spark")) {
                player.dimension.playSound("random.totem", player.location);
                player.addTag("spark");
                player.runCommand(`clear @s combat:arche_pouvoir 0 1`);
                player.sendMessage(`§l§6Pouvoir légué de §kAATT§r §l§6 retrouvé`);
                
            }
            else if (player.hasTag("spark")) {
                player.sendMessage("§l§4Pouvoir légué déjà éveillé.");
            } else if (!classList.some(name => player.hasTag(name)) && !player.hasTag("spark")) {
                player.sendMessage("§o§7Vous devez avoir un rôle avant l'éveil !");
                //player.playSound();
            }
        }


    })
}

export function removeSpark() {
    world.afterEvents.entityDie.subscribe((event) => {
        let entity = event.deadEntity;

       if (entity.typeId ==="minecraft:player" && entity.hasTag("spark")){
        entity.removeTag("spark");
       }
    })
}

export function removeClass() {
    world.afterEvents.entityDie.subscribe((event) => {
        let entity = event.deadEntity;
        const classList = ["archer", "tank", "alchimiste", "troll"];

       if (entity.typeId ==="minecraft:player" && classList.some(name => entity.hasTag(name))){
        for (const tag of classList) {
            entity.removeTag(`${tag}`);
        }
       }
    })
}