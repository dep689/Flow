function FlowModel() {
    this.comments = []

    this.pushcomment = function (text) {
        this.comments.push(new Comment(text))
    }
}