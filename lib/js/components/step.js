function Step(contexts) { // history step
  this.contexts = contexts;
  this.points = [];
}

// how to save best save tool config if on context
Step.prototype.setTool = function(tool) {
  this.tool = new tool.constructor(this.contexts, tool.config)
}

Step.prototype.add = function(data) {
  this.points.push(data);
}

Step.prototype.replay = function(context) {
  this.tool.replay(context, this.points);
}
// will also need to record frame + layer