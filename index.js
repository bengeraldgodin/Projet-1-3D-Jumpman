var objCanvas = null;
var objC2D = null;
var objCycleAnimation = null;

var w = null
var h = null
var wJeu = null //dimension reelle du jeu = 320
var hJeu = null //dimension reelle du jeu = 200
var wJeu2 = null 
var hJeu2 = null
var pxW = null
var pxY = null

var objJumpman = null
var tabPlateformes = null
var tabEchelles = null
var tabBombes = null
var tabCordes = null
var objBalle = null
var objBombe = null

var objSons = null
var audioPas = null
var audioBombe = null
var audioBalle = null
var audioGameover = null
var audioSaut = null
var audioDebutPartie = null

var intVelocite = 0;
var intAcceleration = 1;
var velY = 0;
var velX = 0;
var intVitesse = 1;
var intFriction = 0.8;
var intGravite = 0.15;
var intDirection = 0; //1 droite, -1 gauche, 2 echelle, 3 corde
var intDeplacementBalleX = 0.1
var intDeplacementBalleY = 0

var intBombesDesactives = 0

var plateformeOK = false;
var plateformeCollision = null

var blnEchelleCollisionOuCorde = false
var blnCollisionEchelle = false
var blnCollisionCorde = false

var blnSaut = false
var blnDeplacementGauche = false
var blnDeplacementDroite = false

var objEtatdujeu = null
var intVies = 3
var intScore = 0
var intBonus = 0

var keys = []

var intVitesseAnimation = 30    //Plus grand = moins vite
var intCompteur = 0

var intEnSuspension = 0
var intEnSuspensionY = null

/*
* Initialiser les animations
*/
function initAnimation() {
  objCanvas = document.getElementById('monCanvas');
  objC2D = objCanvas.getContext('2d');
  
  initTailleCanvas();
  
  wJeu = 320
  hJeu = 200
  wJeu2 = wJeu/2
  hJeu2 = hJeu/2
  
  //L'utilisation de "new Array()" est très déconseillé en javascript
  tabPlateformes = []
  tabEchelles = []
  tabBombes = []
  tabCordes = []
  
  //Situé dans jumpman/initObjets.js
  initJumpman()
  initPlateformes()
  initEchelles()
  initCordes()
  initBombes()
  initBalle()
  initAudio()
  initEtatdujeu()

  dessiner(); // Dessiner une première fois
  animer(); // Démarrer l'animation
  
  audioDebutPartie.play();
}

/*
* Initialiser la taille du canvas
*/
function initTailleCanvas() {
  pxW = (window.innerWidth / 320)
  pxH = (window.innerHeight / 200)
  
  dimPx = (pxH < pxW ? pxH : pxW)
  w=dimPx*320
  h=dimPx*200
  
  objCanvas.width = w
  objCanvas.height = h
}

function initAudio() {
  audioGameover = new Audio('sons/gameover.wav');
  audioBombe = new Audio('sons/bombe.wav');
  audioBalle = new Audio('sons/balle.wav');
  audioPas = new Audio('sons/pas.wav');
  audioSaut = new Audio('sons/saut.wav');
  audioDebutPartie = new Audio('sons/debut.wav');
}

function animer() {
  // Requête pour le prochain cycle
  objCycleAnimation = requestAnimationFrame(animer);

  initTailleCanvas();
  
  // Le cycle d'animation
  effacerDessin();
  mettreAJourAnimation();
  dessiner();
  
  if (intCompteur < intVitesseAnimation)
    intCompteur++
  else
    intCompteur = 0
}

function effacerDessin() {
  objC2D.clearRect(0, 0, objCanvas.width, objCanvas.height);
}

function arreterAnimation() {
  if (objCycleAnimation != null)
    cancelAnimationFrame(objCycleAnimation);
  objCycleAnimation = null;
}

