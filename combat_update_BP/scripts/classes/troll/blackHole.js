import { world, system } from "@minecraft/server";
import { checkCooldown, useCooldown } from "../../utils/cooldown_manager";
import { checkMana, consumeMana } from "../../utils/mana_manager";

const atkCost = 60;
const ICD = 180;
const abilityname = "DOOM";
const summonDistance = 20;
const blackHoleRange = 17;

export function initBlackHole() {
    world.beforeEvents.itemUse.subscribe((event) => {
        const { source: player, itemStack: item } = event;

        if(player.hasTag("troll") && player.hasTag("spark")) {
            if (item && item.typeId == "combat:doom") {
                if ( checkCooldown(player, abilityname, ICD) && checkMana(player, atkCost)) {
                    
                    const rayCastHit = player.getBlockFromViewDirection({maxDistance: summonDistance, includeLiquidBlocks: true, includePassableBlocks: true});
                    let origin;
                    
                    if (rayCastHit) {
                        origin = {
                            x: rayCastHit.block.location.x,
                            y: rayCastHit.block.location.y + 2,
                            z:rayCastHit.block.location.z
                        }
                    } else {
                        const playerHead= player.getHeadLocation();
                        const playerView = player.getViewDirection();
                        origin = {
                            x: playerHead.x + (playerView.x * summonDistance),
                            y: playerHead.y + (playerView.y * summonDistance),
                            z: playerHead.z + (playerView.z * summonDistance)
                        }; 
                    }
                    
                    consumeMana(player, atkCost);
                    useCooldown(player, abilityname);
                    
                    for (const player of world.getPlayers()) {
                        player.sendMessage("§l§4DOOM§r");
                    }

                    let durationTick = 300;
                    let angle = 0;
                    
                    system.run(() => {
                        player.dimension.playSound("beacon.activate", origin, {pitch: 0.3, volume: 4});
                    });
                    
                    const blackHole = system.runInterval(() => {
                        if (durationTick<=0) {
                            system.clearRun(blackHole);
                            player.dimension.playSound("beacon.deactivate", origin, {pitch: 0.3, volume: 4});
                            return;
                        }
                        
//==========================================================================================
//it's black hole time                    
                    angle += 0.4;

                    for (let i=0; i<20; i++) {
                    
                        const u = Math.random();                    
                        const v = Math.random();                    
                        const theta = u * 2.0 * Math.PI; //[0;2PI]                    
                        const phi = Math.acos(2.0 * v - 1.0); //[-PI/2;PI/2]                    
                        const rayonNoyau = 2.0; // Taille de la boule noire                    
                        
                        //Equation paramétrique d'une sphère de centre origin.x/y/z et de rayon R= rayonNoyau
                        const sphereLoc = {
                            x: origin.x + (rayonNoyau * Math.sin(phi) * Math.cos(theta)),
                            y: origin.y + (rayonNoyau * Math.cos(phi)),
                            z: origin.z + (rayonNoyau * Math.sin(phi) * Math.sin(theta))
                        };
                     
                        player.dimension.spawnParticle("minecraft:sculk_soul_particle", sphereLoc);
                 
                    }
                
                    for (let rayonDisque = 3; rayonDisque <= 11; rayonDisque++) {
                    
                        const spiralAngle = angle - (rayonDisque * 0.4);
                    
                        for (let i = 0; i < 3; i++) {
                        
                            const offsetAngle = spiralAngle + (i * ((Math.PI * 2) / 3));
                        
                            const diskLoc = {
                            x: origin.x + (Math.cos(offsetAngle) * rayonDisque),  
                            y: origin.y, // On garde Y fixe pour avoir un disque parfaitement plat
                            z: origin.z + (Math.sin(offsetAngle) * rayonDisque)
                            };
                  
                            if (Math.random() > 0.2) {
                                player.dimension.spawnParticle("minecraft:endrod", diskLoc);
                            } else {
                                player.dimension.spawnParticle("minecraft:sculk_charge_particle", diskLoc);
                            }
                        }  
                    }
//==========================================================================================

                        const targets = player.dimension.getEntities({
                            location: origin,
                            maxDistance: blackHoleRange
                        })

                        for (const target of targets) {
                            const dx = origin.x - target.location.x;
                            const dy = origin.y - target.location.y;
                            const dz = origin.z - target.location.z;

                            const vecteurForce = {
                                x: dx* 0.1,
                                y: dy* 0.1,
                                z: dz* 0.1
                            }

                            target.applyImpulse(vecteurForce);
                            
                            const distanceCarre = (dx * dx) + (dy * dy) + (dz * dz); //Distance² = x² + y² + z² dans un espace 3D (norme du vecteur)

                            if(
                                (distanceCarre <= 8.0)
                            ) {
                                target.applyDamage(6);
                            }
                            
                        }
                        durationTick-=2;
                        
                    }, 2)


                } else {
                    event.cancel = true;
                }
            }
        }
    })
}
