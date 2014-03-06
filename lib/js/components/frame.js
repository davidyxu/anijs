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

// move history into frame