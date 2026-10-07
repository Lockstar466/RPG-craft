import { world } from "@minecraft/server";
import { useCooldown, checkCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 40;
const ICD = 60;
const abilityname = "Permutation";
const tpRange = 100;

export function initSwitch () {
    world.afterEvents.itemUse.subscribe((event) => {
        const {
            source:player,
            itemStack: item
        } = event;

        if(player.hasTag("troll") && player.hasTag("spark")) {
                    if (item && item.typeId == "combat:ender_switcher") {
        
                        if(checkMana(player, atkCost) && checkCooldown(player, abilityname, ICD)) {

                            const rayCastHit = player.getEntitiesFromViewDirection({ maxDistance: tpRange});

                            const validTarget = rayCastHit.filter(hit =>
                                hit.entity.id != player.id &&
                                hit.entity.typeId != "minecraft:item" &&
                                hit.entity.typeId != "minecraft:xp_orb"
                            );

                            if (validTarget.length > 0) {
                                useCooldown(player, abilityname);
                                consumeMana(player, atkCost);

                                const target = validTarget[0].entity;
    
                                const myLocation = player.location;
                                const targetLocation = target.location;
    
                                player.teleport(targetLocation);
                                target.teleport(myLocation);
                                
                                player.sendMessage(`§dPermuté avec: ${target.typeId}`);
                                player.dimension.playSound("mob.endermen.portal", myLocation);
                                player.dimension.spawnParticle("minecraft:enderman_particles", myLocation);
                                
                                
                                target.sendMessage(`§dPermuté avec: ${player.name}`);
                                target.dimension.playSound("mob.endermen.portal", targetLocation);
                                target.dimension.spawnParticle("minecraft:enderman_particles", targetLocation);
                            } else {
                                player.sendMessage("§cAucune cible à portée de la technique !")
                            }
                        }
                    }
        }    

    })
}