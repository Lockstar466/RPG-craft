import { world,system } from "@minecraft/server";
import { checkMana, consumeMana } from "../../utils/mana_manager";
import {ActionFormData, ModalFormData} from "@minecraft/server-ui"

/**
* 
* @param {any} inventory 
* @param {string} itemTypeId 
* @returns 
*/
function countItem(inventory, itemTypeId){
    let total = 0;
    for (let i=0; i<inventory.size; i++) {
        let comp = inventory?.getItem(i);
        if (comp && comp.typeId == itemTypeId) {
            total += comp.amount;
        }
    }
    return total;
}

export function initPotionMenu() {
    world.beforeEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;
        const atkCost = 2;

        if (player.hasTag("alchimiste") && player.hasTag("spark")){
            if (item && item.typeId === "combat:codex") system.run(() => main());
            
            function main() {
                const menu = new ActionFormData();
                menu.title("Codex de transmutation");
                menu.body("Bon retour maître §1Alchimiste§r. Sélectionnez la potion à transmuter:§r");
                menu.button("Potion de Soin Instantané\n§o§7Larmes de Ghast", "textures/combat/items/potion_bottle_heal.png");
                menu.button("Potion de Force\n§o§7Poudre de Blaze", "textures/combat/items/potion_bottle_damageBoost.png");
                menu.button("Potion d'Invisibilité\n§o§7Carotte dorée", "textures/combat/items/potion_bottle_invisibility.png");
                menu.button("Potion de Poison\n§o§7Œil d'araignée", "textures/combat/items/potion_bottle_poison.png");
                menu.button("Potion de Lenteur\n§o§7Patte de lapin", "textures/combat/items/potion_bottle_moveSlowdown.png");
                menu.button("Potion de Dégâts\n§o§7Chair putréfiée", "textures/combat/items/potion_bottle_harm.png");
                
                menu.show(player).then((response) => {
                    if(response.canceled) return;
                    switch (response.selection) {
                        case 0:
                            openPotionModal("Potion de Soin Instantané", "minecraft:glistering_melon_slice", 21, 22, "minecraft:glowstone_dust");
                            break;
                        case 1:
                            openPotionModal("Potion de Force", "minecraft:blaze_powder", 31, 33, "minecraft:glowstone_dust");
                            break;
                        case 2:
                            // L'invisibilité utilise la redstone pour l'amélioration (durée)
                            openPotionModal("Potion d'Invisibilité", "minecraft:golden_carrot", 7, 8, "minecraft:redstone"); 
                            break;
                        case 3:
                            openPotionModal("Potion de Poison", "minecraft:spider_eye", 25, 27, "minecraft:glowstone_dust");
                            break;
                        case 4:
                            // La lenteur utilise la redstone pour l'amélioration (durée)
                            openPotionModal("Potion de Lenteur", "minecraft:rabbit_foot", 17, 42, "minecraft:redstone");
                            break;
                        case 5:
                            openPotionModal("Potion de Dégâts", "minecraft:rotten_flesh", 23, 24, "minecraft:glowstone_dust");
                            break;
                    }
                })
            }

            /**
             * 
             * @param {string} potionTitle 
             * @param {string} baseIngredient 
             * @param {number} dataVal1 
             * @param {number} dataVal2 
             * @param {string} catalystItem 
             */

            function openPotionModal(potionTitle, baseIngredient, dataVal1, dataVal2, catalystItem) {
                const subMenu = new ModalFormData();
                subMenu.title(potionTitle);
                subMenu.dropdown("Type de fiole", ["Buvable", "Jettable", "Dispersion"]); // formValues[0]
                subMenu.slider("Intensité / Durée", 1, 2, 1); // formValues[1]
                subMenu.slider("Quantité", 1, 5, 1); // formValues[2]
                subMenu.submitButton("Transmute");

                subMenu.show(player).then((sr) => {
                    if (sr.canceled) return;

                    const typeChoix = sr.formValues[0];
                    const intensite = sr.formValues[1];
                    const potNumber = sr.formValues[2];

                    let typePotion = "potion";
                    let ingredientType = null;

                    if (typeChoix === 1) {
                        typePotion = "splash_potion";
                        ingredientType = "minecraft:gunpowder";
                    } else if (typeChoix === 2) {
                        typePotion = "lingering_potion";
                        ingredientType = "minecraft:dragon_breath"; 
                    }

                    const dataValue = (intensite === 1) ? dataVal1 : dataVal2;
                    const ingIntensite = (intensite === 2) ? catalystItem : null;
                    
                    const inventaire = player.getComponent('minecraft:inventory')?.container;

                    // Vérification dynamique
                    const hasBase = countItem(inventaire, baseIngredient) >= potNumber;
                    const hasIngType = ingredientType ? (countItem(inventaire, ingredientType) >= potNumber) : true;
                    const hasIngIntensite = ingIntensite ? (countItem(inventaire, ingIntensite) >= potNumber) : true;

                    // Application des coûts et récompenses
                    if (hasBase && hasIngType && hasIngIntensite) {
                        if (checkMana(player, atkCost * potNumber)){
                            consumeMana(player, atkCost * potNumber);
                            
                            // Nettoyage de l'inventaire
                            player.runCommand(`clear @s ${baseIngredient.replace("minecraft:", "")} 0 ${potNumber}`);
                            if (ingredientType) player.runCommand(`clear @s ${ingredientType.replace("minecraft:","")} 0 ${potNumber}`);
                            if (ingIntensite) player.runCommand(`clear @s ${ingIntensite.replace("minecraft:", "")} 0 ${potNumber}`);

                            // Don de la potion
                            player.runCommand(`give @s ${typePotion} ${potNumber} ${dataValue}`);
                            player.sendMessage(`§aTransmutation réussie : ${potionTitle} !`);
                        }
                    } else {
                        player.sendMessage("§cIngrédients insuffisants pour cette recette !");
                    }
                });
            }
        }
    })
}