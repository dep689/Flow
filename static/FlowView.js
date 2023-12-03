export class FlowView {
    constructor(model, canvas) {
        this.ctx = canvas.getContext("2d")
        this.canvasheight = canvas.height
        this.canvaswidth = canvas.width
        const initial = canvas.dataset
        const refleshtime = Math.max(Number(initial.refleshtime), 1000) || 1200 //ms
        this.maxwait = refleshtime
        this.charsize = Number(initial.charsize) || 48 //px
        this.margin = Number(initial.margin) || 8 //px
        this.maxtime = Number(initial.maxtime) || 6 //s
        this.lineheight = this.charsize + this.margin
        this.lines = Math.floor(this.canvasheight/this.lineheight)
        this.tails = Array(2*this.lines)
        this.model = model
    }

    start() {
        this.cls()
        this.stamp = Date.now()
        this.draw()
    }
    
    cls() {
        this.ctx.clearRect(0, 0, this.canvaswidth, this.canvasheight)
    }

    selectline(comment) {
        for(let line = 0; line < this.tails.length; line++) {
            const tail = this.tails[line]
            if (!tail) return line
            if (!tail.ismounted) return line

            const tailbottom = tail.x + tail.width
            // コメント全体が表示されていない場合はだめ
            if (tailbottom > this.canvaswidth) continue
            // コメントが追いつかないときはOK
            if (tailbottom/tail.speed < this.canvaswidth/comment.speed) {
                return line
            }
        }
        return undefined
    }

    setcontext(comment) {
        this.ctx.fillStyle = comment.color
        const map = {
            "large": this.charsize + this.margin,
            "small": this.charsize/2
        }
        const size = map[comment.size] ?? this.charsize 
        this.ctx.font = `bold ${size}px sans-serif`
    }

    measurecomment(comment) {
        this.setcontext(comment)
        return this.ctx.measureText(comment.text).width
    }

    mountcomment(comment) {
        switch(comment.position) {
            case "naka": {
                const life = this.maxtime*1000
                const width = this.measurecomment(comment)
                const speed = (this.canvaswidth + width)/life
                comment.width = width
                comment.speed = speed
                const line = this.selectline(comment)
                if (line === undefined) {
                    if (comment.wait === undefined) {
                        comment.pleasewait(maxwait)
                        return
                    }
                    if (comment.wait < 0) comment.unmount()
                }
                const q = Math.floor(line/this.lines)
                const r = line%this.lines
                const x = this.canvaswidth
                const offset = q*(this.charsize/2) + r*this.lineheight
                const y = offset + this.charsize
                comment.mount({ x, y, line, life, width, speed })
                this.tails[line] = comment
                break
            }
        }
    }

    drawcomment(comment) {
        this.ctx.strokeStyle = "black"
        this.ctx.lineWidth = 6
        this.ctx.strokeText(comment.text, comment.x, comment.y)
        this.setcontext(comment)
        this.ctx.fillText(comment.text, comment.x, comment.y)
    }

    draw () {
        const dt = Date.now() - this.stamp
        this.stamp = Date.now()
        this.cls()
        //1
        this.model.comments.forEach((comment) => {
            if (!comment.isdraw) return
            if (!comment.ismounted) this.mountcomment(comment)

            if (comment.line < this.lines) {
                this.drawcomment(comment)
                comment.update(dt)
            }
        })
        //2
        this.model.comments.forEach((comment) => {
            if (!comment.isdraw) return
            if (!comment.ismounted) this.mountcomment(comment)

            if (comment.line >= this.lines) {
                this.drawcomment(comment)
                comment.update(dt)
            }
        })

        requestAnimationFrame(this.draw.bind(this))
    }
}
