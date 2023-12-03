export function FlowController(model, view) {
    this.start = function() { view.start() }
    
    this.pushcomment = function (text) {
        model.pushcomment(text)
    }
}
