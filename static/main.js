// import { FlowModel } from "./FlowModel.js"
// import { FlowView } from "./FlowView.js"
// import { FlowController } from "./FlowController.js"
import { Flow, Comment } from "./flow.js"

const params = (new URL(window.location)).searchParams

const canvas = document.getElementById("flow")

// const model = new FlowModel()
// const view = new FlowView(model, canvas)
// const controller = new FlowController(model, view)

const flow = new Flow(canvas)

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

    comments.reverse().forEach(comment => {
        // controller.pushcomment(comment.message)
        flow.add(Comment.twicas(comment))
    })
}, refleshtime)

// controller.start()
flow.run()


async function fetchLiveComments (user_id, options) {
    const { slice_id } = options
    const res = await fetch(`/api/comments?user_id=${user_id}&slice_id=${slice_id}`)
    const json = await res.json()
    return json
}
