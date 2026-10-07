import { initRadar } from "./radar";
import { initThunder } from "./thunder";
import { initTpArrows } from "./TParrow";
import { initSonicBoom } from "./wardenBlast";

export function loadArcher(){
    initRadar();
    initTpArrows();
    initThunder();
    initSonicBoom ();
    console.warn("Archery complete!");
}