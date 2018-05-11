var renderer;

// on va d'abord vérifier si webgl est bien installé sinon on utilise le rendu générer par canvas renderer
// renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
if (Detector.webgl) {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true // to allow screenshot
    });
} else {
    renderer = new THREE.CanvasRenderer();
}

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//lancement du jeu
var lancementJeu = new Main();

function loop() {
    window.requestAnimationFrame(loop); //NOTE: signale au browser qu'on est pret à render la prochaine frame
    // on envoie lancementJeu qui est un objet de type Main qui a hérité de THREE.Scene (voir fichier main.js)
    renderer.render(lancementJeu, lancementJeu.camera);
    lancementJeu.animate();
};

if (!lancementJeu.init()) {
    loop();
}