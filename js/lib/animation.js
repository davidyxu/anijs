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
  this.contexts.nextOnion.canvas.style.opacity = options.next.opacity;
  this.contexts.prevOnion.canvas.style.opacity = options.prev.opacity;
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
      this.currentStep.complete(results.data);
      this.nextStep();
    } else {
      this.currentStep.add(results.data);
    }
  }
}

Animation.prototype.normalizePosition = function(position) {
  return {
    x: (position.x - this.contexts.buffer.canvas.offsetLeft + pageXOffset) / this.state.view.width,
    y: (position.y - this.contexts.buffer.canvas.offsetTop + pageYOffset) / this.state.view.height
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

  canvas.addEventListener('keydown', function(e) {
    if (e.metaKey) {
      switch (e.which) {
        case 187: //ctrl +
          that.resizeView(that.state.view.x, that.state.view.y, that.state.view.width * 1.25, that.state.view.height * 1.25);
          e.preventDefault();
          break;
        case 189: //ctrl -
          that.resizeView(that.state.view.x, that.state.view.y, that.state.view.width * 0.75, that.state.view.height * 0.75);
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
      switch (e.which) {
        case 37: // left

          // todo, use that.contexts.current.canvas.clientWidth for width in pixels

          break;
        case 38: // up
          break;
        case 39: // right
          break;
        case 40: // down
          break;

      }
    }
  });

  canvas.addEventListener('keyup', function(e) {
  });

  canvas.addEventListener('keypress', function(e) {

  })
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

Animation.prototype.resizeView = function(x, y, width, height) {
   for (var context in this.contexts) {
    this.contexts[context].canvas.style.top = "-" + y + "px";
    this.contexts[context].canvas.style.left = "-" + x + "px";
    this.contexts[context].canvas.style.width = width * 100 + "%";
    this.contexts[context].canvas.style.height = height * 100 + "%"; 
  }

  this.state.view.x = x;
  this.state.view.y = y;
  this.state.view.width = width;
  this.state.view.height = height;
}

Animation.prototype.setupCanvas = function(selector) {
  var el = document.getElementById(selector);
  // todo refactor
  el.innerHTML = '<div id="layers"><canvas id="top-layers"></canvas><canvas id="buffer-layer"></canvas><canvas id="current-layer"></canvas><canvas id="bot-layers"></canvas></div><div id="onion-layer"><canvas class="onion" id="prev-onion"></canvas><canvas class="onion" id="next-onion"></canvas></div>'

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
    mouse: {
      down: false
    },
    frame: {
      current: this.frames[0],
      index: 0
    },
    view: {
      top: 0,
      left: 0,
      width: 1,
      height: 1
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
    }
  }
}

Animation.prototype.init = function(options) {
  this.setupCanvas(options.selector)

  this.history = [];
  this.frames = [new Frame()];
  this.setOnionSettings({next: {opacity: 0.25}, prev: {opacity: 0.25}});
  
  this.nextStep();
  this.setupState(options);
  this.setupSettings(options)

  this.resizeCanvas(window.innerWidth, window.innerHeight);
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
  console.log((this.state.frame.index + 1) + "/" + this.frames.length);
};

Animation.prototype.play = function(options) {
  if (!this.playInterval) {
    var delay = 1000 / (options.fps || 30) // ms delay
    var i = 0;

    var that = this;
    this.playInterval = setInterval(function() {
      that.goToFrame(i);
      if (++i >= that.frames.length) {
        if (options.repeat) {
          i = 0;
        } else {
          clearInterval(that.playInterval);
        }
      }
    }, delay);  
  }
};

Animation.prototype.stop = function() {
  if (this.playInterval) {
    clearInterval(this.playInterval);
    this.playInterval = null;
  }
};