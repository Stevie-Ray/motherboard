import type { Device } from "./models/device.model"
import { write } from "./write"
import { MotherboardCommands, ProgressorCommands } from "./commands"
import { isMotherboard, isProgressor } from "./is-device"

/**
 * Stops the data stream on the specified device.
 * @param {Device} board - The device to stop the stream on.
 * @returns {Promise<void>} A promise that resolves when the stream is stopped.
 */
export const stop = async (board: Device): Promise<void> => {
  if (board.isConnected()) {
    if (isMotherboard(board)) {
      // Stop stream on Motherboard
      await write(board, "uart", "tx", MotherboardCommands.STOP_WEIGHT_MEAS, 0)
    }
    if (isProgressor(board)) {
      // Stop stream on Progressor
      await write(board, "progressor", "tx", ProgressorCommands.STOP_WEIGHT_MEAS, 0)
    }
  }
}
