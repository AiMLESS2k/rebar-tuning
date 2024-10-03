import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useMessenger } from '@Server/systems/messenger.js';

import { modSlotNames, VehicleModData } from './src/VehicleModData.js';
import { tuningShopEvents } from '../shared/events.js';
import { BlipColor } from '@Shared/types/blip.js';
import shopLocations from '../shared/locations.js';

const Rebar = useRebar();
const Messenger = useMessenger();

for (let i = 0; i < shopLocations.length; i++) {
    const locations = shopLocations[i];

    const tuningCol = Rebar.controllers.useInteraction(new alt.ColshapeCircle(locations.x, locations.y, 4), 'vehicle');

    const tuningBlip = Rebar.controllers.useBlipGlobal({
        pos: locations,
        color: BlipColor.DARK_PURPLE,
        sprite: 446,
        shortRange: true,
        text: 'Los Santos Customs',
        scale: 0.8,
    });
    
    tuningCol.on(openMenu);
    tuningCol.setMessage('enter', `Press 'E' to open shop`);
}

function getVehicleMods(vehicle: alt.Vehicle): VehicleModData[] {
    const vehicleMods: VehicleModData[] = [];

    for(let modType = 0; modType < 68; modType++) {
        const modValue = vehicle.getMod(modType);
        const modsCount = vehicle.getModsCount(modType);

        if (modsCount > 0) {
            vehicleMods.push({
                modType,
                modValue,
                modsCount,
                modSlotName: modSlotNames[modType] || 'Unknown Mod Slot'
            });
        }
    }

    return vehicleMods;
}

function openMenu(player: alt.Player) {
    const webview = Rebar.player.useWebview(player);
    const pVehicle = player.vehicle;

    webview.show('TuningShop', 'page', false);
    webview.emit(tuningShopEvents.toWebview.sendVehicleMods, getVehicleMods(pVehicle));
    player.emit(tuningShopEvents.toClient.handleCamera, false);

}

function previewMods(player: alt.Player, modData) {
    const pVehicle = player.vehicle;
    const { modType, modIndex } = modData;

    pVehicle.setMod(modType, modIndex);
}

function cancelMenu(player: alt.Player, originalMods) {
    const pVehicle = player.vehicle;
    const webview = Rebar.player.useWebview(player);

    originalMods.forEach((mod) => {
        pVehicle.setMod(mod.modType, mod.modValue);
    });

    webview.hide('TuningShop');
    player.emit(tuningShopEvents.toClient.handleCamera, true);
}

/* Credits to @koboling. for this function */
function saveVehicleMods(player: alt.Player, vehicleMods: { modType: number, modValue: number }[]) {
    const pVehicle = player.vehicle;
    const document = Rebar.document.vehicle.useVehicle(pVehicle);
    const webview = Rebar.player.useWebview(player);

    if (!document.get()) {
        return;
    }

    const mods: { [key: string]: number } = {};

    for (let i = 0; i < 70; i++) {
        const modValue = pVehicle.getMod(i);
        if (modValue !== -1) {
            mods[i] = modValue;
        }
    }

    document.set('mods', mods);
    webview.hide('TuningShop');
    player.emit(tuningShopEvents.toClient.handleCamera, true);
}

alt.onClient(tuningShopEvents.toServer.previewMods, previewMods);
alt.onClient(tuningShopEvents.toServer.cancelMenu, cancelMenu);
alt.onClient(tuningShopEvents.toServer.saveMods, saveVehicleMods);