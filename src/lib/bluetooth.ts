// Web Bluetooth API Integration with GATT Heart Rate Service (0x180D) & Fallback Simulation

export interface BLEHeartRateData {
  heartRate: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

export async function requestBLEHeartRateSensor(
  onData: (data: BLEHeartRateData) => void,
  onDisconnect?: () => void
): Promise<{ deviceName: string; isRealHardware: boolean }> {
  // Check if Web Bluetooth is supported in the browser
  if (typeof navigator !== "undefined" && "bluetooth" in navigator) {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["battery_service"],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const characteristic = await service.getCharacteristic("heart_rate_measurement");

      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let rate16Bits = flags & 0x1;
        let heartRate: number;
        if (rate16Bits) {
          heartRate = value.getUint16(1, /*littleEndian=*/ true);
        } else {
          heartRate = value.getUint8(1);
        }
        onData({ heartRate });
      });

      if (onDisconnect) {
        device.addEventListener("gattserverdisconnected", onDisconnect);
      }

      return {
        deviceName: device.name || "Bluetooth Heart Rate Monitor",
        isRealHardware: true,
      };
    } catch (err: any) {
      console.warn("Web Bluetooth user cancelled or failed, falling back to clinical simulator:", err);
    }
  }

  // Graceful Clinical Simulator Fallback for desktop or non-BLE browsers
  const simulatedName = "Polar H10 Sensor (BLE 5.2 Simulator)";
  let currentHR = 72;
  const interval = setInterval(() => {
    currentHR += Math.floor(Math.random() * 3) - 1;
    currentHR = Math.max(65, Math.min(85, currentHR));
    onData({ heartRate: currentHR });
  }, 2000);

  // Return simulated handle
  return {
    deviceName: simulatedName,
    isRealHardware: false,
  };
}
