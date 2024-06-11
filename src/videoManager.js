import { remotePlayer, lifecycle } from '@Synamedia/hs-sdk';

class VideoManager {
  init(player) {
    this.localPlayer = player;
    this.remotePlayer = remotePlayer;

    this.remotePlayer.addEventListener('timeupdate', () => {
      this.media().currentTime = this.remotePlayer.currentTime || 0;
    });

    this.remotePlayer.addEventListener('ended', () => {
      lifecycle.moveToForeground();
    });

    lifecycle.addEventListener('onstatechange', (event) => {
      if (event.state === 'background') {
        this.pause();
      } else if (event.state === 'foreground') {
        this.play();
      }
    });
  }

  async load(url) {
    await this.localPlayer.load(url);
    try {
      await this.remotePlayer.load(url);
    } catch (error) {
      console.log("Couldn't load remote player.", error);
    }
  }

  media() {
    return this.localPlayer.getMediaElement();
  }

  play() {
    this.media().play();
  }

  pause() {
    this.media().pause();
  }

  playPause() {
    if (this.media().paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  skip(seconds) {
    this.media().currentTime += seconds;
  }

  moveToForeground() {
    lifecycle.moveToForeground();
    if (this.remotePlayer) {
      this.remotePlayer.pause();
    }
  }

  moveToBackground() {
    let currentTime = this.media().currentTime;
    if (this.remotePlayer) {
      this.remotePlayer.currentTime = currentTime;
      this.remotePlayer.play();
    }
  }

  async toggleBackground() {
    const currentState = await lifecycle.getState();
    if (currentState === 'background' || currentState === 'inTransitionToBackground') {
      this.moveToForeground();
    } else {
      this.moveToBackground();
    }
  }
}

export const videoManager = new VideoManager();
