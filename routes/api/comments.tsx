import { Handlers } from "$fresh/server.ts"
import Twicas from "../../myModules/twicas.js"
import key from "../../twicaskey.json" assert {type: "json"}

const { CLIENT_ID, CLIENT_SECRET } = key
const twicas = new Twicas(CLIENT_ID, CLIENT_SECRET)

export const handler: Handlers = {
    async GET(req) {
        const url = new URL(req.url)
        const params = url.searchParams
        const user_id = params.get("user_id")
        const slice_id = params.get("slice_id")

        const json = await twicas.liveComments(user_id, { slice_id })
        return new Response(JSON.stringify(json), {
            headers: { "Content-Type": "application/json"},
        })
    },
}