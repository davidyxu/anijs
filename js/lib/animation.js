function Animation(options) {
    this.init(options);
}

Animation.prototype.drawLayers = function() {
  this.drawCurrentLayer();
  this.drawTopLayers();
  this.drawBotLayers();
  this.drawOnionLayers();
};

Animation.prototype.clearCanvas = function(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};

Animation.prototype.drawTopLayers = function() {
  this.clearCanvas(this.contexts.topFrames);
};

Animation.prototype.drawBotLayers = function() {
  this.clearCanvas(this.contexts.botFrames);
};

// possible factor out
Animation.prototype.drawCurrentLayer = function() {
  this.clearCanvas(this.contexts.current);

  if (this.state.frame.current.dataURL) {
    var img = new Image();
    img.src = this.state.frame.current.dataURL
    this.contexts.current.drawImage(img, 0, 0);

  }
};

Animation.prototype.drawLayer = function(context, frame) {
  this.clearCanvas(context);

  if (frame.dataURL) {
    var img = new Image();
    img.src = frame.dataURL
    context.drawImage(img, 0, 0);

  }
};

Animation.prototype.applyFilter = function(context, frame, options) {
  var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  var data = imageData.data;

  for(var i = 0; i < data.length; i += 4) {
    data[i] = options.r; // red
    data[i + 1] = options.g; // green
    data[i + 2] = options.b; // blue
  }

  context.putImageData(imageData, 0, 0);
};
Animation.prototype.setOnionSettings = function(options) {
  this.settings.onion = options || this.settings.onion;

  this.contexts.nextOnion.canvas.style.opacity = this.settings.onion.next.opacity;
  this.contexts.prevOnion.canvas.style.opacity = this.settings.onion.prev.opacity;
}

Animation.prototype.muteOnionLayers = function() {
  this.contexts.nextOnion.canvas.style.opacity = 0;
  this.contexts.prevOnion.canvas.style.opacity = 0;
}


Animation.prototype.drawOnionLayers = function() {
  if (this.contexts.nextOnion.canvas.style.opacity > 0) { this.drawNextOnion(); }
  if (this.contexts.prevOnion.canvas.style.opacity > 0) { this.drawPrevOnion(); }
};

// refactor onion logic to pass in onion context to drawOnionLayer
Animation.prototype.drawNextOnion = function() {
  this.clearCanvas(this.contexts.nextOnion);
  var frame = this.frames[this.state.frame.index + 1]
  if (frame) {
    this.drawLayer(this.contexts.nextOnion, frame);
    this.applyFilter(this.contexts.nextOnion, frame, {r:0, g:0, b:255});
  }
};

Animation.prototype.drawPrevOnion = function() {
  this.clearCanvas(this.contexts.prevOnion);
  var frame = this.frames[this.state.frame.index - 1];
  if (frame) {
    this.drawLayer(this.contexts.prevOnion, frame);
    this.applyFilter(this.contexts.prevOnion, frame, {r:255, g:0, b:0});
  }
};

Animation.prototype.setTool = function(Tool) {
  this.tool = new Tool(this.contexts.buffer);
}

Animation.prototype.processEvent = function(results) {
  if (results) {
    if (!this.currentStep.tool) {
      this.currentStep.setTool(this.tool);
    }

    if (results.complete) {
      this.currentStep.add(results.data);
      this.currentStep.replay();
      this.nextStep();
    } else {
      this.currentStep.add(results.data);
    }
  }
}

Animation.prototype.normalizePosition = function(position) {
  return {
    x: (position.x - this.contexts.buffer.canvas.offsetLeft + pageXOffset) / this.state.view.factor,
    y: (position.y - this.contexts.buffer.canvas.offsetTop + pageYOffset) / this.state.view.factor
  }
}

