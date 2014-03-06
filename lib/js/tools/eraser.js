function Eraser(contexts, config) {
  this.contexts = contexts;
  this.config = config;
}

Eraser.prototype.mouseDown = function(data) {
  this.applyConfig("current");
  this.contexts.current.beginPath();
  this.contexts.current.moveTo(data.x, data.y);
  this.points = [data];

  return false;
}

Eraser.prototype.mouseMove = function(data) {
  this.contexts.current.lineTo(data.x, data.y);
  this.contexts.current.stroke();

  this.points.push(data);

  return false;
}

Eraser.prototype.mouseUp = function(data) {
  this.contexts.current.lineTo(data.x, data.y);
  this.contexts.current.stroke();
  this.points.push(data);

  return {config: this.config, constructor: this.constructor, }
}

Eraser.prototype.replay = function(context, points) {
  var point = points[0];

  this.applyConfig("current");
  this.contexts[context].beginPath();
  this.contexts[context].moveTo(point.x, point.y);
  for (var i = 1; i < points.length; i++) {
    this.contexts[context].lineTo(points[i].x, points[i].y)
  }
  this.contexts[context].stroke();
}


Eraser.prototype.applyConfig = function(context) {
  this.contexts[context].globalCompositeOperation="destination-out";
}