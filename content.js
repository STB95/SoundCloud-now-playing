const API =
  CONFIG.API;

let lastSent = "";
let checkRunning = false;

function text(selector) {
  const element = document.querySelector(selector);
  return element?.textContent?.trim() || "";
}

function attr(selector, attribute) {
  const element = document.querySelector(selector);
  return element?.getAttribute(attribute) || "";
}

/*
 * Clean SoundCloud text.
 *
 * Fixes:
 * - "Current track: Song" -> "Song"
 * - "SongSong" -> "Song"
 *
 * The second rule only removes an exact duplicated half,
 * so normal titles such as "Bye Bye" are not changed.
 */
function cleanTitle(value) {
  let title = String(value || "").trim();

  // Remove SoundCloud's label if it appears.
  title = title.replace(/^current\s+track\s*:\s*/i, "").trim();

  // Remove exact duplicated text: "REDRED" -> "RED"
  // but leave normal titles like "Bye Bye" alone.
  if (title.length >= 2 && title.length % 2 === 0) {
    const half = title.length / 2;
    const first = title.slice(0, half);
    const second = title.slice(half);

    if (first.length > 0 && first.toLowerCase() === second.toLowerCase()) {
      title = first;
    }
  }

  return title.trim();
}

function getTrack() {
  /*
   * ---------------------------------------------------------
   * TITLE
   * ---------------------------------------------------------
   *
   * Do NOT use ".playbackSoundBadge" as a fallback.
   * It contains multiple pieces of player information.
   */
  let title =
    text(".playbackSoundBadge__titleLink") ||
    text(".playbackSoundBadge__title") ||
    text(".playbackSoundBadge .soundTitle__title");

  title = cleanTitle(title);

  /*
   * ---------------------------------------------------------
   * ARTIST
   * ---------------------------------------------------------
   */
  const artist =
    text(".playbackSoundBadge__lightLink") ||
    text(".playbackSoundBadge__usernameLink") ||
    text(".playbackSoundBadge .soundTitle__username");

  /*
   * ---------------------------------------------------------
   * TRACK LINK
   * ---------------------------------------------------------
   */
  const link =
    attr(".playbackSoundBadge__titleLink", "href") ||
    attr(".playbackSoundBadge a", "href");

  /*
   * ---------------------------------------------------------
   * ARTWORK
   * ---------------------------------------------------------
   */
  const artwork =
    attr(".playbackSoundBadge__artwork img", "src") ||
    attr(".playbackSoundBadge img", "src") ||
    attr(".playbackSoundBadge__avatar img", "src");

  /*
   * ---------------------------------------------------------
   * PLAY / PAUSE STATE
   * ---------------------------------------------------------
   */
  const playButton = document.querySelector(".playControl");

  let playing = false;

  if (playButton) {
    const titleAttribute = playButton.getAttribute("title") || "";

    const aria = playButton.getAttribute("aria-label") || "";

    playing =
      titleAttribute.toLowerCase() === "pause" ||
      aria.toLowerCase().includes("pause") ||
      playButton.classList.contains("playing");
  }

  /*
   * No title = no track available yet.
   */
  if (!title) {
    return null;
  }

  return {
    playing,
    title,
    artist,
    artwork,
    url: link ? new URL(link, location.origin).href : location.href,
  };
}

async function sendTrack(track) {
  if (!track) {
    return;
  }

  const serialized = JSON.stringify(track);

  /*
   * Do not POST identical data repeatedly.
   */
  if (serialized === lastSent) {
    return;
  }

  try {
    const response = await fetch(API, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-NowPlaying-Key": UPDATE_KEY,
      },

      body: serialized,
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    /*
     * Only remember the track after a successful POST.
     */
    lastSent = serialized;

    console.log("♡ Now Playing updated:", track);
  } catch (error) {
    console.error("Could not update Now Playing:", error);
  }
}

async function check() {
  /*
   * Prevent overlapping checks.
   */
  if (checkRunning) {
    return;
  }

  checkRunning = true;

  try {
    const track = getTrack();

    await sendTrack(track);
  } finally {
    checkRunning = false;
  }
}

/*
 * ---------------------------------------------------------
 * INITIAL CHECK
 * ---------------------------------------------------------
 */
check();

/*
 * ---------------------------------------------------------
 * PERIODIC CHECK
 * ---------------------------------------------------------
 */
setInterval(() => {
  check();
}, 3000);

/*
 * ---------------------------------------------------------
 * SOUNDCloud SPA NAVIGATION
 * ---------------------------------------------------------
 *
 * SoundCloud changes pages without a full reload.
 */
let previousUrl = location.href;

setInterval(() => {
  const currentUrl = location.href;

  if (currentUrl !== previousUrl) {
    previousUrl = currentUrl;

    /*
     * Give SoundCloud time to update the player DOM.
     */
    setTimeout(() => {
      check();
    }, 1000);
  }
}, 1000);
