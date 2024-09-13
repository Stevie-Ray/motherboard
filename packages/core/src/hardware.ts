import type { Device } from "./types/devices"
import { read } from "./read"
import { isConnected } from "./is-connected"
import { Motherboard } from "./devices"

/**
 * Retrieves hardware version from the device.
 * - For Motherboard devices, it reads the hardware version.
 *
 * @param {Device} board - The device from which to retrieve hardware version.
 * @returns {Promise<string>} A Promise that resolves with the hardware version,
 *                            or rejects with an error if the device is not connected.
 * @throws {Error} Throws an error if the device is not connected.
 */
export const hardware = async (board: Device): Promise<string | undefined> => {
  // Check if the device is connected
  if (isConnected(board)) {
    // If the device is connected and it is a Motherboard device
    if (board.filters.some((filter) => filter.name === "Motherboard")) {
      // Read hardware version from the Motherboard
      return await read(Motherboard, "device", "hardware", 250)
    }
    // If device is not found, return undefined
    return
  }
  throw new Error("Not connected.")
}
