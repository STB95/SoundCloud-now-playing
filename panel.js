const API =
  "https://soundcloudnowplaying.turnerb-sarah.workers.dev/api/current";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(String(value));

    if (
      url.protocol === "https:" &&
      (url.hostname === "soundcloud.com" ||
        url.hostname.endsWith(".soundcloud.com"))
    ) {
      return url.href;
    }
  } catch {}

  return "";
}

async function update() {
  const content = document.getElementById("content");

  try {
    const response = await fetch(API, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    if (!data.playing || !data.title) {
      content.innerHTML = `
        <div class="offline">
          🎵 Nothing playing right now~
        </div>
      `;
      return;
    }

    const soundcloudUrl = safeUrl(data.url);
    const artwork = data.artwork || "";

    const artworkHtml = artwork
      ? `
        <img
          class="art"
          src="${escapeHtml(artwork)}"
          alt="Album artwork"
          loading="eager"
          referrerpolicy="no-referrer"
        >
      `
      : "";

    const button = soundcloudUrl
      ? `
        <a
          class="button"
          href="${escapeHtml(soundcloudUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ♫ Listen on SoundCloud
        </a>
      `
      : "";

    content.innerHTML = `
      ${artworkHtml}

      <div class="title">
        ${escapeHtml(data.title)}
      </div>

      <div class="artist">
        ${escapeHtml(data.artist)}
      </div>

      <div class="status">
        <span class="dot">●</span>
        Currently playing
      </div>

      ${button}
    `;
  } catch (error) {
    console.error("Could not update Now Playing:", error);
  }
}

/*
 * Twitch Extension initialization
 *
 * Twitch needs an authorization handler before
 * the extension can properly initialize.
 */
Twitch.ext.onAuthorized(function (auth) {
  console.log("Twitch Extension authorized");

  update();

  setInterval(update, 10000);
});
