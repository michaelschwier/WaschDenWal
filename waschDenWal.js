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
  var gamestate;
  var questionServer;

  // --------------------------------------------------------------------------
  //! Serves questions in a random order but makes sure no question is 
  //! repeated before all others have been shown.
  function RandomQuestionServer()
  {  
    const questions = [
      {
        q: "Ist der Wal ein Fisch oder ein S&auml;ugetier?",
        c: "S&auml;ugetier",
        w: "Fisch"
      },
      {
        q: "Muss ein Wal auftauchen und Luft holen oder kann er einfach  weiterschwimmen?",
        c: "Auftauchen",
        w: "Weiterschwimmen"
      },
      {
        q: "Ein Blauwal kann bis zu 150 Tonnen schwer werden, das ist so viel wie 150 Autos wiegen, und ist damit das schwerste Tier auf der Erde. Stimmt das?",
        c: "Stimmt voll, du Landratte!",
        w: "So ein Quallenquatsch!"
      },
      {
        q: "Wie nennt man die Sprache der Wale?",
        c: "Walgesang",
        w: "Walgelaber"
      },
      {
        q: "Wale k&ouml;nnen sich gegenseitig h&ouml;ren, auch wenn sie mehrere hundert Kilometer weit voneinaneinder entfernt sind. Stimmt das?",
        c: "Das ist doch so klar wie Klabautermannrotze!",
        w: "Die haben doch gar keine Ohren"
      },
      {
        q: "Die Schwanzflosse eines Wals nennt man auch: ",
        c: "Fluke",
        w: "Walfischantriebspaddeldingsbums"
      },
      {
        q: "Die sogenannten Bartenwale essen am liebsten: ",
        c: "Plankton und Krill",
        w: "Pommes und Nudeln"
      },
      {
        q: "Welche zwei Arten von Walen gibt es?",
        c: "Bartwale und Zahnwale",
        w: "Spektralwale und Farbwale"
      },
      {
        q: "Den Spitznamen &bdquo;Einhorn des Meeres&ldquo; tr&auml;gt der Narwal, weil er so einen gro&szlig;en Sto&szlig;zahn hat. ",
        c: "Aber klar, du Leichtmatrose!",
        w: "Erz&auml;hl doch keinen Makrelenmurks! "
      },
      {
        q: "Welche Tiere gelten als die n&auml;chsten lebenden Verwandten der Wale?",
        c: "Flusspferde",
        w: "Pudel"
      },
    ]
    var questionSelectIndex = questions.length;
    var questionIndexList = [];

    function createShuffledIndexList()
    {
      questionIndexList = [];
      for (var n = 0; n < questions.length; n++) {
        questionIndexList.push(n);
        var j, x, i;
        for (i = questionIndexList.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = questionIndexList[i];
          questionIndexList[i] = questionIndexList[j];
          questionIndexList[j] = x;
        }
      }
    }

    this.getNextQuestion = function()
    {
      if (questionSelectIndex >= questions.length) {
        createShuffledIndexList();
        questionSelectIndex = 0;
      }
      question = questions[questionIndexList[questionSelectIndex]];
      questionSelectIndex += 1;
      return question;
    }
  }
  
  
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

    this.update = function update(addTicks) 
    {
      if (!this.isClean) {
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
        this.clipX = frameIndex * this.width;
      }
    };

    this.reset = function()
    {
      this.isClean = false;
      frameIndex = 0;
      this.update(0);
    }
  }

  // --------------------------------------------------------------------------
  function handleTouchMove(e)
  {
    whale.update(1);
  }

  function handleMouseDown(e)
  {
  }

  function handleCorrectAnswer()
  {
    const quizContainer = document.getElementById("quizContainer");
    var htmlOutput = []
    htmlOutput.push(`<p>Voll richtig! Wasch den Wal nochmal!</p>`);
    quizContainer.innerHTML = htmlOutput.join("");
    whale.reset();
    gamestate = 1;
  }

  function handleWrongAnswer()
  {
    const quizContainer = document.getElementById("quizContainer");
    var htmlOutput = []
    htmlOutput.push(`<p>Oh nein, die Antwort war leider falsch! Wasch den Wal nochmal!</p>`);
    quizContainer.innerHTML = htmlOutput.join("");
    whale.reset();
    gamestate = 1;  }

  // --------------------------------------------------------------------------
  function showQuestion()
  {
    const quizContainer = document.getElementById("quizContainer");
    var htmlOutput = []
    currQuestion = questionServer.getNextQuestion();
    htmlOutput.push(`<p>Yay der Wal ist sauber und gl&uuml;cklich!</p>`);
    htmlOutput.push(`<p>${currQuestion.q}</p>`);
    if (Math.random() < 0.5) {
      htmlOutput.push(`<p><button id="correct">${currQuestion.c}</button></p>`);
      htmlOutput.push(`<p><button id="wrong">${currQuestion.w}</button></p>`);
    }
    else {
      htmlOutput.push(`<p><button id="wrong">${currQuestion.w}</button></p>`);      
      htmlOutput.push(`<p><button id="correct">${currQuestion.c}</button></p>`);
    }
    quizContainer.innerHTML = htmlOutput.join("");
    document.getElementById("correct").addEventListener("click", handleCorrectAnswer);
    document.getElementById("wrong").addEventListener("click", handleWrongAnswer);    
  }

  // --------------------------------------------------------------------------
  function gameLoop() 
  {
    window.requestAnimationFrame(gameLoop);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    waveFront.update();
    waveBack.update();

    waveBack.render();
    whale.render();
    waveFront.render();

    if (gamestate == 1) {
      if (whale.isClean) {
        gamestate = 2;
        showQuestion();
      }
    }
  }

  // --------------------------------------------------------------------------
  function initGame()
  {
    // Get canvas
    canvas = document.getElementById("gameCanvas");
    canvas.width = 400;
    canvas.height = 200;
    
    // Create fame objects
    whale = new Whale({
      context: canvas.getContext("2d"),
      width: 400,
      height: 200,
      image: resources.getImage("whale"),
      numberOfFrames: 10,
      ticksPerFrame: 2
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

    gamestate = 1;
    questionServer = new RandomQuestionServer();
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

