uniform float time;
uniform sampler2D tDiffuse;
varying vec2 vUv;
#define N 16

void main() {
    vec2 uv = vUv;
    vec2 u = uv * 2.0 - 1.0;
    vec3 c;

    float w = -max(.0,length(u)) * 0.01;
    // w *= smoothstep(0.5,1.0,sin(10.0 * 15.0)) * 5.0;
    // w += .01;

    vec2 vig = u * w;

    for(int i = 0; i < N; i++){
        vig *= 1.0 + float(i) * 0.01;
        c.x += texture2D(tDiffuse,uv + vec2(float(i) * 0.0005,0)).x;
        c.y += texture2D(tDiffuse,uv).y;
        c.z += texture2D(tDiffuse,uv).z;
    }
    c /= float(N) - 5.0;
    gl_FragColor = vec4(c,1.0);
}