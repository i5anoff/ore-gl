import BaseScene from './utils/BaseScene';
import Background from './utils/Background';
import MainObj from './utils/MainObj';
import Fish from './utils/Fish';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
        window.addEventListener('scroll',this.onScroll.bind(this));
        document.querySelector(".loading").classList.add("hide");
        document.querySelectorAll('.title').forEach((elm)=>{
            elm.classList.add('v');
        })
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,0,9);

        this.cyOffset = 0;

        this.aLight = new THREE.AmbientLight();
        this.aLight.intensity = 0.4;
        this.scene.add(this.aLight);

        this.dLight = new THREE.DirectionalLight();
        this.dLight.intensity = 0.7;
        this.dLight.position.set(0.1,10,-2);
        this.scene.add(this.dLight);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xff0044);
        this.light.position.set(20,0,5);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0x4400ff);
        this.light.position.set(-10,0,5);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.bg = new Background();
        this.bg.obj.frustumCulled = false;
        this.scene.add(this.bg.obj);

        this.mobj = new MainObj();
        this.scene.add(this.mobj.obj);
        this.mobj.obj.position.set(3,0,0);

        this.fish = new Fish(this.renderer,200,50);
        this.fish.setAvoidObje(this.mobj.obj.position,3);
        this.fish.obj.frustumCulled = false;
        this.scene.add(this.fish.obj);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector3(0,0,0);

        window.scene = this.scene;
        this.onScroll();
    }

    animate() {
        this.time += this.clock.getDelta();

        if(this.bg){
            this.bg.update(this.time);
        }

        if(this.mobj){
            this.mobj.update(this.time);
        }

        if(this.fish){
            this.fish.update();
        }
        // let r = 13;
        // this.camera.position.set(Math.sin(this.time * 0.5) * r,0,Math.cos(this.time * 0.5) * r);
        this.renderer.render(this.scene,this.camera);
    }

    ray(cursor){
        var halfWidth = innerWidth / 2;
        var halfHeight = innerHeight / 2;
        var pos = new THREE.Vector2((cursor.x - halfWidth) / halfWidth, (cursor.y - halfHeight) / halfHeight);
        pos.y *= -1;

        this.raycaster.setFromCamera(pos, this.camera); 
        var intersects = this.raycaster.intersectObjects([this.plane]);
        if(intersects.length > 0){
            let point = intersects[0].point;   
            return point;
        }else{
            return null;
        }
    }

    Resize(width,height){
        let aspect = width / height;
        if(aspect < 1){
            this.camera.position.x = 1;
            this.camera.position.z = 13;
            this.cyOffset = -1.0;
        }else{
            this.camera.position.x = 0;
            this.camera.position.z = 10;
            this.cyOffset = 0;
        }
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.camera.position.y = window.pageYOffset * -0.004 + this.cyOffset;
    }

    onScroll(){
        let offset = window.pageYOffset;
        if(this.camera){
            this.camera.position.y = offset * -0.004 + this.cyOffset;
        }

        document.querySelectorAll('.content-list-item').forEach((elm)=>{
            const top = elm.getBoundingClientRect().top + window.pageYOffset;
            if(top < window.pageYOffset + window.innerHeight / 5 * 4){
                elm.classList.add('v');
            }
        })

    }
    
    keep_scroll_reload() {
        var re = /&page_x=(\d+)&page_y=(\d+)/;
        var page_x = document.documentElement ? document.documentElement.scrollLeft : document.body.scrollLeft;
        var page_y = document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop;
        var position = '&page_x=' + page_x + '&page_y=' + page_y;
        if(!url.match(re)) {
                //初回
                location.href = url + position;
        } else {
                //2回目以降
                location.href = url.replace(/&page_x=(\d+)&page_y=(\d+)/,position);
        }
    }

    restore_scroll() {
        var re = /&page_x=(\d+)&page_y=(\d+)/;
        if(window.location.href.match(re)) {
                var position = window.location.href.match(re)
                window.scrollTo(position[1],position[2]);
        }
    }


    
    onTouchStart(c,e){
    }

    onTouchMove(c,e){
    }

    onTouchEnd(c,e){       
    }
}