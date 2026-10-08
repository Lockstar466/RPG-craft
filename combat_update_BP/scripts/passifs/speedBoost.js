/**
 * APTITUDE EN PHASE DE TEST.
 * DESCRIPTION: Initialisation avec l'objet speedData contennant le "timer" et le "tier" pour tout joueur qui possède le tag test_1.
 * Lorsque le joueur est en srpint, le timer s'active et compte le nombre de temps en course. Si le course est interrompue, "timer" et "tier" sont remis à 0.
 */

import { world, system } from "@minecraft/server";

const speedData = new Map();

export function initSpeedBoost() {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            
            if (!player.hasTag("test_1")) continue;

            const speedster = speedData.get(player.id) || { timer: 0, tier: 0 };
            
            if (!player.isSprinting) {
                if (speedster.tier > 0) player.removeEffect("speed");
                speedster.tier = 0;
                speedster.timer = 0;
                speedData.set(player.id, speedster);
                continue;
            }

            //Chaque 2 ticks -> speedster.timer+=2.
            speedster.timer += 2;

            if (speedster.timer >= 60) {
                speedster.timer = 0;
                
                if (speedster.tier < 4) {
                    speedster.tier++;
                    const boomLoc = { x: player.location.x, y: player.location.y + 1, z: player.location.z };
                    player.dimension.spawnParticle("minecraft:sonic_explosion", boomLoc);
                }
            }

            //Au bout de 3 secondes (60 ticks) on a speedster.tier++ -> amp pour augenter l'effet de vitesse. Lorsque speedster.tier >= 4, amp est bloqué à 4.
            if (speedster.tier > 0) {
                const amp = Math.min(speedster.tier, 4);
                player.addEffect("speed", 10, { amplifier: amp, showParticles: false });
            }

            //Lorsque la speedster.tier >= 4, le bloc sur lequel marche le joueur est enflammé 
            if (speedster.tier >= 4 ) {
                const currentLoc = player.location;
                const boostLoc = {
                    x: currentLoc.x + Math.random()*0.5,
                    y: currentLoc.y + 1.3,
                    z: currentLoc.z + Math.random()*0.5
                };
                
                player.dimension.spawnParticle("minecraft:basic_flame_particle", boostLoc);
                player.addEffect("fire_resistance", 10, { showParticles: false });
                
                const block = player.dimension.getBlock(currentLoc);
                if (block && block.isAir) {
                    block.setType("minecraft:fire");
                }
            }

            speedData.set(player.id, speedster);
        }
    }, 2);
}