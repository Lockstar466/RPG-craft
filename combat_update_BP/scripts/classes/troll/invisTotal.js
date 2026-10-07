import { world, system, EquipmentSlot } from "@minecraft/server";
import { useCooldown, checkCooldown } from "../../utils/cooldown_manager";
import { checkMana,consumeMana } from "../../utils/mana_manager";

const atkCost = 15;
const ICD = 30;
const abilityname = "Invisibilité totale";

export function initInvisibility () {

    world.afterEvents.itemUse.subscribe((event) => {
        const {
            source: player,
            itemStack:  item
        } = event;

        if(player.hasTag("troll") && player.hasTag("spark")) {
            if (item && item.typeId == "combat:illusion" && player.isSneaking) {

                if(checkMana(player, atkCost) && checkCooldown(player, abilityname, ICD)) {
                    const equippement = player.getComponent("minecraft:equippable");
                    const Head = equippement?.getEquipment(EquipmentSlot.Head);
                    const Chest = equippement?.getEquipment(EquipmentSlot.Chest);
                    const Legs = equippement?.getEquipment(EquipmentSlot.Legs);
                    const Feet = equippement?.getEquipment(EquipmentSlot.Feet);

                    equippement?.setEquipment(EquipmentSlot.Head, undefined);
                    equippement?.setEquipment(EquipmentSlot.Chest, undefined);
                    equippement?.setEquipment(EquipmentSlot.Legs, undefined);
                    equippement?.setEquipment(EquipmentSlot.Feet, undefined);

                    consumeMana(player, atkCost);
                    useCooldown(player, abilityname);

                    let invisDuration = 600;
                    player.addEffect("invisibility", 640, { showParticles: false });
                    player.addEffect("resistance", 640, { showParticles: false, amplifier: 2 });
                    player.sendMessage("§7[Illusion] Disparition totale...");

                    const invisTime = system.runInterval(() => {
                        if (!player.isValid || invisDuration <= 0){
                            system.clearRun(invisTime);

                            if (player.isValid) {
                                
                                if (Head) equippement?.setEquipment(EquipmentSlot.Head, Head);
                                if (Chest) equippement?.setEquipment(EquipmentSlot.Chest, Chest);
                                if (Legs) equippement?.setEquipment(EquipmentSlot.Legs, Legs);
                                if (Feet) equippement?.setEquipment(EquipmentSlot.Feet, Feet);
                                player.removeEffect("invisibility");
                                player.removeEffect("resistance");
                                
                                player.sendMessage("§7[Illusion] Fin de l'invisibilité.");
                            }
                            return;
                        }

                        invisDuration -=20;
                        
                    },20)
                    
                    
                }
            }
        }
    })
}