import { initBlackHole } from "./blackHole";
import { initInvisibility } from "./invisTotal";
import { initMysteryEntity } from "./randomMob";
import { initSwitch } from "./switch";

export function loadTroll () {
    initInvisibility();
    initSwitch();
    initMysteryEntity();
    initBlackHole();
    console.warn("Troll complete !");
}