// todo, refactor listeners out
Animation.prototype.setupBufferListeners = function(canvas) {
  var that = this;

  canvas.addEventListener('mousedown', function(e) {
    that.state.mouse.down = true;
    that.processEvent(that.tool.mouseDown(that.normalizePosition(e)));
  });
  
  canvas.addEventListener('mouseup', function(e) {
    that.state.mouse.down = false;
    that.processEvent(that.tool.mouseUp(that.normalizePosition(e)));
  });

  canvas.addEventListener('mousemove', function(e) {
    that.state.mouse.x = e.x;
    that.state.mouse.y = e.y;
    if (that.state.mouse.down) {
      that.processEvent(that.tool.mouseMove(that.normalizePosition(e)));
    }
  });

  // add event listener for view change

  canvas.addEventListener('keydown', function(e) {
    if (e.metaKey) {
      switch (e.which) {
        case 187: //ctrl +
          that.changeView(that.state.view.x, that.state.view.y, that.state.view.factor * 1.25);
          e.preventDefault();
          break;
        case 189: //ctrl -
          that.changeView(that.state.view.x, that.state.view.y, that.state.view.factor * 0.75);
          e.preventDefault();
          break;
      }
    } else if (e.shiftKey) {
      switch (e.which) {
      case 187: // +
        that.addFrame(that.frames.length);
        break;
      case 188: // <
        that.prevFrame();
        break;
      case 190: // >
        that.nextFrame();
        break;
      default:
        console.log(e.which)
        break;
    }
    } else {
      console.log(that.state.view)
      switch (e.which) {
        case 32: // space
          that.togglePlay({repeat: true})
          break;
        case 37: // left
          // todo, use that.contexts.current.canvas.clientWidth for width in pixels
          that.state.keys.left = true;
          break;
        case 38: // up
          that.state.keys.up = true;
          break;
        case 39: // right
          that.state.keys.right = true;
          break;
        case 40: // down
          that.state.keys.down = true;
          break;
        default:
          console.log(e.which);
          break;
      }
    }
  });

  canvas.addEventListener('keypress', function(e) {
  });

  canvas.addEventListener('keyup', function(e) {
    switch (e.which) {
      case 32: // space
        break;
      case 37: // left
        that.state.keys.left = false;
        break;
      case 38: // up
        that.state.keys.up = false;
        break;
      case 39: // right
        that.state.keys.right = false;
        break;
      case 40: // down
        that.state.keys.down = false;
        break;
      }
  });

  var x = 0,
      y = 0,
      speed = 10;

  setInterval(function() {
    if (that.state.keys.left) {
      x = -speed;
    } else if (that.state.keys.right) {
      x = speed;
    } else {
      x = 0;
    }
    if (that.state.keys.up) {
      y = -speed;
    } else if (that.state.keys.down) {
      y = speed;
    } else {
      y = 0;
    }

    if (x || y) {
      that.changeView(that.state.view.x + x, that.state.view.y + y, that.state.view.factor);
    }
  }, 50);
}

Animation.prototype.boundedViews = function(x, y) {
  if (x + this.container.offsetWidth > this.contexts.current.canvas.clientWidth) {
    x = this.contexts.current.canvas.clientWidth - this.container.offsetWidth;
  }

  if (y + this.container.offsetHeight > this.contexts.current.canvas.clientHeight) {
    y = this.contexts.current.canvas.clientHeight - this.container.offsetHeight;
  }

  if (x < 0) {
    x = 0;
  }
  if (y < 0) {
    y = 0;
  }

  return {x: x, y: y}
}

Animation.prototype.nextStep = function() {
  if (this.currentStep) {
    this.history.push(this.currentStep);
  }

  this.currentStep = new Step(this.contexts.current);
}
Animation.prototype.resizeCanvas = function(width, height) {
  this.state.frame.current.updateData(this.contexts.current.canvas.toDataURL());

  for (var context in this.contexts) {
    this.contexts[context].canvas.width = width;
    this.contexts[context].canvas.height = height; 
  }

  this.drawLayers();
}

Animation.prototype.changeView = function(x, y, factor) {
  if (this.state.view.factor != factor) {
    for (var context in this.contexts) {
      this.contexts[context].canvas.style.width = factor * this.contexts[context].canvas.width + "px";
      this.contexts[context].canvas.style.height = factor * this.contexts[context].canvas.height + "px"; 
    }
    this.state.view.factor = factor;  
  }
  
  boundedPosition = this.boundedViews(x, y)
  for (var context in this.contexts) {
    this.contexts[context].canvas.style.top = "-" + boundedPosition.y + "px";
    this.contexts[context].canvas.style.left = "-" + boundedPosition.x + "px";
  }

  this.state.view.x = boundedPosition.x;
  this.state.view.y = boundedPosition.y;
}

