import { createRequire } from "node:module"
import { defineConfig } from "vitepress"
const require = createRequire(import.meta.url)
const pkg = require("@hangtime/grip-connect/package.json")

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Grip Connect",
  description:
    "A client that can establish connections with various Force-Sensing Hangboards/Plates used by climbers for strength measurement",
  base: "/hangtime-grip-connect/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: pkg.version,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/Stevie-Ray/hangtime-grip-connect",
          },
        ],
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Get started", link: "/get-started" }],
      },
      {
        text: "Integrations",
        items: [{ text: "Vite", link: "/examples/vite" }],
      },
      {
        text: "Core API",
        link: "/api/",
        items: [
          { text: "Battey", link: "/api/battery" },
          { text: "Calibration", link: "/api/calibration" },
          { text: "Connect", link: "/api/connect" },
          { text: "Disconnect", link: "/api/disconnect" },
          { text: "Download", link: "/api/download" },
          { text: "Firmware", link: "/api/firmware" },
          { text: "Hardware", link: "/api/hardware" },
          { text: "Humidity", link: "/api/humidity" },
          { text: "IsActive", link: "/api/is-active" },
          { text: "IsConnected", link: "/api/is-connected" },
          { text: "IsDevice", link: "/api/is-device" },
          { text: "Led", link: "/api/led" },
          { text: "Manufacturer", link: "/api/manufacturer" },
          { text: "Notify", link: "/api/notify" },
          { text: "Read", link: "/api/read" },
          { text: "Serial", link: "/api/serial" },
          { text: "Stop", link: "/api/stop" },
          { text: "Stream", link: "/api/stream" },
          { text: "Tare", link: "/api/tare" },
          { text: "Text", link: "/api/text" },
          { text: "Write", link: "/api/write" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/Stevie-Ray/hangtime-grip-connect" }],
  },
})
