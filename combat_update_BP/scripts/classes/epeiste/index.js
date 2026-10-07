import { initPhysic } from "./bleeding";
import { initIntimidation } from "./intimidation";
import { initFangs } from "./machoires";
import { initShockWave } from "./onde_choc";

export function loadEpeiste() {
    initShockWave();
    initFangs();
    initPhysic ();
    initIntimidation();
    console.warn("Chevalery complete !");
}