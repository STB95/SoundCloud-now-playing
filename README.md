# SoundCloud-NowPlaying

SoundCloud-NowPlaying is a Twitch Extension that displays the currently playing SoundCloud track in a Twitch panel.

It shows the current track title, artist, playback status, artwork when available, and a link to the track on SoundCloud.

## 1. Architecture

The project consists of three main parts:

```text
SoundCloud
    ↓
Browser Extension
    ↓
Cloudflare Worker + KV
    ↓
Twitch Extension Panel
```
Browser Extension

The browser extension runs on SoundCloud and detects the currently playing track.

It sends the track information to the Cloudflare Worker.

Cloudflare Worker

The Cloudflare Worker provides an API endpoint for the browser extension and Twitch panel.

The browser extension sends the current track to:

POST /api/current

The Twitch panel retrieves the current track from:

GET /api/current

The current track is stored in Cloudflare KV.

Twitch Panel

The Twitch Extension panel periodically requests the current track from the Cloudflare Worker and displays it.

The panel also provides a link to the corresponding SoundCloud track.

## 2. Installing the browser extension

The browser extension can be installed manually using the browser's developer extension functionality.

Chromium-based browsers
Open the browser's Extensions page.
Enable Developer Mode.
Select "Load unpacked".
Select the project directory.
Open SoundCloud.
Play a track.

The extension will detect the current SoundCloud track and send the information to the Cloudflare Worker.

The extension does not need to be published to a browser extension store for local/personal use.

## 3. Cloudflare Worker
The Cloudflare Worker acts as the backend API.
It provides:

GET /api/current

to retrieve the current track.

It provides:

POST /api/current

to update the current track.

The current track is stored in Cloudflare KV under the key:

current

The Worker also handles CORS so that the browser extension and Twitch panel can communicate with it.

## 4. Running the local development server

The Twitch Local Test environment requires HTTPS when loading the extension from localhost.

A local certificate can be generated using mkcert.

Example:

mkcert localhost 127.0.0.1 ::1

The local extension can then be served using:

http-server . -S -C localhost+2.pem -K localhost+2-key.pem -p 3000

The panel is available at:

https://localhost:3000/panel.html

For Twitch Local Test, the Testing Base URI is:

https://localhost:3000/

and the Panel Viewer Path is:

panel.html
## 5. Twitch Extension

The Twitch Extension displays the current SoundCloud track.

The panel retrieves the current track from the Cloudflare Worker and updates periodically.

The extension is configured as a Panel extension.

The Twitch Extension Helper library is loaded by the panel so that the extension can operate inside the Twitch Extension environment.

For Local Test, Twitch loads the extension from the local HTTPS development server.

For Hosted Test, Twitch serves the uploaded extension files from its own CDN.

## 6. Privacy and data handling

SoundCloud-NowPlaying processes currently playing SoundCloud track information, including:

Track title
Artist name
SoundCloud track URL
Track artwork URL when available
Playback status

This information is sent to the Cloudflare Worker and temporarily stored so that the Twitch panel can display it.

The extension does not intentionally collect Twitch usernames, passwords, Twitch authentication credentials, Twitch chat messages, or Twitch identity information.

Only the currently playing track information is stored. It is replaced when new track information is received and is not intended to be used as a historical listening database.

See the full Privacy Policy:

privacy-policy.html
## 7. Building and testing
Local browser extension

Load the extension using the browser's "Load unpacked" developer functionality.

After changing extension files, reload the extension from the browser's Extensions page.

Local Twitch testing

Start the HTTPS development server:

http-server . -S -C localhost+2.pem -K localhost+2-key.pem -p 3000

Configure Twitch Local Test with:

Testing Base URI:
https://localhost:3000/

Panel Viewer Path:
panel.html
Hosted Twitch testing

Create a ZIP containing the Twitch extension files and upload the version through the Twitch Developer Console.

Move the extension from Local Test to Hosted Test.

Hosted Test serves the uploaded assets through Twitch rather than localhost.

Production
After successful Hosted Test, the extension can be submitted to Twitch for review.

License
This project is provided for the purposes of developing and operating the SoundCloud-NowPlaying Twitch Extension.
EOF

