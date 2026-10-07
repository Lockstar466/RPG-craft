import { world, system, EquipmentSlot } from "@minecraft/server";
import { checkMana, consumeMana } from "../../utils/mana_manager";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";

export function initPhysic() {
    const hitCounter = new Map();
    const atkCost = 10;
    const ICD = 5;

    world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const target = event.hitEntity;
    const hasSpark = attacker.hasTag("spark");
    const isTank = attacker.hasTag("tank");
    
    if (!hasSpark || !isTank) return;
    
    if(attacker.typeId === "minecraft:player"){

        const equippable = attacker.getComponent("minecraft:equippable");
        
        if (equippable){
            const item = equippable.getEquipment(EquipmentSlot.Mainhand);

            if (item && item.typeId.includes("sword")){

                //Attaque chargée : 5s + 10 pts d'énergie 

                if(attacker.isSneaking){
                    if(checkCooldown(attacker, "Attaque chargée", ICD) && checkMana(attacker, atkCost)){
                        useCooldown(attacker, "Attaque chargée");
                        consumeMana(attacker, atkCost);
                        attacker.sendMessage("§eAttaque chargée !");
                        target.dimension.playSound("random.anvil_land", target.location);
                        target.dimension.spawnParticle("minecraft:large_explosion", target.location);

                        let dirX = target.location.x - attacker.location.x;
                        let dirZ = target.location.z - attacker.location.z;

                        target.applyKnockback(dirX, dirZ, 4, 0.8);
                    }
                }
            }

            const weapons = ["sword", "axe", "spear"];

                if (item && weapons.some(type => item.typeId.includes(type))) {
                    const combatKey = `${attacker.id}_${target.id}`;
                    const currentTick = system.currentTick;

                    let combatData = hitCounter.get(combatKey) || { hits: 0, lastTick: 0 };
                    if (combatData.hits > 0 && (currentTick - combatData.lastTick) < 10) {
                        return;
                    }

                    if ((currentTick - combatData.lastTick) > 60) {
                        combatData.hits = 0; // Le combo est brisé, on repart à zéro
                    }

                    combatData.hits += 1;
                    combatData.lastTick = currentTick;

                    if(combatData.hits >= 3){
                        target.addEffect("wither", 100, {amplifier:0, showParticles:false});
                        attacker.sendMessage("§cSaignement infligé !");

                        combatData.hits = 0;
                    }

                    hitCounter.set(combatKey, combatData);
                }
        }

    }
    
    })

}