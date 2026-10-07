import { world, system } from "@minecraft/server";
import { checkMana, consumeMana } from "../../utils/mana_manager";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";

export function initFangs() {
    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item} = event;
        const atkCost = 10;
        const ICD = 5;
        const weapons = ["sword", "axe"];

        if (!player.hasTag("tank") || !player.hasTag("spark")) return;

        if(item && weapons.some(type => item.typeId.includes(type))){
            if( checkCooldown(player, "Dévoreur", ICD) && checkMana(player,atkCost)){
                useCooldown(player, "Dévoreur");
                consumeMana(player, atkCost);
                
                player.dimension.playSound("mob.evocation_fang.attack", player.location);
                player.sendMessage("§bDévoreur !")

                const viewDir = player.getViewDirection();
                const startLoc = player.location;

                for(let i=1; i<=6; i++){
                    const fangloc = {
                        x: startLoc.x + (viewDir.x*i*1.5),
                        y: startLoc.y,
                        z: startLoc.z + (viewDir.z*i*1.5)
                    };

                system.runTimeout(() => {
                    player.dimension.runCommand(`summon evocation_fang ${fangloc.x} ${fangloc.y} ${fangloc.z}`)
                }, i*2 );
            }
            }
        }
    })
}