import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module";

// Import JS-Sprachdateien
import en from "./localize/en.js";
import de from "./localize/de.js";
import es from "./localize/es.js";
import fr from "./localize/fr.js";

const languages = { en, de, es, fr };

class PriceTimelineCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  static get styles() {
    return css`
      ha-card {
        background: #fff;
        padding: 16px;
        font-family: sans-serif;
        color: #000;
      }
      .header {
        display:flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .header-left {
        display:flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0; 
      }
      .time {
        font-size: 14px;
        color:#666;
        line-height: 1.1; 
        margin: 0;
      }
      .price {
        font-size: 24px;
        font-weight: bold;
        color:#000;
        line-height: 1.1;
        margin-top: 3px;
        display: flex;
        align-items: baseline; 
      }
      .price .value {
        font-size: 20px;
        font-weight: 800;
      }
      .price .unit {
        font-size: 14px;  
        font-weight: normal;
        margin-left: 4px;  
        color: #000;
      }
      .label {
        font-size: 14px;
        color:#666;
      }
      .slot.marker::after {
        content:"";
        position:absolute;
        top:50%;
        bottom:-8px;
        margin: auto;
        width:3px;
        background:inherit;
        border:2px solid #fff;
        height: 12px;
        transform: translate(-3px, -50%);
        border-radius: 10px;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      }
      .slot {
        flex:1;
        opacity:1;
      }
      .faded {
        opacity:0.3;
      }
      .timeline {
        display: flex;
        margin: 8px 0;
        height: 6px;
        border-radius: 5px;
        overflow: visible;
        position: relative;
      }
      .scale {
        display: grid;
        grid-template-columns: repeat(25, 1fr);
        font-size: 12px;
        color: #666;
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
        background: #656C72;
        margin-bottom: 4px;
      }
      .scale .dot.faded {
        opacity: 0.4;
      }
      .scale .hour {
        font-variant-numeric: tabular-nums;
        text-align: center;
      }
      :host {
        --orange: #FF832D;
        --turquoise: #1DBFAC;
      }
    `;
  }

  setConfig(config) {
    if (!config.price) throw new Error(this.localize("missing_price"));
    if (!config.average) throw new Error(this.localize("missing_average"));
    this.config = config;
  }

  localize(key) {
    const lang = this.hass?.language || "en";
    return languages[lang]?.[key] || languages["en"][key] || key;
  }

  render() {
    if (!this.hass) return html``;

    const entity = this.hass.states[this.config.price];
    const avgEntity = this.hass.states[this.config.average];

    if (!entity || !entity.attributes.data) {
      return html`<ha-card><div>${this.localize("no_data")}</div></ha-card>`;
    }

    const allData = entity.attributes.data;
    const today = new Date();
    const data = allData.filter(item => {
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
    const currentPrice = data[currentHour].price_per_kwh;
    const formattedPrice = (currentPrice * 100).toFixed(1).replace(".", ",");

    return html`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="time">
              ${String(currentHour).padStart(2,"0")}:00-${String((currentHour+1)%24).padStart(2,"0")}:00
            </div>
            <div class="price">
              <span class="value">${formattedPrice}</span>
              <span class="unit">${this.localize("unit_cent")}</span>
            </div>
          </div>
          <div class="label">${this.localize("label_today_price")}</div>
        </div>

        <div class="timeline">
          ${data.map((d, i) => {
            const color = d.price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)";
            const faded = i < currentHour ? "faded" : "";
            const marker = i === currentHour ? "marker" : "";
            const prevColor = i > 0 ? (data[i - 1].price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)") : null;
            const nextColor = i < data.length - 1 ? (data[i + 1].price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)") : null;

            let borderRadius = "";
            if (prevColor !== color) borderRadius += "border-top-left-radius:10px; border-bottom-left-radius:10px;";
            if (nextColor !== color) borderRadius += "border-top-right-radius:10px; border-bottom-right-radius:10px;";

            return html`
              <div class="slot ${faded} ${marker}" style="background:${color}; ${borderRadius}"></div>
            `;
          })}
        </div>

        <div class="scale">
          ${Array.from({ length: 25 }).map((_, i) => {
            const showHour = (i % 6 === 0 || i === 24);
            return html`
              <div class="tick">
                <div class="dot ${showHour ? "" : "faded"}"></div>
                ${showHour ? html`<div class="hour">${String(i % 24).padStart(2,"0")}</div>` : ""}
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }
}

customElements.define("price-timeline-card", PriceTimelineCard);