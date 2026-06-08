export const vertexShaderSource = `
attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_viewProjection;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;

void main() {
    vec4 worldPosition = u_world * position;
    gl_Position = u_viewProjection * worldPosition;

    v_worldPosition = worldPosition.xyz;
    v_normal = (u_worldInverseTranspose * vec4(normal, 0.0)).xyz;
    v_texcoord = texcoord;
}
`;

export const fragmentShaderSource = `
precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_useTexture;
uniform float u_alpha;

uniform float u_enableLighting;
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_viewPosition;
uniform float u_shininess;
uniform float u_specularStrength;

uniform float u_enableFog;
uniform vec3 u_fogColor;
uniform float u_fogNear;
uniform float u_fogFar;

void main() {
    vec4 texColor = texture2D(u_texture, v_texcoord);
    vec4 baseColor = u_color;

    if (u_useTexture > 0.5) {
        baseColor = u_color * texColor;
    }

    vec3 finalColor = baseColor.rgb;

    if (u_enableLighting > 0.5) {
        vec3 normalDir = normalize(v_normal);
        vec3 lightDir = normalize(-u_lightDirection);

        float diffuse = max(dot(normalDir, lightDir), 0.0);

        vec3 viewDir = normalize(u_viewPosition - v_worldPosition);
        vec3 reflectDir = reflect(-lightDir, normalDir);
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), u_shininess);

        vec3 ambientTerm = u_ambientColor * baseColor.rgb;
        vec3 diffuseTerm = diffuse * u_lightColor * baseColor.rgb;
        vec3 specularTerm = specular * u_specularStrength * u_lightColor;

        finalColor = ambientTerm + diffuseTerm + specularTerm;
    }

    if (u_enableFog > 0.5) {
        float distanceToCamera = distance(u_viewPosition, v_worldPosition);
        float fogAmount = smoothstep(u_fogNear, u_fogFar, distanceToCamera);
        finalColor = mix(finalColor, u_fogColor, fogAmount);
    }

    gl_FragColor = vec4(finalColor, baseColor.a * u_alpha);
}
`;
