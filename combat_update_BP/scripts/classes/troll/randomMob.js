import { world, system } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 5;
const ICD = 3;
const abilityname = "Oeuf du mystère";

const mobList = [
    "minecraft:creeper",
    "minecraft:cave_spider",
    "minecraft:witch",
    "minecraft:vindicator",
    "minecraft:silverfish",
    "minecraft:elder_guardian",
    "minecraft:zombie",
    "minecraft:skeleton",
    "minecraft:wither_skeleton"
]
export function initMysteryEntity() {

    world.beforeEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;

        if(player.hasTag("troll") && player.hasTag("spark")) {
            if (item && item.typeId == "combat:mystery_egg") {
                if(checkMana(player, atkCost) && checkCooldown(player, abilityname, ICD)) {
                    consumeMana(player, atkCost);
                    useCooldown(player, abilityname);
                } else {
                    event.cancel = true;
                }
            }
        }
    });

    world.afterEvents.projectileHitBlock.subscribe((event) => {
        const { source: player, projectile, location } = event;

        if (player?.typeId === "minecraft:player" && player.hasTag("troll") && player.hasTag("spark")) {
            if (projectile.typeId === "minecraft:egg") {
                spawnSurprise(player.dimension, location);
            }
        }
    });

    world.afterEvents.projectileHitEntity.subscribe((event) => {
        const { source: player, projectile, location } = event;

        if (player?.typeId === "minecraft:player" && player.hasTag("troll") && player.hasTag("spark")) {
            if (projectile.typeId === "minecraft:egg") {
                spawnSurprise(player.dimension, location);
            }
        }
    });
}

/**
 * 
 * @param {*} dimension 
 * @param {import("@minecraft/server").Vector3} location 
 */

function spawnSurprise(dimension, location) {
    const randomMob = mobList[Math.floor(Math.random() * mobList.length)];

    dimension.spawnEntity(randomMob, location);

    dimension.spawnParticle("minecraft:huge_explosion_emitter", location);
    dimension.playSound("random.pop", location);
}