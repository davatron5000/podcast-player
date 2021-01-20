import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.2.1/lit-element.js?module";

class PodcastPlayer extends LitElement {
  static get properties() {
    return {
      currentTime: { type: String },
      currentSpeedIdx: { type: Number },
      duration: { type: String },
    };
  }

  // TODO: Make styles optional? Easily overrideable?
  static get styles() {
    return css`
     .sr-only {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }

     .podcast-player {
        display: flex;
        gap: 0.5rem;
        width:100%;
        align-items: center;
        grid-gap: 0.5rem;
      }

      .podcast-player .progress {
        flex: 1;
      }

      .podcast-player button svg {
        width: 0.8em;
        height: 0.8em;
      }

      /* Speed */
      .podcast-player .button-speed:after {
        content: 'x';
      }

      /* Play/Pause */
      .button-play .pause {
        display: none;
      }

      :host(.is-playing) .button-play .pause {
        display: inline;
      }
      :host(.is-playing) .button-play .play {
        display: none;
      }

      /* Mute/Unmute */
      .button-mute .muted {
        display: none;
      }

      :host(.is-muted) .button-mute .muted {
        display: inline;
      }

      :host(.is-muted) .button-mute .unmuted {
        display: none;
      }
    `;
  }

  constructor() {
    super();

    // HTMLAudioElement
    this.audio = this.querySelector("audio");
    this.audio.controls = false; // remove controls if it has 'em

    this.speeds = [1, 1.25, 1.5, 1.75, 2];
    this.currentSpeedIdx = 0;
    this.currentTime = 0;
    this.duration = 0;

    this.audio.addEventListener("timeupdate", this.handleTimeUpdate.bind(this));
    this.audio.addEventListener(
      "loadedmetadata",
      this.handleLoadedMetadata.bind(this)
    );
    this.audio.addEventListener('ended', this.stop.bind(this))

    window.addEventListener(
      "DOMContentLoaded",
      this.timeJump.bind(this),
      false
    );
    window.addEventListener("hashchange", this.timeJump.bind(this), false);
  }

  handleLoadedMetadata() {
    this.duration = this.audio.duration;
  }

  handleTimeUpdate(e) {
    this.currentTime = this.audio.currentTime;
  }

  timeJump(event) {
    let params = new URLSearchParams(window.location.hash.substring(1));
    let t = params.get("t") || 0;

    console.log(window, params, t, event);

    var timestamp = this.parseTime(t);

    if (t) {
      // Preload the media
      this.audio.setAttribute("preload", "true");
      // Set the current time. Will update if playing. Will fail if paused.
      this.audio.currentTime = timestamp;
      // If the media is able to play, play.
      this.audio.addEventListener(
        "canplay",
        () => {
          /* only start the player if it is not already playing */
          if (!this.audio.paused) {
            return false;
          }

          this.audio.currentTime = timestamp;
          this.audio.play();
          this.classList.add("is-playing");
        },
        false
      );
    }
  }

  parseTime(str) {
    var plain = /^\d+(\.\d+)?$/g,
      npt = /^(?:npt:)?(?:(?:(\d+):)?(\d\d?):)?(\d\d?)(\.\d+)?$/,
      quirks = /^(?:(\d\d?)[hH])?(?:(\d\d?)[mM])?(\d\d?)[sS]$/,
      match;
    if (plain.test(str)) {
      return parseFloat(str);
    }
    match = npt.exec(str) || quirks.exec(str);
    if (match) {
      return (
        3600 * (parseInt(match[1], 10) || 0) +
        60 * (parseInt(match[2], 10) || 0) +
        parseInt(match[3], 10) +
        (parseFloat(match[4]) || 0)
      );
    }
    return 0;
  }

