import { world } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

export function initTpArrows () {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;
        const atkCost = 20;
        const ICD = 10;
        
        if (player.hasTag("archer") && player.hasTag("spark")){
            if(item && item.typeId === "combat:ender_resin"){
                if ( checkCooldown(player, "Grappin", ICD) && checkMana(player, atkCost) ){
                    useCooldown(player, "Grappin");
                    consumeMana(player, atkCost);
                    player.addTag("grapple_loaded");
                    player.sendMessage("§eFlèche grappin chargée !");
                    player.dimension.playSound("note.chime",player.location);
                    
                    const inventory = player.getComponent("minecraft:inventory");
                    const mainHand = inventory?.container.getSlot(player.selectedSlotIndex);

                    if ( item.amount > 1) {
                        item.amount -=1;
                        mainHand?.setItem(item);
                    } else {
                        mainHand?.setItem();
                    }
                }   
            }
        }
    })
    world.afterEvents.projectileHitBlock.subscribe((event) => {
        const shooter = event.source;
        const arrow = event.projectile;

        if(arrow.typeId === "minecraft:arrow" && shooter && shooter.hasTag("grapple_loaded")){
            shooter.removeTag("grapple_loaded");
            const hitLoc = event.location;
            const tpLoc = {
                x: hitLoc.x,
                y: hitLoc.y +1,
                z: hitLoc.z
            }

            shooter.teleport(tpLoc,{dimension: shooter.dimension});

            shooter.dimension.playSound("mob.endermen.portal", tpLoc);
            shooter.dimension.spawnParticle("minecraft:enderman_particles", tpLoc);

            arrow.remove();
        }
    })
}