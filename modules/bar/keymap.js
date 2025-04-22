const hypr = await Service.import("hyprland");

function getmap() {
  const lang = Utils.exec(
    `bash -c "hyprctl devices -j | jq -c '.keyboards.[] | select(.main == true)| .active_keymap' | xargs"`,
  );
  if (lang == "Norwegian") {
    return "NO";
  }
  return "EN";
}

export default function Keymap() {
  return Widget.Button({
    className: "keymap",
    cursor: "pointer",
    child: Widget.Label({
      label: Utils.watch(getmap(), hypr, "keyboard-layout", () => getmap()),
    }),
    onClicked: () => {
      Utils.exec(`bash -c "hyprctl switchxkblayout all next"`);
    },
  });
}
