import {MoleHole, DeviceInfo} from 'molehole';

interface DeviceInfoWithTTL extends DeviceInfo {
  update: Date
}

const app = new Vue({
  el: '#main',
  data: {
    loading: {
      value: false
    },
    devices: {
      value: []
    }
  },
  methods: {
    update: async function (timeout = 10) {
      app.$set(app.loading, 'value', true);
      const now = new Date();
      const _devices = await MoleHole.getDevicesFromLAN(timeout);
      const devices:DeviceInfoWithTTL[] = [];
      for (const device of _devices) {
        const deviceWithTTL = device as DeviceInfoWithTTL;
        deviceWithTTL.update = now;
        devices.push(deviceWithTTL);
      }
      for (const device of app.devices.value) {
        // If we haven't seen this device more than 2 mins, remove it
        if (now.getTime() - device.update.getTime() >= 2 * 60 * 1000) {
          continue;
        }

        const cacheDevice = devices.find(_device => _device.ip === device.ip);
        if (cacheDevice) {
          continue;
        }

        devices.push(device);
      }
      app.$set(app.devices, 'value', devices);
      app.$set(app.loading, 'value', false);
    }
  }
});

app.update();

setInterval(app.update, 15000);