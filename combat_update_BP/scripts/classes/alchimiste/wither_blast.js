import { EquipmentSlot, system, world } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

export function initWither() {
    const atkCost = 60;
    const ICD = 90;
    
    const wither = system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            if (!player.isValid) continue;

            const equippable = player.getComponent("minecraft:equippable");

            if (player.hasTag("alchimiste") && player.hasTag("spark")) {
                if (equippable) {
                    const item = equippable.getEquipment(EquipmentSlot.Head);

                    if (item && item.typeId == "minecraft:wither_skeleton_skull") {
                        const targets = player.dimension.getEntities({
                            location: player.location,
                            maxDistance: 10,
                            excludeNames: [player.name],
                            excludeFamilies: ["inanimate"]
                        });

                        if (targets.length > 0) {
                            const currentMana = player.getDynamicProperty("mana") ?? 100;
                            if (checkCooldown(player, "Wither wave", ICD) && currentMana >= atkCost) {
                                
                                consumeMana(player, atkCost);
                                useCooldown(player, "Wither wave");
                                player.dimension.playSound("mob.wither.spawn", player.location);
                                player.sendMessage("§l§5Wither wave active...");                                  
                                
                                let durationTicks = 200;

                                const auraInterval = system.runInterval(() => {
                                    if (!player.isValid || durationTicks <= 0) {
                                        system.clearRun(auraInterval);
                                        return;
                                    }

                                    durationTicks -=5;
                                    player.dimension.spawnParticle("minecraft:basic_smoke_particle", player.location);

                                    const currentTarget = player.dimension.getEntities({
                                        location: player.location,
                                        maxDistance: 10,
                                        excludeNames: [player.name],
                                        excludeFamilies: ["minecraft:inanimate"],
                                        excludeTypes:["minecraft:item", "minecraft:xp_orb"]
                                    })
                                    
                                    for (const target of currentTarget) {
                                        target.addEffect("wither", 40, {amplifier: 2, showParticles: false});
                                        target.dimension.spawnParticle("minecraft:basic_smoke_particle", target.location);
                                    }
                                }, 5)
                            }
                        }
                    }
                }
            }
        }
    }, 20)
}