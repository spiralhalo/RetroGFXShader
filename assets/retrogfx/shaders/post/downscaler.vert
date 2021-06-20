#include frex:shaders/api/header.glsl
#include retrogfx:downscaler_config

#if __VERSION__ <= 130

#define frxu_frameProjectionMatrix gl_ProjectionMatrix
#define in_vertex gl_Vertex

#else

uniform mat4 frxu_frameProjectionMatrix;

in vec3 in_vertex;

#endif


uniform ivec2 frxu_size;

in vec2 in_uv;

out vec2 _cvv_texcoord;

const float scale = clamp(DOWNSCALER_SCALE * 0.1, 0.1, 1.0);

void main() {    
	vec4 outPos = frxu_frameProjectionMatrix * vec4(in_vertex.xy * frxu_size, 0.0, 1.0);

    outPos.xy *= scale;

	gl_Position = vec4(outPos.xy, 0.2, 1.0);

	_cvv_texcoord = in_uv;
}
