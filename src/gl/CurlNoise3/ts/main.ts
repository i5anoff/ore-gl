import { Vector3, Vector4, Matrix4 } from 'matrixgl';
const GLPower = require('./GLPower')

const frag = require('../shader/frag.glsl');
const vert = require('../shader/vert.glsl');

const renderVert = require('../shader/renderVert.glsl');
const renderFrag= require('../shader/renderFrag.glsl');

const particleFrag = require('../shader/computeParticle.fs');
const initParticleFrag = require('../shader/initParticle.fs');

const wholeFrag = require('../shader/whole.fs');

var canvas;
var glp;

var scenePrg;
var particlePrg;
var wholeRenderPrg;
var renderPrg;
var initParticlePrg;

var time = 0;

window.addEventListener('load',() =>{
    canvas = document.getElementById("canvas");
    var dpr = window.devicePixelRatio || 1;
    // var dpr = 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    glp = new GLPower(canvas,{r:0,g:0,b:0});

    initParticlePrg = glp.getProgram(renderVert,initParticleFrag);
    particlePrg = glp.getProgram(renderVert,particleFrag);
    scenePrg = glp.getProgram(vert,frag);
    wholeRenderPrg = glp.getProgram(renderVert,wholeFrag);
    renderPrg = glp.getProgram(renderVert,renderFrag);

    initPrg();
},false)

function initPrg(){

    glp.setAttribute(initParticlePrg,'position',3);
    glp.addUniform(initParticlePrg,'resolution','uniform2fv');

    glp.setAttribute(particlePrg,'position',3);
    glp.addUniform(particlePrg,'resolution','uniform2fv');
    glp.addUniform(particlePrg,'posTexture','uniform1i');
    glp.addUniform(particlePrg,'time','uniform1f');

    glp.setAttribute(scenePrg,'index',1);
    glp.addUniform(scenePrg,'mvp','uniformMatrix4fv')
    glp.addUniform(scenePrg,'time','uniform1f');
    glp.addUniform(scenePrg,'num','uniform1f');
    glp.addUniform(scenePrg,'posTexture','uniform1i');

    glp.setAttribute(wholeRenderPrg,'position',3);
    glp.addUniform(wholeRenderPrg,'resolution','uniform2fv');
    glp.addUniform(wholeRenderPrg,'tex1','uniform1i');
    glp.addUniform(wholeRenderPrg,'tex2','uniform1i');
    glp.addUniform(wholeRenderPrg,'time','uniform1f');

    glp.setAttribute(renderPrg,'position',3);
    glp.addUniform(renderPrg,'texture','uniform1i');
    glp.addUniform(renderPrg,'resolution','uniform2fv');

    var boxVertex = []
    var particleIndex = []

    let partNum = 1024;

    for(var j = 0; j < partNum; j++){
        for(var i = 0; i < partNum; i++){
            boxVertex.push(0,0,0);
            particleIndex.push(i + j * partNum);
        }
    }

    var boxVBO = glp.cVBO(boxVertex);
    var indexVBO = glp.cVBO(particleIndex);

    //particle compute buffer
    glp.cFbuffer(partNum,partNum,0,true);
    glp.cFbuffer(partNum,partNum,1,true);

    //render buffer
    glp.cFbuffer(canvas.width,canvas.height,2);

    glp.cFbuffer(canvas.width,canvas.height,3);
    glp.cFbuffer(canvas.width,canvas.height,4);

    var fBselect = 0;
    var selectRBuffer = 3;

    glp.selectFramebuffer(0);
    glp.selectUseProgram(initParticlePrg)
    glp.addAttribute('position',glp.screenVBO,glp.screenIBO);
    glp.setUniform('resolution',[partNum,partNum]);
    glp.clear();
    glp.drawElements();
    glp.flush();

    render();
    
    function render(){
        time += 0.01666;
        
        const view = Matrix4.lookAt(new Vector3(0,2,5),new Vector3(0,0,0),new Vector3(0,1,0));

        const perspective = Matrix4.perspective({
            fovYRadian: 60 * Math.PI / 180,
            aspectRatio: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 10
        });

        const transform = Matrix4.identity().rotateY(0).scale(2,2,2);
        const mvp = perspective.mulByMatrix4(view).mulByMatrix4(transform);

        fBselect = fBselect == 0 ? 1 : 0;
        
        glp.selectFramebuffer(fBselect);
        glp.selectUseProgram(particlePrg)
        glp.addAttribute('position',glp.screenVBO,glp.screenIBO);
        glp.setUniform('posTexture',fBselect == 0 ? 1 : 0);
        glp.setUniform('resolution',[partNum,partNum]);
        glp.setUniform('time',time);
        glp.clear();
        glp.drawElements();
        glp.flush();

        glp.selectFramebuffer(2);
        glp.selectUseProgram(scenePrg);
        glp.addAttribute('index',indexVBO,null);
        glp.setUniform('mvp',mvp.values);
        glp.setUniform('num',partNum);
        glp.setUniform('time',time);
        glp.setUniform('posTexture',fBselect);
        glp.clear();
        glp.drawArrays(glp.gl.POINTS)
        glp.flush();
        
        selectRBuffer = selectRBuffer == 3 ? 4 : 3;

        glp.selectFramebuffer(selectRBuffer);
        glp.selectUseProgram(wholeRenderPrg);
        glp.addAttribute("position",glp.screenVBO,glp.screenIBO);
        glp.setUniform('resolution',[canvas.width,canvas.height]);
        glp.setUniform('tex1',2);
        glp.setUniform('tex2',selectRBuffer == 3 ? 4 : 3);
        glp.setUniform('time',time);
        glp.clear();
        glp.drawElements();
        glp.flush();

        glp.selectFramebuffer(null);
        glp.selectUseProgram(renderPrg);
        glp.addAttribute("position",glp.screenVBO,glp.screenIBO);
        glp.setUniform('texture',selectRBuffer);
        glp.setUniform('resolution',[canvas.width,canvas.height]);
        glp.clear();
        glp.drawElements();
        glp.flush();

        requestAnimationFrame(render);
    }
}
