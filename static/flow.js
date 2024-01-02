class Comment {
  #message

  constructor(message) {
    this.#message = message
  }

  static twicas(comment) {
    /* https://apiv2-doc.twitcasting.tv/#comment-object */
    return new Comment(comment.message)
  }

  static whowatch(comment) {
    return new Comment(comment.message)
  }
}

class BoundingBox {
  #pos
  #rect

  /**
   * @param {Position} pos 
   * @param {Rectangle} rect 
   */
  constructor(pos, rect) {
    this.#pos = pos
    this.#rect = rect
  }

  get left() { return this.#pos.left }
  get top() { return this.#pos.top }
  get right () { return this.#pos.left + this.#rect.width }
  get bottom() { return this.#pos.top + this.#rect.height }
}

class Rectangle {
  #width
  #height

  constructor(width, height) {
    this.#width = width
    this.#height = height
  }

  get width() { return this.#width }
  get height() { return this.#height }
}

class CommentActor {
  #comment
  #pos
  #face
  #box
  #metrics
  #state

  /**
   * @param {Comment} comment 
   * @param {CommentFace} face 
   * @param {CommentPosition} pos 
   */
  constructor(comment, pos, rect, face) {
    this.#comment = comment
    this.#pos = pos
    this.#face = face
    this.#box = new BoundingBox(pos, rect)
  }

  /** @param {number} dt Delta time (ms). */
  update(dt) {
    this.#pos.update(dt)
  }

  /** @param {CanvasRenderingContext2D} g  */
  render(g) {
    this.#face.render(g, this.#comment, this.#pos)
  }

  get timeToEnd() {
    return this.#box.right / this.#move.speed
  }
}

class CommentFace {
  /** @param {CanvasRenderingContext2D} g  */
  #setContext(g) {
    g.font = "bold 48px sans-serif"
    g.fillStyle = "#fff"
    g.strokeStyle = "#000"
    g.textAlign = "left"
    g.textBaseline = "alphabetic"
  }

  /**
   * @param {CanvasRenderingContext2D} g 
   * @param {Comment} c 
   */
  measure(g, c) {
    this.#setContext(g)
    return g.measureText(c.message)
  }

  /**
   * @param {CanvasRenderingContext2D} g 
   * @param {Comment} c 
   */
  measureWidth(g, c) {
    const m = this.measure(g, c)
    return m.actualBoundingBoxRight + m.actualBoundingBoxLeft
  }

  /**
   * @param {CanvasRenderingContext2D} g 
   * @param {Comment} c
   * @param {CommentPosition} p 
  */
  render(g, c, p) {
    this.#setContext(g)
    const m = this.measure(g, c)
    const { x, y } = p.getPosition(m)
    g.strokeText(c.message, x, y)
    g.fillText(c.message, x, y)
  }
}

class Position {
  #left
  #top
  #speed

  constructor(left, top, speed) {
    this.#left = left
    this.#top = top
    this.#speed = speed
  }

  /** @param {TextMetrics} m  */
  getPosition(m) {
    return {
      x: this.#left - m.actualBoundingBoxLeft,
      y: this.#top  - m.actualBoundingBoxAscent,
    }
  }

  update(dt) {
    this.#left -= this.#speed * dt
  }
}

class Actors {
  /** @type {Set<CommentActor>} */
  #actors = new Set
  /** @type {Set<Comment>} */
  #waitingComments = new Set
  /** @type {Array<CommentActor>} */
  #last
  #screen
  #nrow

  /** @param {Screen} screen  */
  constructor(screen) {
    this.#nrow = 8
    this.#last = Array(this.#nrow)
    this.#screen = screen
  }

  /** @param {Comment} c  */
  #tryPlace(c) {
    const face = new CommentFace
    const time = 6000

    const width = face.measureWidth(this.#screen.context, c)
    const speed = (width + this.#screen.width) / time

    for (let i = 0; i < this.#last.length; i++) {
      const last = this.#last[i]
      if (last && last.timeToEnd < speed / this.#screen.width) continue

      const left = this.#screen.width
      const top = 50 * (i % this.#nrow)
      const pos = new CommentPosition(left, top, speed)
      const actor = new CommentActor(c, pos, face)

      this.#actors.add(actor)
      this.#last[i] = actor
      this.#waitingComments.delete(actor)
      return
    }

  }

  /** @param {number} dt */
  update(dt) {
    for (const c of this.#waitingComments) {
      this.#tryPlace(c)
    }

    for (const actor of this.#actors) {
      actor.update(dt)
      if (actor.isOutOf(this.#screen)) {
        this.#actors.delete(actor)
      }
    }
  }

  render() {
    for (const actor of this.#actors) {
      actor.render(this.#screen.context)
    }
  }

  /** @param {Comment} c  */
  add(c) {
    this.#waitingComments.add(c)
  }
}

class Animation {
  #stamp
  #actors

  /**
   * @param {Actors} actors 
   */
  constructor(actors) {
    this.#actors = actors
  }

  animate(now) {
    requestAnimationFrame(this.animate.bind(this))

    if (!now) return

    const dt = this.#stamp ? now - this.#stamp : 0
    this.#stamp = now

    this.#actors.update(dt)
    this.#actors.render()
  }
}

class Screen {
  #canvas

  /** @param {HTMLCanvasElement} canvas  */
  constructor(canvas) {
    this.#canvas = canvas
  }

  get width() { return this.#canvas.width}
  get height() { return this.#canvas.height }
  get context() { return this.#canvas.getContext("2d") }
}

class Flow {
  #actors
  #animation

  /** @param {HTMLCanvasElement} canvas  */
  constructor(canvas) {
    const screen = new Screen(canvas)
    const actors = new Actors(screen)
    const animation = new Animation(actors)

    this.#actors = actors
    this.#animation = animation
  }

  run() {
    this.#animation.animate()
  }

  /** @param {Comment} c  */
  add(c) {
    this.#actors.add(c)
  }
}

export { Flow, Comment }
