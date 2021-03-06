const vsSource = `#version 300 es
layout (location = 0) in vec4 aVertexPosition;
out vec4 vPos;
out float vx;
out float vy;
uniform float xshift;
void main() {
    vPos = aVertexPosition;
    vPos.y /= xshift;
    vPos.x /= xshift;
    // vx /= xshift;
    vPos.x -= 0.72; // -0.265; // 0.72;
    vPos.y -= 0.202; // -0.0035;// 0.202;

    gl_Position = aVertexPosition;
}
`;

const fsSource = `#version 300 es
precision mediump float;

in vec4 vPos;
out vec4 FragColor;
void main() {
    // vec2 z = vPos.xy;
    float za = vPos.x;
    float zb = vPos.y;
    int i = 0;
    int lim = 300;
    for (; i < lim; ++i) {
        float temp = za;
        za = za*za-zb*zb+vPos.x;
        zb = 2.0*temp*zb+vPos.y;
        // z = vec2(z.x*z.x-z.y*z.y+vPos.x, 2.0*z.x*z.y+vPos.y);
        if (za+zb > 4.0) {
            break;
        }
    }
    if (i == lim) {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        FragColor = vec4(float(i)/float(lim), float(i)/float(lim), float(i)/float(lim), 1.0f)*vec4(0.1f, 0.9f, 0.9f, 1.0f);
    }
    
}
`;

function main() {
    const canvas = document.querySelector("#canv");
    const gl = canvas.getContext("webgl2");
    if (gl === null) {
        console.log("No webgl support.");
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vs));
        console.log("Shader compile error (Vertex)");
        gl.deleteShader(vs);
        return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fs))
        console.log("Shader compile error (Fragment)");
        gl.deleteShader(fs);
        return;
    }

    const shadProgram = gl.createProgram();
    gl.attachShader(shadProgram, vs);
    gl.attachShader(shadProgram, fs);
    gl.linkProgram(shadProgram);

    if (!gl.getProgramParameter(shadProgram, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(shadProgram));
        return console.log("error linking");
    }

    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    const vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    beginRender(gl, shadProgram, vbuf);
}

function beginRender(gl, progshad, buff) {
    // console.log(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT));
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    let model = mat4.create();
    let proj = mat4.create();

    let last = 0;
    gl.uniform1f(gl.getUniformLocation(progshad, "xshift"), rotation /= 1e2);

    function render(now) {
        let dt = now - last;
        last = now;
        draw(gl, dt, model, proj, buff, progshad);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
var rotation = 1;
var track = 0; // precision error begins at 600
var zoomfac = 1.04;

function draw(gl, dt, model, proj, buff, progshad) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.uniform1f(gl.getUniformLocation(progshad, "xshift"), rotation *= zoomfac);
    gl.useProgram(progshad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

main();