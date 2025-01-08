const hyprland = await Service.import("hyprland");
import bar from "./modules/bar/index.js";
import sounddemon from "./modules/sounddemon.js";
import bluedemon from "./modules/bluedemon.js";
import netdemon from "./modules/netdemon.js";
import powerdemon from "./modules/powerdemon.js";
import controldemon from "./modules/controldemon.js";
import { populateMon, refreshMon, closer } from "./lib.js";

App.config({
  iconTheme: "MoreWaita",
  style: `${App.configDir}/macos/style.css`,
});

const windows = [
  bar,
  sounddemon,
  bluedemon,
  netdemon,
  powerdemon,
  controldemon,
  closer,
];
populateMon(windows);

hyprland.connect("monitor-added", () => refreshMon(windows));
hyprland.connect("monitor-removed", () => refreshMon(windows));

Utils.monitorFile(`${App.configDir}`, () => {
  // main scss file
  const css = `${App.configDir}/macos/style.css`;
  App.resetCss();
  App.applyCss(css);
});

export {};
