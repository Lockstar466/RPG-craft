import { system } from "@minecraft/server";

const globalCooldown = new Map();

/**
 * 
 * @param {import("@minecraft/server").Player} player 
 * @param {string} abilityName 
 * @param {number} cooldownSecond 
 * @returns {boolean}
 */

export function checkCooldown (player, abilityName, cooldownSecond) {
    const currentTick = system.currentTick;
    const cooldownTick = cooldownSecond * 20;

    if(!globalCooldown.has(player.id)) return true;

    const playerCooldown = globalCooldown.get(player.id);
    const lastUse = playerCooldown.get(abilityName) || 0;
    const abilityExcludes = ["Wither wave", "Aura monster"];
    if (currentTick - lastUse < cooldownTick) {
        if (!abilityExcludes.some(name => abilityName.includes(name))){
            const remainingTick = cooldownTick - (currentTick - lastUse);
            const remainingSecond = Math.ceil(remainingTick / 20);
            player.sendMessage(`§e[${abilityName}] §cEn recharge pendant ${remainingSecond}s.`);
        }
        return false;
    }
    return true;
}

/**
 * 
 * @param {import("@minecraft/server").Player} player 
 * @param {string} abilityName
 */

export function useCooldown(player, abilityName){
    
    if(!globalCooldown.has(player.id)) {
        globalCooldown.set(player.id, new Map());
    }

    globalCooldown.get(player.id).set(abilityName, system.currentTick);    
}