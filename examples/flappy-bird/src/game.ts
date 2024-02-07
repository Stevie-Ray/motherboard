import { Motherboard, Tindeq, Entralpi, connect, notify, stream, stop, isConnected } from "@hangtime/grip-connect"
import { Device } from "@hangtime/grip-connect/src/devices/types"

interface massObject {
  massTotal: string
  massRight?: string
  massLeft?: string
}

let mass: number
let device: Device = Motherboard

function getBluetoothData() {
  return connect(device, async () => {
    // Listen for notifications
    notify((data: { value?: massObject }) => {
      if (data && data.value) {
        if (data.value.massTotal !== undefined) {
          mass = Number(data.value.massTotal)
        } else {
          console.log(data.value)
        }
      }
    })

    await stream(device)
  })
}

export function setupDevice(element: HTMLSelectElement) {
  element.addEventListener("change", () => {
    const selectedDevice = element.value

    if (selectedDevice === "motherboard") {
      device = Motherboard
    }
    if (selectedDevice === "entralpi") {
      device = Entralpi
    }
    if (selectedDevice === "tindeq") {
      device = Tindeq
    }
    getBluetoothData()
  })
}

const RAD: number = Math.PI / 180
const scrn: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement
const sctx: CanvasRenderingContext2D = scrn.getContext("2d") as CanvasRenderingContext2D
scrn.tabIndex = 1

async function handleUserInput(): Promise<void> {
  switch (state.curr) {
    case state.getReady:
      if (isConnected(device)) {
        stream(device)
        state.curr = state.Play
        SFX.start.play()
      } else {
        await getBluetoothData().then(() => {
          state.curr = state.Play
          SFX.start.play()
        })
      }
      break
    case state.Play:
      bird.flap()
      break
    case state.gameOver:
      state.curr = state.getReady
      bird.speed = 0
      bird.y = 100
      pipe.pipes = []
      UI.score.curr = 0
      SFX.played = false
      break
  }
}

scrn.addEventListener("click", handleUserInput)

scrn.onkeydown = function keyDown(e: KeyboardEvent): void {
  if (e.key === " " || e.key === "w" || e.key === "ArrowUp") {
    handleUserInput()
  }
}

