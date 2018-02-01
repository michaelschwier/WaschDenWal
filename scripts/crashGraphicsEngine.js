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
function SinusAnimationSprite(options)
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
function MultiFrameSprite(options)
{
  SpriteBase.call(this, options)

  this.frameIndex = 0;
  this.numberOfFrames = options.numberOfFrames || 1;

  this.getNumberOfFrames = function()
  {
    return this.numberOfFrames;
  }

  this.setCurrentFrameIdx = function(newFrameIndex)
  {
    this.frameIndex = Math.min((this.numberOfFrames - 1), Math.max(0, newFrameIndex));
  }

  this.increaseCurrentFrameIdxBy = function(step)
  {
    this.setCurrentFrameIdx(this.frameIndex + step)
  }

  this.getCurrentFrameIdx = function()
  {
    return this.frameIndex;
  }

  this.update = function() 
  { 
    this.clipX = this.frameIndex * this.width;
  }

  this.reset = function()
  {
    this.frameIndex = 0;
    this.update();
  }
}

// --------------------------------------------------------------------------
function MultiFrameAnimatedSprite(options)
{
  MultiFrameSprite.call(this, options);

  this.isPlaying = false;
  this.autoRepeat = false;
  this.updateRate = options.updateRate || 1;
  this.currTickCount = 0;

  this.play = function() 
  {
    this.isPlaying = true;
  }

  this.playLoop = function() 
  {
    this.isPlaying = true;
    this.autoRepeat = true;
  }

  this.stop = function()
  {
    this.isPlaying = false;
    this.autoRepeat = false;
  }

  this.super_update = this.update;
  this.update = function()
  {
    this.currTickCount += 1;
    if (this.currTickCount >= this.updateRate) {
      this.currTickCount = 0;
      if (this.frameIndex < this.numberOfFrames - 1) {
        this.increaseCurrentFrameIdxBy(1);
      }
      else if (this.autoRepeat) {
        this.frameIndex = 0;
      }
      else {
        this.stop();
      }
    }
    this.super_update();
  }
}