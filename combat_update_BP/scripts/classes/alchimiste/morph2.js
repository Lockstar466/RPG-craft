import { world, system, EquipmentSlot } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 40;
const ICD = 50;
const abilityName = "Transmutation: Incarnation";
const mobList = [
    {
        id: 'iron_golem',
        traits: [
            { effect: "strength", amp: 3 }, 
            { effect: "slowness", amp: 1 },
            { effect: "resistance", amp: 3}
        ]
    },
    {
        id : 'shulker',
        traits: [
            { effect: "resistance", amp: 3 },
            { effect: "slowness", amp: 3 }
        ]
    },
    {
        id: 'enderman',
        traits: [
            { effect: "strength", amp: 4 },
            { effect: "speed", amp: 2 },
            { effect: "resistance", amp: 15 }
        ]
    }
]

export function initMorph2 () {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;

        if(player.hasTag("alchimiste") && player.hasTag("spark")) {

            if (!player.hasTag("morphed")) {
                if (item && item.typeId == "combat:incarnation") {
                    if (checkMana(player, atkCost) && checkCooldown(player, abilityName, ICD)) {
                        const equippement = player.getComponent("minecraft:equippable");
                        const Head = equippement?.getEquipment(EquipmentSlot.Head);
                        const Chest = equippement?.getEquipment(EquipmentSlot.Chest);
                        const Legs = equippement?.getEquipment(EquipmentSlot.Legs);
                        const Feet = equippement?.getEquipment(EquipmentSlot.Feet);
                        
                        equippement?.setEquipment(EquipmentSlot.Head, undefined);
                        equippement?.setEquipment(EquipmentSlot.Chest, undefined);
                        equippement?.setEquipment(EquipmentSlot.Legs, undefined);
                        equippement?.setEquipment(EquipmentSlot.Feet, undefined);
                        
                        useCooldown(player, abilityName);
                        consumeMana(player, atkCost);
                        player.addTag("morphed");

                        //selection du mob
                        const randomMob = Math.floor(Math.random()*mobList.length);
                        const selectedMob = mobList[randomMob];
                        const mob= player.dimension.spawnEntity(`minecraft:${selectedMob.id}`, player.location);
                        mob.triggerEvent("spark:make_morph");

                        //application des effets en fonction du mob
                        player.addEffect("invisibility", 400, {showParticles: false});

                        for (const trait of selectedMob.traits) {
                            player.addEffect(trait.effect, 400, {showParticles: false, amplifier: trait.amp});
                        }
                        player.dimension.spawnParticle("minecraft:huge_explosion_emitter", player.location);;

                        player.sendMessage(`§b${abilityName}`);

                        let durationTicks = 400;
                        //bloucle pour teleporter le mob à mma position et mettre fin à la capcité
                        const illusion = system.runInterval(() => {
                            if (!player.isValid || durationTicks<=0 || !mob.isValid) {
                                system.clearRun(illusion);
                                if (mob.isValid) {
                                    mob.remove();//retrait du mob
                                }

                                if (player.isValid) {
                                    player.removeEffect("invisibility");
                                    for (const trait of selectedMob.traits) {
                                        player.removeEffect(trait.effect);
                                    }

                                    if (Head) equippement?.setEquipment(EquipmentSlot.Head, Head);
                                    if (Chest) equippement?.setEquipment(EquipmentSlot.Chest, Chest);
                                    if (Legs) equippement?.setEquipment(EquipmentSlot.Legs, Legs);
                                    if (Feet) equippement?.setEquipment(EquipmentSlot.Feet, Feet);

                                    player.dimension.spawnParticle("minecraft:huge_explosion_emitter", player.location);;//retrait effets
                                    player.removeTag("morphed");
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