let gameFrames: number = 0
const dx: number = 2
const state: { curr: number; getReady: number; Play: number; gameOver: number } = {
  curr: 0,
  getReady: 0,
  Play: 1,
  gameOver: 2,
}
const SFX: {
  start: HTMLAudioElement
  flap: HTMLAudioElement
  score: HTMLAudioElement
  hit: HTMLAudioElement
  die: HTMLAudioElement
  played: boolean
} = {
  start: new Audio(),
  flap: new Audio(),
  score: new Audio(),
  hit: new Audio(),
  die: new Audio(),
  played: false,
}
interface Ground {
  sprite: HTMLImageElement
  x: number
  y: number
  draw(): void
  update(): void
}
const gnd: Ground = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    this.y = parseFloat(String(scrn.height - this.sprite.height))
    sctx.drawImage(this.sprite, this.x, this.y)
  },
  update: function () {
    if (state.curr != state.Play) return
    this.x -= dx
    this.x = this.x % (this.sprite.width / 4)
  },
}
const bg: {
  sprite: HTMLImageElement
  x: number
  y: number
  draw: () => void
} = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    const y: number = parseFloat(String(scrn.height - this.sprite.height))
    sctx.drawImage(this.sprite, this.x, y)
  },
}
const pipe: {
  top: { sprite: HTMLImageElement }
  bot: { sprite: HTMLImageElement }
  gap: number
  moved: boolean
  pipes: { x: number; y: number }[]
  draw: () => void
  update: () => void
} = {
  top: { sprite: new Image() },
  bot: { sprite: new Image() },
  gap: 85,
  moved: true,
  pipes: [],
  draw: function () {
    for (let i = 0; i < this.pipes.length; i++) {
      const p = this.pipes[i]
      sctx.drawImage(this.top.sprite, p.x, p.y)
      sctx.drawImage(this.bot.sprite, p.x, p.y + parseFloat(String(this.top.sprite.height)) + this.gap)
    }
  },
  update: function () {
    if (state.curr != state.Play) return
    if (gameFrames % 100 == 0) {
      this.pipes.push({
        x: parseFloat(String(scrn.width)),
        y: -210 * Math.min(Math.random() + 1, 1.8),
      })
    }
    this.pipes.forEach((pipe) => {
      pipe.x -= dx
    })

    if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
      this.pipes.shift()
      this.moved = true
    }
  },
}
const bird: {
  animations: { sprite: HTMLImageElement }[]
  rotatation: number
  x: number
  y: number
  speed: number
  gravity: number
  thrust: number
  frame: number
  draw: () => void
  update: () => void
  flap: () => void
  setRotation: () => void
  collisioned: () => boolean
} = {
  animations: [{ sprite: new Image() }, { sprite: new Image() }, { sprite: new Image() }, { sprite: new Image() }],
  rotatation: 0,
  x: 50,
  y: 100,
  speed: 0,
  gravity: 0.125,
  thrust: 3.6,
  frame: 0,
  draw: function () {
    const h = this.animations[this.frame].sprite.height
    const w = this.animations[this.frame].sprite.width
    sctx.save()
    sctx.translate(this.x, this.y)
    sctx.rotate(this.rotatation * RAD)
    sctx.drawImage(this.animations[this.frame].sprite, -w / 2, -h / 2)
    sctx.restore()
  },
  update: async function () {
    const r = parseFloat(String(this.animations[0].sprite.width)) / 2
    switch (state.curr) {
      case state.getReady:
        this.rotatation = 0
        this.y += gameFrames % 10 == 0 ? Math.sin(gameFrames * RAD) : 0
        this.frame += gameFrames % 10 == 0 ? 1 : 0
        break
      case state.Play:
        this.frame += gameFrames % 5 == 0 ? 1 : 0
        if (mass) {
          const newy: number = (mass / 100) * scrn.height
          this.y = Math.max(Math.min(newy, gnd.y - r), r)
        }
        this.y += this.speed
        this.setRotation()
        this.speed += this.gravity
        if ((!isConnected(device) && this.y + r >= gnd.y) || this.collisioned()) {
          state.curr = state.gameOver
        }
        break
      case state.gameOver:
        this.frame = 1
        if (this.y + r < gnd.y) {
          this.y += this.speed
          this.setRotation()
          this.speed += this.gravity * 2
        } else {
          this.speed = 0
          this.y = gnd.y - r
          this.rotatation = 90
          if (!SFX.played) {
            SFX.die.play()
            SFX.played = true
            if (isConnected(device)) {
              await stop(device)
            }
          }
        }
        break
    }
    this.frame = this.frame % this.animations.length
  },
  flap: function () {
    if (this.y > 0) {
      SFX.flap.play()
      this.speed = -this.thrust
    }
  },
  setRotation: function () {
    if (this.speed <= 0) {
      this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust))
    } else if (this.speed > 0) {
      this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2))
    }
  },
  collisioned: function (): boolean {
    if (!pipe.pipes.length) return false
    const bird = this.animations[0].sprite
    const x = pipe.pipes[0].x
    const y = pipe.pipes[0].y
    const r = bird.height / 4 + bird.width / 4
    const roof = y + parseFloat(String(pipe.top.sprite.height))
    const floor = roof + pipe.gap
    const w = parseFloat(String(pipe.top.sprite.width))
    if (this.x + r >= x) {
      if (this.x + r < x + w) {
        if (this.y - r <= roof || this.y + r >= floor) {
          SFX.hit.play()
          return true
        }
      } else if (pipe.moved) {
        UI.score.curr++
        SFX.score.play()
        pipe.moved = false
        return false
      }
    }
    return false
  },
}
const UI = {
  getReady: { sprite: new Image() },
  gameOver: { sprite: new Image() },
  tap: [{ sprite: new Image() }, { sprite: new Image() }],
  score: {
    curr: 0,
    best: 0,
  },
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  frame: 0,
  draw: function () {
    switch (state.curr) {
      case state.getReady:
        this.y = parseFloat(String(scrn.height - this.getReady.sprite.height)) / 2
        this.x = parseFloat(String(scrn.width - this.getReady.sprite.width)) / 2
        this.tx = parseFloat(String(scrn.width - this.tap[0].sprite.width)) / 2
        this.ty = this.y + this.getReady.sprite.height - this.tap[0].sprite.height
        sctx.drawImage(this.getReady.sprite, this.x, this.y)
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty)
        break
      case state.gameOver:
        this.y = parseFloat(String(scrn.height - this.gameOver.sprite.height)) / 2
        this.x = parseFloat(String(scrn.width - this.gameOver.sprite.width)) / 2
        this.tx = parseFloat(String(scrn.width - this.tap[0].sprite.width)) / 2
        this.ty = this.y + this.gameOver.sprite.height - this.tap[0].sprite.height
        sctx.drawImage(this.gameOver.sprite, this.x, this.y)
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty)
        break
    }
    this.drawScore()
  },
  drawScore: function () {
    sctx.fillStyle = "#FFFFFF"
    sctx.strokeStyle = "#000000"
    switch (state.curr) {
      case state.Play:
        sctx.lineWidth = 2
        sctx.font = "35px Squada One"
        sctx.fillText(String(this.score.curr), scrn.width / 2 - 5, 50)
        sctx.strokeText(String(this.score.curr), scrn.width / 2 - 5, 50)
        break
      case state.gameOver:
        sctx.lineWidth = 2
        sctx.font = "40px Squada One"
        // eslint-disable-next-line no-case-declarations
        const sc = `SCORE :     ${this.score.curr}`
        try {
          this.score.best = Math.max(this.score.curr, Number(localStorage.getItem("best")))
          localStorage.setItem("best", String(this.score.best))
          const bs = `BEST  :     ${this.score.best}`
          sctx.fillText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0)
          sctx.strokeText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0)
          sctx.fillText(bs, scrn.width / 2 - 80, scrn.height / 2 + 30)
          sctx.strokeText(bs, scrn.width / 2 - 80, scrn.height / 2 + 30)
        } catch (e) {
          sctx.fillText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15)
          sctx.strokeText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15)
        }

        break
    }
  },
  update: function () {
    if (state.curr == state.Play) return
    this.frame += gameFrames % 10 == 0 ? 1 : 0
    this.frame = this.frame % this.tap.length
  },
}

