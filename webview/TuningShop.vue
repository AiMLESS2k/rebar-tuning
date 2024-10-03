<script lang="ts" setup>
import { useEvents } from '../../../../webview/composables/useEvents';
import { ref, toRaw } from 'vue';
import { tuningShopEvents } from '../shared/events';

const events = useEvents();

/* Reactive variable to store vehicle mods */
const vehicleMods = ref([]);
const originalMods = ref<any[]>([]);

/* Handle the incoming mods event */
events.on(tuningShopEvents.toWebview.sendVehicleMods, (mods: any[]) => {
    vehicleMods.value = mods; /* Store the mods in the reactive variable */

    // Save the original mod values (deep copy)
    originalMods.value = mods.map(mod => ({ ...mod }));
});

/* Function to decrease mod value */
const decreaseModValue = (mod: any) => {
    if (mod.modValue > 0) {
        mod.modValue--; /* Decrement the mod value, but not below 0 */
        logAndSendModChange(mod);
    }
};

/* Function to increase mod value */
const increaseModValue = (mod: any) => {
    if (mod.modValue < mod.modsCount) {
        mod.modValue++; /* Increment the mod value, but not above modsCount */
        logAndSendModChange(mod);
    }
};

/* Function to log the mod value change */
const logAndSendModChange = (mod: any) => {
    const originalMod = originalMods.value.find((orig: any) => orig.modType === mod.modType);

    /* Log and send the modValue change */
    if (originalMod && originalMod.modValue !== mod.modValue) {
        
        /* Send modType and modValue to the server */
        events.emitServer(tuningShopEvents.toServer.previewMods, { modType: mod.modType, modIndex: mod.modValue });
    }
}

/* Function to handle the cancel action */
const cancelMenu = () => {

    /* use toRaw to strip the proxy */
    const plainOriginalMods = toRaw(originalMods.value);

    /* Emit an event with the original mods to the server to revert changes */
    events.emitServer(tuningShopEvents.toServer.cancelMenu, plainOriginalMods);
};

/* Function to handle the save action */
const saveAndCloseMenu = () => {

    /* use toRaw to strip the proxy */
    const plainVehicleMods = toRaw(vehicleMods.value);
    /* Emit an event to the server to save changes and close the menu */
    events.emitServer(tuningShopEvents.toServer.saveMods, JSON.stringify(vehicleMods.value));
};

</script>

<template>
    <div class="flex h-screen w-screen overflow-hidden text-white">
        <div class="flex flex-col gap-3 p-3">
            <!-- Mods Section -->
            <div class="flex max-h-full flex-col gap-3 rounded-lg bg-neutral-950 bg-opacity-70 p-3 pb-4 shadow-lg overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                <!-- Loop through each mod -->
                <div v-for="(mod, index) in vehicleMods" :key="index" class="flex flex-col items-center outline outline-1 w-52 p-2 outline-slate-300 font-bold text-sm">
                    <!-- Display the mod -->
                    <span class="text-slate-300">ModType: {{ mod.modSlotName }}</span>
                    <div class="flex flex-row items-center justify-center p-2">
                        <!-- Decrease Button -->
                        <button @click="decreaseModValue(mod)" class="bg-transperent text-slate-300 font-bold py-1 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                            </svg>
                        </button>
                        <!-- Input showing the current mod value -->
                        <input type="number" :value="mod.modValue" readonly id="modIndex" class="bg-transparent text-slate-100 text-sm block w-full py-1 px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" />
                        <!-- Increase Button -->
                        <button @click="increaseModValue(mod)" class="bg-transperent text-slate-300 font-bold py-1 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex flex-row items-center w-full">
                <!-- Cancel button -->
                <button @click="cancelMenu" type="button" class="w-1/2 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">Cancel</button>
                <!-- Save Button -->
                <button @click="saveAndCloseMenu" type="button" class="w-1/2 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Save</button>
            </div>
        </div>
    </div>
</template>
