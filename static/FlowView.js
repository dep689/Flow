function FlowView(model, canvas) {
    const ctx = canvas.getContext("2d")
    const canvasheight = canvas.height
    const canvaswidth = canvas.width
    const initial = canvas.dataset
    const refleshtime = Math.max(Number(initial.refleshtime), 1000) || 1200 //ms
    const maxwait = refleshtime
    const charsize = Number(initial.charsize) || 48 //px
    const margin = Number(initial.margin) || 8 //px
    const maxtime = Number(initial.maxtime) || 6 //s
    const lineheight = charsize + margin
    const lines = Math.floor(canvasheight/lineheight)
    const tails = Array(2*lines)
    let stamp


    this.start = function () {
        cls()
        stamp = Date.now()
        requestAnimationFrame(draw)
    }
    
    function cls() {
        ctx.clearRect(0, 0, canvaswidth, canvasheight)
    }

    function selectline(comment) {
        for(let line = 0; line < tails.length; line++) {
            const tail = tails[line]
            if (!tail) return line
            if (!tail.ismounted) return line

            const tailbottom = tail.x + tail.width
            // コメント全体が表示されていない場合はだめ
            if (tailbottom > canvaswidth) continue
            // コメントが追いつかないときはOK
            if (tailbottom/tail.speed < canvaswidth/comment.speed) {
                return line
            }
        }
        return undefined
    }

    function setcontext(comment) {
        ctx.fillStyle = comment.color
        const size = (function(){
            switch (comment.size) {
                case "large": { return charsize + margin }
                case "small": { return charsize/2}
                default: { return charsize }
            }
        })()
        ctx.font = `bold ${size}px sans-serif`
    }

    function measurecomment(comment) {
        setcontext(comment)
        return ctx.measureText(comment.text).width
    }

    function mountcomment(comment) {
        switch(comment.position) {
            case "naka": {
                const life = maxtime*1000
                const width = measurecomment(comment)
                const speed = (canvaswidth + width)/life
                comment.width = width
                comment.speed = speed
                const line = selectline(comment)
                if (line === undefined) {
                    if (comment.wait === undefined) {
                        comment.pleasewait(maxwait)
                        return
                    }
                    if (comment.wait < 0) comment.unmount()
                }
                const q = Math.floor(line/lines)
                const r = line%lines
                const x = canvaswidth
                const offset = q*(charsize/2) + r*lineheight
                const y = offset + charsize
                comment.mount({ x, y, line, life, width, speed })
                tails[line] = comment
                break
            }
        }
    }

    function drawcomment(comment) {
        ctx.strokeStyle = "black"
        ctx.lineWidth = 6
        ctx.strokeText(comment.text, comment.x, comment.y)
        setcontext(comment)
        ctx.fillText(comment.text, comment.x, comment.y)
    }

    function draw () {
        const dt = Date.now() - stamp
        stamp = Date.now()
        cls()
        //1
        model.comments.forEach((comment) => {
            if (!comment.isdraw) return
            if (!comment.ismounted) mountcomment(comment)

            if (comment.line < lines) {
                drawcomment(comment)
                comment.update(dt)
            }
        })
        //2
        model.comments.forEach((comment) => {
            if (!comment.isdraw) return
            if (!comment.ismounted) mountcomment(comment)

            if (comment.line >= lines) {
                drawcomment(comment)
                comment.update(dt)
            }
        })

        requestAnimationFrame(draw)
    }
}