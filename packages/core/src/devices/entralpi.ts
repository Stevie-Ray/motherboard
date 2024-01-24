import { Device } from "./types"
import { notifyCallback } from "../notify"

export const Entralpi: Device = {
  name: "ENTRALPI",
  services: [
    {
      name: "Device Information",
      id: "device",
      uuid: "0000180a-0000-1000-8000-00805f9b34fb",
      characteristics: [],
    },
    {
      name: "Battery Service",
      id: "battery",
      uuid: "0000180f-0000-1000-8000-00805f9b34fb",
      characteristics: [],
    },
    {
      name: "Generic Attribute",
      id: "attribute",
      uuid: "00001801-0000-1000-8000-00805f9b34fb",
      characteristics: [],
    },
    {
      name: "UART ISSC Transparent Service",
      id: "uart",
      uuid: "0000fff0-0000-1000-8000-00805f9b34fb",
      characteristics: [
        {
          name: "TX",
          id: "tx",
          uuid: "0000fff5-0000-1000-8000-00805f9b34fb",
        },
        {
          name: "RX",
          id: "rx",
          uuid: "0000fff4-0000-1000-8000-00805f9b34fb",
        },
      ],
    },
    {
      name: "Weight Scale",
      id: "weight",
      uuid: "0000181d-0000-1000-8000-00805f9b34fb",
      characteristics: [],
    },
    {
      name: "Generic Access",
      id: "access",
      uuid: "00001800-0000-1000-8000-00805f9b34fb",
      characteristics: [],
    },
  ],
}

/**
 * handleEntralpiData
 * @param uuid - Unique identifier
 * @param receivedData - Received data string
 */
export function handleEntralpiData(uuid: string, receivedData: number): void {
  if (notifyCallback) {
    notifyCallback({
      uuid,
      value: {
        massTotal: receivedData,
      },
    })
  }
}
