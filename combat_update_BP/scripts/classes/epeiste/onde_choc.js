import { world, system } from "@minecraft/server";
import { checkMana, consumeMana } from "../../utils/mana_manager";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";

const atkCost = 45;
const ICD = 10;
const abilityName = "Esprit héroïque";

/**
 * 
 * @param {import("@minecraft/server").Player} player
 */

function aura(player){
    let auraDuration = 400;

    const initAura = system.runInterval(() => {

        if (!player.isValid || auraDuration<=0){
            system.clearRun(initAura);
            return;
        }

        const pLoc = player.location;

        const offsetX = (Math.random() -0.5)*1.5;
        const offsetZ = (Math.random() -0.5)*1.5;
        const offsetY = (Math.random())*2.5;
        const auraLoc = {
            x: pLoc.x + offsetX,
            y: pLoc.y + offsetY,
            z: pLoc.z + offsetZ
        }

        if (Math.random() > 0.2) {
            player.dimension.spawnParticle("minecraft:electric_spark_particle", auraLoc);
            } else {
                player.dimension.spawnParticle("minecraft:totem_particle", auraLoc);
        }   
        
        auraDuration -=20;
    }, 20)
}

export function initShockWave() {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;

        if (!player.hasTag("tank") || !player.hasTag("spark")) return;
        
        if (item.typeId === "minecraft:shield" /*&& player.hasTag("Epée")*/) {
            if ( checkCooldown(player, abilityName, ICD) && checkMana(player, atkCost) ) {
                useCooldown(player, abilityName);
                consumeMana(player, atkCost);
                player.sendMessage(`§b${abilityName} !`);
                player.dimension.playSound("random.totem", player.location);

                for (let i=0; i<30; i++){
                    const auraLoc = {
                        x: player.location.x + (Math.random() -0.5)*10,
                        y: player.location.y + 0.5 + Math.random(),
                        z: player.location.z + (Math.random() -0.5)*10
                    };
                    player.dimension.spawnParticle("minecraft:trial_spawner_detection", auraLoc);
                }

                aura(player);

                player.addEffect("strength", 400, {amplifier: 0, showParticles:false});
                player.addEffect("speed", 100, {amplifier: 5, showParticles: false});
                player.addEffect("resistance", 400, { amplifier: 1, showParticles: false});
                player.addEffect("fire_resistance", 400, {amplifier: 0, showParticles: false});

                const target = player.dimension.getEntities({
                    maxDistance:8,
                    location:player.location,
                    excludeNames: [player.name]
                });

                for(const targets of target) {
                    const pLoc = player.location;
                    const eLoc = targets.location;

                    let dirX = eLoc.x-pLoc.x;
                    let dirZ = eLoc.z-pLoc.z;

                    targets.applyKnockback(dirX, dirZ, 3.5, 1.2);
                    
                }
            }

        }
    })
}