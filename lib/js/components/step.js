function Step(contexts, tool, config, points) { // history step
  this.contexts = contexts;
  this.tool = tool;
  this.points = points;
}

Step.prototype.add = function(data) {
  this.points.push(data);
}

Step.prototype.replay = function(context) {
  this.tool.replay(context, this.points);
}
// will also need to record frame + layer