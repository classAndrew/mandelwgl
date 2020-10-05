const vsSource = `#version 300 es
layout (location = 0) in vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

const fsSource = `#version 300 es
precision mediump float;
out vec4 FragColor;
void main() {
  FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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
    const vertices = [0, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    render(gl, shadProgram, vbuf);
}

function render(gl, progshad, buff) {

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    let model = mat4.create();
    const proj = mat4.create();
    setInterval(() => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(proj, 45 * 3.141592653589 / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100);

        model = mat4.create();

        mat4.translate(model, model, [0, 0, -10]);
        mat4.rotate(model, model, Date.now(), [0, 1, 0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.useProgram(progshad);
        gl.uniformMatrix4fv(gl.getUniformLocation(progshad, "uProjectionMatrix"), false, proj);
        gl.uniformMatrix4fv(gl.getUniformLocation(progshad, "uModelViewMatrix"), false, model);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, 100);

}

main();