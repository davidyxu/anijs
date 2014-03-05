function Pencil(context, config) {
  this.context = context;
  this.config = config;
}


Pencil.prototype.mouseDown = function(data) {
  this.context.beginPath();
  

  this.context.moveTo(data.x, data.y);

  return {complete: false, data: data }
}

Pencil.prototype.mouseMove = function(data) {
  this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

  this.context.lineTo(data.x, data.y);
  this.context.stroke();

  return {complete: false, data: data }
}

Pencil.prototype.mouseUp = function(data) {
  this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  return {complete: true, data: data }
}

Pencil.prototype.replay = function(points) {
  var point = points.pop();

  this.context.moveTo(point.x, point.y);
  this.context.beginPath();
  for (var i = 0; i < points.length; i++) {
    this.context.lineTo(points[i].x, points[i].y)
  }
  this.context.stroke();
}
