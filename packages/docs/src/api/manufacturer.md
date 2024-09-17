### Supported Devices

```ts
import { Motherboard } from "./devices"
```

### Basic Usage

```ts
import { connect, manufacturer, Motherboard } from "@hangtime/grip-connect"

connect(Motherboard, async () => {
  /**
   * Retrieves manufacturer information from the device.
   * - For Motherboard devices, it reads the manufacturer information.
   *
   * @param {Device} board - The device from which to retrieve manufacturer information.
   * @returns {Promise<string>} A Promise that resolves with the manufacturer information,
   */
  const manufacturerInfo = await manufacturer(Motherboard)
  console.log(manufacturerInfo)
})
```