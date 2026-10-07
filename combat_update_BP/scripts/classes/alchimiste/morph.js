import { world, system, EquipmentSlot } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 10;
const ICD = 15;
const abilityName = "Transmutation: Morphose";
const mobList = [
    'chicken',
    'pig',
    'rabbit',
    'pufferfish',
    'sheep',
    'zombie'
]

/**
 * 
 * @param {import ("@minecraft/server").Player} player 
 */
function aura(player) {
    const offsetX = (Math.random() -0.5)*1.5;
    const offsetZ = (Math.random() -0.5)*1.5;
    const offsetY = (Math.random())
    const auraLoc = {
        x: player.location.x + offsetX,
        y: player.location.y + offsetY,
        z: player.location.z + offsetZ
    }

    player.dimension.spawnParticle("minecraft:misc_fire_vapor_particle", auraLoc);
}

export function initMorph () {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;
        if(player.hasTag("alchimiste") && player.hasTag("spark")) {

            if (item && item.typeId == "combat:morphose") {
                
                if (!player.hasTag("morphed")) { //empêcher le joueur de stack 2 transformations
                    if (checkMana(player, atkCost) && checkCooldown(player, abilityName, ICD)) {
                        useCooldown(player, abilityName);
                        consumeMana(player, atkCost);
                        player.addTag("morphed");
                        
                        var randomMob = Math.floor(Math.random()*mobList.length);
                        const mob= player.dimension.spawnEntity(`minecraft:${mobList[randomMob]}`, player.location);
                        
                        const equippement = player.getComponent("minecraft:equippable");
                        const Head = equippement?.getEquipment(EquipmentSlot.Head);
                        const Chest = equippement?.getEquipment(EquipmentSlot.Chest);
                        const Legs = equippement?.getEquipment(EquipmentSlot.Legs);
                        const Feet = equippement?.getEquipment(EquipmentSlot.Feet);

                        equippement?.setEquipment(EquipmentSlot.Head, undefined);
                        equippement?.setEquipment(EquipmentSlot.Chest, undefined);
                        equippement?.setEquipment(EquipmentSlot.Legs, undefined);
                        equippement?.setEquipment(EquipmentSlot.Feet, undefined);

                        player.addEffect("invisibility", 200, {showParticles: false});
                        player.addEffect("resistance", 200, {showParticles: false});
                        
                        aura(player);
                        player.sendMessage(`§b${abilityName}`);
                        
                        let durationTicks = 200;
                        
                        const illusion = system.runInterval(() => {
                            if (!player.isValid || durationTicks<=0 || !mob.isValid) {
                                system.clearRun(illusion);
                                if (mob.isValid) {
                                    mob.remove();
                                }
                            
                                if (player.isValid) {
                                    if (Head) equippement?.setEquipment(EquipmentSlot.Head, Head);
                                    if (Chest) equippement?.setEquipment(EquipmentSlot.Chest, Chest);
                                    if (Legs) equippement?.setEquipment(EquipmentSlot.Legs, Legs);
                                    if (Feet) equippement?.setEquipment(EquipmentSlot.Feet, Feet);
                                    player.removeEffect("invisibility");
                                    player.removeEffect("resistance");
                                    player.removeTag("morphed");
                                    aura(player);
                                }
                            
                                return;
                            }
                        
                            const phRot = player.getRotation();
                            mob.teleport(player.location, {rotation :{x:phRot.x, y:phRot.y}})
                        
                        
                            durationTicks -= 1;
                        }, 1)
                    
                    }
                }
            }

        }

        
    })
}
