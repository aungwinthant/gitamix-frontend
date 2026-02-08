declare module 'waveform-playlist' {
    interface PlaylistOptions {
        samplesPerPixel?: number;
        waveHeight?: number;
        container: HTMLElement;
        state?: string;
        colors?: {
            waveOutlineColor?: string;
            timeColor?: string;
            fadeColor?: string;
        };
        controls?: {
            show?: boolean;
            width?: number;
        };
        zoomLevels?: number[];
    }

    interface Track {
        src: string;
        name: string;
        start?: number;
        gain?: number;
        muted?: boolean;
        soloed?: boolean;
    }

    interface EventEmitter {
        on(event: string, callback: (...args: any[]) => void): void;
        emit(event: string, ...args: any[]): void;
    }

    interface PlaylistInstance {
        load(tracks: Track[]): Promise<void>;
        getEventEmitter(): EventEmitter;
        isPlaying(): boolean;
        play(): void;
        pause(): void;
        stop(): void;
    }

    function Playlist(options: PlaylistOptions): PlaylistInstance;
    export = Playlist;
}
