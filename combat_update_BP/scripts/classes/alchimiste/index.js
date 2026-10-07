import { initMorph } from "./morph";
import { initMorph2 } from "./morph2";
import { initPotionMenu } from "./potion_menu";
import { initSpiderShot } from "./webShot";
import { initWither } from "./wither_blast";

export function loadAlchimiste () {

    initPotionMenu();
    initWither();
    initSpiderShot();
    initMorph();
    initMorph2();

    console.warn("Alchemy complete!");
}