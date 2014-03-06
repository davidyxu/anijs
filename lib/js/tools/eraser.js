function Eraser(bufferContext, currentContext, config) {
  this.bufferContext = bufferContext;
  this.currentContext = currentContext;
  this.config = config;
}

Eraser.prototype.mouseDown = function(data) {
  this.applyConfig();
  this.currentContext.beginPath();
  this.currentContext.moveTo(data.x, data.y);

  return {complete: false, data: data }
}

Eraser.prototype.mouseMove = function(data) {
  this.currentContext.lineTo(data.x, data.y);
  this.currentContext.stroke();

  return {complete: false, data: data }
}

Eraser.prototype.mouseUp = function(data) {
  this.currentContext.lineTo(data.x, data.y);
  this.currentContext.stroke();
  
  return {complete: true, data: data }
}

Eraser.prototype.replay = function(points) {
  var point = points[0];

  this.applyConfig();
  this.currentContext.beginPath();
  this.currentContext.moveTo(point.x, point.y);
  for (var i = 1; i < points.length; i++) {
    this.currentContext.lineTo(points[i].x, points[i].y)
  }
  this.currentContext.stroke();
}


Eraser.prototype.applyConfig = function() {
  this.currentContext.globalCompositeOperation="destination-out";
}