import { videoManager } from './videoManager';
import { ImmersivePlayer } from './immersive';
import { init, uiReady } from "@Synamedia/hs-sdk";
import shaka from 'shaka-player';

let immersivePlayer;
const VIDEO_URL = 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd';

window.addEventListener('load', async () => {
  try {
    await init();

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true;
    document.body.appendChild(video);

    immersivePlayer = new ImmersivePlayer(video);
    await videoManager.init(immersivePlayer);

    await videoManager.load(VIDEO_URL);
    videoManager.moveToBackground();

    uiReady();

  } catch (error) {
    console.error('Senza SDK initialization or video loading failed:', error);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    videoManager.toggleBackground();
  } else if (immersivePlayer) {
    immersivePlayer.handleKeyDown(event);
  }
});
