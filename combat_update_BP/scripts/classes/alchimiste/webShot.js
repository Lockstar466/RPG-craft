import { world, system } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 5;
const ICD = 3;
const abilityName = "Transmutation: toile";

export function initSpiderShot () {

    world.afterEvents.itemUse.subscribe((event) => {
        const { source: player, itemStack: item} = event;

        if (player && player.hasTag("alchimiste") && player.hasTag("spark")) {
            if(item && item.typeId === "combat:compacted_web"){
                
                if (checkMana(player, atkCost) && checkCooldown(player,abilityName, ICD)){
                    consumeMana(player, atkCost);
                    useCooldown(player, abilityName);
    
                    player.addTag("web");
                }
            }

        }

    })

    world.afterEvents.projectileHitEntity.subscribe((event) => {
        const {source: shooter, projectile: shoot, location: hitLoc} = event;

        if (shooter && shooter.typeId == "minecraft:player" && shooter.hasTag("web")) {
            shooter.removeTag("web");
            if (shoot && shoot.typeId == "minecraft:snowball") {
                const centerX = Math.floor(hitLoc.x);
                const centery = Math.floor(hitLoc.y);
                const centerz = Math.floor(hitLoc.z);
                
                const offsets = [
                    {dx:0, dz:0},
                    { dx: 1, dz: 0 }, 
                    { dx: -1, dz: 0 },
                    { dx: 0, dz: 1 }, 
                    { dx: 0, dz: -1 }
                ]
                
                for (const offset of offsets ) {
                    const targetLoc = {
                        x: centerX + offset.dx,
                        y: centery,
                        z: centerz + offset.dz
                    }
                    const block = shooter.dimension.getBlock(targetLoc);
                    if (block && block.isAir) {
                        block.setType("minecraft:web");
                    }
                };
                
                shooter.dimension.playSound("step.slime", hitLoc);
                shooter.sendMessage(`§7${abilityName}`);
                
            }
        }
    })
}