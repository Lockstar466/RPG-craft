import { world, system, EntityDamageCause } from "@minecraft/server";

const plungeData = new Map();

export function initGroundPound() {

    system.runInterval(() => {
        for(const player of world.getPlayers()) {
            if (!player.hasTag("test_2")) continue;

            let plunge = plungeData.get(player.id);
            if (!plunge) {
                plunge = { timer: 0, puissance: 1 };
                plungeData.set(player.id, plunge);
            }

            //--- PHASE DE CHUTE ---
            if (player.isGliding) {
                if(player.isSneaking) {
                    //player.sendMessage("test succes");
                    const fallForce = -0.05 - (plunge.timer * 0.005);
                    const impulseVector = {
                        x: 0,
                        y: fallForce,
                        z: 0
                    }
                    
                    const particleLoc = {
                        x: player.location.x,
                        y: player.location.y + 1,
                        z: player.location.z
                    }
                    
                    player.applyImpulse(impulseVector);

                    if (!player.hasTag("pounding")) player.addTag("pounding");
                    plunge.timer +=2;

                    if(plunge.timer >= 20) {
                        plunge.timer = 0;
                        plunge.puissance ++;
                    }

                    //player.sendMessage(`Time is: ${plunge.timer}`);

                    player.addEffect("resistance", 2, { amplifier: 255, showParticles: false });
                    player.dimension.spawnParticle("minecraft:campfire_smoke_particle", particleLoc);
                } 
                else if (!player.isSneaking && player.hasTag("pounding") ) {
                    player.removeTag("pounding");
                    plunge.timer = 0;
                    plunge.puissance=1;
                }

            }
            
            //--- IMPACT (KABOOM)---
//Applique les dégats et l'explosion eventuellement

            if (player.hasTag("pounding") && player.isOnGround) {
                player.removeTag("pounding");

                const finalPower = plunge.puissance;
                const finalTimer = plunge.timer;
                plunge.timer = 0;
                plunge.puissance = 1;

                if (finalPower ==1 && finalTimer <= 17) continue;
                
                const impactLoc = player.location;
                player.dimension.spawnParticle("minecraft:smash_ground_particle_center", impactLoc);

                const targets = player.dimension.getEntities({
                    location: impactLoc,
                    maxDistance: 6,
                    excludeNames: [player.name],
                    excludeFamilies: ["minecraft:inanimate"],
                    excludeTypes:["minecraft:item", "minecraft:xp_orb"]
                });
                

                for (const target of targets) {
                    const eLoc = target.location;
                    let dirX = eLoc.x - impactLoc.x;
                    let dirZ = eLoc.z - impactLoc.z;

                    const distance = Math.sqrt((dirX * dirX) + (dirZ * dirZ));
                    if (distance > 0) {
                        dirX /= distance;
                        dirZ /= distance;
                    }
                    
                    target.applyDamage(10, {cause: EntityDamageCause.maceSmash, damagingEntity: player});
                    target.applyKnockback(dirX, dirZ, 2.0, 1.0);
                }
                
                if(finalPower >= 3){
                    player.dimension.createExplosion(impactLoc, finalPower-1, {breaksBlocks: true, allowUnderwater: false, source:player});
                }
            }
        }
    },1);
}