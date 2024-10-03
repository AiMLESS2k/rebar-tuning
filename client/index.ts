import * as alt from 'alt-client';
import * as natives from 'natives';

import { useWebview } from '@Client/webview/index.js';
import { useClientApi } from '@Client/api/index.js';
import { tuningShopEvents } from '../shared/events.js';

/* Get the CameraAPI through Rebar's Plugin API-System */
const CameraAPI = await useClientApi().getAsync("ascended-camera-api");
const webview = useWebview();

webview.on("CAMERA_MOVE_START", CameraAPI.cameraMoveStart);
webview.on("CAMERA_MOVE_END", CameraAPI.cameraMoveEnd);
webview.on("CAMERA_SCROLL_UP", CameraAPI.cameraMoveIn);
webview.on("CAMERA_SCROLL_DOWN", CameraAPI.cameraMoveOut);

async function handleCamera(value: boolean) {
    CameraAPI.onMovementControl(value); /* false = start | true = end? */
}

alt.onServer(tuningShopEvents.toClient.handleCamera, handleCamera);