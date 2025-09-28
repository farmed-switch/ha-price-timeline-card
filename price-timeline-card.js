import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module";

import en from "./localize/en.js";
import de from "./localize/de.js";
import es from "./localize/es.js";
import fr from "./localize/fr.js";

const languages = { en, de, es, fr };

function localize(key, lang) {
  return languages[lang]?.[key] || languages["en"][key] || key;
}

class PriceTimelineCard extends LitElement {
    
  static get properties() {
    return {
      config: {},
      theme: { type: String },
      selectedHour: { type: Number },
    };
  }
  
  set hass(hass) {
    this._hass = hass;

      this._lang =
        hass?.locale?.language ||
        hass?.language ||
        "en";
    
      this.requestUpdate(); 
    }
  

  static get styles() {
    return css`
      :host {
        --color-bg-light: #fff;
        --color-text-light: #000;
        --color-subtle-light: #666;
        --color-dot-light: #656c72;
        --color-orange-light: #ff832d;
        --color-turquoise-light: #1dbfac;

        --color-bg-dark: #1e1e1e;
        --color-text-dark: #f5f5f5;
        --color-subtle-dark: #aaa;
        --color-dot-dark: #999;
        --color-orange-dark: #ff832d;
        --color-turquoise-dark: #1dbfac;

        --card-bg: var(--color-bg-light);
        --card-text: var(--color-text-light);
        --card-subtle: var(--color-subtle-light);
        --card-dot: var(--color-dot-light);
        --orange: var(--color-orange-light);
        --turquoise: var(--color-turquoise-light);
      }

      ha-card {
        background: var(--card-bg);
        padding: 16px;
        font-family: sans-serif;
        color: var(--card-text);
        text-align: center;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .header-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
      }

      .time {
        font-size: 14px;
        color: var(--card-subtle);
        line-height: 1.1;
        margin: 0;
      }

      .price {
        font-size: 24px;
        font-weight: bold;
        color: var(--card-text);
        line-height: 1.1;
        margin-top: 3px;
        display: flex;
        align-items: baseline;
        justify-content: center;
      }

      .price .value {
        font-size: 28px;
        font-weight: 800;
      }

      .price .unit {
        font-size: 14px;
        font-weight: normal;
        margin-left: 6px;
        color: var(--card-text);
      }

      .label {
        font-size: 14px;
        color: var(--card-subtle);
      }

      .timeline {
        display: flex;
        margin: 8px 0;
        height: 6px;
        border-radius: 5px;
        overflow: visible;
        position: relative;
      }

      .slot {
        flex: 1;
        opacity: 1;
        position: relative;
      }

      .slot.marker::after {
        content: "";
        position: absolute;
        top: 50%;
        left: calc(var(--progress, 0) * 100%);
        transform: translate(-50%, -50%);
        width: 3px;
        height: 14px;
        background: inherit;
        border: 2px solid var(--card-bg);
        border-radius: 10px;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
      }

      .faded {
        opacity: 0.3;
      }

      .scale {
        display: grid;
        grid-template-columns: repeat(25, 1fr);
        font-size: 12px;
        color: var(--card-subtle);
        margin-top: 6px;
        width: calc(100% + (100% / 24));
        margin-left: calc(-0.5 * (100% / 24));
        margin-right: calc(-0.5 * (100% / 24));
      }

      .scale .tick {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .scale .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--card-dot);
        margin-bottom: 4px;
      }

      .scale .dot.faded {
        opacity: 0.4;
      }

      .scale .hour {
        font-variant-numeric: tabular-nums;
        text-align: center;
      }

      /* Kreis-Ansicht */
      .circle-container {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto;
      }

      svg {
        transform: rotate(-90deg);
      }

      .circle-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      .circle-text .value {
        font-size: 28px;
        font-weight: bold;
        color: var(--card-text);
      }

      .circle-text .unit {
        font-size: 16px;
        margin-left: 4px;
        color: var(--card-text);
      }

      .circle-text .time {
        font-size: 14px;
        color: var(--card-subtle);
        margin-top: 4px;
      }

      .slider-container {
        margin-top: 16px;
      }

      input[type="range"] {
  -webkit-appearance: none; /* Standarddarstellung weg */
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: var(--primary-color); /* Home Assistant Theme Farbe */
  outline: none;
  opacity: 0.9;
  transition: background 0.3s;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--slider-color, var(--accent-color)); /* Theme-Farbe */
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--slider-color, var(--accent-color));
  cursor: pointer;
}
    `;
  }

