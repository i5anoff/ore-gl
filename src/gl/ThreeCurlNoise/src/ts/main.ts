import MainScene from './MainScene';
import ThreeController from './utils/ThreeController'
class App {
    constructor() {
        this.init();
    }

    init() {
        let tc = new ThreeController();
        let scene = new MainScene(tc.renderer);
    }
}

window.addEventListener('load', () => { new App() } );