/**
 * API de YouTube simulada para las pruebas (sin red). Imita la política de
 * reproducción automática: con sonido solo suena tras un gesto del usuario
 * (o si la prueba lo permite con window.__ytAutoplay).
 */
export const FAKE_YOUTUBE_API = `
window.addEventListener('pointerdown', function () { window.__ytGesture = true }, true)
window.addEventListener('keydown', function () { window.__ytGesture = true }, true)
window.YT = {
  Player: function (element, options) {
    var state = -1, muted = false, volume = 100
    var player = {
      playVideo: function () {
        var allowed = muted || window.__ytAutoplay === true || window.__ytGesture === true
        state = allowed ? 1 : -1
        window.__ytState = { state: state, muted: muted, volume: volume }
      },
      pauseVideo: function () { state = 2; window.__ytState = { state: state, muted: muted, volume: volume } },
      mute: function () { muted = true },
      unMute: function () { muted = false },
      setVolume: function (v) { volume = v },
      getPlayerState: function () { return state },
      destroy: function () {}
    }
    setTimeout(function () { options.events.onReady({ target: player }) }, 50)
    return player
  }
}
setTimeout(function () { window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady() }, 0)
`
