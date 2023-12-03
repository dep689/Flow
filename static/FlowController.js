export class FlowController {
    /**
     * @param {FlowModel} model
     * @param {FlowView} view
     */
    constructor(model , view) {
        this.model = model
        this.view = view
    }

    /**
     * @return {void}
     */
    start() {
        this.view.start()
    }

    /**
     * @param {string} text
     * @return {void}
     */
    pushcomment(text) {
        this.model.pushcomment(text)
    }
}
