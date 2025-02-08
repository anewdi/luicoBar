const mpris = await Service.import("mpris");
const players = mpris.bind("players");

const FALLBACK_ICON = "audio-x-generic-symbolic";
const PLAY_ICON = "media-playback-start-symbolic";
const PAUSE_ICON = "media-playback-pause-symbolic";
const PREV_ICON = "media-skip-backward-symbolic";
const NEXT_ICON = "media-skip-forward-symbolic";

function lengthStr(length) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}

function mplayer(player) {
  const img = Widget.Box({
    class_name: "img",
    vpack: "start",
    css: player.bind("cover_path").transform(
      (p) => `
            background-image: url('${p}');
        `,
    ),
  });

  const title = Widget.Label({
    class_name: "title",
    truncate: "end",
    hpack: "start",
    label: player.bind("track_title"),
  });

  const artist = Widget.Label({
    class_name: "artist",
    truncate: "end",
    hpack: "start",
    label: player.bind("track_artists").transform((a) => a.join(", ")),
  });

  const positionSlider = Widget.Slider({
    class_name: "position",
    draw_value: false,
    vpack: "end",
    on_change: ({ value }) => (player.position = value * player.length),
    visible: player.bind("length").as((l) => l > 0),
    setup: (self) => {
      function update() {
        const value = player.position / player.length;
        self.value = value > 0 ? value : 0;
      }
      self.hook(player, update);
      self.hook(player, update, "position");
      self.poll(1000, update);
    },
  });

  const positionLabel = Widget.Label({
    hpack: "start",
    setup: (self) => {
      const update = (_, time) => {
        self.label = lengthStr(time || player.position);
        self.visible = player.length > 0;
      };

      self.hook(player, update, "position");
      self.poll(1000, update);
    },
  });

  const lengthLabel = Widget.Label({
    class_name: "length",
    hpack: "end",
    visible: player.bind("length").transform((l) => l > 0),
    label: player.bind("length").transform(lengthStr),
  });

  const icon = Widget.Icon({
    class_name: "icon",
    hexpand: true,
    hpack: "end",
    tooltip_text: player.identity || "",
    icon: player.bind("entry").transform((entry) => {
      const name = `${entry}-symbolic`;
      return Utils.lookUpIcon(name) ? name : FALLBACK_ICON;
    }),
  });

  const prev = () => {
    return Widget.Button({
      hexpand: true,
      on_clicked: () => player.previous(),
      child: Widget.Icon(PREV_ICON),
    });
  };

  const playPause = () => {
    return Widget.Button({
      class_name: "play-pause",
      on_clicked: () => player.playPause(),
      hexpand: true,
      child: Widget.Icon({
        icon: player.bind("play_back_status").transform((s) => {
          switch (s) {
            case "Playing":
              return PAUSE_ICON;
            case "Paused":
            case "Stopped":
              return PLAY_ICON;
          }
        }),
      }),
    });
  };

  const next = () => {
    return Widget.Button({
      on_clicked: () => player.next(),
      hexpand: true,
      child: Widget.Icon(NEXT_ICON),
    });
  };

  const playerUi = Widget.Box({
    class_name: "player",
    vertical: true,
    hexpand: true,
    children: [
      Widget.Box([title, icon]),
      artist,
      Widget.Box({ vexpand: true }),
      Widget.CenterBox({
        start_widget: positionLabel,
        end_widget: lengthLabel,
      }),
    ],
  });

  return Widget.Box({
    vertical: true,
    children: [
      Widget.Separator(),
      Widget.Overlay({
        child: Widget.Overlay({
          child: img,
          overlays: [playerUi],
        }),
        overlays: [
          Widget.Box({
            homogeneous: true,
            className: "hoverControls",
            children: [prev(), playPause(), next()],
          }),
        ],
        passThrough: false,
      }),
      positionSlider,
    ],
  });
}

export default function mediaPlayer() {
  return Widget.Box({
    vexpand: true,
    className: "mediaplayer",
    spacing: 15,
    vertical: true,
    visible: players.as((p) => p.length > 0),
    children: players.as((p) =>
      p.filter((p) => p.play_back_status != "Stopped").map(mplayer),
    ),
  });
}
