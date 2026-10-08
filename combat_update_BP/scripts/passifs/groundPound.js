/**
 * APTITUDE EN PHASE DE TEST.
 * DESCRIPTION: En vol en elytra, le joueur possédant le tag "test_2" appuie sur la touche shift ou sneak pour faire une attaque plongeante 
 * qui génère en fonction du temps de chute et de la distance, une explosion et des dégats de zone.
 * initGroundPound() : introduction de l'objet plungeData qui possède la donnée du joueur, le temps de chute(initialisée à 0) et la puissance(initialisée à 1) détecte que le joueur en en vol.
 * Si la touche "sneak" est enfoncée et est en vol, le compteur démarre et un tag est attribué.
 * Lorsque le compteur compte 20 tick (1s), il est réinitialisé et la puissance est élevé à +1.
 * Si la touche "sneak" est relachée, le compteur s'arrête et le joueur perd le tag lui conférant la capacité de chute.
 * Perte du tag, remise des compteurs à 0 et 1.
 */

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
/**
 * Lorsque le joueur touche le sol, l'effet de resistance se termine et les variables plunge.puissance et plunge.timer sont sauvegardées dans finalPower et finalTimer.
 * Des dégats sont inflgés aux entités (sauf le joueur lui même), applique une explosion proportionnelle à la puissance si elle st supérieure à 3.
 */

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