function mettreAJourAnimation() {
  var blnDeplacement = false
  
  if (!keys[39] && !keys[37]) {
    velX = 0
    intDirection = 0
  }
  if (!keys[38] && !keys[40] && (blnCollisionCorde || blnCollisionEchelle)) {
    velY = 0
    if (blnCollisionEchelle) {
      
    }
  }
  if (keys[39]) { //fleche droite
    if (velX < intVitesse) {
      velX++
      intDirection = 1
      blnDeplacement = true
    }
  }
  if (keys[37]) { //fleche gauche
    if (velX > -intVitesse) {
      velX--
      intDirection = -1
      blnDeplacement = true
    }
  }
  if (keys[32]) { //spacebar
      if(!blnSaut){
        blnSaut = true;
        velY = -intVitesse*2;
        audioSaut.play()
      }
  }
  


  velX *= intFriction //friction
  velY += intGravite
  
  blnCollisionEchelle = false
  blnCollisionCorde = false
  //check pour collision avec echelle
  for (var i = 0; i < tabEchelles.length; i++) {
    if (collision(objJumpman, tabEchelles[i])) {
      blnCollisionEchelle = true
      intDirection = 2
    }
  }
  //check pour collision avec corde, meme comportement qu'une echelle
  for (var i = 0; i < tabCordes.length; i++) {
    if (collision(objJumpman, tabCordes[i])) {
      blnCollisionCorde = true
      intDirection = 3
    }
  }

  objJumpman.intX += velX
  // if echelle, non
  if (!blnCollisionEchelle && !blnCollisionCorde) {
    objJumpman.intY += velY
  } else {
    if (blnCollisionCorde) {
      objJumpman.intY--
    }
    if (keys[38]) { //if fleche du haut, monter les escaliers ou la corde
        if (blnCollisionEchelle) {
          objJumpman.intY--
        }
        
        blnDeplacement = true
    }
    if (keys[40]) { //if fleche du bad, descendre les escaliers ou la corde
        objJumpman.intY++
        blnDeplacement = true
    }
    
  }
  
  plateformeCollision = null
  
  //collision plateforme
  for (var i = 0; i < tabPlateformes.length; i++) {
    if (collision(objJumpman, tabPlateformes[i]) && (!blnCollisionEchelle && !blnCollisionCorde)) {
      plateformeCollision = tabPlateformes[i]
      plateformeOK = true
    }

  }
  
  if (plateformeCollision == null) {
     
  } else { 
    if (objJumpman.intY >= plateformeCollision.intY-objJumpman.intHauteur){
        objJumpman.intY = plateformeCollision.intY-objJumpman.intHauteur
        blnSaut = false;
        velY = 0
    }
  }
  //physique();
  
  for (var i = 0; i < tabBombes.length; i++) {
    if (collision(objJumpman, tabBombes[i])) {
      
      if (!tabBombes[i].blnDesactive) {
        audioBombe.play()
        tabBombes[i].blnDesactive = true
        intBombesDesactives += 1
      }
      
    } 
    if (tabBombes[i].blnDesactive && i == 6) {
      tabEchelles[5].blnVisible = false
      tabEchelles[5].blnCollision = false
    }
    else if (tabBombes[i].blnDesactive && i == 7) {
      tabEchelles[8].blnVisible = false
      tabEchelles[8].blnCollision = false
    }
    else if (tabBombes[i].blnDesactive && i == 8) {
      //enlever les plateformes en 48,26;56,28;64,26 à gauche
      tabPlateformes[141].blnVisible = false
      tabPlateformes[142].blnVisible = false
      tabPlateformes[143].blnVisible = false
      
      tabPlateformes[141].blnCollision = false
      tabPlateformes[142].blnCollision = false
      tabPlateformes[143].blnCollision = false
    }
    else if (tabBombes[i].blnDesactive && i == 11) {
      //enlever les plateformes en 48,26;56,28;64,26 à gauche
      tabPlateformes[162].blnVisible = false
      tabPlateformes[163].blnVisible = false
      tabPlateformes[164].blnVisible = false
      
      tabPlateformes[162].blnCollision = false
      tabPlateformes[163].blnCollision = false
      tabPlateformes[164].blnCollision = false
    }
    
  }
  intScore = 100 * intBombesDesactives
  
  //balle
  if (objBalle.intMode == 1 || objBalle.intMode == 2) {
    objBalle.intX += objBalle.intDeplacementBalleX
    if (collisionVertical(objJumpman, objBalle) && !objBalle.blnCollisionVertical) {
      audioBalle.play()

      objBalle.blnCollisionVertical = true

      objBalle.intDeplacementBalleX = 0

      if (objJumpman.intY >= objBalle.intY) { //la balle est au dessus
        objBalle.intDeplacementBalleY = 1
      } else if (objJumpman.intY <= objBalle.intY) { //la balle est au dessous
        objBalle.intDeplacementBalleY = -1
      }
    } 
    objBalle.intY += objBalle.intDeplacementBalleY
    
    if (objBalle.intY > 182 || objBalle.intY <= 0) {
      initBalle()
    }
  } else if (objBalle.intMode == 3 || objBalle.intMode == 4) {
    objBalle.intY += objBalle.intDeplacementBalleY
    if (collisionHorizontal(objJumpman, objBalle) && !objBalle.blnCollisionHorizontal) {
      audioBalle.play()

      objBalle.blnCollisionHorizontal = true

      objBalle.intDeplacementBalleY = 0

      if (objJumpman.intX >= objBalle.intX) { //la balle est au dessus
        objBalle.intDeplacementBalleX = 1
      } else if (objJumpman.intX <= objBalle.intX) { //la balle est au dessous
        objBalle.intDeplacementBalleX = -1
      }
    } 
    objBalle.intX += objBalle.intDeplacementBalleX
    
    if (objBalle.intX > 320 || objBalle.intX < 0) {
      initBalle()
    }
  }
  
  if (collision(objJumpman, objBalle)) {
    gameOver()
  }
  
  if (blnDeplacement) {
    audioPas.play()
  }
  
  
  //fall damage
  if (plateformeCollision == null && !blnCollisionCorde && !blnCollisionEchelle) {
    if (intEnSuspensionY == null) {
      intEnSuspensionY = objJumpman.intY
    } else {
      if (intEnSuspensionY - objJumpman.intY >= 0) {
        intEnSuspension++
        console.log(intEnSuspension)
      }
       
    }
    
  } else {
    intEnSuspension = 0
  }
  
  if (objJumpman.intY >= 182) {
    gameOver()
  }
  
}


