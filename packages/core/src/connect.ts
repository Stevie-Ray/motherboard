import { Device } from "./types"
import { notifyCallback } from "./notify"

/**
 * onDisconnected
 * @param board
 * @param event
 */
const onDisconnected = (event: Event, board: Device): void => {
  board.device = undefined
  const device = event.target as BluetoothDevice
  console.log(`Device ${device.name} is disconnected.`)
}
/**
 * handleNotifications
 * @param event
 * @param onNotify
 */
const handleNotifications = (event: Event): void => {
  const characteristic = event.target as BluetoothRemoteGATTCharacteristic
  const receivedData = new Uint8Array(characteristic.value!.buffer)

  // Create an array to store the parsed decimal values
  const decimalArray: number[] = []

  // Iterate through each byte and convert to decimal
  for (let i = 0; i < receivedData.length; i++) {
    decimalArray.push(receivedData[i])
  }
  // Convert the decimal array to a string representation
  const receivedString: string = String.fromCharCode(...decimalArray)

  // Split the string into pairs of characters
  const hexPairs: RegExpMatchArray | null = receivedString.match(/.{1,2}/g)

  // Convert each hexadecimal pair to decimal
  const parsedDecimalArray: number[] | undefined = hexPairs?.map((hexPair) => parseInt(hexPair, 16))

  // Handle different types of data
  if (characteristic.value!.byteLength === 20) {
    // Define keys for the elements
    const elementKeys = [
      "frames",
      "cycle",
      "unknown",
      "eleven",
      "dynamic1",
      "pressure1",
      "left",
      "dynamic2",
      "pressure2",
      "right",
    ]
    // Create a single object with keys and values
    const dataObject = {}

    if (parsedDecimalArray) {
      elementKeys.forEach((key, index) => {
        dataObject[key] = parsedDecimalArray[index]
      })
    }
    // Call the onNotify function with the data
    if (notifyCallback) {
      notifyCallback(dataObject)
    }
    // TODO: handle 14 byte data
  } else if (characteristic.value!.byteLength === 14) {
    // Call the onNotify function with the data
    if (notifyCallback) {
      notifyCallback({ byteLength: characteristic.value!.byteLength, data: parsedDecimalArray })
    }
  } else {
    // TODO: handle x byte data
    if (notifyCallback) {
      notifyCallback({ byteLength: characteristic.value!.byteLength, data: parsedDecimalArray })
    }
  }
}
/**
 * Return all service UUIDs
 * @param device
 */
function getAllServiceUUIDs(device: Device) {
  return device.services.map((service) => service.uuid)
}
/**
 * connect
 * @param device
 * @param onSuccess
 */
export const connect = async (board: Device, onSuccess: () => void): Promise<void> => {
  try {
    const deviceServices = getAllServiceUUIDs(board)

    // setup filter list
    const filters = []

    if (board.name) {
      filters.push({
        name: board.name,
      })
    }
    if (board.companyId) {
      filters.push({
        manufacturerData: [
          {
            companyIdentifier: board.companyId,
          },
        ],
      })
    }

    const device = await navigator.bluetooth.requestDevice({
      filters: filters,
      optionalServices: deviceServices,
    })

    board.device = device

    device.addEventListener("gattserverdisconnected", (event) => onDisconnected(event, board))

    const server = await device.gatt?.connect()
    const services = await server?.getPrimaryServices()

    if (!services || services.length === 0) {
      console.error("No services found")
      return
    }

    for (const service of services) {
      const matchingService = board.services.find((boardService) => boardService.uuid === service.uuid)

      if (matchingService) {
        const characteristics = await service.getCharacteristics()

        for (const characteristic of matchingService.characteristics) {
          const matchingCharacteristic = characteristics.find((char) => char.uuid === characteristic.uuid)

          if (matchingCharacteristic) {
            const element = matchingService.characteristics.find((char) => char.uuid === matchingCharacteristic.uuid)
            if (element) {
              element.characteristic = matchingCharacteristic

              // notify
              if (element.id === "rx") {
                matchingCharacteristic.startNotifications()
                matchingCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications)
              }
            }
          } else {
            console.warn(`Characteristic ${characteristic.uuid} not found in service ${service.uuid}`)
          }
        }
      }
    }
    onSuccess()
  } catch (error) {
    console.error(error)
  }
}
