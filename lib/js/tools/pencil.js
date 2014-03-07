function Pencil(contexts) {
  this.contexts = contexts;
}

Pencil.prototype.mouseDown = function(data) {
  this.applyConfig("drawBuffer");

  this.contexts.drawBuffer.beginPath();
  this.contexts.drawBuffer.moveTo(data.x, data.y);
  this.points = [data];

  return false
}

Pencil.prototype.mouseMove = function(data) {
  this.contexts.drawBuffer.clearRect(0, 0, this.contexts.drawBuffer.canvas.width, this.contexts.drawBuffer.canvas.height);

  this.contexts.drawBuffer.lineTo(data.x, data.y);
  this.contexts.drawBuffer.stroke();
  this.points.push(data);

  return false
}

Pencil.prototype.mouseUp = function(data) {
  this.contexts.drawBuffer.clearRect(0, 0, this.contexts.drawBuffer.canvas.width, this.contexts.drawBuffer.canvas.height);
  this.points.push(data);
  this.replay("current", this.points);

  return {config: this.config, points: this.points}
}

Pencil.prototype.replay = function(context, points) {
  var point = points[0];
  this.applyConfig(context);
  this.contexts[context].beginPath();
  this.contexts[context].moveTo(point.x, point.y);
  for (var i = 1; i < points.length; i++) {
    this.contexts[context].lineTo(points[i].x, points[i].y)
  }
  this.contexts[context].stroke();
}

Pencil.prototype.applyConfig = function(context) {
  this.contexts[context].globalCompositeOperation = "source-over";
  // for (var prop in this.config) {
  //   this.context[prop] = config[prop];
  // }
 // todo, apply settings
}
