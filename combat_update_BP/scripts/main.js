import { loadAlchimiste } from "./classes/alchimiste/index";
import { loadArcher } from "./classes/archer/index";
import { loadEpeiste } from "./classes/epeiste/index";
import { loadTroll } from "./classes/troll/index";
import { intiPassive } from "./passifs/index.js";
import { getSpark, removeClass, removeSpark } from "./utils/getSpark";
import {initManaSystem} from "./utils/mana_manager";


getSpark();
removeSpark();
removeClass();
initManaSystem();
loadEpeiste();
loadArcher();
loadAlchimiste();
loadTroll();
intiPassive();