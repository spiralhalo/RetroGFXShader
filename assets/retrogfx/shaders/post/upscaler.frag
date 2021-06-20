#include frex:shaders/api/header.glsl
#include frex:shaders/lib/math.glsl
#include retrogfx:downscaler_config

uniform sampler2D cvu_input;
uniform ivec2 frxu_size;

in vec2 _cvv_texcoord;
out vec4 fragColor;

const float scale = clamp(DOWNSCALER_SCALE * 0.1, 0.1, 1.0);

void main() {
	const float reverseScale = 1. - scale;
	const vec2 bottomLeft = vec2(reverseScale * 0.5);

	vec2 realTexcoord = bottomLeft + _cvv_texcoord * scale;

	fragColor = texture(cvu_input, realTexcoord);

#ifdef MONOCHROME
	const vec3 monoTint = vec3(MONOCHROME_R, MONOCHROME_G, MONOCHROME_B) * 0.1;

	fragColor.rgb = vec3(frx_luminance(fragColor.rgb));
	fragColor.rgb *= monoTint;
#endif

#ifdef SCANLINES
	// uv = texcoord unit
	// px = pixel unit
	// sc = scanline unit

#ifdef BLURRY_SCANLINES
	const float spacing = SCANLINE_SPACING;
	const float scanlineScale = max(scale * 4.0, SCANLINE_SCALE * 0.1);
#else
	const float spacing = 1 + SCANLINE_SPACING;
	const float scanlineScale = max(scale, SCANLINE_SCALE * 0.1);
#endif

	const float opacity = SCANLINE_OPACITY * 0.1;
	const float unitPx = (1.0 / scale) * scanlineScale;
	const float thickPx = spacing * unitPx;
	const float thickSc = 1.0 / float(spacing);

	float scanlineCount = float(frxu_size.y) / thickPx;
	float thickUv = 1.0 / scanlineCount;
	float alignedCoord = _cvv_texcoord.y;// + thickUv * 0.25;
	float scCoord = mod(alignedCoord, thickUv) / thickUv;

#ifdef BLURRY_SCANLINES
	float scCoordCentered = abs(scCoord - 0.5);
	float scanlineFactor = smoothstep(0.0, 1.0, scCoordCentered);
#else
	float scanlineFactor = scCoord < thickSc ? 1.0 : 0.0;
#endif

	fragColor *= mix(1.0, 1.0 - opacity, scanlineFactor);

	// if (scCoordCentered < thickSc) {
	// 	fragColor *= 1.0 - opacity;
	// }

	// const int spacing = 1 + SCANLINE_SPACING;
	// const float opacity = SCANLINE_OPACITY * 0.1;
	// const float scanlineScale = 10.0 / SCANLINE_SCALE;

	// vec2 scanlineTexcoord = _cvv_texcoord * scale * min(1.0 / scale, scanlineScale);
	// ivec2 iCoord = ivec2(vec2(frxu_size) * scanlineTexcoord);

	// if (iCoord.y % spacing == 0) {
	// 	fragColor *= 1.0 - opacity;
	// }
#endif
}
