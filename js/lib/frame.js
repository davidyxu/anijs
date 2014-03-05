function Frame() {
  this.dataURL = null;
}

Frame.prototype.updateData = function(dataURL) {
  this.dataURL = dataURL;
}