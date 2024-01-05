import { Device } from "./devices/types"
import { notifyCallback } from "./notify"

let server: BluetoothRemoteGATTServer

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
const handleNotifications = (event: Event, board: Device): void => {
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

  if (board.name === "Motherboard") {
    // Split the string into pairs of characters
    const hexPairs: RegExpMatchArray | null = receivedString.match(/.{1,2}/g)
    // Convert each hexadecimal pair to decimal
    const parsedDecimalArray: number[] | undefined = hexPairs?.map((hexPair) => parseInt(hexPair, 16))
    // Handle different types of data
    if (characteristic.value!.byteLength === 20) {
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
      const dataObject: { [key: string]: number } = {}

      if (parsedDecimalArray) {
        elementKeys.forEach((key: string, index: number) => {
          dataObject[key] = parsedDecimalArray[index]
        })
      }
      if (notifyCallback) {
        notifyCallback({ uuid: characteristic.uuid, value: dataObject })
      }
    } else if (characteristic.value!.byteLength === 14) {
      // TODO: handle 14 byte data
      // notifyCallback({ uuid: characteristic.uuid, value: characteristic.value!.getInt8(0) / 100 })
    }
  } else if (board.name === "ENTRALPI") {
    // TODO: handle Entralpi notify
    // characteristic.value!.getInt16(0) / 100;
    if (notifyCallback) {
      notifyCallback({ uuid: characteristic.uuid, value: receivedString })
    }
  } else if (board.name === "Tindeq") {
    // TODO: handle Tindeq notify
  } else {
    if (notifyCallback) {
      notifyCallback({ uuid: characteristic.uuid, value: receivedString })
    }
  }
}
/**
 * onConnected
 * @param event
 * @param board
 */
const onConnected = async (board: Device, onSuccess: () => void): Promise<void> => {
  try {
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
                matchingCharacteristic.addEventListener("characteristicvaluechanged", (event) =>
                  handleNotifications(event, board),
                )
              }
            }
          } else {
            console.warn(`Characteristic ${characteristic.uuid} not found in service ${service.uuid}`)
          }
        }
      }
    }

    // Call the onSuccess callback after successful connection and setup
    onSuccess()
  } catch (error) {
    console.error(error)
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
 * Connect to the BluetoothDevice
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

    console.log(board.device)

    if (!board.device.gatt) {
      console.error("GATT is not available on this device")
      return
    }

    server = await board.device?.gatt?.connect()

    console.log(server)

    board.device.addEventListener("gattserverdisconnected", (event) => onDisconnected(event, board))

    board.device.addEventListener("gattserverconnected", () => onConnected(board, onSuccess))
  } catch (error) {
    console.error(error)
  }
}
