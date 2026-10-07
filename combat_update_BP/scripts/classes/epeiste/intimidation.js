import { world, system } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 5;
const ICD = 90;

export function initIntimidation () {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            if (!player.hasTag("tank") || !player.hasTag("spark")) continue;

            const targets = player.dimension.getEntities({
                location: player.location,
                maxDistance: 10,
                excludeNames: [player.name],
                excludeTypes:["minecraft:item", "minecraft:xp_orb"],
                excludeFamilies:["minecraft:inanimate", "minecraft:npc"]
            });

            if(targets.length >0){
                const currentMana = player.getDynamicProperty("mana") ?? 100;
                
                if(currentMana >= 5) {
                    if (checkCooldown(player, "Aura monster", ICD) && checkMana(player, atkCost)) {
                        consumeMana(player, 5);
                        useCooldown(player, "Aura monster");

                        for (const target of targets) {
                            target.addEffect("slowness", 160, {amplifier: 1});
                            target.addEffect("weakness", 160, {amplifier: 1});
                            target.addEffect("blindness", 160, {amplifier: 0});
                        }
                        const pLoc = player.location;
                        player.sendMessage("§l§5Indtimidation active...");
                        player.dimension.playSound("mob.wither.spawn", pLoc, {pitch: 0.5, volume:0.5});
                        
                        for (let i=0; i<30; i++){
                            const auraLoc = {
                                x: pLoc.x + (Math.random() -0.5)*10,
                                y: pLoc.y + 0.5 + Math.random(),
                                z: pLoc.z + (Math.random() -0.5)*10
                            };
                            player.spawnParticle("minecraft:trial_spawner_detection_ominous", auraLoc);
                        }
                        
                    }

                }
            }
        }
    }, 10);
}