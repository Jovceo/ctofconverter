import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default function handler(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const celsius = searchParams.get('c');

        if (!celsius) {
            return new Response('Missing temperature parameter', { status: 400 });
        }

        const c = parseFloat(celsius);
        const f = (c * 9 / 5) + 32;
        const formattedF = parseFloat(f.toFixed(1)).toString();

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        // Brand Blue Gradient (Matches site --primary-color #3498db to --primary-dark #2980b9)
                        backgroundImage: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                        fontFamily: '"Geist Mono", monospace',
                        color: 'white',
                        position: 'relative',
                    }}
                >
                    {/* Abstract Shapes for Texture (Subtle) */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '700px',
                        height: '700px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0,0,0,0) 70%)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0,0,0,0) 70%)',
                    }} />

                    {/* Main Content Container - simplified, no heavy card borders, just clean layout */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'translateY(-20px)', // Visual center correction
                        }}
                    >
                        {/* Main Result: Big and Bold */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '30px',
                        }}>
                            <span style={{
                                fontSize: 130,
                                fontWeight: 800,
                                textShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                {c}°C
                            </span>
                            <span style={{
                                fontSize: 80,
                                opacity: 0.6,
                                marginTop: 20
                            }}>=</span>
                            <span style={{
                                fontSize: 130,
                                fontWeight: 800,
                                textShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                {formattedF}°F
                            </span>
                        </div>

                        {/* Simplified Formula Line (Optional, but good for context) */}
                        <div style={{
                            marginTop: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            opacity: 0.9,
                            background: 'rgba(255, 255, 255, 0.15)',
                            padding: '10px 30px',
                            borderRadius: '50px',
                            fontFamily: 'monospace',
                        }}>
                            ({c} × 9/5) + 32
                        </div>
                    </div>

                    {/* Minimal Brand Footer */}
                    <div style={{
                        position: 'absolute',
                        bottom: 50,
                        fontSize: 28,
                        fontWeight: 600,
                        opacity: 0.9,
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        {/* Simple White Dot Icon */}
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white' }} />
                        CToFConverter.com
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: unknown) {
        const error = e as Error;
        console.log(`${error.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
