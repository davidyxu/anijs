function Pencil(contexts, config) {
  this.contexts = contexts;
  this.config = config;
}

Pencil.prototype.mouseDown = function(data) {
  this.applyConfig("drawBuffer");

  this.contexts.drawBuffer.beginPath();
  this.contexts.drawBuffer.moveTo(data.x, data.y);

  return {complete: false, data: data }
}

Pencil.prototype.mouseMove = function(data) {
  this.contexts.drawBuffer.clearRect(0, 0, this.contexts.drawBuffer.canvas.width, this.contexts.drawBuffer.canvas.height);

  this.contexts.drawBuffer.lineTo(data.x, data.y);
  this.contexts.drawBuffer.stroke();

  return {complete: false, data: data }
}

Pencil.prototype.mouseUp = function(data) {
  this.contexts.drawBuffer.clearRect(0, 0, this.contexts.drawBuffer.canvas.width, this.contexts.drawBuffer.canvas.height);

  return {complete: true, data: data }
}

Pencil.prototype.replay = function(context, points) {
  var point = points[0];
  console.log(context);
  this.applyConfig(context);
  this.contexts[context].beginPath();
  this.contexts[context].moveTo(point.x, point.y);
  for (var i = 1; i < points.length; i++) {
    this.contexts[context].lineTo(points[i].x, points[i].y)
  }
  this.contexts[context].stroke();
}

Pencil.prototype.applyConfig = function(context) {
  console.log(context);
  console.log(this.contexts);
  this.contexts[context].globalCompositeOperation = "source-over";
  // for (var prop in this.config) {
  //   this.context[prop] = config[prop];
  // }
 // todo, apply settings
}
