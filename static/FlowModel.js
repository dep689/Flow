import { Comment } from "./Comment.js"

export class FlowModel {
    /** @type {Comment[]} */
    comments = []

    /**
     * @param {string} text 
     */
    pushcomment(text) {
        this.comments.push(new Comment(text))
    }
}
