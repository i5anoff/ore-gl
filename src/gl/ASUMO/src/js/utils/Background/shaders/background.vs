varying vec2 u;

void main() {
    vec3 pos = position;
    pos.z = 1.0;
    gl_Position = vec4(pos,1.0);
    u = uv;
}


