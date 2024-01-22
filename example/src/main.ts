import "./style.css"
import { setupChart, setupDevice } from "./devices"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Grip Connect</h1>
    <h2>Vite + TypeScript example</h2>
    <canvas class="chart"></canvas>
    <div class="card">
      <select id="deviceSelect">
        <option>Select device</option>
        <option value="motherboard">Motherboard</option>
        <option value="entralpi">Entralpi</option>
        <option value="tindeq">Tindeq</option>
      </select>
    </div>
    <p class="output"></p>
  </div>
`

setupDevice(
  document.querySelector<HTMLSelectElement>("#deviceSelect")!,
  document.querySelector<HTMLDivElement>(".output")!,
)

setupChart(document.querySelector<HTMLCanvasElement>(".chart")!)