  setConfig(config) {
    if (!config.price) throw new Error(localize("missing_price", "en"));
    if (!config.average) throw new Error(localize("missing_average", "en"));
    this.config = config;
    this.theme = config.theme || "light";
  }

  _onSliderChange(ev) {
    this.selectedHour = parseInt(ev.target.value, 10);
  }

  render() {
    if (!this._hass) return html``;
    const lang = this._lang;

    // Theme setzen
    switch (this.theme) {
      case "dark":
        this.style.setProperty("--card-bg", "var(--color-bg-dark)");
        this.style.setProperty("--card-text", "var(--color-text-dark)");
        this.style.setProperty("--card-subtle", "var(--color-subtle-dark)");
        this.style.setProperty("--card-dot", "var(--color-dot-dark)");
        this.style.setProperty("--orange", "var(--color-orange-dark)");
        this.style.setProperty("--turquoise", "var(--color-turquoise-dark)");
        break;

      case "theme":
        this.style.setProperty("--card-bg", "var(--ha-card-background, var(--card-background-color))");
        this.style.setProperty("--card-text", "var(--primary-text-color)");
        this.style.setProperty("--card-subtle", "var(--secondary-text-color)");
        this.style.setProperty("--card-dot", "var(--divider-color)");
        this.style.setProperty("--orange", "var(--accent-color)");
        this.style.setProperty("--turquoise", "var(--state-icon-color)");
        break;

      default: // light
        this.style.setProperty("--card-bg", "var(--color-bg-light)");
        this.style.setProperty("--card-text", "var(--color-text-light)");
        this.style.setProperty("--card-subtle", "var(--color-subtle-light)");
        this.style.setProperty("--card-dot", "var(--color-dot-light)");
        this.style.setProperty("--orange", "var(--color-orange-light)");
        this.style.setProperty("--turquoise", "var(--color-turquoise-light)");
    }

    const entity = this._hass.states[this.config.price];
    const avgEntity = this._hass.states[this.config.average];

    if (!entity || !entity.attributes.data) {
      return html`<ha-card><div>${localize("no_data", lang)}</div></ha-card>`;
    }

    const allData = entity.attributes.data;
    const today = new Date();
    const data = allData.filter((item) => {
      const start = new Date(item.start_time);
      return (
        start.getFullYear() === today.getFullYear() &&
        start.getMonth() === today.getMonth() &&
        start.getDate() === today.getDate()
      );
    });

    const avg = parseFloat(avgEntity.state);
    const now = new Date();
    const currentHour = now.getHours();
    const minutes = now.getMinutes();
    const hourProgress = minutes / 60;

    // aktuelle oder ausgewählte Stunde
    const hourToShow = this.config.slider ? (this.selectedHour ?? currentHour) : currentHour;

    const currentPrice = data[hourToShow].price_per_kwh;
    const formattedPrice = (currentPrice * 100).toFixed(0);

    const minPrice = Math.min(...data.map((d) => d.price_per_kwh));
    const maxPrice = Math.max(...data.map((d) => d.price_per_kwh));

    const rawRatio = (currentPrice - minPrice) / (maxPrice - minPrice || 1);
    const ratio = 0.05 + rawRatio * 0.9;

    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - ratio);

    const circleColor = currentPrice > avg ? "var(--orange)" : "var(--turquoise)";
    const timeLabel = `${String(hourToShow).padStart(2, "0")}:00-${String((hourToShow + 1) % 24).padStart(2, "0")}:00`;

