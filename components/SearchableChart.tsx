import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { getLocalizedLink } from '../utils/i18n';

interface TemperatureItem {
    c: number;
    f: number;
    isTier1: boolean;
}

interface SearchableChartProps {
    initialData: TemperatureItem[];
    locale: string;
    t: any;
}

export default function SearchableChart({ initialData, locale, t }: SearchableChartProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filtered data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery) return initialData;
        const query = searchQuery.toLowerCase();
        return initialData.filter(item =>
            item.c.toString().includes(query) ||
            item.f.toString().includes(query)
        );
    }, [searchQuery, initialData]);

    return (
        <div className="interactive-container">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder={t.search_placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search temperature"
                />
                <div className="search-icon" aria-hidden="true">🔍</div>
            </div>

            <div className="chart-wrapper">
                <table className="premium-chart">
                    <thead>
                        <tr>
                            <th>{t.th_c}</th>
                            <th>{t.th_f}</th>
                            <th className="status-header">{t.th_status}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.c} className={item.isTier1 ? 'highlight-row' : ''}>
                                <td>
                                    {item.isTier1 ? (
                                        <Link href={getLocalizedLink(`/${item.c}-c-to-f`, locale)}>
                                            {item.c}°C
                                        </Link>
                                    ) : `${item.c}°C`}
                                </td>
                                <td>{item.f}°F</td>
                                <td className="status-label">
                                    {item.c === 0 && t.status_freezing}
                                    {item.c === 20 && t.status_room}
                                    {item.c === 37 && t.status_body}
                                    {item.c === 100 && t.status_boiling}
                                    {item.c < 0 && t.status_below_freezing}
                                    {item.c > 40 && item.c <= 100 && t.status_industrial}
                                    {(item.c > 20 && item.c < 37) && t.status_warm}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="no-results">{t.no_results}</div>
                )}
            </div>
            <style jsx>{`
                .interactive-container { margin-bottom: 3rem; }
                .search-bar { position: relative; max-width: 600px; margin: 2rem auto; }
                .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; font-size: 1.1rem; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .search-bar input:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15); }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.2rem; }

                /* Chart Table */
                .chart-wrapper { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .premium-chart { width: 100%; border-collapse: collapse; text-align: left; }
                .premium-chart th { background: #f7fafc; padding: 1rem 1.5rem; color: #718096; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; border-bottom: 2px solid #edf2f7; }
                .premium-chart td { padding: 0.75rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #2d3748; transition: background 0.1s; }
                .premium-chart tr:hover td { background: #f8fafc; }
                .highlight-row td { background: #ebf8ff; font-weight: 600; color: #2b6cb0; }
                .highlight-row td a { color: #2b6cb0; text-decoration: underline; }
                .status-label { font-size: 0.85rem; color: #a0aec0; font-style: italic; }

                .no-results { padding: 3rem; text-align: center; color: #718096; font-style: italic; }

                @media (max-width: 768px) {
                    .premium-chart td, .premium-chart th { padding: 0.75rem 1rem; }
                    .status-label, .status-header { display: none; }
                }
            `}</style>
        </div>
    );
}