  toHHMMSS(totalsecs) {
    var sec_num = parseInt(totalsecs, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    hours = hours > 0 ? hours + ":" : "";
    minutes = minutes + ":";

    var time = hours + minutes + seconds;
    return time;
  }

  changeSpeed() {
    this.currentSpeedIdx =
      this.currentSpeedIdx + 1 < this.speeds.length
        ? this.currentSpeedIdx + 1
        : 0;
    this.audio.playbackRate = this.speeds[this.currentSpeedIdx];
  }

  mute() {
    this.audio.muted = !this.audio.muted;
    this.classList.toggle("is-muted", this.audio.muted);
  }

  play() {
    if (this.audio.paused) {
      console.log(this.currentTime, this.audio.currentTime);
      this.audio.play();
    } else {
      this.audio.pause();
    }
    this.classList.toggle("is-playing", !this.audio.paused);
  }

  stop() {
    this.classList.toggle("is-playing", !this.audio.paused);
  }

  rewind() {
    this.audio.currentTime -= 30;
  }

  ff() {
    this.audio.currentTime += 30;
  }

  seek(e) {
    this.audio.currentTime = e.target.value;
  }

  render() {
    // TODO: Make icons, button text, button labels overrideable?
    return html`
      <slot></slot>
      <svg style="display: none;">
        <symbol id="icon-play" viewBox="0 0 30.406 46.843">
          <path
            class="cls-1"
            d="M977.571,603.068l-2.828-2.4,2.828-2.4,2.828,2.4Zm-3.535,3-2.829-2.4,2.829-2.4,2.828,2.4Zm-3.536,3-2.828-2.4,2.828-2.4,2.828,2.4Zm10.607-9.01-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.829,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.829,2.4Zm-17.677,9.01-2.829-2.4,2.829-2.4,2.828,2.4Zm-3.536,3-2.828-2.4,2.828-2.4,2.828,2.4Zm7.071-6.006-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.829,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm-17.678,9.01-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.829,2.4ZM970.5,591.055l-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm-10.607,3-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm3.535-3-2.828-2.4,2.828-2.4,2.828,2.4Zm-7.071,0-2.828-2.4,2.828-2.4,2.828,2.4Zm3.536-3-2.829-2.4,2.829-2.4,2.828,2.4Zm21.213,12.013-2.829-2.4,2.829-2.4,2.828,2.4Zm-3.536-3-2.828-2.4,2.828-2.4,2.829,2.4Zm-3.535-3-2.829-2.4,2.829-2.4,2.828,2.4Zm-3.536-3-2.828-2.4,2.828-2.4,2.829,2.4Zm-3.535-3-2.829-2.4,2.829-2.4,2.828,2.4Zm-3.536-3-2.828-2.4,2.828-2.4,2.828,2.4Zm-3.535-3-2.829-2.4,2.829-2.4,2.828,2.4Zm-3.536-3-2.828-2.4,2.828-2.4,2.828,2.4Zm0,6.007-2.828-2.4,2.828-2.4,2.828,2.4Z"
            transform="translate(-967.656 -562.219)"
          />
        </symbol>
        <symbol id="icon-pause" viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M4 4 H12 V28 H4 z M20 4 H28 V28 H20 z "
          ></path>
        </symbol>
        <symbol id="icon-rewind" viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M4 4 H8 V14 L28 4 V28 L8 18 V28 H4 z "
          ></path>
        </symbol>
        <symbol id="icon-speaker-unmuted" viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M2 12 L8 12 L16 6 L16 26 L8 20 L2 20 z M32 16 A16 16 0 0 1 27.25 27.375 L25.25 25.25 A13 13 0 0 0 29 16 A13 13 0 0 0 25.25 6.75 L27.25 4.625 A16 16 0 0 1 32 16 M25 16 A9 9 0 0 1 22.375 22.375 L20.25 20.25 A6 6 0 0 0 22 16 A6 6 0 0 0 20.25 11.75 L22.375 9.625 A9 9 0 0 1 25 16  "
          ></path>
        </symbol>
        <symbol id="icon-speaker-muted" viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M2 12 L8 12 L16 6 L16 26 L8 20 L2 20 z  "
          ></path>
        </symbol>
      </svg>

      <div class="podcast-player">
        <button
          class="button-rewind"
          aria-label="Rewind 30 seconds"
          style="grid-area: rewind"
          @click="${this.rewind}"
        >
          30<br /><<&mdash;
        </button>

        <button class="button-play" aria-label="Play" style="grid-area: play" @click="${this.play}">
          <svg class="play"><use xlink:href="#icon-play"></use></svg>
          <svg class="pause"><use xlink:href="#icon-pause"></use></svg>
        </button>

        <button
          class="button-ff"
          aria-label="Fast Forward 30 seconds"
          style="grid-area: ff"
          @click="${this.ff}"
        >
          30<br />&mdash;>>
        </button>

        <div style="grid-area: currenttime">
          <span class="sr-only">Current Time</span>
          <span class="currenttime time" >${this.toHHMMSS(this.currentTime)}</span>
        </div>

        <input
          type="range"
          class="progress"
          value="${this.currentTime}"
          max="${this.duration}"
          style="grid-area: progress"
          @change="${this.seek}"
        />

        <div style="grid-area: duration">
          <span class="sr-only">Duration</span>
          <span class="duration time">${this.toHHMMSS(this.duration)}</span>
        </div>

        <button class="button-speed"  style="grid-area: speed" @click="${this.changeSpeed}">
          ${this.speeds[this.currentSpeedIdx]}
        </button>

        <button class="button-mute" aria-label="Mute"  style="grid-area: mute" @click="${this.mute}">
          <svg class="unmuted">
            <use xlink:href="#icon-speaker-unmuted"></use>
          </svg>
          <svg class="muted"><use xlink:href="#icon-speaker-muted"></use></svg>
        </button>
      </div>
    `;
  }
}

customElements.define("podcast-player", PodcastPlayer);
