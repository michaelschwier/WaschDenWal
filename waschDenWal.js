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
  var whale;
  var waveFront;
  var waveBack;
  var canvas;
  
  // ----- Main game lop ----------------------------------
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
  
  
  // ----- Wave Animation Object -------------------------
  function Wave(options)
  {
    var verticalRelPos = 0.0;
    var horizontalRelPos = 0.0;
    var verticalStepSize = Math.PI / options.verticalSteps;
    var horizontalStepSize = Math.PI / options.horizontalSteps;
    var verticalMoveRange = options.verticalMoveRange;
    var horizontalMoveRange = options.horizontalMoveRange;

    this.context = options.context;
    this.width = options.width;
    this.height = options.height;
    this.x = options.x;
    this.y = options.y;
    this.image = options.image;

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
    }

    this.render = function()
    {
      this.context.drawImage(
        this.image,
        horizontalMoveRange + Math.sin(horizontalRelPos) * horizontalMoveRange,
        verticalMoveRange + Math.sin(verticalRelPos) * verticalMoveRange,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height);
    }
  }
  
  
  // ----- Whale Game Object ------------------------------
  function Whale(options)
  {
    var frameIndex = 0;
    var tickCount = 0;
    var ticksPerFrame = options.ticksPerFrame || 0;
    var numberOfFrames = options.numberOfFrames || 1;
    
    this.context = options.context;
    this.width = options.width;
    this.height = options.height;
    this.image = options.image;
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
        0,
        0,
        this.width / numberOfFrames,
        this.height);
    };
  }

  // ----- Event Handlers ---------------------------------
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
  
  // ----- MAIN -------------------------------------------
  // Get canvas
  canvas = document.getElementById("gameCanvas");
  canvas.width = 400;
  canvas.height = 200;
  
  // Create sprite sheet
  var whaleImage;
  whaleImage = new Image();  
  
  // Create sprite
  whale = new Whale({
    context: canvas.getContext("2d"),
    width: 4000,
    height: 200,
    image: whaleImage,
    numberOfFrames: 10,
    ticksPerFrame: 10
  });
  
  // Load sprite sheet and start loop when loaded
  whaleImage.addEventListener("load", gameLoop);
  whaleImage.src = "images/whale-sprite_4000x200.png";
  
  var waveBackImage = new Image();
  waveBack = new Wave({
    context: canvas.getContext("2d"),
    width: 400,
    height: 180,
    x: 0,
    y: 20,
    image: waveBackImage,
    horizontalSteps: 307,
    verticalSteps: 103,
    horizontalMoveRange: 20,
    verticalMoveRange: 6
  })
  waveBackImage.src = "images/waves_back.png";

  var waveFrontImage = new Image();
  waveFront = new Wave({
    context: canvas.getContext("2d"),
    width: 400,
    height: 180,
    x: 0,
    y: 20,
    image: waveFrontImage,
    horizontalSteps: 241,
    verticalSteps: 127,
    horizontalMoveRange: 30,
    verticalMoveRange: 4
  })
  waveFrontImage.src = "images/waves_front.png";

  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("mousemove", handleTouchMove);
  canvas.addEventListener("mousedown", handleMouseDown);

} ());