Animation.prototype.setupCanvas = function(selector) {
  this.container = document.getElementById(selector);
  // todo refactor
  this.container.innerHTML = '<div id="layers"><canvas id="top-layers"></canvas><canvas id="buffer-layer"></canvas><canvas id="current-layer"></canvas><canvas id="bot-layers"></canvas></div><div id="onion-layer"><canvas class="onion" id="prev-onion"></canvas><canvas class="onion" id="next-onion"></canvas></div>'

  this.contexts = {
    buffer: document.getElementById('buffer-layer').getContext('2d'),
    topFrames: document.getElementById('top-layers').getContext('2d'),
    current: document.getElementById('current-layer').getContext('2d'),
    botFrames: document.getElementById('bot-layers').getContext('2d'),
    nextOnion: document.getElementById('next-onion').getContext('2d'),
    prevOnion: document.getElementById('prev-onion').getContext('2d')
  }
};

Animation.prototype.setupState = function(options) {
  this.state = {
    playing: null,
    mouse: {
      down: false
    },
    keys: {
      left: false,
      right: false,
      up: false,
      down: false
    },
    frame: {
      current: this.frames[0],
      index: 0
    },
    view: {
      x: 0,
      y: 0,
      factor: 1
    }
  }
};

Animation.prototype.setupSettings = function(options) {
  this.settings = {
    history: {
      max: 100,
      min: 50
    },
    view: {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    onion: {
      next: {opacity: 0.25},
      prev: {opacity: 0.25}
    }
  }
}

Animation.prototype.init = function(options) {
  this.setupCanvas(options.selector);

  this.frames = [new Frame()];

  this.setupState(options);
  this.setupSettings(options);
  this.setOnionSettings();

  this.history = [];  
  this.nextStep();

  this.resizeCanvas(options.width || window.innerWidth, options.height || window.innerHeight);
  this.setupBufferListeners(document);
  this.setTool(Pencil);
};

Animation.prototype.goToFrame = function(index) {
    if (index < 0) {
      index = 0;
    } else if (index > this.frames.length - 1) {
      index = this.frames.length - 1;
    }

    this.state.frame.current.updateData(this.contexts.current.canvas.toDataURL());

    this.state.frame.index = index;
    this.state.frame.current  = this.frames[index];

    this.drawLayers();

    this.frameCount();
}

Animation.prototype.prevFrame = function() {
  this.goToFrame(this.state.frame.index - 1);
}

Animation.prototype.nextFrame = function() {
  this.goToFrame(this.state.frame.index + 1); 
}

Animation.prototype.addFrame = function(index) {
  if (index <= 0) {
    index = 0;
    this.frames.splice(index, 0, new Frame());
  } else if (index >= this.frames.length) {
    index = this.frames.length;
    this.frames.push(new Frame());
  }

  if (index < this.state.frame.index) {
    ++this.state.frame.index; 
  }

  this.frameCount();
}

// todo, probably should be moved out to tool
Animation.prototype.clear = function(posX, posY, width, height) {

}

Animation.prototype.copy = function(posX, posY, width, height) {
  // create imagedata into copy buffer
}

Animation.prototype.crop = function(posX, posY, width, height) {
  this.copy(posX, posY, width, height);
  this.clear(posX, posY, width, height);
};

Animation.prototype.flattenHistory = function() {
  
};

Animation.prototype.export = function(filetype) {
  // export file
};

Animation.prototype.frameCount = function() {
  if (!this.state.playing) {
    console.log((this.state.frame.index + 1) + "/" + this.frames.length);
  }
};

Animation.prototype.togglePlay = function(options) {
  if (this.state.playing) {
    this.stop();
  } else {
    this.play(options);
  }
}

Animation.prototype.play = function(options) {
  if (!this.state.playing) {
    if (!options.onion) {
      this.muteOnionLayers();
    }
    var delay = 1000 / (options.fps || 30) // ms delay
    var i = this.state.frame.index;

    var that = this;
    this.state.playing = setInterval(function() {
      that.goToFrame(i);
      if (++i >= that.frames.length) {
        if (options.repeat) {
          i = 0;
        } else {
          this.stop();
        }
      }
    }, delay);
  }
};

Animation.prototype.stop = function() {
  clearInterval(this.state.playing);
  this.setOnionSettings();
  this.state.playing = null;
};