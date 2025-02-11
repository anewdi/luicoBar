const date = Variable("", {
  poll: [1000, 'date "+%a %d %b %H:%M"'],
});

export default function Clock() {
  return Widget.Button({
    class_name: "clock",
    onClicked: () => togglePopup("controlWidget"),
    child: Widget.Label({
      label: date.bind(),
    }),
  });
}
