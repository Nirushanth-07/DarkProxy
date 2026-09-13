# DarkProxy HUD Console

DarkProxy is a high-contrast Firefox browser extension designed to intercept and switch proxy configurations. Inspired by retro terminal interfaces, it provides a clean dark theme suitable for local routing, security testing, and privacy control.

## Key Features

*   **Fast Proxy Interception**: Support SOCKS5, SOCKS4, HTTP, and HTTPS routing profiles.
*   **Seeded Database**: Pre-seeded with a default localhost gateway configuration (`127.0.0.1:1080` SOCKS5).
*   **Live Route Representation**: An interactive SVG connection path graph showing data packet flows.
*   **System Diagnostics**: Live telemetry dashboard tracking latency, bandwidth, CPU sync, and cumulative routed packet tallies.
*   **Grey Terminal Theme**: The popup looks like a grey terminal window, with `$ command` section headers, htop-style meters, and a tmux-style status bar.
*   **Web Audio Telemetry**: Dynamic audio sweeps synthesized using the Web Audio API on connect, disconnect, click, and alerts.
*   **Dynamic Matrix Code Rain**: An optional background animation toggled via header controls.

## File Structure

```text
├── background.js     # Intercepts web requests and configures browser proxy settings
├── manifest.json     # Firefox extension manifest definition (MV3)
├── popup/
│   ├── popup.html    # User interface structure
│   ├── popup.css     # Design system and theme styles
│   └── popup.js      # Interactive telemetry, audio, and database operations
└── icons/
    └── icon.svg      # Extension HUD action icon
```

## Installation & Testing

To test this extension locally in Firefox:

1.  Open Firefox and navigate to `about:debugging`.
2.  Click **This Firefox** on the left menu.
3.  Click **Load Temporary Add-on...**.
4.  Navigate to the directory and select the `manifest.json` file.
5.  Open the DarkProxy HUD Console from the browser toolbar.
