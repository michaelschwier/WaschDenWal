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
  
  // Global variables
  var whale;
  
  // Main game lop
  function gameLoop () 
  {
    window.requestAnimationFrame(gameLoop);
    whale.render();
  }
  
  // Whale Sprite
  function WhaleSprite(options)
  {
    var frameIndex = 0;
    var tickCount = 0;
    var ticksPerFrame = options.ticksPerFrame || 0;
    var numberOfFrames = options.numberOfFrames || 1;
    
    var that = {};
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;
    that.isClean = false;

    that.update = function(addTicks) 
    {
      tickCount += addTicks;
      if (tickCount > ticksPerFrame) {
        tickCount = 0;
        if (frameIndex < numberOfFrames - 2) {
          frameIndex += 1;
        } 
        else {
          frameIndex = 9;
          that.isClean = true;
        }
      }
    };

    that.reset = function()
    {
      frameIndex = 0;
      that.isClean = false;
    }

    that.render = function() 
    {
      // Clear the canvas
      that.context.clearRect(0, 0, that.width, that.height);
      
      // Draw the animation
      that.context.drawImage(
        that.image,
        frameIndex * that.width / numberOfFrames,
        0,
        that.width / numberOfFrames,
        that.height,
        0,
        0,
        that.width / numberOfFrames,
        that.height);
    };
    return that;
  }

  // Event Handlers
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
  
  // ----- MAIN ----
  // Get canvas
  var canvas;          
  canvas = document.getElementById("gameCanvas");
  canvas.width = 400;
  canvas.height = 200;
  
  // Create sprite sheet
  var whaleImage;
  whaleImage = new Image();  
  
  // Create sprite
  whale = WhaleSprite({
    context: canvas.getContext("2d"),
    width: 4000,
    height: 200,
    image: whaleImage,
    numberOfFrames: 10,
    ticksPerFrame: 30
  });
  
  // Load sprite sheet and start loop when loaded
  whaleImage.addEventListener("load", gameLoop);
  whaleImage.src = "images/whale-sprite_4000x200.png";

  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("mousemove", handleTouchMove);
  canvas.addEventListener("mousedown", handleMouseDown);

} ());

