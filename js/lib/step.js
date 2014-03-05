function Step(currentContext) { // history step
  this.currentContext = currentContext; //should be seeded with frame, not context
  this.points = [];
}

Step.prototype.setTool = function(tool) {
  this.tool = new tool.constructor(this.currentContext, tool.config)
}

Step.prototype.add = function(data) {
  this.points.push(data);
}

Step.prototype.complete = function(data) {
  this.points.push(data);
  this.tool.replay(this.points);
}