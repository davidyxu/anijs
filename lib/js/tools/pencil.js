function Pencil(bufferContext, currentContext, config) {
  this.bufferContext = bufferContext;
  this.currentContext = currentContext;
  this.config = config;
}

Pencil.prototype.mouseDown = function(data) {
  this.applyConfig();

  this.bufferContext.beginPath();
  this.bufferContext.moveTo(data.x, data.y);

  return {complete: false, data: data }
}

Pencil.prototype.mouseMove = function(data) {
  this.bufferContext.clearRect(0, 0, this.bufferContext.canvas.width, this.bufferContext.canvas.height);

  this.bufferContext.lineTo(data.x, data.y);
  this.bufferContext.stroke();

  return {complete: false, data: data }
}

Pencil.prototype.mouseUp = function(data) {
  this.bufferContext.clearRect(0, 0, this.bufferContext.canvas.width, this.bufferContext.canvas.height);
  return {complete: true, data: data }
}

Pencil.prototype.replay = function(points) {
  var point = points[0];

  this.applyConfig();
  this.currentContext.beginPath();
  this.currentContext.moveTo(point.x, point.y);
  for (var i = 1; i < points.length; i++) {
    this.currentContext.lineTo(points[i].x, points[i].y)
  }
  this.currentContext.stroke();
}

Pencil.prototype.applyConfig = function() {
  this.currentContext.globalCompositeOperation = "source-over";
  // for (var prop in this.config) {
  //   this.context[prop] = config[prop];
  // }
 // todo, apply settings
}
