(function() {
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  // MIT license

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                 || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                                   timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

  if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
}());


(function() {
  
  // ----- Global variables -------------------------------
  var resources;
  var whale;
  var waveFront;
  var waveBack;
  var canvas;
  
  // --------------------------------------------------------------------------
  function ResourcePreLoader()
  {
    var images = {};
    var loadedImagesCount = 0;
    var callback = null;

    this.addImage = function(name, src)
    {
      images[name] = src;
    }

    this.getImage = function(name)
    {
      return images[name];
    }

    function loadNext()
    {
      var imageSrc = null;
      var key;
      for (key in images) {
        var value = images[key];
        if (typeof value === 'string') {
          imageSrc = value;
          break;
        }
      }
      if (imageSrc) {
        var image = new Image();
        images[key] = image;
        image.addEventListener("load", loadNext);
        image.src = imageSrc;
      }
      else {
        callback();
      }
    }

    this.loadAndCallWhenDone = function(c)
    {
      callback = c;
      loadNext();
    }
  }
  
  // --------------------------------------------------------------------------
  function SpriteBase(options)
  {
    this.image = options.image;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width;
    this.height = options.height;
    this.clipX = options.clipX || this.x;
    this.clipY = options.clipY || this.y;
    this.clipWidth = options.clipWidth || this.width;
    this.clipHeight = options.clipHeight || this.height;
    this.context = options.context;

    this.render = function()
    {
      this.context.drawImage(
        this.image,
        this.clipX,
        this.clipY,
        this.clipWidth,
        this.clipHeight,
        this.x,
        this.y,
        this.width,
        this.height);
    }
  }
  
  // --------------------------------------------------------------------------
  function Wave(options)
  {
    SpriteBase.call(this, options)

    var verticalRelPos = 0.0;
    var horizontalRelPos = 0.0;
    var verticalStepSize = Math.PI / options.verticalSteps;
    var horizontalStepSize = Math.PI / options.horizontalSteps;
    var verticalMoveRange = options.verticalMoveRange;
    var horizontalMoveRange = options.horizontalMoveRange;

    this.update = function()
    {
      verticalRelPos += verticalStepSize;
      if (verticalRelPos > (2 * Math.PI)) {
        verticalRelPos -= (2 *Math.PI);
      }
      horizontalRelPos += horizontalStepSize;
      if (horizontalRelPos > (2 * Math.PI)) {
        horizontalRelPos -= (2 *Math.PI);
      }
      this.clipX = horizontalMoveRange + Math.sin(horizontalRelPos) * horizontalMoveRange;
      this.clipY = verticalMoveRange + Math.sin(verticalRelPos) * verticalMoveRange;
    }
  }
  
  
  // --------------------------------------------------------------------------
  function Whale(options)
  {
    SpriteBase.call(this, options)

    var frameIndex = 0;
    var tickCount = 0;
    var ticksPerFrame = options.ticksPerFrame || 0;
    var numberOfFrames = options.numberOfFrames || 1;
    
    this.isClean = false;

    this.update = function(addTicks) 
    {
      tickCount += addTicks;
      if (tickCount > ticksPerFrame) {
        tickCount = 0;
        if (frameIndex < numberOfFrames - 2) {
          frameIndex += 1;
        } 
        else {
          frameIndex = 9;
          this.isClean = true;
        }
      }
    };

    this.reset = function()
    {
      frameIndex = 0;
      this.isClean = false;
    }

    this.render = function() 
    {
      this.context.drawImage(
        this.image,
        frameIndex * this.width / numberOfFrames,
        0,
        this.width / numberOfFrames,
        this.height,
        this.x,
        this.y,
        this.width / numberOfFrames,
        this.height);
    };
  }

  // --------------------------------------------------------------------------
  function handleTouchMove(e)
  {
    whale.update(1);
  }

  function handleMouseDown(e)
  {
    if (whale.isClean) {
      whale.reset();
    }
  }

  // --------------------------------------------------------------------------
  function gameLoop () 
  {
    window.requestAnimationFrame(gameLoop);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    waveFront.update();
    waveBack.update();

    waveBack.render();
    whale.render();
    waveFront.render();
  }

  // --------------------------------------------------------------------------
  function initGame()
  {
    // Get canvas
    canvas = document.getElementById("gameCanvas");
    canvas.width = 400;
    canvas.height = 200;
    
    // Create sprite
    whale = new Whale({
      context: canvas.getContext("2d"),
      width: 4000,
      height: 200,
      image: resources.getImage("whale"),
      numberOfFrames: 10,
      ticksPerFrame: 10
    });
    
    waveBack = new Wave({
      context: canvas.getContext("2d"),
      width: 400,
      height: 180,
      x: 0,
      y: 20,
      image: resources.getImage("waveBack"),
      horizontalSteps: 433,
      verticalSteps: 123,
      horizontalMoveRange: 20,
      verticalMoveRange: 6
    })

    waveFront = new Wave({
      context: canvas.getContext("2d"),
      width: 400,
      height: 180,
      x: 0,
      y: 20,
      image: resources.getImage("waveFront"),
      horizontalSteps: 387,
      verticalSteps: 103,
      horizontalMoveRange: 30,
      verticalMoveRange: 4
    })

    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("mousemove", handleTouchMove);
    canvas.addEventListener("mousedown", handleMouseDown);

    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  resources = new ResourcePreLoader();
  resources.addImage("waveBack", "images/waves_back.png");
  resources.addImage("waveFront", "images/waves_front.png");
  resources.addImage("whale", "images/whale-sprite_4000x200.png");
  resources.loadAndCallWhenDone(initGame);
} ());

