import { world, system } from "@minecraft/server";
import { useCooldown, checkCooldown } from "../../utils/cooldown_manager";
import { consumeMana, checkMana } from "../../utils/mana_manager";

export function initThunder () {

    world.afterEvents.itemUse.subscribe((event) => {
        const {source: player, itemStack: item } = event;
        const atkCost = 25;
        const ICD = 10;

        if (player.hasTag("archer") && player.hasTag("spark")) {
            if(item && item.typeId === "combat:thunder"){
                if ( checkCooldown(player, "Flèche de foudre", ICD) && checkMana(player, atkCost) ){
                    useCooldown(player, "Flèche de foudre");
                    consumeMana(player, atkCost);
                    player.addTag("thunder_charged");
                    player.sendMessage("§eFlèche de foudre chargée !");
                    player.dimension.playSound("beacon.power", player.location);
                }
            }
        }
    })

    world.afterEvents.projectileHitBlock.subscribe((event) => {
        const {projectile: arrow, source: shooter, location:hitLoc } = event;

        if (arrow.typeId === "minecraft:arrow" && shooter && shooter.hasTag("thunder_charged")){
            shooter.removeTag("thunder_charged");

            arrow.dimension.runCommand(`summon lightning_bolt ${hitLoc.x} ${hitLoc.y} ${hitLoc.z}`);
            arrow.remove();
        }
    })
    
    world.afterEvents.projectileHitEntity.subscribe((event) => {
        const {projectile: arrow, source: shooter, location:hitLoc} = event;
        const target = event.getEntityHit().entity;

        if (arrow.typeId === "minecraft:arrow" && shooter && shooter.hasTag("thunder_charged")){
            shooter.removeTag("thunder_charged");

            shooter.dimension.runCommand(`summon lightning_bolt ${hitLoc.x} ${hitLoc.y} ${hitLoc.z}`);
        }
    })
}