function collision(obj1, obj2) {
  if (obj1.blnCollision != null) {
    if (obj1.blnCollision) {
      return !(obj1.intX > obj2.intX + obj2.intLargeur || obj1.intX + obj1.intLargeur < obj2.intX || obj1.intY > obj2.intY + obj2.intHauteur || obj1.intY + obj1.intHauteur < obj2.intY);
    } else {
      return false
    }
  } else if (obj2.blnCollision != null) {
    if (obj2.blnCollision) {
      return !(obj1.intX > obj2.intX + obj2.intLargeur || obj1.intX + obj1.intLargeur < obj2.intX || obj1.intY > obj2.intY + obj2.intHauteur || obj1.intY + obj1.intHauteur < obj2.intY);
    } else {
      return false
    }
  } else {
    return !(obj1.intX > obj2.intX + obj2.intLargeur || obj1.intX + obj1.intLargeur < obj2.intX || obj1.intY > obj2.intY + obj2.intHauteur || obj1.intY + obj1.intHauteur < obj2.intY);
  }
}

function collisionVertical(obj1, obj2) {
  return !(obj1.intX > obj2.intX + obj2.intLargeur || obj1.intX + obj1.intLargeur < obj2.intX);
}

function collisionHorizontal(obj1, obj2) {
  return !(obj1.intY > obj2.intY + obj2.intHauteur || obj1.intY + obj1.intHauteur < obj2.intY);
}

function gererClavierUp(event) { //onkeyup
  if (event.keyCode == 37 || event.keyCode == 39)
    velX = 0
  if (event.keyCode == 38 || event.keycode == 40)
    velY = 0
}

function dessiner() {
  //Situé dans jumpman/dessiner.js
  dessinerFond()
  dessinerStats()
  dessinerPlateformes()
  dessinerEchelles()
  dessinerCordes()
  dessinerBalle()
  dessinerBombes()
  
 // if (velX === 0 && velY === 0)
  //  intDirection = 0
  
  //console.log('velX: ' + velX + '\n' + 'velY: ' + velY + '\n' + 'direction: ' + intDirection)
  //dessinerJumpman est situé dans jumpman/dessinerJumpman.js
  if (intDirection == 2) {
    if (intCompteur < (intVitesseAnimation/2))
      dessinerJumpmanMonteEchelle(1)
    else
      dessinerJumpmanMonteEchelle(2)
  }
  else if (intDirection == 3)
    dessinerJumpmanMonteCorde(1)
  else if ((velX === 0) && intDirection === 0) {
    dessinerJumpman()
  } else if ((velX !== 0) && intDirection == -1) {
    if (intCompteur < (intVitesseAnimation/2))
      dessinerJumpmanGauche(1)
    else
      dessinerJumpmanGauche(2)
  } else if ((velX !== 0) && intDirection == 1) {
    if (intCompteur < (intVitesseAnimation/2))
      dessinerJumpmanDroite(1)
    else
      dessinerJumpmanDroite(2)
  }
}

function gameOver() {
    
    alert("Game Over")
    audioGameover.play()
    intVies--
    location.reload()
    exit()
}

