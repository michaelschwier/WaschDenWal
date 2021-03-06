(function() {
  // ----- Global variables -------------------------------
  var resources;
  var canvas;
  var gamePhase;
  var questionServer;
  var playerScore = 0;
  var gLanguage = "de"

  // --------------------------------------------------------------------------
  //! Translation functionality, very simple
    const translations = {
      de: {
        "Scrub the whale with your finger or the mouse to wash it!":
        "Schrubbe kr&auml;ftig mit dem Finger oder der Maus &uuml;ber den Wal, um ihn zu waschen!",

        "Correct! Wash the whale again!":
        "Voll richtig! Wasch den Wal nochmal!",

        "You answered correctly 3x in a row! Wash the whale with shampoo!":
        "Du hast 3x hintereinander richtig geantwortet! Wasch den Wal mit Shampoo!",

        "Oh no, the answer was wrong! Wash the whale again!":
        "Oh nein, die Antwort war leider falsch! Wasch den Wal nochmal!",

        "Yay, the whale is clean and happy!":
        "Yay, der Wal ist sauber und gl&uuml;cklich!"
      }
    };

  function tr(text)
  {
    if ((gLanguage in translations) && (text in translations[gLanguage])) {
      return translations[gLanguage][text];
    }
    else {
      return text;
    }
  }
  
  
  // --------------------------------------------------------------------------
  //! Serves questions in a random order but makes sure no question is 
  //! repeated before all others have been shown.
  function RandomQuestionServer(language)
  {  
    const questionsMultilingual = {
      de: [
        {
          q: "Ist der Wal ein Fisch oder ein S&auml;ugetier?",
          c: "S&auml;ugetier",
          w: "Fisch"
        },
        {
          q: "Muss ein Wal auftauchen und Luft holen oder kann er einfach weiterschwimmen?",
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
        }
      ],
      en: [
        {
          q: "Question 1?",
          c: "Correct Answer 1",
          w: "Wrong Answer 1"
        },
        {
          q: "Question 2?",
          c: "Correct Answer 2",
          w: "Wrong Answer 2"
        },
        {
          q: "Question 3?",
          c: "Correct Answer 3",
          w: "Wrong Answer 3"
        }
      ]
    };
    const questions = questionsMultilingual[language];
    var questionSelectIndex = questions.length;
    var questionIndexList = [];

    function createShuffledIndexList()
    {
      questionIndexList = [];
      for (var n = 0; n < questions.length; n++) {
        questionIndexList.push(n);
      }
      var j, x, i;
      for (i = questionIndexList.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = questionIndexList[i];
        questionIndexList[i] = questionIndexList[j];
        questionIndexList[j] = x;
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
  function Whale(options)
  {
    this.whaleSprite = new MultiFrameSprite({
      context: canvas.getContext("2d"),
      width: 600,
      height: 600,
      image: resources.getImage("whale"),
      numberOfFrames: 12
    });
    this.overlaySprite = new MultiFrameSprite({
      context: canvas.getContext("2d"),
      width: 600,
      height: 600,
      image: resources.getImage("dirt"),
      numberOfFrames: 12
    });
    this.scrubCount = 0;
    this.scrubsPerDirtLevel = options.scrubsPerDirtLevel;
    
    this.scrub = function()
    {
      if (!this.isClean()) {
        this.scrubCount += 1;
        if (this.scrubCount > this.scrubsPerDirtLevel) {
          this.scrubCount = 0;
          this.whaleSprite.increaseCurrentFrameIdxBy(1);
          this.overlaySprite.increaseCurrentFrameIdxBy(1);
        }
      }
    }

    this.update = function update() 
    {
      this.whaleSprite.update();
      this.overlaySprite.update();
    }

    this.render = function()
    {
      this.whaleSprite.render();
      this.overlaySprite.render();
    }

    this.reset = function()
    {
      this.whaleSprite.reset();
      this.overlaySprite.reset();
    }

    this.isClean = function()
    {
      return (this.whaleSprite.getCurrentFrameIdx() >= this.whaleSprite.getNumberOfFrames() - 1);
    }
  }
  
  // --------------------------------------------------------------------------
  function ShampooWhale(options)
  {
    Whale.call(this, options);
    this.shampooOverlaySprite = new MultiFrameSprite({
      context: canvas.getContext("2d"),
      width: 600,
      height: 600,
      image: resources.getImage("shampoo"),
      numberOfFrames: 9
    });
    var shampooed = false;

    this.scrub = function()
    {
      this.scrubCount += 1;
      if(!shampooed) {
        if (this.scrubCount > this.scrubsPerDirtLevel) {
          this.scrubCount = 0;
          this.shampooOverlaySprite.increaseCurrentFrameIdxBy(1);
          currShampooFrameIdx = this.shampooOverlaySprite.getCurrentFrameIdx();
          shampooNumberOfFrames = this.shampooOverlaySprite.getNumberOfFrames()
          if (currShampooFrameIdx >= shampooNumberOfFrames - 1) {
            shampooed = true;
          }
        }
      }
      else if (!this.isClean()) {
        if (this.scrubCount > this.scrubsPerDirtLevel) {
          this.scrubCount = 0;
          this.whaleSprite.increaseCurrentFrameIdxBy(1);
          this.overlaySprite.increaseCurrentFrameIdxBy(1);
          this.shampooOverlaySprite.increaseCurrentFrameIdxBy(-1);
        }
      }
    }

    this.update = function update() 
    {
      this.whaleSprite.update();
      this.overlaySprite.update();
      this.shampooOverlaySprite.update();
    }

    this.render = function()
    {
      this.whaleSprite.render();
      this.overlaySprite.render();
      this.shampooOverlaySprite.render();
    }
  }
  
  // --------------------------------------------------------------------------
  function handleMouseMove(e)
  {
    gamePhase.handleMouseMove();
  }
  
  // --------------------------------------------------------------------------
  function IntroPhase(titleDelay = 100) {
    var delayUntilTitle = titleDelay;
    var delayUntilGame = 100 + delayUntilTitle;
    const quizContainer = document.getElementById("quizContainer");
    quizContainer.innerHTML = "";
    playerScore = 0;

    this.handleMouseMove = function()
    { }

    this.update = function()
    {
      delayUntilTitle -= 1;
      delayUntilGame -= 1;
    }

    this.render = function()
    {
      if (delayUntilTitle == 0) {
        document.getElementById("gameContainer").style.backgroundImage=`url(images/${gLanguage}/title-02.png)`;
      }
      if (delayUntilGame == 0) {
        document.getElementById("gameContainer").style.backgroundImage="url(images/background.png)"; 
        const quizContainer = document.getElementById("quizContainer");
        quizContainer.innerHTML = `<p>${tr("Scrub the whale with your finger or the mouse to wash it!")}</p>`;
      }
    }

    this.getNextGamePhase = function()
    {
      if (delayUntilGame < 0) 
      {
        var whale = new Whale({
          scrubsPerDirtLevel: 10
        });
        
        var waveBack = new SinusAnimationSprite({
          context: canvas.getContext("2d"),
          width: 600,
          height: 250,
          x: 0,
          y: 240,
          image: resources.getImage("waveBack"),
          horizontalSteps: 433,
          verticalSteps: 123,
          horizontalMoveRange: 20,
          verticalMoveRange: 6
        });
    
        var waveFront = new SinusAnimationSprite({
          context: canvas.getContext("2d"),
          width: 600,
          height: 250,
          x: 0,
          y: 360,
          image: resources.getImage("waveFront"),
          horizontalSteps: 387,
          verticalSteps: 103,
          horizontalMoveRange: 30,
          verticalMoveRange: 4
        });
    
        return new WashPhase({
          backGround: waveBack,
          foreGround: waveFront,
          whale: whale
        });
      }
      else {
        return this;
      }
    }
  }
  
  // --------------------------------------------------------------------------
  function GamePhase(scene) 
  {
    this.backGround = scene.backGround;
    this.foreGround = scene.foreGround;
    this.whale = scene.whale;

    this.handleMouseMove = function()
    { }

    this.update = function()
    { 
      this.backGround.update();
      this.whale.update();
      this.foreGround.update();
    }

    this.render = function()
    { 
      this.backGround.render();
      this.whale.render();
      this.foreGround.render();
    }

    this.getNextGamePhase = function()
    { 
      return this;
    }
  }
  
  // --------------------------------------------------------------------------
  function WashPhase(scene) 
  {
    GamePhase.call(this, scene);
    var chachedScene = scene;
    this.whale.reset();

    this.handleMouseMove = function()
    {
      this.whale.scrub();
    }

    this.getNextGamePhase = function()
    {
      if (this.whale.isClean()) {
        var followUpGamePhase = new QuestionPhase(chachedScene);
        return new IdlePhase(chachedScene, 30, followUpGamePhase);
      }
      else {
        return this;
      }
    }
  }

  // --------------------------------------------------------------------------
  function WashPhaseDeluxeIntro(scene)
  {
    GamePhase.call(this, scene);
    var chachedScene = scene;
    var sceneEndCountdown = 80;
    this.shampoAnimation = new MultiFrameAnimatedSprite({
      context: canvas.getContext("2d"),
      width: 600,
      height: 600,
      image: resources.getImage("shampooBottle"),
      numberOfFrames: 11,
      updateRate: 10
    });
    this.shampoAnimation.play();

    this.super_update = this.update;
    this.update = function()
    {
      if (this.shampoAnimation.getCurrentFrameIdx() >= this.shampoAnimation.getNumberOfFrames() - 1) {
        sceneEndCountdown -= 1;
      }
      this.super_update();
      this.shampoAnimation.update();
    }

    this.super_render = this.render;
    this.render = function()
    {
      this.super_render();
      this.shampoAnimation.render();
    }

    this.getNextGamePhase = function()
    {
      if (sceneEndCountdown <= 0) {
        return new WashPhaseDeluxe(chachedScene);
      }
      else {
        return this;
      }
    }
  }

  // --------------------------------------------------------------------------
  function WashPhaseDeluxe(scene) 
  {
    GamePhase.call(this, scene);
    var chachedScene = scene;
    this.whale = new ShampooWhale({
      scrubsPerDirtLevel: 10
    });

    this.handleMouseMove = function()
    {
      this.whale.scrub();
    }

    this.getNextGamePhase = function()
    {
      if (this.whale.isClean()) {
        var followUpGamePhase = new IntroPhase(1);
        return new IdlePhase(chachedScene, 200, followUpGamePhase);
      }
      else {
        return this;
      }
    }
  }

  // --------------------------------------------------------------------------
  function IdlePhase(scene, idleDuration, followingGamePhase) 
  {
    GamePhase.call(this, scene);
    var chachedScene = scene;
    var idleTimeLeft = idleDuration;
    var nextGamePhase = followingGamePhase;

    this.super_update = this.update;
    this.update = function()
    {
      this.super_update();
      idleTimeLeft -= 1;
    }

    this.getNextGamePhase = function()
    {
      if (idleTimeLeft <= 0) {
        return nextGamePhase;
      }
      else {
        return this;
      }
    }
  }
  
  // --------------------------------------------------------------------------
  function QuestionPhase(scene) 
  {
    GamePhase.call(this, scene);
    var cachedScene = scene;
    var questionShown = false;
    var finished = false;

    function handleCorrectAnswer()
    {
      playerScore += 1;
      const quizContainer = document.getElementById("quizContainer");
      var htmlOutput = []
      if (playerScore < 3) {
        htmlOutput.push(`<p>${tr("Correct! Wash the whale again!")}</p>`);
      }
      else {
        htmlOutput.push(`<p>${tr("You answered correctly 3x in a row! Wash the whale with shampoo!")}</p>`);        
      }
      quizContainer.innerHTML = htmlOutput.join("");
      finished = true;
    }
  
    function handleWrongAnswer()
    {
      playerScore = 0;
      const quizContainer = document.getElementById("quizContainer");
      var htmlOutput = []
      htmlOutput.push(`<p>${tr("Oh no, the answer was wrong! Wash the whale again!")}</p>`);
      quizContainer.innerHTML = htmlOutput.join("");
      finished = true;
    }

    function showQuestion()
    {
      const quizContainer = document.getElementById("quizContainer");
      var htmlOutput = []
      currQuestion = questionServer.getNextQuestion();
      htmlOutput.push(`<p>${tr("Yay, the whale is clean and happy!")}</p>`);
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

    this.super_update = this.update;
    this.update = function()
    {
      this.super_update();
      if (!questionShown) {
        showQuestion();
        questionShown = true;
      }
    }

    this.getNextGamePhase = function()
    {
      if(finished) {
        if (playerScore < 3) {
          return new WashPhase(cachedScene);
        }
        else {
          return new WashPhaseDeluxeIntro(cachedScene);
        }
      }
      else {
        return this;
      }
    }
  }
    
  // --------------------------------------------------------------------------
  function adjustCanvasSize()
  {
    var gameContainer = document.getElementById("gameContainer");
    var newSize = Math.min(gameContainer.offsetWidth, gameContainer.offsetHeight);
    var currSize = Math.min(canvas.width, canvas.height);

    if (newSize != currSize) {
      //console.log(gameContainer.offsetWidth, gameContainer.offsetHeight, canvas.width, canvas.height);
      canvas.width = newSize;
      canvas.height = newSize;
      newRelSize = newSize / 600.0;
      canvas.getContext("2d").setTransform(newRelSize, 0, 0, newRelSize, 0, 0);
      //console.log(gameContainer.offsetWidth, gameContainer.offsetHeight, canvas.width, canvas.height);
      //console.log("-------------------")
      }
  }
  
  // --------------------------------------------------------------------------
  function gameLoop() 
  {
    window.requestAnimationFrame(gameLoop);
    adjustCanvasSize();
    canvas.getContext("2d").clearRect(0, 0, 600, 600);

    gamePhase.update();
    gamePhase.render();
    gamePhase = gamePhase.getNextGamePhase();
  }
  
  // --------------------------------------------------------------------------
  function initGame()
  {
    canvas = document.getElementById("gameCanvas");
    adjustCanvasSize();
    questionServer = new RandomQuestionServer(gLanguage);
    gamePhase = new IntroPhase();

    canvas.addEventListener("touchmove", handleMouseMove);
    canvas.addEventListener("mousemove", handleMouseMove);
    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  if (document.getElementById("gameContainer").hasAttribute("lang")) {
    gLanguage = document.getElementById("gameContainer").getAttribute("lang");
    if ((gLanguage != "de") && (gLanguage != "en")) {
      //console.log("Language not supported!");
      gLanguage = "en"
    }
    //console.log("Switching language to", gLanguage)
  }

  resources = new ResourcePreLoader();
  resources.addImage("waveBack", "images/waves-back_700x250.png");
  resources.addImage("waveFront", "images/waves-front_700x250.png");
  resources.addImage("whale", "images/whale-sprite_600x600x12.png");
  resources.addImage("dirt", "images/dirt-sprite_600x600x12.png");
  resources.addImage("shampoo", "images/shampoo-sprite_600x600x9.png");
  resources.addImage("shampooBottle", "images/shampoo-bottle_600x600x11.png");
  resources.loadAndCallWhenDone(initGame);
} ());

