const params = (new URL(window.location)).searchParams

/** for twicas api */
const reflesh_time = 1200 // ms
const user_id = params.get('id')
let slice_id = 1
let counter = 0

/** for canvas */
const canvas = /** @type {HTMLCanvasElement} */ document.getElementById("flow")
const ctx = canvas.getContext("2d")
const charsize = Number(canvas.dataset.charsize) || 48 //px
const margin = Number(canvas.dataset.margin) || 8 // px
const maxtime = Number(canvas.dataset.maxtime) || 8 // s
const lines = Math.floor(canvas.clientHeight/(charsize + margin))
const comments = []
const tails = Array(2*lines)
let stamp = undefined


/** functions */
async function fetchLiveComments (user_id, options) {
    const { slice_id } = options
    const comments_res = await fetch(`/api/comments?user_id=${user_id}&slice_id=${slice_id}`)
    const comments_json = await comments_res.json()
    return comments_json
}

function pushComment(message) {
    comments.push(createcomment(message))
}

ctx.cls = function cls() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
}

ctx.drawcomment = function drawcomment(comment) {
    const offset = 2
    ctx.font = `bold ${comment.size}px sans-serif`
    // shadow
    ctx.fillStyle = "#000"
    ctx.fillText(comment.text, comment.x + offset, comment.y + offset)
    ctx.fillStyle = comment.style
    ctx.fillText(comment.text, comment.x, comment.y)
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
        "白": "white",  //"虹": undefined,
    }
    const sizemap = { "大": charsize + margin, "小": charsize/2 }
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

function createcomment(text) {
    const { commands, textbody } = parsecommand(text)
    const width = ctx.measureText(textbody).width
    const speed = (width + canvas.clientWidth)/(maxtime*1000) // px/ms
    // const alpha = 0.9
    let x

    if (commands.position === "ue" || commands.position === "shita") {
        x = (canvas.clientWidth - width)/2
    } else {
        x = canvas.clientWidth
    }

    return {
        isdraw: true,
        life: maxtime*1000,
        position: commands.position || "naka",
        size:  commands.size || charsize,
        speed: speed,
        style: commands.color || "#fff",
        text: textbody,
        width: width,
        x: x,
        y: undefined,
    }
}

function selectline(comment) {
    for (let i = 0; i < tails.length; i++) {
        if (!tails[i]) return i
        if (!tails[i].isdraw) return i
        // コメント全体が表示されていない場合はだめ
        if (tails[i].x + tails[i].width > canvas.clientWidth) continue
        // コメントが追いつかないとき
        if ((tails[i].x + tails[i].width)/tails[i].speed < canvas.clientWidth/comment.speed) {
            return i
        }
    }
    return undefined
}

function divrem(a, b) {
    return [Math.floor(a/b), a%b]
}

function init() {
    ctx.cls()
    ctx.fillStyle = "#ffffff"
    ctx.font = `${charsize}px inherit`
    stamp = Date.now()
    requestAnimationFrame(draw)
}

function draw() {
    dt = Date.now() - stamp // ms
    stamp = Date.now()
    ctx.cls()
    
    for (const comment of comments) {
        if (!comment.isdraw) continue
        if (comment.life < 0) continue

        if (comment.position === "naka") {
            
            if (comment.y === undefined) {
                const line = selectline(comment)
                // 列が全部埋まっていたらコメントを捨てる
                if (line === undefined) {
                    comment.isdraw = false
                }
                const [q, r] = divrem(line, lines)
                comment.y = q*(charsize >> 1) + charsize + r*(charsize + margin)
                tails[line] = comment
            }

            ctx.drawcomment(comment)
            comment.x -= comment.speed * dt
            
            if (comment.x < -comment.width) {
                comment.isdraw = false
                comment.life = -1
            }
        } else if (comment.position === "ue") {
            if (comment.y === undefined) {
                comment.y = charsize
            }
            comment.life -= dt
            ctx.drawcomment(comment)
        } else if (comment.position === "shita") {
            if (comment.y === undefined) {
                comment.y = canvas.clientHeight - margin
            }
            comment.life -= dt
            ctx.drawcomment(comment)
        }
    }
    
    requestAnimationFrame(draw)
}


/** main */
setInterval(async () => {
    counter += 1
    const { comments, error } = await fetchLiveComments(user_id, { slice_id })
    if (error) return 
    if (comments.length > 0) slice_id = comments[0].id
    if (counter == 1) return

    // 古いものから順に追加
    comments.reverse().forEach(comment => {
        pushComment(comment.message)
    })
}, reflesh_time)

init()