    // Circle-Ansicht
    if (this.config.timeline === false) {
      return html`
        <ha-card>
          <div class="circle-container">
            <svg width="150" height="150">
              <circle
                cx="75"
                cy="75"
                r="${radius}"
                stroke="var(--card-dot)"
                stroke-width="10"
                fill="none"
                opacity="0.2"
              ></circle>
              <circle
                cx="75"
                cy="75"
                r="${radius}"
                stroke="${circleColor}"
                stroke-width="10"
                fill="none"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                stroke-linecap="round"
              ></circle>
            </svg>
            <div class="circle-text">
              <div class="price">
                <span class="value">${formattedPrice}</span>
                <span class="unit">${localize("unit_cent", lang)}</span>
              </div>
              <div class="time">${timeLabel}</div>
            </div>
          </div>

          ${this.config.slider
            ? html`
                <div class="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="23"
                    .value="${hourToShow}"
                    @input="${this._onSliderChange}"
                  />
                </div>
              `
            : ""}
        </ha-card>
      `;
    }

    // Timeline Ansicht
    return html`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="time">${timeLabel}</div>
            <div class="price">
              <span class="value">${formattedPrice}</span>
              <span class="unit">${localize("unit_cent", lang)}</span>
            </div>
          </div>
          <div class="label">${localize("label_today_price", lang)}</div>
        </div>

        <div class="timeline">
          ${data.map((d, i) => {
            const color = d.price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)";
            const faded = i < currentHour ? "faded" : "";
            const marker = i === currentHour ? "marker" : "";

            const prevColor = i > 0 ? (data[i - 1].price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)") : null;
            const nextColor =
              i < data.length - 1 ? (data[i + 1].price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)") : null;

            let borderRadius = "";
            if (prevColor !== color) {
              borderRadius += "border-top-left-radius:10px; border-bottom-left-radius:10px;";
            }
            if (nextColor !== color) {
              borderRadius += "border-top-right-radius:10px; border-bottom-right-radius:10px;";
            }

            return html`
              <div
                class="slot ${faded} ${marker}"
                style="background:${color}; ${borderRadius}; --progress:${hourProgress}"
              ></div>
            `;
          })}
        </div>

        <div class="scale">
          ${Array.from({ length: 25 }).map((_, i) => {
            const showHour = i % 6 === 0 || i === 24;
            return html`
              <div class="tick">
                <div class="dot ${showHour ? "" : "faded"}"></div>
                ${showHour ? html`<div class="hour">${String(i % 24).padStart(2, "0")}</div>` : ""}
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement("price-timeline-card-editor");
  }
}
customElements.define("price-timeline-card", PriceTimelineCard);

// ---------------------
// EDITOR
// ---------------------
class PriceTimelineEditor extends LitElement {
  static get properties() {
    return {
      _config: { type: Object },
      hass: { type: Object },
    };
  }

  setConfig(config) {
    this._config = {
      price: "",
      average: "",
      timeline: true,
      theme: "light",
      slider: false,
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;

    const newConfig = { ...ev.detail.value };

    this._config = newConfig;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this._config) return html``;
    const lang = this._hass?.language || "en";
    const schema = [
      { name: "price", selector: { text: {} } },
      { name: "average", selector: { text: {} } },
      { name: "timeline", selector: { boolean: {} } },
      { name: "slider", selector: { boolean: {} } },
      {
        name: "theme",
        selector: {
          select: {
            options: [
              { value: "light", label: localize("editor_theme_light", lang) },
              { value: "dark", label: localize("editor_theme_dark", lang) },
              { value: "theme", label: localize("editor_theme_system", lang) },
            ],
          },
        },
      },
    ];

    return html`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${schema}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}
customElements.define("price-timeline-card-editor", PriceTimelineEditor);
window.customCards = window.customCards || [];
window.customCards.push({
   type: "price-timeline-card",
   name: "HA Price Timeline Card",
   preview: false,
   description: "Card that visualizes hourly energy prices on a timeline or circle",
});
