const params = (new URL(window.location)).searchParams

const canvas = document.getElementById("flow")

const model = new FlowModel()
const view = new FlowView(model, canvas)
const controller = new FlowController(model, view)

const refleshtime = 1200//ms
const user_id = params.get("id")
let slice_id = 1
let counter = 0

setInterval(async () => {
    counter += 1
    const { comments, error } = await fetchLiveComments(user_id, { slice_id })
    if (error) return 
    if (comments.length > 0) slice_id = comments[0].id
    if (counter === 1) return

    // 古いものから順に追加
    comments.reverse().forEach(comment => {
        controller.pushcomment(comment.message)
    })
}, refleshtime)

controller.start()


async function fetchLiveComments (user_id, options) {
    const { slice_id } = options
    const comments_res = await fetch(`/api/comments?user_id=${user_id}&slice_id=${slice_id}`)
    const comments_json = await comments_res.json()
    return comments_json
}