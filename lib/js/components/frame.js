function Frame() {
  this.dataURL = null;
  this.setupLayers();
  this.history = [];
}

Frame.prototype.setupLayers = function() {
  this.layers = [new Layer()];
  this.layer = this.layers[0];
}

Frame.prototype.gotoLayer = function(index) {
  this.layer = this.layers[index];
}

Frame.prototype.topLayers = function() {
	// slice current index to end
	// draw each one, also check history for applicable steps

	return [] // array of image data for animation
}

Frame.prototype.bottomLayers = function() {
	// slice 0 to current index
	// ...
}


Frame.prototype.updateData = function(dataURL) {
  this.dataURL = dataURL;
}

Frame.prototype.flattenHistory = function(max) {
  if (this.history.length > max) {
    // is possible with web worker?
    // maybe have a flatten history buffer canvas that is not attached to dom
  }
}
// move history into frame