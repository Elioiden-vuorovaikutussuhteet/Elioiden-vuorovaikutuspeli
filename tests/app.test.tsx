import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import App from '../src/App';

vi.mock('../src/components/PhaserGame', () => ({
    PhaserGame: () => <div />,
}));

describe("App test", () => {
    it('renders successfully', () => {
        render(<App />)
    })
})
