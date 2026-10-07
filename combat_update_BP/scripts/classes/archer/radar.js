import { world, system } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

export function initRadar() {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: items} = event;
        const atkCost = 15;
        const ICD = 60;
        const abilityname = "Radar"

        if (player.hasTag("archer") && player.hasTag("spark")){
            if(items && items.typeId === "combat:radar"){
                if ( checkCooldown(player, abilityname, ICD) && checkMana(player, atkCost) ){
                    useCooldown(player, abilityname);
                    consumeMana(player, atkCost);
                    const targets = player.dimension.getEntities({
                        maxDistance: 50,
                        location: player.location,
                        excludeNames: [player.name],
                        excludeTypes:["minecraft:item", "minecraft:xp_orb"]
                        //excludeFamilies:["minecraft:inanimate"],
                        //type: "minecraft:player"
                    })

                    let radarTick = 200;

                    const radarIntervall = system.runInterval(() => {
                        if (radarTick <= 0 || !player.isValid) {
                            system.clearRun(radarIntervall);
                            return;
                        }
                        
                        for (const target of targets){
                            if (!target.isValid) continue;
                            for(let i=5; i<= 10; i+=0.5){
                                const radarLoc = {
                                    x: target.location.x,
                                    y: target.location.y + i,
                                    z: target.location.z
                                }
                                
                                player.dimension.spawnParticle("minecraft:basic_flame_particle", radarLoc);
                            }
                        }

                        radarTick--;
                    }, 1)
                }
            }
        }
    })
}