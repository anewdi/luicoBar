const battery = await Service.import("battery");

import bluetoothButton from "./bluetooth.js";
import networkButton from "./network.js";
import nightlightButton from "./nightlight.js";
import syncthingButton from "./syncthing.js";
import powerProfileButton from "./powerprofile.js";
import brightnessSlider from "../common/brightnessSlider.js";
import volumeSlider from "../common/volumeSlider.js";
import mediaPlayer from "../common/mediaPlayer.js";

const settings = () =>
  Widget.Button({
    cursor: "pointer",
    on_clicked: () => {
      Utils.execAsync("env XDG_CURRENT_DESKTOP=gnome gnome-control-center");
    },
    child: Widget.Icon({
      icon: "applications-system-symbolic",
    }),
  });

const batteryStatus = () => {
  const icon = Utils.merge(
    [battery.bind("percent"), battery.bind("charging")],
    (p, charging) =>
      charging
        ? `battery-level-${Math.floor(p / 10) * 10}-charging-symbolic`
        : `battery-level-${Math.floor(p / 10) * 10}-symbolic`,
  );

  return Widget.Button({
    visible: battery.bind("available"),
    child: Widget.Box({
      children: [
        Widget.Icon({ icon: icon }),
        Widget.Label({
          label: battery.bind("percent").as((p) => `${p}%`),
          css: "font-weight: bold;",
        }),
        Widget.Label({
          css: "color: grey;",
          truncate: "end",
          label: battery.bind("time_remaining").as((time) => {
            const mins = time / 60;
            const hours = Math.floor(mins / 60);
            const minutes = Math.round(mins % 60);
            if (hours >= 1) {
              return `${hours}h ${minutes}m`;
            }
            if (minutes) {
              return `${minutes}m`;
            }
            return "External Power";
          }),
        }),
      ],
    }),
    onClicked: () => togglePopup("powerWidget"),
  });
};

const recorder = () => {
  const active = Variable(false);
  const time = Variable(0);

  function counter() {
    if (active.value) {
      time.value++;
      setTimeout(counter, 1000);
    }
  }

  const elapsed = Widget.Revealer({
    revealChild: active.bind(),
    transition: "slide_left",
    child: Widget.Label({
      css: "color: grey; font-weight: bold;",
      label: time.bind().as((t) => `Recording: ${t}s`),
    }),
  });

  const recbutton = Widget.Button({
    child: Widget.Icon({
      css: "color: coral;",
      icon: "media-record-symbolic",
    }),
    onClicked: () => {
      if (!active.value) {
        Utils.execAsync(`bash -c "wf-recorder -c libx264rgb -f ~/temp.mkv"`);
        active.value = true;
        counter();
      } else {
        Utils.execAsync(`bash -c "pkill wf-recorder"`).then(
          () => (active.value = false),
        );
      }
    },
  });

  return Widget.Box({
    className: active.bind().as((b) => (b ? "rec" : "norec")),
    children: [elapsed, recbutton],
  });
};

const header = () =>
  Widget.Box({
    className: "header",
    children: [
      batteryStatus(),
      Widget.Box({
        className: "headerButtons",
        hpack: "end",
        hexpand: true,
        children: [
          recorder(),
          settings(),
          Widget.Button({
            child: Widget.Icon({
              icon: "system-shutdown-symbolic",
            }),
            onClicked: () => {
              togglePopup("powermenuRight");
            },
          }),
        ],
      }),
    ],
  });

const switches = () =>
  Widget.Box({
    className: "switches",
    hexpand: true,
    spacing: 8,
    homogeneous: true,
    children: [
      Widget.Box({
        hexpand: true,
        vertical: true,
        children: [networkButton(), nightlightButton()],
      }),
      Widget.Box({
        hexpand: true,
        vertical: true,
        children: [bluetoothButton(), powerProfileButton()],
      }),
    ],
  });

const control = () =>
  Widget.Box({
    vertical: true,
    class_names: ["popup", "controlWidget"],
    children: [
      header(),
      volumeSlider(true),
      brightnessSlider(),
      Widget.Separator(),
      switches(),
      mediaPlayer(),
    ],
  });

export default function controlWidget(monitor) {
  return Widget.Window({
    margins: [7],
    visible: false,
    name: `controlWidget${monitor}`,
    monitor,
    anchor: ["top", "right"],
    child: control(),
  });
}
