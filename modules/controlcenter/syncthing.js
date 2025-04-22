export default function syncthingButton() {
  const icon = Widget.Icon("syncthing-symbolic");
  const label = Widget.Label({ label: "Syncthing", truncate: "end" });

  const active = Variable(
    Utils.exec(`bash -c "systemctl --user is-active syncthing"`) == "active",
  );

  return Widget.Box({
    hexpand: true,
    classNames: active
      .bind()
      .as((b) => (b ? ["togglebtn", "active"] : ["togglebtn"])),
    children: [
      Widget.Button({
        hexpand: true,
        onClicked: () => {
          if (active.value) {
            Utils.exec(`bash -c "systemctl --user stop syncthing"`);
          } else {
            Utils.exec(`bash -c "systemctl --user start syncthing"`);
          }
          active.value =
            Utils.exec(`bash -c "systemctl --user is-active syncthing"`) ==
            "active";
        },
        child: Widget.Box({
          children: [icon, label],
        }),
      }),
    ],
  });
}
