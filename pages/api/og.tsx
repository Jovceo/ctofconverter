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
                        backgroundImage: 'linear-gradient(to bottom right, #3498db, #2980b9)',
                        fontSize: 60,
                        letterSpacing: -2,
                        fontWeight: 700,
                        textAlign: 'center',
                        color: 'white',
                    }}
                >
                    <div
                        style={{
                            backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216))',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontSize: 80,
                            marginBottom: 20,
                            display: 'flex'
                        }}
                    >
                        Temperature Conversion
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '40px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex' }}>
                            {c}°C = {formattedF}°F
                        </div>
                        <div style={{ fontSize: 30, marginTop: 20, fontWeight: 400, opacity: 0.8, display: 'flex' }}>
                            Formula: ({c} × 9/5) + 32 = {formattedF}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
