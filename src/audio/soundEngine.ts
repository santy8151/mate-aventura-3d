/**
 * Sintetizador de efectos de sonido estilo Nintendo / Toy-Box usando Web Audio API.
 * No requiere archivos de audio externos.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainLevel = 0.16,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, freqStart), now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + Math.min(0.02, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(620, 880, 0.055, 'sine', 0.12);
  }

  public playJump(stepCount = 1): void {
    // Clásico salto tipo Mario + nota musical sutil que sube en escala pentatónica
    this.playTone(250, 620, 0.14, 'triangle', 0.18);
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const note = pentatonic[(Math.max(1, stepCount) - 1) % pentatonic.length];
    this.playTone(note, note * 1.03, 0.09, 'sine', 0.1, 0.05);
  }

  public playSuccess(): void {
    // Moneda / acierto brillante estilo Nintendo + Duolingo
    this.playTone(587.33, 587.33, 0.08, 'triangle', 0.15, 0);
    this.playTone(880, 880, 0.1, 'triangle', 0.16, 0.07);
    this.playTone(1174.66, 1174.66, 0.18, 'sine', 0.15, 0.14);
  }

  public playPowerAttack(): void {
    // Rayo de superhéroe + impacto brillante
    this.playTone(920, 240, 0.18, 'sawtooth', 0.09, 0);
    this.playTone(440, 880, 0.15, 'triangle', 0.14, 0.04);
    this.playTone(1046.5, 1318.5, 0.2, 'sine', 0.14, 0.16);
  }

  public playTurbo(): void {
    // Aceleración turbo en autopista
    this.playTone(330, 660, 0.16, 'sawtooth', 0.08, 0);
    this.playTone(523.25, 1046.5, 0.22, 'triangle', 0.15, 0.04);
    this.playTone(783.99, 1567.98, 0.24, 'sine', 0.12, 0.1);
  }

  public playError(): void {
    // Bonk amigable estilo cartoon (sin ser estridente)
    this.playTone(310, 210, 0.15, 'triangle', 0.17, 0);
    this.playTone(210, 135, 0.22, 'sawtooth', 0.07, 0.12);
  }

  public playEvolution(): void {
    // Fanfarria mágica de evolución / Power-Up
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.14, idx % 2 === 0 ? 'triangle' : 'sine', 0.15, idx * 0.075);
    });
  }

  public playLevelWin(): void {
    // Melodía de nivel superado estilo plataforma indie
    const melody = [
      { f: 523.25, d: 0.11, t: 0 },
      { f: 659.25, d: 0.11, t: 0.11 },
      { f: 783.99, d: 0.11, t: 0.22 },
      { f: 1046.5, d: 0.28, t: 0.34 },
      { f: 987.77, d: 0.1, t: 0.56 },
      { f: 1046.5, d: 0.34, t: 0.67 },
    ];
    melody.forEach((m) => this.playTone(m.f, m.f, m.d, 'triangle', 0.16, m.t));
  }

  public playGrandVictory(): void {
    const chords = [
      { f: 523.25, t: 0, d: 0.13 },
      { f: 659.25, t: 0.12, d: 0.13 },
      { f: 783.99, t: 0.24, d: 0.13 },
      { f: 1046.5, t: 0.36, d: 0.25 },
      { f: 783.99, t: 0.62, d: 0.13 },
      { f: 1046.5, t: 0.76, d: 0.45 },
      { f: 1318.51, t: 0.76, d: 0.45 },
      { f: 1567.98, t: 0.76, d: 0.45 },
    ];
    chords.forEach((c) => this.playTone(c.f, c.f, c.d, 'triangle', 0.14, c.t));
  }

  public playOwlHoot(): void {
    // Suave "uh-uhú" amigable del búho mentor
    this.playTone(440, 392, 0.14, 'sine', 0.12, 0);
    this.playTone(392, 523.25, 0.2, 'sine', 0.13, 0.17);
  }
}

export const soundEngine = new SoundEngine();
