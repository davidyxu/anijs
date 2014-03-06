function Step(bufferContext, currentContext) { // history step
  this.bufferContext = bufferContext;
  this.currentContext = currentContext; //should be seeded with frame, not context
  this.points = [];
}

// how to save best save tool config if on context
Step.prototype.setTool = function(tool) {
  this.tool = new tool.constructor(this.bufferContext, this.currentContext, tool.config)
}

Step.prototype.add = function(data) {
  this.points.push(data);
}

Step.prototype.replay = function() {
  this.tool.replay(this.points);
}
// will also need to record frame + layer