import { world, system, EntityDamageCause, Entity } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

export function initSonicBoom () {

    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item } = event;
        const atkCost = 60;
        const ICD = 20;
        const rayDistance = 25;

        if (player.hasTag("archer") && player.hasTag("spark")) {
            if(item && item.typeId === "combat:echo_blast"){
                if ( checkCooldown(player, "Sonic Boom", ICD) && checkMana(player, atkCost) ){
                    useCooldown(player, "Sonic Boom");
                    consumeMana(player, atkCost);

                    player.dimension.playSound("mob.warden.sonic_charge", player.location);
                    
                    
                    system.runTimeout(() => {
                        if (!player.isValid) return;
                        const startLoc = player.getHeadLocation();
                        const viewDir = player.getViewDirection();

                        for (let i =1; i<= rayDistance; i++){
                            const rayLoc = {
                                x: startLoc.x + (viewDir.x * i),
                                y: startLoc.y + (viewDir.y * i),
                                z: startLoc.z + (viewDir.z * i)
                            }
                            player.dimension.spawnParticle("minecraft:sonic_explosion", rayLoc);
                        };
                        player.dimension.playSound("mob.warden.sonic_boom",player.location);

                        const hitTarget = player.dimension.getEntitiesFromRay(startLoc, viewDir, { maxDistance: rayDistance });

                        for (const hitEntities of hitTarget) {
                            const target = hitEntities.entity;

                            if (target.id === player.id) continue;
                            target.applyDamage(24, {cause: EntityDamageCause.sonicBoom, damagingEntity: player});
                            target.applyKnockback(viewDir.x, viewDir.z, 2.5, 1.2);
                        }
                    }, 30)
                }
                
            }
        }
    })

    

}

// mob.warden.roar
//mob.warden.sonic_boom
// mob.warden.heartbeat
