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

            speedster.timer += 2;

            if (speedster.timer >= 60) {
                speedster.timer = 0;
                
                if (speedster.tier < 4) {
                    speedster.tier++;
                    const boomLoc = { x: player.location.x, y: player.location.y + 1, z: player.location.z };
                    player.dimension.spawnParticle("minecraft:sonic_explosion", boomLoc);
                }
            }

            if (speedster.tier > 0) {
                const amp = Math.min(speedster.tier, 4);
                player.addEffect("speed", 10, { amplifier: amp, showParticles: false });
            }

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