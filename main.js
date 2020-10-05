const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

const fsSource = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

function main() {
    const canvas = document.querySelector("#canv");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        console.log("No webgl support.");
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("Shader compile error (Vertex)");
        gl.deleteShader(vs);
        return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, vsSource);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
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



}

main();