function Comment(text) {
    this.isdraw = true // 描画するか？
    this.ismounted = false // 描画されているか？
    this.life = undefined
    this.speed = undefined
    this.wait = undefined //ms
    this.width = undefined
    this.x = undefined
    this.y = undefined
    this.line = undefined

    const { commands, textbody } = parsecommand(text)

    this.color = commands.color || "rgba(255,255,255,0.9)"
    this.position = commands.position || "naka" // "naka"|"ue"|"shita"
    this.size = commands.size || "default"
    this.text = textbody
    
    this.pleasewait = function(time) {
        this.wait = time
    }

    this.mount = function({ x, y, line, life, width, speed }) {
        this.isdraw = true
        this.ismounted = true
        this.life = life
        this.speed = speed
        this.width = width
        this.x = x
        this.y = y
        this.line = line
    }

    this.unmount = function() {
        this.isdraw = false
        this.ismounted = false
        this.wait = undefined
        this.x = undefined
        this.y = undefined
        this.line = undefined
    }

    this.update = function(dt) {
        // 座標
        switch (this.position) {
            case "naka": {
                this.x -= this.speed * dt
                break
            }
            case "ue": case "shita": { break }
        }
        // 待ち時間
        if (this.wait !== undefined) this.wait -= dt
        // 寿命
        if (this.life !== undefined) this.life -= dt
        // unmount
        if (this.x + this.width < 0) this.unmount()
        if (this.wait < 0) this.unmount()
        if (this.life < 0) this.unmount()
    }

    function parsecommand(text) {
        const m = text.match("^[@＠](.*)[\\s]+(.*)?")
    
        if (!m) return { commands: { color: undefined }, textbody: text }
    
        const comm = m[1] || ""
        const textbody = m[2] || ""
        const colormap = {
            "赤": "red",    "桃": "pink",   "橙": "orange", 
            "黄": "yellow", "緑": "green",  "水": "cyan",
            "青": "blue",   "紫": "purple", "黒": "black", 
            "白": "white",  "虹": undefined,
        }
        const sizemap = { "大": "large", "小": "small" }
        const positionmap = { "上": "ue", "下": "shita" }
        let color, size, position
        for (const c of comm.split("")) {
            if (c in colormap) color = colormap[c]
            if (c in sizemap)  size = sizemap[c]
            if (c in positionmap) position = positionmap[c]
        }
    
        const commands = { color, size, position }
        return { commands, textbody }
    }
}