gnd.sprite.src = "img/ground.png"
bg.sprite.src = "img/BG.png"
pipe.top.sprite.src = "img/toppipe.png"
pipe.bot.sprite.src = "img/botpipe.png"
UI.gameOver.sprite.src = "img/go.png"
UI.getReady.sprite.src = "img/getready.png"
UI.tap[0].sprite.src = "img/tap/t0.png"
UI.tap[1].sprite.src = "img/tap/t1.png"
bird.animations[0].sprite.src = "img/bird/b0.png"
bird.animations[1].sprite.src = "img/bird/b1.png"
bird.animations[2].sprite.src = "img/bird/b2.png"
bird.animations[3].sprite.src = "img/bird/b0.png"
SFX.start.src = "sfx/start.wav"
SFX.flap.src = "sfx/flap.wav"
SFX.score.src = "sfx/score.wav"
SFX.hit.src = "sfx/hit.wav"
SFX.die.src = "sfx/die.wav"

function gameLoop(): void {
  update()
  draw()
  gameFrames++
}

function update(): void {
  bird.update()
  gnd.update()
  pipe.update()
  UI.update()
}

function draw(): void {
  sctx.fillStyle = "#30c0df"
  sctx.fillRect(0, 0, scrn.width, scrn.height)
  bg.draw()
  pipe.draw()

  bird.draw()
  gnd.draw()
  UI.draw()
}

setInterval(gameLoop, 20)
