/**
 * Script qui gère la gestion générale du mana et tout évènement y étant lié directement.
 * initManaSystem() attribut l'objet mana au joueur dès l'attribution du tag "spark". La quantité de mana maximale étant de 100 (MAX_MANA).
 * L'affichage est aussi gérée par cette fonction qui affiche la quantité en chiffre et sous forme de barre dynamique dans l'actionbar du joueur très vite pour créer un effet de persistance.
 * Le gain de mana est aussi géré de 2 façons: passif (1 point de mana chaque 8 s) et actif (utilisation d'une fiole de mana).
 * La vérification du mana par checkMana(player, cost) permet de vérifier avant l'utilisation d'une capacité si le joueur possède la quantité requise.
 */

import { world, system/*, DisplaySlotId, ObjectiveSortOrder*/ } from "@minecraft/server";

const MAX_MANA = 100;
//const OBJECTIVE_NAME = "mana_monitor";

//function initScoreboardSystem() {
//    let objective = world.scoreboard.getObjective(OBJECTIVE_NAME);
//
//    if (!objective) {
//        world.scoreboard.addObjective(OBJECTIVE_NAME, "§b§lMana");
//    }
//
//    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
//        objective: objective,
//        sortOrder: ObjectiveSortOrder.Descending
//    });
//    return objective;
//}


export function initManaSystem() {
    //const objective = initScoreboardSystem();

    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            const classList = ["archer", "tank", "alchimiste", "troll"];
            if (player.hasTag("spark") && classList.some(name => player.hasTag(name))) {
                let mana = player.getDynamicProperty("mana");

                if (typeof mana !== "number") {
                    player.setDynamicProperty("mana", MAX_MANA);  
                    mana = MAX_MANA;
                }

                if (mana < MAX_MANA) {
                    player.setDynamicProperty("mana", mana + 1);  
                }
            }
        }
    }, 160); //regénération passive du mana

    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            const classList = ["archer", "tank", "alchimiste", "troll"];
            
            if (player.hasTag("spark") && classList.some(name => player.hasTag(name))) {
                const mana = player.getDynamicProperty("mana") ?? MAX_MANA;
                
                //Affichage de la barre de mana dans l'actionbar
                const totalBars = 20;
                const manaPercentage = mana / MAX_MANA;
                const filledBars = Math.round(totalBars * manaPercentage);
                const emptyBars = totalBars - filledBars;

                const barVisual = "§b" + "█".repeat(filledBars) + "§8" + "█".repeat(emptyBars);

                player.onScreenDisplay.setActionBar(`${barVisual} §f${Math.floor(mana)}/${MAX_MANA}`);
            }
        }
    }, 5);

    // Regénération par fiole de mana
    world.afterEvents.itemCompleteUse.subscribe((event) => {
        const { source: player, itemStack: item } = event;

        if (item.typeId === "combat:fiole_mana") {
            let currentMana = player.getDynamicProperty("mana");
            if (typeof currentMana !== "number") currentMana = MAX_MANA;

            const newMana = Math.min(MAX_MANA, currentMana + 25);

            player.setDynamicProperty("mana", newMana);  
            player.sendMessage("§a+25 ⚡ Énergie restaurée !");
        }
    });
    
}

/**
 * 
 * @param {import("@minecraft/server").Player} player 
 * @param {number} cost 
 */

export function checkMana(player, cost){
    let currentMana = player.getDynamicProperty("mana");
    if (typeof currentMana !== "number") currentMana = MAX_MANA;

    if (currentMana >= cost) {
        return true;
    } else {
        player.sendMessage(`§cPas assez d'énergie ! (Requis: ${cost}) ⚡`);
        player.dimension.playSound("note.bass", player.location); 
        return false;
    }

}

/**
 *
 * @param {import("@minecraft/server").Player} player 
 * @param {number} cost 

 */
export function consumeMana(player, cost) {
    let currentMana = player.getDynamicProperty("mana") ?? 100;
    player.setDynamicProperty("mana", currentMana - cost);  
}
