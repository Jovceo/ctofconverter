import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/HotOrCold.module.css';
import { generateRound, GameRound } from '../../utils/temperatureGenerator';
import { useTranslation } from '../../utils/i18n';

const GAME_DURATION = 60; // 60 seconds total for arcade mode

export default function HotOrColdEngine() {
    const { t } = useTranslation('game');
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [round, setRound] = useState<GameRound | null>(null);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setGameState('PLAYING');
        nextRound();
        // Start Timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState('GAMEOVER');
    };

    const nextRound = React.useCallback(() => {
        setRound(generateRound());
        setFeedback(null);
    }, []);

    const handleGuess = React.useCallback((guess: 'HOTTER' | 'COLDER') => {
        if (!round || gameState !== 'PLAYING') return;

        if (round.correctAnswer === guess) {
            // Correct
            setScore((s) => s + 10);
            setFeedback('CORRECT');
            // Visual delay briefly or instant? Arcade needs speed.
            // Let's do instant transition but show overlay
            setTimeout(nextRound, 300);
        } else {
            // Wrong - in arcade mode, maybe just penalty time or strict?
            // Let's standard: penalty time -5s
            setTimeLeft((t) => Math.max(0, t - 5));
            setFeedback('WRONG');
            setTimeout(nextRound, 300);
        }
    }, [round, gameState, nextRound]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'PLAYING' || !round) return;
            if (e.key === 'ArrowLeft') {
                handleGuess('HOTTER');
            } else if (e.key === 'ArrowRight') {
                handleGuess('COLDER');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, round, handleGuess]);

    if (gameState === 'START') {
        return (
            <div className={styles.gameContainer}>
                <h2>{t('game.startTitle')}</h2>
                <p style={{ margin: '1rem 0', color: '#666' }}>
                    {t('game.startDescription')}
                </p>
                <button
                    type="button"
                    onClick={startGame}
                    className={`${styles.restartBtn} ${styles.pulseBtn} `}
                    style={{ background: '#3b82f6', marginTop: '1rem', padding: '1.2rem 3rem', fontSize: '1.5rem', fontWeight: 'bold' }}
                    aria-label={t('game.ariaStart')}
                >
                    {t('game.startGame')}
                </button>
            </div>
        );
    }

    if (gameState === 'GAMEOVER') {
        return (
            <div className={styles.gameContainer}>
                <h2>{t('game.timeUp')}</h2>
                <div className={styles.finalScore}>{score}</div>
                <p>{t('game.points')}</p>
                <button type="button" onClick={startGame} className={styles.restartBtn}>
                    {t('game.playAgain')}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <div className={styles.scoreBoard}>{t('game.score')}: {score}</div>
                <div style={{ color: timeLeft < 10 ? 'red' : '#333', fontWeight: 'bold' }}>{timeLeft}{t('game.secondsShort')}</div>
            </div>

            <div className={styles.timerBar}>
                <div
                    className={styles.timerFill}
                    style={{ width: `${(timeLeft / GAME_DURATION) * 100}% ` }}
                />
            </div>

            {round && (
                <div className={styles.battleField}>
                    <div className={`${styles.card} ${styles.baseCard} `}>
                        <div className={styles.cardTitle}>{t('game.baseTemp')}</div>
                        <div className={styles.cardValue}>{round.baseDisplay}</div>
                    </div>

                    <div className={styles.vs}>VS</div>

                    <div className={`${styles.card} ${styles.challengeCard} `}>
                        <div className={styles.cardTitle}>{t('game.challengeTemp')}</div>
                        <div className={styles.cardValue}>{round.challengeDisplay}</div>
                    </div>
                </div>
            )}

            {feedback === 'CORRECT' && (
                <div className={styles.feedbackContainer}>
                    <div className={styles.feedbackCorrect}>🎉</div>
                </div>
            )}
            {feedback === 'WRONG' && (
                <div className={styles.feedbackContainer}>
                    <div className={styles.feedbackWrong}>❌</div>
                </div>
            )}

            <div className={styles.controls}>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnHot} `}
                    onClick={() => handleGuess('HOTTER')}
                    aria-label={t('game.ariaHotter')}
                    title="Press Left Arrow"
                >
                    🔥 Hotter <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '5px' }}>(←)</span>
                </button>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnCold} `}
                    onClick={() => handleGuess('COLDER')}
                    aria-label={t('game.ariaColder')}
                    title="Press Right Arrow"
                >
                    🧊 Colder <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '5px' }}>(→)</span>
                </button>
            </div>
        </div>
    );
}
