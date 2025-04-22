const battery = await Service.import("battery");

const powerprofiles = await Service.import("powerprofiles");
const profiles = powerprofiles.profiles.reverse();

//import { cpu, mem } from "./statWidget.js";

const nameMap = {
  "power-saver": "Power Saver",
  balanced: "Balanced",
  performance: "Performance",
};

function powerbox(profile) {
  let modename = nameMap[profile.Profile];

  const ccss = powerprofiles.bind("active_profile").as(
    (activeProfile) => (profile.Profile == activeProfile ? [] : []), // add mem and cpu stuff here in the future
  );

  return Widget.Button({
    className: powerprofiles
      .bind("active_profile")
      .as((activeProfile) =>
        profile.Profile == activeProfile ? "active" : "",
      ),
    cursor: "pointer",
    hexpand: true,

    on_clicked: () => {
      powerprofiles.active_profile = profile.Profile;
    },

    child: Widget.Box({
      children: [
        Widget.Icon(`power-profile-${profile.Profile}-symbolic`),
        Widget.Label({ hpack: "start", label: modename }),
        Widget.Box({
          hexpand: true,
          hpack: "end",
          children: ccss,
        }),
      ],
    }),
  });
}

const powercontainer = () =>
  Widget.Box({
    className: "container",
    vertical: true,
    children: profiles.map(powerbox),
  });

// Just here so the common css structure works
const powermodes = () =>
  Widget.Scrollable({
    hscroll: "never",
    vscroll: "never",
    child: powercontainer(),
  });

const batterylevel = () =>
  Widget.Box({
    className: "batterybar",
    vertical: true,
    children: [
      Widget.LevelBar({
        hexpand: true,
        vexpand: true,
        value: battery.bind("percent").as((p) => p / 100),
      }),

      Widget.CenterBox({
        startWidget: Widget.Label({
          hpack: "start",
          label: battery.bind("energy_rate").as((pull) => {
            if (pull == 0) {
              return "External Power";
            } else if (pull > 0) {
              return `Discharging - ${Math.round(pull)} W`;
            } else {
              return `Charging - ${-pull} W`;
            }
          }),
        }),
        endWidget: Widget.Label({
          hpack: "end",
          label: battery.bind("percent").as((p) => `${String(p)} %`),
        }),
      }),
    ],
  });

const settings = () =>
  Widget.Button({
    hpack: "end",
    cursor: "pointer",
    on_clicked: () => {
      Utils.execAsync(
        "env XDG_CURRENT_DESKTOP=gnome gnome-control-center power",
      );
    },
    child: Widget.Icon({
      icon: "applications-system-symbolic",
    }),
  });

const header = () =>
  Widget.CenterBox({
    className: "header",
    hexpand: true,
    startWidget: Widget.Label({
      hpack: "start",
      css: "font-weight: bold;",
      label: "Power",
    }),
    endWidget: settings(),
  });

const power = () =>
  Widget.Box({
    vertical: true,
    class_names: ["popup", "powerWidget"],
    children: [header(), batterylevel(), Widget.Separator(), powermodes()],
  });

export default function powerWidget(monitor) {
  return Widget.Window({
    margins: [7, 20],
    visible: false,
    name: `powerWidget${monitor}`,
    monitor,
    anchor: ["top", "right"],
    child: power(),
  });
}
